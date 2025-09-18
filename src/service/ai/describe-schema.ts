// File: src/service/ai/describe-schema.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ZodAny,
  ZodObject,
  ZodArray,
  ZodUnion,
  ZodLiteral,
  ZodEnum,
  ZodDefault,
  ZodOptional,
  ZodDiscriminatedUnion,
  ZodNullable,
  ZodPipe,
} from 'zod'
import { ZodEffects } from 'zod/v3'

/**
 * Interface untuk menyimpan informasi describe dari schema
 */
export interface SchemaDescribe {
  name: string
  description?: string
  type: string
  fields?: Record<string, SchemaDescribe>
  properties?: Record<string, SchemaDescribe>
  items?: SchemaDescribe
  validation?: Record<string, any>
  isOptional: boolean
  defaultValue?: any
  required?: boolean
}

/**
 * Fungsi untuk mengekstrak describe information dari Zod schema
 */
export function getSchemaDescribe(schema: ZodAny, path: string = ''): SchemaDescribe {
  try {
    // Handle ZodEffects dan ZodPipeline (transformations dan validations)
    if (isZodEffects(schema) || isZodPipeline(schema)) {
      const innerType = getInnerSchema(schema)
      if (innerType) {
        return getSchemaDescribe(innerType, path)
      }
    }

    const result: SchemaDescribe = {
      name: path.split('.').pop() || 'root',
      type: getZodTypeName(schema),
      isOptional: isZodOptional(schema),
      defaultValue: getDefaultValue(schema)
    }

    // Extract description from schema menggunakan getDescription
    const description = getDescription(schema)
    if (description) {
      result.description = description
    }

    // Handle different Zod types
    if (schema instanceof ZodObject) {
      result.properties = {}
      const shape = (schema as ZodObject).shape
      for (const [key, fieldSchema] of Object.entries(shape)) {
        const fieldPath = path ? `${path}.${key}` : key
        result.properties[key] = getSchemaDescribe(fieldSchema as ZodAny, fieldPath)
      }
    } else if (schema instanceof ZodArray) {
      result.items = getSchemaDescribe((schema as ZodArray).element as ZodAny, `${path}[]`)
    } else if (schema instanceof ZodUnion) {
      // Handle union types
      result.type = 'union'
      result.properties = {
        options: {
          name: 'options',
          type: 'array',
          items: {
            name: 'option',
            type: 'variant',
            isOptional: false
          },
          isOptional: false
        }
      }
    } else if (schema instanceof ZodDiscriminatedUnion) {
      // Handle discriminated union
      result.type = 'discriminated-union'
      result.properties = {
        options: {
          name: 'options',
          type: 'array',
          items: {
            name: 'variant',
            type: 'object',
            isOptional: false
          },
          isOptional: false
        }
      }
    } else if (schema instanceof ZodLiteral) {
      result.defaultValue = (schema as ZodLiteral).value
    } else if (schema instanceof ZodEnum) {
      result.validation = { options: (schema as ZodEnum).options }
    } else if (schema instanceof ZodDefault) {
      const innerSchema = (schema as ZodDefault).def.innerType as ZodAny
      result.defaultValue = (schema as ZodDefault).def.defaultValue
      return getSchemaDescribe(innerSchema, path)
    } else if (schema instanceof ZodOptional) {
      const innerSchema = (schema as ZodOptional).def.innerType as ZodAny
      result.isOptional = true
      return getSchemaDescribe(innerSchema, path)
    } else if (schema instanceof ZodNullable) {
      const innerSchema = (schema as ZodNullable).def.innerType as ZodAny
      return getSchemaDescribe(innerSchema, path)
    }

    // Extract validation rules
    const validation = extractValidationRules(schema)
    if (validation && Object.keys(validation).length > 0) {
      result.validation = validation
    }

    return result
  } catch (error) {
    console.error(`Error getting schema describe for path ${path}:`, error)
    return {
      name: path.split('.').pop() || 'unknown',
      type: 'unknown',
      isOptional: false,
      description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Mendapatkan deskripsi dari schema Zod
 */
function getDescription(schema: ZodAny): string | undefined {
  try {
    // Coba akses description melalui berbagai cara
    if (typeof schema.description === 'string') {
      return schema.description
    }

    return undefined
  } catch {
    return undefined
  }
}

/**
 * Check if schema is ZodEffects
 */
function isZodEffects(schema: ZodAny): boolean {
  return (schema.def.type as string) === 'ZodEffects'
}

/**
 * Check if schema is ZodPipeline
 */
function isZodPipeline(schema: ZodAny): boolean {
  return (schema.def.type as string) === 'ZodPipeline'
}

/**
 * Mendapatkan schema inner dari ZodEffects atau ZodPipeline
 */
function getInnerSchema(schema: ZodAny): ZodAny | null {
  if (isZodEffects(schema)) {
    return (schema as unknown as ZodEffects<any>)._def.schema as ZodAny
  }
  if (isZodPipeline(schema)) {
    return (schema as unknown as ZodPipe).def.in as ZodAny
  }
  return null
}

/**
 * Mendapatkan nama type Zod
 */
function getZodTypeName(schema: ZodAny): string {
  const typeName = schema.def.type as string

  switch (typeName) {
    case 'ZodString':
      return 'string'
    case 'ZodNumber':
      return 'number'
    case 'ZodBoolean':
      return 'boolean'
    case 'ZodDate':
      return 'date'
    case 'ZodArray':
      return 'array'
    case 'ZodObject':
      return 'object'
    case 'ZodEnum':
      return 'enum'
    case 'ZodLiteral':
      return 'literal'
    case 'ZodUnion':
      return 'union'
    case 'ZodOptional':
      return 'optional'
    case 'ZodDefault':
      return 'default'
    case 'ZodNullable':
      return 'nullable'
    case 'ZodDiscriminatedUnion':
      return 'discriminated-union'
    case 'ZodEffects':
      return 'effect'
    case 'ZodPipeline':
      return 'pipeline'
    default:
      return typeName || 'unknown'
  }
}

/**
 * Mengecek apakah schema optional
 */
function isZodOptional(schema: ZodAny): boolean {
  if (schema instanceof ZodOptional) return true
  if (schema instanceof ZodDefault) {
    return isZodOptional((schema as ZodDefault).def.innerType as ZodAny)
  }
  if (schema instanceof ZodNullable) {
    return isZodOptional((schema as ZodNullable).def.innerType as ZodAny)
  }
  if (isZodEffects(schema) || isZodPipeline(schema)) {
    const innerSchema = getInnerSchema(schema)
    return innerSchema ? isZodOptional(innerSchema) : false
  }
  return false
}

/**
 * Mendapatkan default value dari schema
 */
function getDefaultValue(schema: ZodAny): any {
  try {
    if (schema instanceof ZodDefault) {
      return typeof (schema as ZodDefault).def.defaultValue === 'function'
        ? ((schema as ZodDefault).def.defaultValue as () => any)()
        : (schema as ZodDefault).def.defaultValue
    }
    if (schema instanceof ZodLiteral) {
      return (schema as ZodLiteral).value
    }
    if (isZodEffects(schema) || isZodPipeline(schema)) {
      const innerSchema = getInnerSchema(schema)
      return innerSchema ? getDefaultValue(innerSchema) : undefined
    }
    return undefined
  } catch {
    return undefined
  }
}

/**
 * Mengekstrak validation rules dari schema
 */
function extractValidationRules(schema: ZodAny): Record<string, any> {
  const rules: Record<string, any> = {}
  const def = schema._def

  if (!def) return rules

  // String validations
  if (def.minLength !== undefined) rules.minLength = def.minLength
  if (def.maxLength !== undefined) rules.maxLength = def.maxLength
  if (def.length !== undefined) rules.length = def.length
  if (def.regex) rules.pattern = def.regex

  // Number validations
  if (def.minimum !== undefined) rules.minimum = def.minimum
  if (def.maximum !== undefined) rules.maximum = def.maximum
  if (def.multipleOf) rules.multipleOf = def.multipleOf

  // Check validations
  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case 'min':
          rules.min = check.value
          break
        case 'max':
          rules.max = check.value
          break
        case 'email':
          rules.format = 'email'
          break
        case 'url':
          rules.format = 'url'
          break
        case 'uuid':
          rules.format = 'uuid'
          break
        case 'positive':
          rules.positive = true
          break
        case 'nonnegative':
          rules.nonnegative = true
          break
        case 'int':
          rules.integer = true
          break
      }
    }
  }

  // Custom validation rules dari schema extensions
  if (def.validation) {
    Object.assign(rules, def.validation)
  }

  return rules
}

/**
 * Fungsi utility untuk print schema describe dalam format yang readable
 */
export function printSchemaDescribe(describe: SchemaDescribe, indent: number = 0): string {
  const indentStr = '  '.repeat(indent)
  let output = `${indentStr}${describe.name}: ${describe.type}${describe.isOptional ? '?' : ''}`

  if (describe.description) {
    output += ` - ${describe.description}`
  }

  if (describe.defaultValue !== undefined) {
    output += ` (default: ${JSON.stringify(describe.defaultValue)})`
  }

  if (describe.validation && Object.keys(describe.validation).length > 0) {
    output += ` [validation: ${JSON.stringify(describe.validation)}]`
  }

  output += '\n'

  if (describe.properties) {
    for (const [, prop] of Object.entries(describe.properties)) {
      output += printSchemaDescribe(prop, indent + 1)
    }
  }

  if (describe.items) {
    output += `${indentStr}  items:\n`
    output += printSchemaDescribe(describe.items, indent + 2)
  }

  return output
}

/**
 * Fungsi untuk mendapatkan describe dalam bentuk JSON yang terstruktur
 */
export function getSchemaDescribeJSON(schema: ZodAny): SchemaDescribe {
  return getSchemaDescribe(schema)
}

/**
 * Fungsi khusus untuk mendapatkan deskripsi dari field schema
 * Contoh: getFieldDescription(BaseFieldSchema.shape.name)
 * akan mengembalikan: "Technical field name (must be unique within table)"
 */
export function getFieldDescription(schema: ZodAny): string | undefined {
  return getDescription(schema)
}

/**
 * Fungsi untuk mendapatkan semua deskripsi dari object schema
 */
export function getSchemaDescriptions(schema: ZodObject<any>): Record<string, string> {
  const descriptions: Record<string, string> = {}
  const shape = schema.shape

  for (const [key, fieldSchema] of Object.entries(shape)) {
    const description = getDescription(fieldSchema as ZodAny)
    if (description) {
      descriptions[key] = description
    }
  }

  return descriptions
}

// Contoh penggunaan:
// const descriptions = getSchemaDescriptions(BaseFieldSchema)
// console.log(descriptions.name) // "Technical field name (must be unique within table)"
