// File: src/schema/database/client.ts
import z from 'zod'
import {
  SchemaColumnEnum,
  SchemaColumnString,
  SchemaColumnNumber,
  SchemaDatabase,
  SchemaDatabaseStore,
  SchemaTable,
  SchemaTableColumn,
  SchemaColumnBoolean,
  SchemaColumnDate,
  SchemaColumnArray,
  SchemaColumnObject,
  SchemaDatabaseProps,
  SchemaDatabaseTableProps
} from '.'
import _ from 'lodash'

interface Options {
  useISODateFormat?: boolean
}

type ZodISODateTypes = z.ZodISODate | z.ZodISODateTime | z.ZodISOTime

export type ZodGeneratedTypePrimitive = string | number | boolean | Date | undefined
export type ZodGeneratedType =
  | ZodGeneratedTypePrimitive
  | ZodGeneratedTypePrimitive[]
  | Record<string, ZodGeneratedTypePrimitive>
  | Record<string, ZodGeneratedTypePrimitive>[]
export type ZodSchemaPrimitive =
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodDate
  | z.ZodEnum
  | z.ZodLiteral<boolean>
export type ZodSchemaComposite =
  | z.ZodArray<ZodSchemaPrimitive>
  // @ts-ignore #Infinite
  | z.ZodObject<Record<string, ZodSchemaResult>>
export type ZodSchemaWithDefault = z.ZodDefault<ZodSchemaPrimitive | ZodSchemaComposite>
export type ZodSchemaNullable = z.ZodNullable<ZodSchemaPrimitive | ZodSchemaComposite>
export type ZodSchemaOptional = z.ZodOptional<ZodSchemaPrimitive | ZodSchemaComposite>
export type ZodSchemaResult =
  | ZodSchemaPrimitive
  | ZodSchemaComposite
  | ZodSchemaWithDefault
  | ZodSchemaNullable
  | ZodSchemaOptional

type GenerateZodSchemaResult = z.ZodObject<Record<string, ZodSchemaResult>>

type SchemaStoreTables = SchemaDatabaseStore[string]['tables']
type SchemaStoreColumns = SchemaStoreTables[string]['columns']

export class DatabaseClient {
  private instance: _.ObjectChain<SchemaDatabaseStore> | undefined

  constructor(databases: SchemaDatabase[]) {
    this.instance = _.chain(databases)
      .keyBy('_id')
      .mapValues((db: SchemaDatabase) => ({
        ...db,
        tables: _.chain(db.tables)
          .keyBy('_id')
          .mapValues((table: SchemaTable) => ({
            ...table,
            columns: _.chain(table.columns).keyBy('_id').value()
          }))
          .value()
      }))
  }

  setInstance(database: SchemaDatabaseStore): void {
    this.instance = _.chain(database)
  }

  getTables({ databaseId }: SchemaDatabaseProps): _.ObjectChain<SchemaStoreTables> {
    if (!this.instance || this.instance.get(databaseId).isUndefined().value())
      throw new Error('Database not initialized')
    return this.instance.get([databaseId, 'tables'])
  }

  getTable(props: SchemaDatabaseTableProps): _.ObjectChain<SchemaStoreTables[string]> {
    const find = this.getTables(props).get(props.tableId)
    if (find.isUndefined().value()) {
      throw new Error(`Table not found`)
    }
    return find
  }

  getTableColumns(props: SchemaDatabaseTableProps): _.ObjectChain<SchemaStoreColumns> {
    return this.getTable(props).get('columns')
  }

  setMeta(
    result: ZodSchemaResult,
    { description, name: title, type }: SchemaTableColumn
  ): ZodSchemaResult {
    if (type === 'date') return result.meta({ title, description, format: 'date', type: 'number' })
    if (type === 'number') return result.meta({ title, description, type: 'number' })
    return result.meta({ title, description })
  }

  generateZodString(column: SchemaColumnString): ZodSchemaResult {
    if (column.validation?.format) {
      if (column.validation.format === 'email') {
        return z.email() as unknown as z.ZodString
      }
      if (column.validation.format === 'url') {
        return z.url() as unknown as z.ZodString
      }
      if (column.validation.format === 'uuid') {
        return z.uuid() as unknown as z.ZodString
      }
    }
    let schema = z.string()
    if (column.validation?.length) {
      schema = schema.length(
        column.validation.length,
        `${column.name} must be ${column.validation.length} characters long`
      )
    }
    if (column.validation?.max) {
      schema = schema.max(
        column.validation.max,
        `${column.name} must be shorter than ${column.validation.max} characters`
      )
    }
    if (column.validation?.min) {
      schema = schema.min(
        column.validation.min,
        `${column.name} must be longer than ${column.validation.min} characters`
      )
    }
    if (column.validation?.pattern) {
      schema = schema.regex(new RegExp(column.validation.pattern), {
        message: `${column.name} must match the pattern ${column.validation.pattern}`
      })
    }
    if (column.validation?.trim) {
      schema = schema.trim()
    }
    if (column.isNullable) {
      schema = schema.nullable() as unknown as z.ZodString
    }
    if (column.isOptional) {
      schema = schema.optional() as unknown as z.ZodString
    }
    if (column.validation?.defaultValue) {
      schema = schema.default(column.validation.defaultValue) as unknown as z.ZodString
    }
    return schema
  }

  generateZodNumber(column: SchemaColumnNumber): ZodSchemaResult {
    let schema = z.number()
    if (column.validation?.min) {
      schema = schema.min(
        column.validation.min,
        `${column.name} must be greater than ${column.validation.min}`
      )
    }
    if (column.validation?.max) {
      schema = schema.max(
        column.validation.max,
        `${column.name} must be less than ${column.validation.max}`
      )
    }
    if (column.validation?.integer) {
      schema = schema.int(`${column.name} must be an integer`)
    } else if (column.validation?.positive) {
      schema = schema.positive(`${column.name} must be a positive number`)
    } else if (column.validation?.nonnegative) {
      schema = schema.nonnegative(`${column.name} must be a non-negative number`)
    } else if (column.validation?.multipleOf) {
      schema = schema.multipleOf(
        column.validation.multipleOf,
        `${column.name} must be a multiple of ${column.validation.multipleOf}`
      )
    }
    if (column.isNullable) {
      schema = schema.nullable() as unknown as z.ZodNumber
    }
    if (column.isOptional) {
      schema = schema.optional() as unknown as z.ZodNumber
    }
    if (column.validation?.defaultValue) {
      schema = schema.default(column.validation.defaultValue) as unknown as z.ZodNumber
    }
    return schema
  }

  generateZodEnum(column: SchemaColumnEnum): ZodSchemaResult {
    const values = column.validation?.options?.map((opt) => opt.value) as [string, ...string[]]
    if (!values || values.length === 0) return z.string()
    let schema = z.enum(values)
    if (column.isNullable) {
      schema = schema.nullable() as unknown as typeof schema
    }
    if (column.isOptional) {
      schema = schema.optional() as unknown as typeof schema
    }
    if (column.validation?.defaultValue) {
      schema = schema.default(column.validation.defaultValue) as unknown as typeof schema
    }
    return schema
  }

  generateZodBoolean(column: SchemaColumnBoolean): ZodSchemaResult {
    if (column.validation?.literal)
      return z.literal(column.validation.literal === 'true') as z.ZodLiteral<boolean>
    let schema = z.boolean()
    if (column.isNullable) {
      schema = schema.nullable() as unknown as z.ZodBoolean
    }
    if (column.isOptional) {
      schema = schema.optional() as unknown as z.ZodBoolean
    }
    if (column.validation?.defaultValue) {
      schema = schema.default(column.validation.defaultValue) as unknown as z.ZodBoolean
    }
    return schema
  }

  generateZodDate(column: SchemaColumnDate): ZodSchemaResult {
    let schema = z.date()
    if (column.validation) {
      if (column.validation.min) {
        schema = schema.min(column.validation.min)
      }
      if (column.validation.max) {
        schema = schema.max(column.validation.max)
      }
      if (column.validation.past) {
        schema = schema.max(new Date())
      }
      if (column.validation.future) {
        schema = schema.min(new Date())
      }
      if (column.validation?.defaultValue) {
        schema = schema.default(column.validation.defaultValue) as unknown as z.ZodDate
      }
    }
    if (column.isNullable) {
      schema = schema.nullable() as unknown as z.ZodDate
    }
    if (column.isOptional) {
      schema = schema.optional() as unknown as z.ZodDate
    }

    return schema
  }

  generateZodDateISO(column: SchemaColumnDate): ZodSchemaResult {
    let schema: ZodISODateTypes | z.ZodDefault<ZodISODateTypes>
    if (column.validation?.uiComponent === 'time') {
      schema = z.iso.time() as z.ZodISOTime
    } else if (column.validation?.uiComponent === 'date') {
      schema = z.iso.date() as z.ZodISODate
    } else {
      schema = z.iso.datetime() as z.ZodISODateTime
    }
    if (column.validation) {
      if (column.validation.min) {
        schema = schema.min(column.validation.min.getDate())
      }
      if (column.validation.max) {
        schema = schema.max(column.validation.max.getDate())
      }
      if (column.validation.past) {
        schema = schema.max(Date.now())
      }
      if (column.validation.future) {
        schema = schema.min(Date.now())
      }
      if (column.validation?.defaultValue) {
        schema = schema.default(
          String(column.validation.defaultValue)
        ) as z.ZodDefault<ZodISODateTypes>
      }
    }
    if (column.isNullable) {
      schema = schema.nullable() as unknown as ZodISODateTypes
    }
    if (column.isOptional) {
      schema = schema.optional() as unknown as ZodISODateTypes
    }

    return schema as unknown as z.ZodString
  }

  generateZodArray(column: SchemaColumnArray, options: Options): ZodSchemaResult {
    let schema = z.array(
      this.generateZodSchemaForColumn(column.validation.column, options) as ZodSchemaPrimitive
    )
    if (column.validation.length) {
      schema = schema.length(column.validation.length)
    }
    if (column.validation.max) {
      schema = schema.max(column.validation.max)
    }
    if (column.validation.min) {
      schema = schema.min(column.validation.min)
    }
    return schema as ZodSchemaResult
  }

  generateZodObject(column: SchemaColumnObject, options: Options): ZodSchemaResult {
    let schema = z.object(
      Object.fromEntries(
        column.validation.columns.map((column) => [
          column.name,
          this.generateZodSchemaForColumn(column, options) as ZodSchemaPrimitive
        ])
      )
    )
    if (column.validation?.strict) {
      schema = schema.strict()
    }
    if (column.validation?.passthrough) {
      schema = schema.loose()
    }
    return schema
  }

  generateZodSchemaForColumn(column: SchemaTableColumn, options: Options): ZodSchemaResult {
    switch (column.type) {
      case 'string':
        return this.generateZodString(column)
      case 'number':
        return this.generateZodNumber(column)
      case 'enum':
        return this.generateZodEnum(column)
      case 'boolean':
        return this.generateZodBoolean(column)
      case 'date':
        return options.useISODateFormat
          ? this.generateZodDateISO(column)
          : this.generateZodDate(column)
      case 'reference':
        return z.string()
      case 'array':
        return this.generateZodArray(column, options)
      case 'object':
        return this.generateZodObject(column, options)
      default:
        return z.string()
    }
  }

  generateZodSchema(props: SchemaDatabaseTableProps, options: Options): GenerateZodSchemaResult {
    const columns = this.getTableColumns(props)
      .map<[string, ZodSchemaResult]>((column) => {
        return [column.name, this.setMeta(this.generateZodSchemaForColumn(column, options), column)]
      })
      .value()
    return z.object(Object.fromEntries(columns))
  }

  generateZodJSON(props: SchemaDatabaseTableProps): z.core.JSONSchema.BaseSchema {
    try {
      const table = this.getTable(props).value()
      return z.toJSONSchema(
        this.generateZodSchema(props, { useISODateFormat: true }).meta({
          title: table.name,
          description: table.description
        })
      )
    } catch (error) {
      throw new Error((error as Error).message)
    }
  }

  private findDefaultValues(column: SchemaTableColumn): ZodGeneratedType {
    switch (column.type) {
      case 'array':
        return []
      case 'string':
        return column.validation?.defaultValue ?? ''
      case 'number':
        return column.validation?.defaultValue ?? 0
      case 'boolean':
        return column.validation?.defaultValue ?? false
      case 'object':
        return Object.fromEntries(
          column.validation.columns.map<[string, ZodGeneratedTypePrimitive]>((column) => [
            column.name,
            this.findDefaultValues(column) as ZodGeneratedTypePrimitive
          ])
        )
      case 'date':
        return String(column.validation?.defaultValue ?? new Date())
      case 'enum':
        return column.validation.defaultValue ?? column.validation.options?.[0].value ?? ''
      case 'reference':
        return ''
      default:
        return undefined
    }
  }

  getDefaultValues(props: SchemaDatabaseTableProps): Record<string, ZodGeneratedType> {
    return Object.fromEntries(
      this.getTableColumns(props)
        .map<[string, ZodGeneratedType]>((prop) => [
          prop.name,
          this.generateZodSchema(props, {}) as unknown as ZodGeneratedType
        ])
        .value()
    )
  }
}
