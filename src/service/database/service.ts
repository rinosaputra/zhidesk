import { SchemaDatabaseStore } from '@schema/database'
import { createLowDB, CreateLowDBProps, LowWithLodash, pathDefaultLowDB } from '@service/libs/lowdb'
import _ from 'lodash'

type DatabaseServiceProps = {
  database: CreateLowDBProps<SchemaDatabaseStore>
  tables: Record<string, CreateLowDBProps<SchemaDatabaseStore>>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordAny = Record<string, any>

type Databases = LowWithLodash<SchemaDatabaseStore>
type Table = LowWithLodash<RecordAny>

export class DatabaseService {
  private props: DatabaseServiceProps = {
    database: {
      defaultValue: {},
      filepath: pathDefaultLowDB,
      filename: 'database'
    },
    tables: {}
  }
  private databases: Databases | null = null
  private tables: Record<string, Table> = {}

  constructor(props: Partial<Partial<CreateLowDBProps<SchemaDatabaseStore>>>) {
    this.initializeDatabases(props)
  }

  initializeDatabases(props: Partial<CreateLowDBProps<SchemaDatabaseStore>>): Databases {
    try {
      if (this.databases) return this.databases
      this.props.database = {
        ...this.props.database,
        ...props
      }
      this.databases = createLowDB(this.props.database)
      this.databases.read()
      if (props.defaultValue) this.databases.write()
      return this.databases
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }

  getDatabase(databaseId: string): _.ObjectChain<SchemaDatabaseStore[string]> {
    if (!this.databases) throw new Error(`Database not initialize`)
    const database = this.databases.chain.get(databaseId)
    if (database.isUndefined()) throw new Error(`Database not found`)
    return database
  }

  initializeTable(tableId: string, defaultValue?: RecordAny): Table {
    try {
      if (this.tables[tableId]) return this.tables[tableId]
      this.props.tables[tableId] = {
        defaultValue: defaultValue ?? {},
        filename: tableId,
        filepath: this.props.database.filepath,
        onMemory: this.props.database.onMemory
      }
      this.tables[tableId] = createLowDB(this.props.tables[tableId])
      this.tables[tableId].read()
      if (defaultValue) this.tables[tableId].write()
      return this.tables[tableId]
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }

  getTableSchema(tableId: string): Table {
    const table = this.initializeTable(tableId)
    return table
  }

  getTable(tableId: string): Table {
    const table = this.initializeTable(tableId)
    return table
  }
}
