/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/service/database/service.ts
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { mkdir, access, constants } from 'fs/promises'
import _ from 'lodash'
import { DatabaseGenerator } from './generator'
import { exampleUserTable, examplePostTable } from './examples'
import { Table } from './types'
import { AggregationStage, DocumentData, QueryOptions, SearchOptions } from './types'

// ==================== DATABASE SERVICE ====================

export class DatabaseService {
  private static instance: DatabaseService
  private dbs: Map<string, Low<DocumentData[]>> = new Map()
  private generators: Map<string, DatabaseGenerator> = new Map()
  private baseDataPath: string = 'data'

  private constructor() {
    this.initializeBaseDirectories()
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private async initializeBaseDirectories(): Promise<void> {
    try {
      await mkdir(this.baseDataPath, { recursive: true })
    } catch (error) {
      console.error('Error creating base data directory:', error)
    }
  }

  // Database management
  async initializeDatabase(
    databaseId: string,
    databaseName: string,
    tables: Table[] = []
  ): Promise<void> {
    const databasePath = join(this.baseDataPath, databaseId)

    try {
      await mkdir(databasePath, { recursive: true })

      const generator = new DatabaseGenerator({
        name: `${databaseName}_database`,
        tables: [...tables, exampleUserTable, examplePostTable] as Table[]
      })

      this.generators.set(databaseId, generator)

      for (const table of generator.getAllTables()) {
        await this.initializeTable(databaseId, table.name)
      }
    } catch (error) {
      console.error(`Error initializing database ${databaseId}:`, error)
      throw error
    }
  }

  private async initializeTable(databaseId: string, tableName: string): Promise<void> {
    const tablePath = join(this.baseDataPath, databaseId, `${tableName}.json`)

    try {
      await mkdir(dirname(tablePath), { recursive: true })

      try {
        await access(tablePath, constants.F_OK)
      } catch {
        const adapter = new JSONFile<DocumentData[]>(tablePath)
        const db = new Low(adapter, [])
        db.data = []
        await db.write()
      }
    } catch (error) {
      console.error(`Error initializing table ${tableName} for database ${databaseId}:`, error)
      throw error
    }
  }

  private async getDatabase(databaseId: string, tableName: string): Promise<Low<DocumentData[]>> {
    const dbKey = `${databaseId}_${tableName}`

    if (!this.dbs.has(dbKey)) {
      const tablePath = join(this.baseDataPath, databaseId, `${tableName}.json`)
      const adapter = new JSONFile<DocumentData[]>(tablePath)
      const db = new Low(adapter, [])

      await db.read()

      if (db.data === null) {
        db.data = []
        await db.write()
      }

      this.dbs.set(dbKey, db)
    }

    return this.dbs.get(dbKey)!
  }

  private getGenerator(databaseId: string): DatabaseGenerator {
    const generator = this.generators.get(databaseId)
    if (!generator) {
      throw new Error(`Database ${databaseId} not initialized`)
    }
    return generator
  }

  // Table operations
  async createDatabaseTable(databaseId: string, Table: Table): Promise<boolean> {
    try {
      const generator = this.getGenerator(databaseId)
      generator.registerTable(Table)

      await this.initializeTable(databaseId, Table.name)
      return true
    } catch (error) {
      console.error('Error creating table:', error)
      return false
    }
  }

  // Data operations
  async find(
    databaseId: string,
    tableName: string,
    query: Record<string, unknown> = {},
    options: QueryOptions = {}
  ): Promise<DocumentData[]> {
    this.getGenerator(databaseId)

    const db = await this.getDatabase(databaseId, tableName)
    let data = _.cloneDeep(db.data || [])

    if (!_.isEmpty(query)) {
      data = _.filter(data, (item) => {
        return _.every(query, (value, key) => {
          if (key.includes('.') || key.includes('[')) {
            return _.isEqual(_.get(item, key), value)
          }
          return _.isEqual(item[key], value)
        })
      })
    }

    if (options.sort && !_.isEmpty(options.sort)) {
      const sortFields = _.map(options.sort, (_direction, field) => {
        return (obj: DocumentData) => {
          const value = _.get(obj, field)
          return typeof value === 'string' ? value.toLowerCase() : value
        }
      })

      const sortOrders = _.map(options.sort, (direction) => (direction === 1 ? 'asc' : 'desc'))
      data = _.orderBy(data, sortFields, sortOrders)
    }

    if (options.skip || options.limit) {
      const skip = options.skip || 0
      const limit = options.limit || data.length
      data = _.slice(data, skip, skip + limit)
    }

    return data
  }

  async findOne(
    databaseId: string,
    tableName: string,
    query: Record<string, unknown> = {}
  ): Promise<DocumentData | null> {
    const results = await this.find(databaseId, tableName, query, { limit: 1 })
    return _.first(results) || null
  }

  async findById(databaseId: string, tableName: string, id: string): Promise<DocumentData | null> {
    this.getGenerator(databaseId)

    const db = await this.getDatabase(databaseId, tableName)
    return _.find(db.data, { _id: id }) || null
  }

  async findByField(
    databaseId: string,
    tableName: string,
    field: string,
    value: unknown
  ): Promise<DocumentData[]> {
    this.getGenerator(databaseId)

    const db = await this.getDatabase(databaseId, tableName)
    return _.filter(db.data, (item) => _.get(item, field) === value)
  }

  async search(
    databaseId: string,
    tableName: string,
    searchTerm: string,
    fields: string[] = [],
    options: SearchOptions = {}
  ): Promise<DocumentData[]> {
    this.getGenerator(databaseId)

    const db = await this.getDatabase(databaseId, tableName)
    let data = db.data || []

    if (searchTerm && fields.length > 0) {
      const searchRegex = new RegExp(_.escapeRegExp(searchTerm), 'i')

      data = _.filter(data, (item) => {
        return _.some(fields, (field) => {
          const value = _.get(item, field)
          return value && searchRegex.test(String(value))
        })
      })
    }

    if (options.sort) {
      data = this.applySorting(data, options.sort)
    }

    if (options.skip || options.limit) {
      const skip = options.skip || 0
      const limit = options.limit || data.length
      data = _.slice(data, skip, skip + limit)
    }

    return data
  }

  async aggregate(
    databaseId: string,
    tableName: string,
    pipeline: AggregationStage[]
  ): Promise<DocumentData[]> {
    try {
      this.getGenerator(databaseId)

      const db = await this.getDatabase(databaseId, tableName)
      let data = _.cloneDeep(db.data || [])

      for (const stage of pipeline) {
        if (stage.$match) {
          data = this.applyMatchStage(data, stage.$match)
        } else if (stage.$group) {
          data = this.applyGroupStage(data, stage.$group)
        } else if (stage.$sort) {
          data = this.applySortStage(data, stage.$sort)
        } else if (stage.$project) {
          data = this.applyProjectStage(data, stage.$project)
        } else if (stage.$skip) {
          data = this.applySkipStage(data, stage.$skip)
        } else if (stage.$limit) {
          data = this.applyLimitStage(data, stage.$limit)
        } else if (stage.$unwind) {
          data = this.applyUnwindStage(data, stage.$unwind)
        } else if (stage.$lookup) {
          data = await this.applyLookupStage(databaseId, data, stage.$lookup)
        } else if (stage.$addFields) {
          data = this.applyAddFieldsStage(data, stage.$addFields)
        }
      }

      return data
    } catch (error) {
      console.error('Error executing aggregation pipeline:', error)
      throw error
    }
  }

  private applyMatchStage(data: any[], matchQuery: any): any[] {
    return _.filter(data, matchQuery)
  }

  private applyGroupStage(data: any[], groupStage: any): any[] {
    const results: any[] = []
    const grouped = _.groupBy(data, (item) => {
      if (_.isString(groupStage._id)) {
        const fieldPath = groupStage._id.startsWith('$')
          ? groupStage._id.substring(1)
          : groupStage._id
        return _.get(item, fieldPath)
      } else if (_.isObject(groupStage._id)) {
        const compositeKey: Record<string, any> = {}
        _.forEach(groupStage._id, (value, key) => {
          if (_.isString(value) && value.startsWith('$')) {
            compositeKey[key] = _.get(item, value.substring(1))
          } else {
            compositeKey[key] = value
          }
        })
        return JSON.stringify(compositeKey)
      } else {
        return groupStage._id
      }
    })

    _.forEach(grouped, (groupItems, groupKey) => {
      const result: any = {
        _id: _.isObject(groupStage._id) ? JSON.parse(groupKey) : groupKey
      }

      _.forEach(groupStage, (operation, field) => {
        if (field !== '_id') {
          if (operation.$sum) {
            result[field] = this.calculateSum(groupItems, operation.$sum)
          } else if (operation.$avg) {
            result[field] = this.calculateAvg(groupItems, operation.$avg)
          } else if (operation.$min) {
            result[field] = this.calculateMin(groupItems, operation.$min)
          } else if (operation.$max) {
            result[field] = this.calculateMax(groupItems, operation.$max)
          } else if (operation.$push) {
            result[field] = this.calculatePush(groupItems, operation.$push)
          } else if (operation.$addToSet) {
            result[field] = this.calculateAddToSet(groupItems, operation.$addToSet)
          } else if (operation.$first) {
            result[field] = this.calculateFirst(groupItems, operation.$first)
          } else if (operation.$last) {
            result[field] = this.calculateLast(groupItems, operation.$last)
          } else if (operation.$count) {
            result[field] = groupItems.length
          }
        }
      })

      results.push(result)
    })

    return results
  }

  private calculateSum(items: any[], expression: any): number {
    if (expression === 1) {
      return items.length
    } else if (_.isString(expression) && expression.startsWith('$')) {
      const fieldPath = expression.substring(1)
      return _.sumBy(items, fieldPath)
      // @ts-ignore
    } else if (_.isObject(expression) && expression.$multiply) {
      return _.sumBy(items, (item) => {
        // @ts-ignore
        const factors = expression.$multiply.map((factor: any) => {
          if (_.isString(factor) && factor.startsWith('$')) {
            return _.get(item, factor.substring(1))
          }
          return factor
        })
        return factors.reduce((acc: number, val: number) => acc * val, 1)
      })
    }
    return 0
  }

  private calculateAvg(items: any[], expression: any): number {
    if (_.isString(expression) && expression.startsWith('$')) {
      const fieldPath = expression.substring(1)
      return _.meanBy(items, fieldPath)
    }
    return 0
  }

  private calculateMin(items: any[], expression: any): any {
    if (_.isString(expression) && expression.startsWith('$')) {
      const fieldPath = expression.substring(1)
      return _.minBy(items, fieldPath)?.[fieldPath]
    }
    return undefined
  }

  private calculateMax(items: any[], expression: any): any {
    if (_.isString(expression) && expression.startsWith('$')) {
      const fieldPath = expression.substring(1)
      return _.maxBy(items, fieldPath)?.[fieldPath]
    }
    return undefined
  }

  private calculatePush(items: any[], expression: any): any[] {
    if (_.isString(expression) && expression.startsWith('$')) {
      const fieldPath = expression.substring(1)
      return _.map(items, fieldPath)
    }
    return []
  }

  private calculateAddToSet(items: any[], expression: any): any[] {
    if (_.isString(expression) && expression.startsWith('$')) {
      const fieldPath = expression.substring(1)
      return _.uniq(_.map(items, fieldPath))
    }
    return []
  }

  private calculateFirst(items: any[], expression: any): any {
    if (_.isString(expression) && expression.startsWith('$')) {
      const fieldPath = expression.substring(1)
      return _.first(items)?.[fieldPath]
    }
    return undefined
  }

  private calculateLast(items: any[], expression: any): any {
    if (_.isString(expression) && expression.startsWith('$')) {
      const fieldPath = expression.substring(1)
      return _.last(items)?.[fieldPath]
    }
    return undefined
  }

  private applySortStage(data: any[], sortSpec: any): any[] {
    const sortFields = _.keys(sortSpec)
    const sortOrders = _.map(sortFields, (field) => (sortSpec[field] === 1 ? 'asc' : 'desc'))

    return _.orderBy(
      data,
      sortFields.map((field) => (item: any) => {
        const value = _.get(item, field)
        return typeof value === 'string' ? value.toLowerCase() : value
      }),
      sortOrders
    )
  }

  private applyProjectStage(data: any[], projectSpec: any): any[] {
    return _.map(data, (item) => {
      const result: any = {}

      _.forEach(projectSpec, (value, field) => {
        if (value === 1 || value === true) {
          // Include field
          _.set(result, field, _.get(item, field))
        } else if (value === 0 || value === false) {
          // Exclude field - do nothing
        } else if (_.isObject(value)) {
          // Handle expressions
          // @ts-ignore
          if (value.$concat) {
            // @ts-ignore
            const values = value.$concat.map((part: any) => {
              if (_.isString(part) && part.startsWith('$')) {
                return _.get(item, part.substring(1))
              }
              return part
            })
            _.set(result, field, values.join(''))
            // @ts-ignore
          } else if (value.$toUpper) {
            const fieldValue =
              // @ts-ignore
              _.isString(value.$toUpper) && value.$toUpper.startsWith('$')
                ? // @ts-ignore
                  _.get(item, value.$toUpper.substring(1))
                : // @ts-ignore
                  value.$toUpper
            _.set(result, field, _.isString(fieldValue) ? fieldValue.toUpperCase() : fieldValue)
            // @ts-ignore
          } else if (value.$toLower) {
            const fieldValue =
              // @ts-ignore
              _.isString(value.$toLower) && value.$toLower.startsWith('$')
                ? // @ts-ignore
                  _.get(item, value.$toLower.substring(1))
                : // @ts-ignore
                  value.$toLower
            _.set(result, field, _.isString(fieldValue) ? fieldValue.toLowerCase() : fieldValue)
          }
          // Tambahkan expression lainnya sesuai kebutuhan
        }
      })

      return result
    })
  }

  private applySkipStage(data: any[], skipCount: number): any[] {
    return _.slice(data, skipCount)
  }

  private applyLimitStage(data: any[], limitCount: number): any[] {
    return _.slice(data, 0, limitCount)
  }

  private applyUnwindStage(data: any[], unwindSpec: any): any[] {
    const result: any[] = []
    const path = unwindSpec.startsWith('$') ? unwindSpec.substring(1) : unwindSpec

    _.forEach(data, (item) => {
      const array = _.get(item, path)
      if (_.isArray(array)) {
        _.forEach(array, (element) => {
          const newItem = _.cloneDeep(item)
          _.set(newItem, path, element)
          result.push(newItem)
        })
      } else {
        result.push(item)
      }
    })

    return result
  }

  private async applyLookupStage(databaseId: string, data: any[], lookupSpec: any): Promise<any[]> {
    const { from, localField, foreignField, as } = lookupSpec
    const foreignData = await this.find(databaseId, from, {})

    return _.map(data, (item) => {
      const localValue = _.get(
        item,
        localField.startsWith('$') ? localField.substring(1) : localField
      )
      const matches = _.filter(foreignData, (foreignItem) => {
        const foreignValue = _.get(
          foreignItem,
          foreignField.startsWith('$') ? foreignField.substring(1) : foreignField
        )
        return _.isEqual(localValue, foreignValue)
      })

      const result = _.cloneDeep(item)
      _.set(result, as, matches)
      return result
    })
  }

  private applyAddFieldsStage(data: any[], addFieldsSpec: any): any[] {
    return _.map(data, (item) => {
      const result = _.cloneDeep(item)

      _.forEach(addFieldsSpec, (expression, field) => {
        if (expression.$concat) {
          const values = expression.$concat.map((part: any) => {
            if (_.isString(part) && part.startsWith('$')) {
              return _.get(item, part.substring(1))
            }
            return part
          })
          _.set(result, field, values.join(''))
        } else if (expression.$add) {
          const values = expression.$add.map((operand: any) => {
            if (_.isString(operand) && operand.startsWith('$')) {
              return _.get(item, operand.substring(1))
            }
            return operand
          })
          _.set(
            result,
            field,
            values.reduce((acc: number, val: number) => acc + val, 0)
          )
        } else if (expression.$subtract) {
          const values = expression.$subtract.map((operand: any) => {
            if (_.isString(operand) && operand.startsWith('$')) {
              return _.get(item, operand.substring(1))
            }
            return operand
          })
          _.set(
            result,
            field,
            values.reduce((acc: number, val: number) => acc - val)
          )
        }
        // Tambahkan expression lainnya sesuai kebutuhan
      })

      return result
    })
  }

  private applySorting(data: any[], sort: any): any[] {
    const sortFields = _.keys(sort)
    const sortOrders = _.map(sortFields, (field) => (sort[field] === 1 ? 'asc' : 'desc'))

    return _.orderBy(
      data,
      sortFields.map((field) => (item: any) => {
        const value = _.get(item, field)
        return typeof value === 'string' ? value.toLowerCase() : value
      }),
      sortOrders
    )
  }

  async create(databaseId: string, tableName: string, data: DocumentData): Promise<DocumentData> {
    try {
      const generator = this.getGenerator(databaseId)
      const db = await this.getDatabase(databaseId, tableName)

      const validatedData = generator.validateData(tableName, {
        ...generator.extractDefaults(tableName),
        ...data
      }) as DocumentData

      db.data.push(validatedData)
      await db.write()

      return validatedData
    } catch (error) {
      console.error('Error creating document:', error)
      throw error
    }
  }

  async createMany(
    databaseId: string,
    tableName: string,
    items: DocumentData[]
  ): Promise<DocumentData[]> {
    try {
      const generator = this.getGenerator(databaseId)
      const db = await this.getDatabase(databaseId, tableName)

      const validatedItems = items.map(
        (item) =>
          generator.validateData(tableName, {
            ...generator.extractDefaults(tableName),
            ...item
          }) as DocumentData
      )

      db.data.push(...validatedItems)
      await db.write()

      return validatedItems
    } catch (error) {
      console.error('Error creating multiple documents:', error)
      throw error
    }
  }

  async update(databaseId: string, databaseName: string, id: string, data: any): Promise<any> {
    try {
      const generator = this.getGenerator(databaseId)
      const db = await this.getDatabase(databaseId, databaseName)

      const index = _.findIndex(db.data, { _id: id })
      if (index === -1) {
        throw new Error('Document not found')
      }

      const existingData = db.data[index]
      const updatedData = {
        ...existingData,
        ...data,
        _updatedAt: new Date()
      }

      // Validasi data yang diupdate
      const validatedData = generator.validateData(databaseName, updatedData)

      db.data[index] = validatedData
      await db.write()

      return validatedData
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }

  async updateMany(
    databaseId: string,
    databaseName: string,
    query: any,
    update: any
  ): Promise<number> {
    try {
      const generator = this.getGenerator(databaseId)
      const db = await this.getDatabase(databaseId, databaseName)

      const itemsToUpdate = _.filter(db.data, query)
      let updateCount = 0

      for (const item of itemsToUpdate) {
        const index = _.findIndex(db.data, { _id: item._id })
        if (index !== -1) {
          const updatedData = {
            ...item,
            ...update,
            _updatedAt: new Date()
          }

          const validatedData = generator.validateData(databaseName, updatedData)
          db.data[index] = validatedData
          updateCount++
        }
      }

      if (updateCount > 0) {
        await db.write()
      }

      return updateCount
    } catch (error) {
      console.error('Error updating multiple documents:', error)
      throw error
    }
  }

  async delete(databaseId: string, databaseName: string, id: string): Promise<boolean> {
    try {
      const generator = this.getGenerator(databaseId)
      const db = await this.getDatabase(databaseId, databaseName)
      const table = generator.getTable(databaseName)

      const index = _.findIndex(db.data, { _id: id })
      if (index === -1) {
        return false
      }

      if (table?.softDelete) {
        // Soft delete
        db.data[index]._deletedAt = new Date()
      } else {
        // Hard delete
        _.pullAt(db.data, index)
      }

      await db.write()
      return true
    } catch (error) {
      console.error('Error deleting document:', error)
      return false
    }
  }

  async deleteMany(databaseId: string, databaseName: string, query: any): Promise<number> {
    try {
      const generator = this.getGenerator(databaseId)
      const db = await this.getDatabase(databaseId, databaseName)
      const table = generator.getTable(databaseName)

      const itemsToDelete = _.filter(db.data, query)
      let deleteCount = 0

      if (table?.softDelete) {
        // Soft delete
        const now = new Date()
        for (const item of itemsToDelete) {
          const index = _.findIndex(db.data, { _id: item._id })
          if (index !== -1) {
            db.data[index]._deletedAt = now
            deleteCount++
          }
        }
      } else {
        // Hard delete
        db.data = _.reject(db.data, query)
        deleteCount = itemsToDelete.length
      }

      if (deleteCount > 0) {
        await db.write()
      }

      return deleteCount
    } catch (error) {
      console.error('Error deleting multiple documents:', error)
      throw error
    }
  }

  // Utility methods dengan Lodash
  async count(databaseId: string, databaseName: string, query: any = {}): Promise<number> {
    // Validasi database sudah diinisialisasi
    this.getGenerator(databaseId)

    const db = await this.getDatabase(databaseId, databaseName)
    return _.size(_.filter(db.data, query))
  }

  async distinct(
    databaseId: string,
    databaseName: string,
    field: string,
    query: any = {}
  ): Promise<any[]> {
    // Validasi database sudah diinisialisasi
    this.getGenerator(databaseId)

    const db = await this.getDatabase(databaseId, databaseName)
    const filteredData = _.filter(db.data, query)
    return _.uniq(_.map(filteredData, field))
  }

  async exists(databaseId: string, databaseName: string, query: any): Promise<boolean> {
    // Validasi database sudah diinisialisasi
    this.getGenerator(databaseId)

    const db = await this.getDatabase(databaseId, databaseName)
    return _.some(db.data, query)
  }

  // Schema operations
  getTableSchema(databaseId: string, tableName: string): Table | undefined {
    const generator = this.generators.get(databaseId)
    return generator?.getTable(tableName) as Table | undefined
  }

  getAllDatabaseTables(databaseId: string): Table[] {
    const generator = this.generators.get(databaseId)
    return (generator?.getAllTables() as Table[]) || []
  }

  getDatabaseSchema(databaseId: string): { tables: Table[] } | undefined {
    const generator = this.generators.get(databaseId)
    return generator ? { tables: generator.getAllTables() as Table[] } : undefined
  }

  // Database management utilities
  async databaseExists(databaseId: string): Promise<boolean> {
    try {
      const databasePath = join(this.baseDataPath, databaseId)
      await access(databasePath, constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  async getAllDatabases(): Promise<string[]> {
    return Array.from(this.generators.keys())
  }

  async closeDatabase(databaseId: string): Promise<void> {
    const keysToRemove: string[] = []
    this.dbs.forEach((_, key) => {
      if (key.startsWith(`${databaseId}_`)) {
        keysToRemove.push(key)
      }
    })

    _.forEach(keysToRemove, (key) => this.dbs.delete(key))
    this.generators.delete(databaseId)
  }
}
