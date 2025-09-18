import {
  BuildSchemaTable,
  SchemaAuditLog,
  SchemaDatabaseProps,
  SchemaDatabaseStore,
  SchemaDatabaseTableProps,
  SchemaTable,
  SchemaTableColumn,
  SchemaTableProps,
  SchemaTableStore,
  TableFilterConditionResult,
  TableFilterValue,
  TableQuery,
  TableResponse,
  TableSortDirection
} from '@schema/database'
import { DatabaseClient } from '@schema/database/client'
import { createLowDB, CreateLowDBProps, LowWithLodash, pathDefaultLowDB } from '@service/libs/lowdb'
import _ from 'lodash'
import { format } from 'date-fns'
import { filterOperations, sortComparators } from './utils'

type TableStorageConfig = CreateLowDBProps<SchemaTableStore>
type DatabaseStorageConfig = CreateLowDBProps<SchemaDatabaseStore>

type DatabaseServiceConfiguration = {
  database: DatabaseStorageConfig
  tables: Record<string, Record<string, TableStorageConfig>>
  disabled?: {
    auditLogging: boolean
  }
}

type DatabaseStore = LowWithLodash<SchemaDatabaseStore>
type TableStore = LowWithLodash<SchemaTableStore>
type AuditLogStore = LowWithLodash<Array<SchemaAuditLog>>

export class DatabaseService {
  private schemaClient: DatabaseClient = new DatabaseClient([])
  private configuration: DatabaseServiceConfiguration = {
    database: {
      defaultValue: {},
      filepath: pathDefaultLowDB,
      filename: 'database'
    },
    tables: {}
  }
  private databaseStore: DatabaseStore | null = null
  private tableStores: Record<string, Record<string, TableStore>> = {}
  private auditLogStores: Record<string, AuditLogStore> = {}

  constructor(props: Partial<Partial<CreateLowDBProps<SchemaDatabaseStore>>>) {
    this.initializeDatabaseStore(props)
  }

  getAuditLogStore({
    date,
    defaultEntries
  }: {
    defaultEntries?: Array<SchemaAuditLog>
    date?: Date
  }): AuditLogStore {
    try {
      const key = format(date ?? new Date(), 'yyyy-MM-dd')
      if (this.auditLogStores[key] instanceof LowWithLodash) {
        console.log('Using cached audit log store: ', key)
        return this.auditLogStores[key]
      }
      this.auditLogStores[key] = createLowDB({
        defaultValue: defaultEntries ?? [],
        filename: key,
        filepath: [this.configuration.database.filepath, 'logs'].join('/'),
        onMemory: this.configuration.database.onMemory
      })
      this.auditLogStores[key].read()
      if (defaultEntries) this.auditLogStores[key].write()
      return this.auditLogStores[key]
    } catch (error) {
      throw new Error(
        `Failed to get audit log store: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  logAuditEvent(input: Omit<SchemaAuditLog, 'date'> & { date?: Date }): Promise<void> {
    if (this.configuration.disabled?.auditLogging) return Promise.resolve()
    const log = this.getAuditLogStore({})
    log.chain
      .push({
        ...input,
        data: _.omit(input.data, '_createdAt', '_updatedAt'),
        date:
          (input.date ?? Array.isArray(input.data))
            ? new Date()
            : (input.data._createdAt ?? new Date())
      })
      .value()
    return log.write()
  }

  initializeDatabaseStore(
    configuration: Partial<CreateLowDBProps<SchemaDatabaseStore>>
  ): DatabaseStore {
    try {
      if (this.databaseStore instanceof LowWithLodash) {
        console.log('Using cached database store')
        return this.databaseStore
      }
      this.configuration.database = {
        ...this.configuration.database,
        ...configuration
      }
      this.databaseStore = createLowDB(this.configuration.database)
      this.databaseStore.read()
      if (configuration.defaultValue) this.databaseStore.write()
      this.schemaClient.setInstance(this.databaseStore.data)
      return this.databaseStore
    } catch (error) {
      throw new Error(
        `Failed to initialize database store: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  getDatabaseInstance({
    databaseId
  }: SchemaDatabaseProps): _.ObjectChain<SchemaDatabaseStore[string]> {
    if (!this.databaseStore) throw new Error(`Database not initialize`)
    const database = this.databaseStore.chain.get(databaseId)
    if (database.isUndefined().value()) {
      throw new Error(`Database with ID '${databaseId}' not found`)
    }
    return database
  }

  async modifyDatabase(
    { databaseId }: SchemaDatabaseProps,
    modification: (data: _.ObjectChain<SchemaDatabaseStore[string]>) => Promise<void>
  ): Promise<void> {
    try {
      if (!this.databaseStore) throw new Error(`Database not initialize`)
      const database = this.databaseStore.chain.get(databaseId)
      await modification(database)
      await this.databaseStore.write()
      return
    } catch (error) {
      throw new Error(
        `Failed to modify database: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async createTableSchema({
    body,
    props
  }: BuildSchemaTable<SchemaDatabaseTableProps, SchemaTable>): Promise<void> {
    const tableData: SchemaDatabaseStore[string]['tables'][string] = {
      ...body,
      columns: Object.fromEntries(body.columns.map((column) => [column._id, column]))
    }
    await this.modifyDatabase(props, async (database) => {
      if (!database.get(['tables', props.tableId]).isUndefined().value()) {
        throw new Error(`Table '${props.tableId}' already exists`)
      }
      database.get('tables').set(props.tableId, tableData).value()
      await this.logAuditEvent({
        data: tableData,
        method: 'insert',
        type: 'database'
      })
      return
    })
    return
  }

  async updateTableSchema({
    body,
    props
  }: BuildSchemaTable<
    SchemaDatabaseTableProps,
    Partial<Omit<SchemaTable, 'columns'>>
  >): Promise<void> {
    await this.modifyDatabase(props, async (database) => {
      const table = database.get(['tables', props.tableId]).value()
      if (!table) throw new Error('Table not found')
      database
        .get('tables')
        .set(props.tableId, {
          ...table,
          ...body,
          columns: table.columns
        })
        .value()
      await this.logAuditEvent({
        data: body,
        method: 'update',
        type: 'database'
      })
      return
    })
    return
  }

  async modifyTableColumn({
    body,
    props
  }: BuildSchemaTable<SchemaDatabaseTableProps, SchemaTableColumn>): Promise<void> {
    await this.modifyDatabase(props, async (database) => {
      const columns = database.get(['tables', props.tableId, 'columns'])
      if (columns.isUndefined().value()) {
        throw new Error(`Columns not found for table '${props.tableId}'`)
      }
      const isNewColumn = columns.get(body._id).isUndefined().value()
      columns.set(body._id, body).value()
      await this.logAuditEvent({
        data: body,
        method: isNewColumn ? 'insert' : 'update',
        type: 'database'
      })
      return
    })
  }

  generateTableValidationSchema(
    props: SchemaDatabaseTableProps
  ): ReturnType<DatabaseClient['generateZodSchema']> {
    return this.schemaClient.generateZodSchema(props, {})
  }

  getTableStorageConfig(
    { tableId, part = 'default' }: Omit<SchemaTableProps, 'databaseId'>,
    defaultValue?: SchemaTableStore['rows']
  ): TableStorageConfig {
    if (!this.configuration.tables[tableId]) this.configuration.tables[tableId] = {}
    if (this.configuration.tables[tableId][part]) return this.configuration.tables[tableId][part]
    this.configuration.tables[tableId][part] = {
      defaultValue: {
        rows: defaultValue ?? {},
        indexs: {}
      },
      filename: part,
      filepath: [this.configuration.database.filepath, tableId].join('/'),
      onMemory: this.configuration.database.onMemory
    }
    return this.configuration.tables[tableId][part]
  }

  getTableStore(
    { tableId, part = 'default' }: SchemaTableProps,
    defaultValue?: SchemaTableStore['rows']
  ): TableStore {
    try {
      if (!this.tableStores[tableId]) this.tableStores[tableId] = {}
      if (this.tableStores[tableId][part] instanceof LowWithLodash) {
        console.log('Using cached table store: ', tableId, part)
        return this.tableStores[tableId][part]
      }
      this.tableStores[tableId][part] = createLowDB(
        this.getTableStorageConfig({ tableId, part }, defaultValue)
      )
      this.tableStores[tableId][part].read()
      if (defaultValue) this.tableStores[tableId][part].write()
      return this.tableStores[tableId][part]
    } catch (error) {
      throw new Error(
        `Failed to get table store: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  getColumnIdByName(props: SchemaDatabaseTableProps, name: string): string {
    const table = this.getDatabaseInstance(props).get(['tables', props.tableId])
    if (table.isUndefined().value()) {
      throw new Error(`Table '${props.tableId}' not found`)
    }
    const column = table.get('columns').find({ name }).value()
    if (!column) {
      throw new Error(`Column '${name}' not found`)
    }
    return column._id
  }

  evaluateFilterCondition(
    { key, value: filterValue }: TableFilterConditionResult,
    value: TableFilterValue
  ): boolean {
    try {
      // Handle operasi kompleks yang memerlukan evaluasi rekursif
      switch (key) {
        case 'and':
          if (Array.isArray(filterValue)) {
            return filterValue.every((condition) =>
              this.evaluateFilterCondition(
                condition as unknown as TableFilterConditionResult,
                value
              )
            )
          }
          return false

        case 'or':
          if (Array.isArray(filterValue)) {
            return filterValue.some((condition) =>
              this.evaluateFilterCondition(condition as TableFilterConditionResult, value)
            )
          }
          return false

        case 'not':
          return !this.evaluateFilterCondition(
            filterValue as unknown as TableFilterConditionResult,
            value
          )

        default:
          // Handle operasi sederhana dengan utility functions
          // eslint-disable-next-line no-case-declarations
          const operation = filterOperations[key]
          if (operation) {
            return operation(value, filterValue as TableFilterValue)
          }
          console.warn(`Unknown filter operation: ${key}`)
          return false
      }
    } catch (error) {
      console.error(`Error evaluating filter condition ${key}:`, error)
      return false
    }
  }

  buildFilterQuery(
    body: TableQuery['filter'],
    columns: Record<string, SchemaTableColumn>
  ): Array<{
    key: string
    column: SchemaTableColumn
    conditions: Array<TableFilterConditionResult>
    predicate: (value: TableFilterValue) => boolean
  }> {
    const query = Object.entries(body).map(([key, value]) => {
      const column = columns[key]
      const conditions = Object.entries(value).map(([key, value]) => {
        return {
          key,
          value
        } as TableFilterConditionResult
      })

      return {
        key,
        value,
        column,
        conditions,
        predicate: (value: TableFilterValue): boolean => {
          return (
            conditions
              .map((condition) => {
                return this.evaluateFilterCondition(condition, value)
              })
              .filter(Boolean).length === conditions.length
          )
        }
      }
    })
    return query.filter((item) => !!item.column)
  }

  buildSortQuery(
    body: TableQuery['sort'],
    columns: Record<string, SchemaTableColumn>
  ): Array<{
    key: string
    column: SchemaTableColumn
    direction: TableSortDirection
    comparator: (a: TableFilterValue, b: TableFilterValue) => number
  }> {
    const query = Object.entries(body).map(([key, direction]) => {
      const column = columns[key]
      return {
        key,
        direction,
        column,
        comparator: sortComparators[direction]
      }
    })
    return query.filter((item) => !!item.column)
  }

  queryTableRecords({
    body,
    props
  }: BuildSchemaTable<SchemaDatabaseTableProps, TableQuery>): TableResponse {
    try {
      const tableStore = this.getTableStore(props)
      const columns = this.getDatabaseInstance(props)
        .get(['tables', props.tableId, 'columns'])
        .value()

      // Build filter query
      const filterQuery = this.buildFilterQuery(body.filter ?? {}, columns)

      // Build sort query
      const sortQuery = this.buildSortQuery(body.sort ?? {}, columns)

      // Get all rows
      let rows = tableStore.chain.get('rows').values().value()

      // Apply filters
      if (filterQuery.length > 0) {
        rows = rows.filter((row) =>
          filterQuery.every((filterItem) => filterItem.predicate(row[filterItem.key]))
        )
      }

      // Apply sorting
      if (sortQuery.length > 0) {
        rows.sort((a, b) => {
          for (const sortItem of sortQuery) {
            const comparison = sortItem.comparator(a[sortItem.key], b[sortItem.key])
            if (comparison !== 0) return comparison
          }
          return 0
        })
      }

      // Apply pagination
      const startIndex = body.offset ?? 0
      const endIndex = body.limit ? startIndex + body.limit : undefined
      const paginatedRows = body.limit ? rows.slice(startIndex, endIndex) : rows

      return {
        data: paginatedRows,
        total: rows.length,
        limit: body.limit,
        offset: body.offset ?? 0,
        hasMore: body.limit ? startIndex + body.limit < rows.length : false
      }
    } catch (error) {
      console.error('Error querying table records:', error)
      throw new Error(
        `Failed to query table records: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
