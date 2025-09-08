/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/schema/database/generator.ts
import { z } from 'zod'
import {
  Field,
  Table,
  Database,
  StringField,
  NumberField,
  BooleanField,
  DateField,
  EnumField,
  ReferenceField,
  ArrayField,
  ObjectField
} from './types'

export class DatabaseGenerator {
  private tables: Map<string, Table> = new Map()
  private generatedSchemas: Map<string, z.ZodTypeAny> = new Map()
  private database: Database

  constructor(databaseConfig: Partial<Database> = {}) {
    this.database = {
      name: databaseConfig.name || 'default-database',
      version: databaseConfig.version || 1,
      tables: databaseConfig.tables || [],
      createdAt: databaseConfig.createdAt || new Date(),
      updatedAt: databaseConfig.updatedAt || new Date()
    }

    // Register semua table yang diberikan
    this.database.tables.forEach((table) => this.registerTable(table))
  }

  // Table management
  registerTable(table: Table): void {
    this.tables.set(table.name, table)
    this.generatedSchemas.delete(table.name)
  }

  getTable(tableName: string): Table | undefined {
    return this.tables.get(tableName)
  }

  getAllTables(): Table[] {
    return Array.from(this.tables.values())
  }

  // Schema generation
  generateTableSchema(tableName: string): z.ZodObject<any> {
    if (this.generatedSchemas.has(tableName)) {
      return this.generatedSchemas.get(tableName) as z.ZodObject<any>
    }

    const table = this.getTable(tableName)
    if (!table) {
      throw new Error(`Table ${tableName} not found`)
    }

    const shape: Record<string, z.ZodTypeAny> = {}

    // Generate schema untuk setiap field
    for (const field of table.fields) {
      shape[field.name] = this.generateFieldSchema(field)
    }

    // Tambahkan metadata fields
    if (table.timestamps) {
      shape._createdAt = z.date().default(() => new Date())
      shape._updatedAt = z.date().default(() => new Date())
    }

    if (table.softDelete) {
      shape._deletedAt = z.date().nullable().optional()
    }

    // Tambahkan ID field
    shape._id = z.uuid().default(() => this.generateId())

    let tableSchema = z.object(shape)

    // Terapkan validasi tingkat table
    if (table.validation?.strict) {
      tableSchema = tableSchema.strict()
    }

    this.generatedSchemas.set(tableName, tableSchema)
    return tableSchema
  }

  private generateFieldSchema(field: Field): z.ZodTypeAny {
    switch (field.type) {
      case 'string':
        return this.generateStringSchema(field as StringField)
      case 'number':
        return this.generateNumberSchema(field as NumberField)
      case 'boolean':
        return this.generateBooleanSchema(field as BooleanField)
      case 'date':
        return this.generateDateSchema(field as DateField)
      case 'enum':
        return this.generateEnumSchema(field as EnumField)
      case 'reference':
        return this.generateReferenceSchema(field as ReferenceField)
      case 'array':
        return this.generateArraySchema(field as ArrayField)
      case 'object':
        return this.generateObjectSchema(field as ObjectField)
      default:
        throw new Error(`Unknown field type: ${(field as any).type}`)
    }
  }

  private generateStringSchema(field: StringField): z.ZodString {
    let schema = field.coerce ? z.coerce.string() : z.string()

    if (field.validation) {
      const { min, max, length, pattern, format, trim } = field.validation

      if (min !== undefined) schema = schema.min(min)
      if (max !== undefined) schema = schema.max(max)
      if (length !== undefined) schema = schema.length(length)
      if (pattern) schema = schema.regex(new RegExp(pattern))
      if (trim) schema = schema.trim()

      if (format) {
        switch (format) {
          case 'email':
            schema = z.email()
            break
          case 'url':
            schema = z.url()
            break
          case 'uuid':
            schema = z.uuid()
            break
          case 'phone':
            schema = schema.regex(/^\+?[\d\s\-()]+$/)
            break
          case 'password':
            schema = schema.min(8)
            break
        }
      }
    }

    return this.applyFieldModifiers(schema, field) as z.ZodString
  }

  private generateNumberSchema(field: NumberField): z.ZodNumber {
    let schema = field.coerce ? z.coerce.number() : z.number()

    if (field.validation) {
      const { min, max, integer, positive, nonnegative, multipleOf } = field.validation

      if (min !== undefined) schema = schema.min(min)
      if (max !== undefined) schema = schema.max(max)
      if (integer) schema = schema.int()
      if (positive) schema = schema.positive()
      if (nonnegative) schema = schema.nonnegative()
      if (multipleOf) schema = schema.multipleOf(multipleOf)
    }

    return this.applyFieldModifiers(schema, field) as z.ZodNumber
  }

  private generateBooleanSchema(field: BooleanField): z.ZodBoolean {
    let schema = field.coerce ? z.coerce.boolean() : z.boolean()

    if (field.validation) {
      const { is } = field.validation

      if (is) {
        schema = schema.refine((val) => val === Boolean(is), 'Value must be ' + field.validation.is)
      }
    }

    return this.applyFieldModifiers(schema, field) as z.ZodBoolean
  }

  private generateDateSchema(field: DateField): z.ZodDate {
    let schema = field.coerce ? z.coerce.date() : z.date()

    if (field.validation) {
      const { min, max, past, future } = field.validation

      if (min) schema = schema.min(min)
      if (max) schema = schema.max(max)
      if (past) schema = schema.max(new Date())
      if (future) schema = schema.min(new Date())
    }

    return this.applyFieldModifiers(schema, field) as z.ZodDate
  }

  private generateEnumSchema(field: EnumField): z.ZodEnum<Readonly<Record<string, string>>> {
    if (!field.options || field.options.length === 0) {
      throw new Error('Enum field must have options array with at least one value')
    }

    return this.applyFieldModifiers(z.enum(field.options), field)
  }

  private generateReferenceSchema(field: ReferenceField): z.ZodString {
    let schema = z.string().uuid()

    if (field.validation?.required) {
      schema = schema.min(1, 'Reference ID is required')
    }

    return this.applyFieldModifiers(schema, field)
  }

  private generateArraySchema(field: ArrayField): z.ZodArray<any> {
    const itemSchema = this.generateFieldSchema(field.items)
    let schema = z.array(itemSchema)

    if (field.validation) {
      const { min, max, length, unique } = field.validation

      if (min !== undefined) schema = schema.min(min)
      if (max !== undefined) schema = schema.max(max)
      if (length !== undefined) schema = schema.length(length)
      if (unique) {
        schema = schema.refine(
          (arr) => arr.length === new Set(arr).size,
          'Array must contain unique values'
        )
      }
    }

    return this.applyFieldModifiers(schema, field)
  }

  private generateObjectSchema(field: ObjectField): z.ZodObject<any> {
    const shape: Record<string, z.ZodTypeAny> = {}

    for (const subField of field.fields) {
      shape[subField.name] = this.generateFieldSchema(subField)
    }

    let schema = z.object(shape)

    if (field.validation) {
      const { strict, passthrough } = field.validation

      if (strict) schema = schema.strict()
      if (passthrough) schema = schema.passthrough()
    }

    return this.applyFieldModifiers(schema, field)
  }

  private applyFieldModifiers<T extends z.ZodTypeAny>(schema: T, field: Field): T {
    let result = schema

    // Handle required/optional
    if (!field.required) {
      // @ts-ignore
      result = result.optional() as T
    }

    // Handle nullable
    if (field.type !== 'reference' && !field.required) {
      // @ts-ignore
      result = result.nullable() as T
    }

    // Apply default value
    if (field.default !== undefined) {
      // @ts-ignore
      result = result.default(field.default) as T
    }

    return result
  }

  // Utility methods
  private generateId(): string {
    return crypto.randomUUID()
  }

  extractDefaults(tableName: string): Record<string, any> {
    const table = this.getTable(tableName)
    if (!table) return {}

    const defaults: Record<string, any> = {
      id: this.generateId()
    }

    for (const field of table.fields) {
      defaults[field.name] =
        field.default !== undefined ? field.default : this.getDefaultValueForType(field.type)
    }

    if (table.timestamps) {
      defaults.createdAt = new Date()
      defaults.updatedAt = new Date()
    }

    if (table.softDelete) {
      defaults.deletedAt = null
    }

    return defaults
  }

  private getDefaultValueForType(type: string): any {
    switch (type) {
      case 'string':
        return ''
      case 'number':
        return 0
      case 'boolean':
        return false
      case 'date':
        return new Date()
      case 'enum':
        return ''
      case 'reference':
        return ''
      case 'array':
        return []
      case 'object':
        return {}
      default:
        return null
    }
  }

  validateData(tableName: string, data: any): any {
    const schema = this.generateTableSchema(tableName)
    return schema.parse(data)
  }

  // Database operations
  getDatabase(): Database {
    return {
      ...this.database,
      tables: this.getAllTables(),
      updatedAt: new Date()
    }
  }

  clearCache(): void {
    this.generatedSchemas.clear()
  }
}
