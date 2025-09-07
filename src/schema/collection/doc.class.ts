/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/schema/collection/doc.class.ts
import { z } from 'zod'
import {
  DocSchemaType,
  StringDocSchemaType,
  NumberDocSchemaType,
  BooleanDocSchemaType,
  DateDocSchemaType,
  ArrayDocSchemaType,
  ObjectDocSchemaType,
  EnumDocSchemaType,
  ReferenceDocSchemaType,
  CollectionSchemaType
} from './doc'

export class DocGenerator {
  private schemaRegistry: Map<string, DocSchemaType> = new Map()
  private generatedSchemas: Map<string, z.ZodTypeAny> = new Map()
  private collections: Map<string, CollectionSchemaType> = new Map()

  constructor(schemas?: DocSchemaType[]) {
    if (schemas) {
      schemas.forEach((schema) => this.registerSchema(schema))
    }
  }

  // Collection management
  // Di method registerCollection
  registerCollection(collection: CollectionSchemaType): void {
    this.collections.set(collection.name, collection)

    // Register the main collection schema
    this.registerSchema({
      type: 'object',
      name: collection.name,
      label: collection.label || collection.name,
      properties: collection.fields
    } as ObjectDocSchemaType)

    // Juga register individual fields jika diperlukan
    collection.fields.forEach((field) => {
      this.registerSchema(field, `${collection.name}.${field.name}`)
    })
  }

  getCollection(collectionName: string): CollectionSchemaType | undefined {
    return this.collections.get(collectionName)
  }

  // Schema management
  registerSchema(schema: DocSchemaType, fullName?: string): void {
    const name = fullName || schema.name
    this.schemaRegistry.set(name, schema)
    this.generatedSchemas.delete(name)
  }

  generate<K extends string>(schemaName: K): z.ZodTypeAny {
    if (this.generatedSchemas.has(schemaName)) {
      return this.generatedSchemas.get(schemaName)!
    }

    const schema = this.schemaRegistry.get(schemaName)
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found in registry`)
    }

    const generatedSchema = this.generateFromSchema(schema)
    this.generatedSchemas.set(schemaName, generatedSchema)
    return generatedSchema
  }

  generateCollectionSchema(collectionName: string): z.ZodObject<any> {
    const collection = this.getCollection(collectionName)
    if (!collection) {
      throw new Error(`Collection ${collectionName} not found`)
    }

    const shape: Record<string, z.ZodTypeAny> = {}

    for (const field of collection.fields) {
      shape[field.name] = this.generateFromSchema(field)
    }

    // Add metadata fields
    if (collection.timestamps) {
      shape.createdAt = z.date().optional()
      shape.updatedAt = z.date().optional()
    }

    if (collection.softDelete) {
      shape.deletedAt = z.date().nullable().optional()
    }

    let collectionSchema = z.object(shape)

    // Apply collection-level validation
    if (collection.validation?.strict) {
      collectionSchema = collectionSchema.strict()
    }

    return collectionSchema
  }

  private generateFromSchema<S extends DocSchemaType>(schema: S): z.ZodTypeAny {
    switch (schema.type) {
      case 'string':
        return this.generateStringSchema(schema as StringDocSchemaType)
      case 'number':
        return this.generateNumberSchema(schema as NumberDocSchemaType)
      case 'boolean':
        return this.generateBooleanSchema(schema as BooleanDocSchemaType)
      case 'date':
        return this.generateDateSchema(schema as DateDocSchemaType)
      case 'enum':
        return this.generateEnumSchema(schema as EnumDocSchemaType)
      case 'reference':
        return this.generateReferenceSchema(schema as ReferenceDocSchemaType)
      case 'array':
        return this.generateArraySchema(schema as ArrayDocSchemaType)
      case 'object':
        return this.generateObjectSchema(schema as ObjectDocSchemaType)
      default:
        throw new Error(`Unknown schema type: ${(schema as any).type}`)
    }
  }

  private generateEnumSchema(
    schema: EnumDocSchemaType
  ): z.ZodEnum<Readonly<Record<string, string>>> {
    if (!schema.validation?.values || schema.validation.values.length === 0) {
      throw new Error('Enum schema must have validation.values array with at least one value')
    }

    const enumValues = schema.validation.values as [string, ...string[]]
    let DocSchema = z.enum(enumValues)

    // Apply case sensitivity if needed
    if (schema.validation.caseSensitive === false) {
      DocSchema = DocSchema.transform((val) => val.toLowerCase()) as any
    }

    return this.applyModifiers(DocSchema, schema)
  }

  private generateReferenceSchema(schema: ReferenceDocSchemaType): z.ZodString {
    let DocSchema = z.string()

    if (schema.validation?.required) {
      DocSchema = DocSchema.min(1, 'Reference ID is required')
    }

    return this.applyModifiers(DocSchema, schema)
  }

  private generateStringSchema(schema: StringDocSchemaType): z.ZodString | z.ZodCoercedString {
    let DocSchema: z.ZodString | z.ZodCoercedString = schema.coerce ? z.coerce.string() : z.string()

    if (schema.validation) {
      const { min, max, length, regex, format, trim } = schema.validation

      if (format) {
        switch (format) {
          case 'email':
            DocSchema = z.email()
            break
          case 'url':
            DocSchema = z.url()
            break
          case 'uuid':
            DocSchema = z.uuid()
            break
          case 'phone':
            DocSchema = DocSchema.regex(/^\+?[\d\s\-()]+$/)
            break
          case 'password':
            DocSchema = DocSchema.min(8)
            break
        }
      }

      if (min !== undefined) DocSchema = DocSchema.min(min)
      if (max !== undefined) DocSchema = DocSchema.max(max)
      if (length !== undefined) DocSchema = DocSchema.length(length)
      if (regex) DocSchema = DocSchema.regex(new RegExp(regex))
      if (trim) DocSchema = DocSchema.trim()
    }

    return this.applyModifiers(DocSchema, schema)
  }

  private generateNumberSchema(schema: NumberDocSchemaType): z.ZodNumber | z.ZodCoercedNumber {
    let DocSchema: z.ZodNumber | z.ZodCoercedNumber = schema.coerce ? z.coerce.number() : z.number()

    if (schema.validation) {
      const { min, max, int, positive, nonnegative, multipleOf } = schema.validation

      if (min !== undefined) DocSchema = DocSchema.min(min)
      if (max !== undefined) DocSchema = DocSchema.max(max)
      if (int) DocSchema = DocSchema.int()
      if (positive) DocSchema = DocSchema.positive()
      if (nonnegative) DocSchema = DocSchema.nonnegative()
      if (multipleOf) DocSchema = DocSchema.multipleOf(multipleOf)
    }

    return this.applyModifiers(DocSchema, schema)
  }

  private generateBooleanSchema(schema: BooleanDocSchemaType): z.ZodBoolean | z.ZodCoercedBoolean {
    if (schema.coerce) {
      const coercedSchema = z.any().transform((val) => {
        if (typeof val === 'string') {
          const lowerVal = val.toLowerCase().trim()
          return lowerVal === 'true' || lowerVal === '1'
        }

        if (typeof val === 'number') return val === 1

        if (typeof val === 'boolean') return val

        return Boolean(val)
      }) as unknown as z.ZodCoercedBoolean

      let DocSchema = coercedSchema

      if (schema.validation) {
        const { isTrue, isFalse } = schema.validation

        if (isTrue) {
          DocSchema = DocSchema.refine((val) => val === true, {
            message: 'Value must be true'
          })
        }
        if (isFalse) {
          DocSchema = DocSchema.refine((val) => val === false, {
            message: 'Value must be false'
          })
        }
      }

      return this.applyModifiers(DocSchema, schema)
    } else {
      let DocSchema = z.boolean()

      if (schema.validation) {
        const { isTrue, isFalse } = schema.validation

        if (isTrue) {
          DocSchema = DocSchema.refine((val) => val === true, {
            message: 'Value must be true'
          })
        }
        if (isFalse) {
          DocSchema = DocSchema.refine((val) => val === false, {
            message: 'Value must be false'
          })
        }
      }

      return this.applyModifiers(DocSchema, schema)
    }
  }

  private generateDateSchema(schema: DateDocSchemaType): z.ZodDate | z.ZodCoercedDate {
    let DocSchema: z.ZodDate | z.ZodCoercedDate = schema.coerce ? z.coerce.date() : z.date()

    if (schema.validation) {
      const { min, max, past, future } = schema.validation

      if (min) DocSchema = DocSchema.min(min)
      if (max) DocSchema = DocSchema.max(max)
      if (past) DocSchema = DocSchema.max(new Date())
      if (future) DocSchema = DocSchema.min(new Date())
    }

    return this.applyModifiers(DocSchema, schema)
  }

  private generateArraySchema(schema: ArrayDocSchemaType): z.ZodArray<any> {
    const itemSchema = this.generateFromSchema(schema.properties)
    let DocSchema = z.array(itemSchema)

    if (schema.validation) {
      const { min, max, length, unique } = schema.validation

      if (min !== undefined) DocSchema = DocSchema.min(min)
      if (max !== undefined) DocSchema = DocSchema.max(max)
      if (length !== undefined) DocSchema = DocSchema.length(length)
      if (unique)
        DocSchema = DocSchema.refine(
          (arr) => arr.length === new Set(arr).size,
          'Array must contain unique values'
        )
    }

    return this.applyModifiers(DocSchema, schema)
  }

  private generateObjectSchema(schema: ObjectDocSchemaType): z.ZodObject<any> {
    const shape: Record<string, z.ZodTypeAny> = {}

    for (const propertySchema of schema.properties) {
      shape[propertySchema.name] = this.generateFromSchema(propertySchema)
    }

    let DocSchema = z.object(shape)

    if (schema.validation) {
      const { strict, passthrough, unknownKeys } = schema.validation

      if (strict) DocSchema = DocSchema.strict()
      if (passthrough) DocSchema = DocSchema.passthrough()

      if (unknownKeys) {
        switch (unknownKeys) {
          case 'allow':
            DocSchema = DocSchema.catchall(z.any())
            break
          case 'deny':
            DocSchema = DocSchema.strict()
            break
          case 'strip':
            // Default behavior
            break
        }
      }
    }

    return this.applyModifiers(DocSchema, schema)
  }

  private applyModifiers<T extends z.ZodTypeAny>(DocSchema: T, schema: DocSchemaType): T {
    let result: z.ZodTypeAny = DocSchema

    // Handle coerce for complex types
    if (schema.coerce && this.isComplexType(result)) {
      result = result.transform((val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val)
          } catch {
            return val
          }
        }
        return val
      })
    }

    // Apply validation modifiers
    if (schema.noempty && this.isNonEmptyableType(result)) {
      result = result.nonempty()
    }

    if (schema.nullable) {
      result = result.nullable()
    }

    if (schema.optional) {
      result = result.optional()
    }

    // Apply default value if provided
    if (schema.default !== undefined) {
      result = result.default(schema.default)
    }

    return result as T
  }

  private isComplexType(schema: z.ZodTypeAny): schema is z.ZodObject<any> | z.ZodArray<any> {
    return schema instanceof z.ZodObject || schema instanceof z.ZodArray
  }

  private isNonEmptyableType(schema: z.ZodTypeAny): schema is z.ZodString | z.ZodArray<any> {
    return schema instanceof z.ZodString || schema instanceof z.ZodArray
  }

  // Utility methods
  extractDefaults(schemaName: string): any {
    const schema = this.schemaRegistry.get(schemaName)
    if (!schema) return {}

    // Handle object schemas with nested properties
    if (schema.type === 'object') {
      const objectSchema = schema as ObjectDocSchemaType
      const result: Record<string, any> = {}

      for (const prop of objectSchema.properties) {
        // Untuk nested properties, extract dari property schema langsung
        result[prop.name] =
          prop.default !== undefined ? prop.default : this.getDefaultValueForType(prop.type)

        // Jika property adalah object, lakukan rekursi
        if (prop.type === 'object') {
          result[prop.name] = this.extractNestedDefaults(prop as ObjectDocSchemaType)
        }

        // ✅ Tambahkan handling untuk array properties
        if (prop.type === 'array') {
          const arraySchema = prop as ArrayDocSchemaType
          result[prop.name] = arraySchema.default !== undefined ? arraySchema.default : []
        }
      }

      return result
    }

    // Handle other types...
    return this.getDefaultValueForType(schema.type)
  }

  private extractNestedDefaults(schema: ObjectDocSchemaType): any {
    const result: Record<string, any> = {}

    for (const prop of schema.properties) {
      result[prop.name] =
        prop.default !== undefined ? prop.default : this.getDefaultValueForType(prop.type)

      if (prop.type === 'object') {
        result[prop.name] = this.extractNestedDefaults(prop as ObjectDocSchemaType)
      }

      // ✅ Tambahkan handling untuk array properties di nested objects
      if (prop.type === 'array') {
        const arraySchema = prop as ArrayDocSchemaType
        result[prop.name] = arraySchema.default !== undefined ? arraySchema.default : []
      }
    }

    return result
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
        return undefined
      case 'array':
        return []
      case 'object':
        return {}
      case 'enum':
        return '' // ✅ Tambahkan default untuk enum
      case 'reference':
        return '' // ✅ Tambahkan default untuk reference
      default:
        return null
    }
  }

  clearCache(): void {
    this.generatedSchemas.clear()
  }
}

// Utility functions untuk membuat schema dengan mudah
export function createStringSchema(config: Omit<StringDocSchemaType, 'type'>): StringDocSchemaType {
  return { type: 'string', ...config }
}

export function createNumberSchema(config: Omit<NumberDocSchemaType, 'type'>): NumberDocSchemaType {
  return { type: 'number', ...config }
}

export function createBooleanSchema(
  config: Omit<BooleanDocSchemaType, 'type'>
): BooleanDocSchemaType {
  return { type: 'boolean', ...config }
}

export function createDateSchema(config: Omit<DateDocSchemaType, 'type'>): DateDocSchemaType {
  return { type: 'date', ...config }
}

export function createArraySchema(config: Omit<ArrayDocSchemaType, 'type'>): ArrayDocSchemaType {
  return { type: 'array', ...config }
}

export function createObjectSchema(config: Omit<ObjectDocSchemaType, 'type'>): ObjectDocSchemaType {
  return { type: 'object', ...config }
}

export function createEnumSchema(config: Omit<EnumDocSchemaType, 'type'>): EnumDocSchemaType {
  return { type: 'enum', ...config }
}

export function createReferenceSchema(
  config: Omit<ReferenceDocSchemaType, 'type'>
): ReferenceDocSchemaType {
  return { type: 'reference', ...config }
}

export function createCollection(config: CollectionSchemaType): CollectionSchemaType {
  return config
}
