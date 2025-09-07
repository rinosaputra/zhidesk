/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/schema/collection/doc.ts
import { z } from 'zod'

// Base schema dengan type yang eksplisit
export const BaseDocSchema = z.object({
  name: z.string().min(1, 'Schema name is required'),
  label: z.string().min(1, 'Schema label is required'),
  coerce: z.boolean().default(false).optional(),
  noempty: z.boolean().default(false).optional(),
  nullable: z.boolean().default(false).optional(),
  optional: z.boolean().default(false).optional(),
  description: z.string().optional(),
  hidden: z.boolean().default(false).optional(),
  readonly: z.boolean().default(false).optional(),
  index: z.boolean().default(false).optional(),
  unique: z.boolean().default(false).optional()
})

// Type Zod dengan const assertion yang tepat
const TypeDoc = [
  'string',
  'number',
  'boolean',
  'date',
  'array',
  'object',
  'enum',
  'reference'
] as const
export type TypeDoc = (typeof TypeDoc)[number]

// Enum Zod Schema
export const EnumDocSchema = BaseDocSchema.extend({
  type: z.literal('enum'),
  default: z.string().optional(),
  validation: z
    .object({
      values: z.array(z.string()).min(1, 'At least one enum value is required'),
      caseSensitive: z.boolean().default(false).optional()
    })
    .optional()
})

// String Zod Schema
export const StringDocSchema = BaseDocSchema.extend({
  type: z.literal('string'),
  default: z.string().optional(),
  validation: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(1).optional(),
      length: z.number().min(0).optional(),
      regex: z.string().optional(),
      format: z.enum(['email', 'url', 'uuid', 'phone', 'password']).optional(),
      trim: z.boolean().default(true).optional()
    })
    .optional()
})

// Number Zod Schema
export const NumberDocSchema = BaseDocSchema.extend({
  type: z.literal('number'),
  default: z.number().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      int: z.boolean().default(false).optional(),
      positive: z.boolean().default(false).optional(),
      nonnegative: z.boolean().default(false).optional(),
      multipleOf: z.number().optional()
    })
    .optional()
})

// Boolean Zod Schema
export const BooleanDocSchema = BaseDocSchema.extend({
  type: z.literal('boolean'),
  default: z.boolean().optional(),
  validation: z
    .object({
      isTrue: z.boolean().default(false).optional(),
      isFalse: z.boolean().default(false).optional()
    })
    .optional()
})

// Date Zod Schema
export const DateDocSchema = BaseDocSchema.extend({
  type: z.literal('date'),
  default: z.date().optional(),
  validation: z
    .object({
      min: z.coerce.date().optional(),
      max: z.coerce.date().optional(),
      past: z.boolean().default(false).optional(),
      future: z.boolean().default(false).optional()
    })
    .optional()
})

// Reference Schema untuk relasi ke collection lain
export const ReferenceDocSchema = BaseDocSchema.extend({
  type: z.literal('reference'),
  collection: z.string().min(1, 'Reference collection name is required'),
  default: z.string().optional(),
  validation: z
    .object({
      required: z.boolean().default(false).optional(),
      multiple: z.boolean().default(false).optional()
    })
    .optional()
})

// Primitive schemas (non-recursive)
export const PrimitiveDocSchema = z.discriminatedUnion('type', [
  StringDocSchema,
  NumberDocSchema,
  BooleanDocSchema,
  DateDocSchema,
  EnumDocSchema,
  ReferenceDocSchema
])

// Define recursive schemas dengan lazy evaluation
export const ArrayDocSchema: z.ZodType<ArrayDocSchemaType> = z.lazy(() =>
  BaseDocSchema.extend({
    type: z.literal('array'),
    default: z.any().array().optional(),
    properties: DocSchema, // Recursive reference
    validation: z
      .object({
        min: z.number().min(0).optional(),
        max: z.number().min(1).optional(),
        length: z.number().min(0).optional(),
        unique: z.boolean().default(false).optional()
      })
      .optional()
  })
)

export const ObjectDocSchema: z.ZodType<ObjectDocSchemaType> = z.lazy(() =>
  BaseDocSchema.extend({
    type: z.literal('object'),
    default: z.any().optional(),
    properties: z.array(DocSchema), // Array of any schema type (recursive)
    validation: z
      .object({
        strict: z.boolean().default(false).optional(),
        passthrough: z.boolean().default(false).optional(),
        unknownKeys: z.enum(['allow', 'deny', 'strip']).default('strip').optional()
      })
      .optional()
  })
)

// Main DocSchema dengan semua types termasuk recursive
export const DocSchema: z.ZodType<DocSchemaType> = z.lazy(() =>
  z.discriminatedUnion('type', [
    StringDocSchema,
    NumberDocSchema,
    BooleanDocSchema,
    DateDocSchema,
    EnumDocSchema,
    ReferenceDocSchema,
    ArrayDocSchema,
    ObjectDocSchema
  ] as any)
) as z.ZodType<DocSchemaType>

// Collection Schema untuk mendefinisikan seluruh collection
export const CollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  label: z.string().min(1, 'Collection label is required'),
  description: z.string().optional(),
  fields: z.array(DocSchema).min(1, 'At least one field is required'),
  indexes: z.array(z.string()).optional(),
  timestamps: z.boolean().default(true).optional(),
  softDelete: z.boolean().default(false).optional(),
  validation: z
    .object({
      strict: z.boolean().default(true).optional(),
      additionalProperties: z.boolean().default(false).optional()
    })
    .optional()
})

// Export individual types
export type BaseDocSchemaType = z.infer<typeof BaseDocSchema>
export type StringDocSchemaType = z.infer<typeof StringDocSchema>
export type NumberDocSchemaType = z.infer<typeof NumberDocSchema>
export type BooleanDocSchemaType = z.infer<typeof BooleanDocSchema>
export type DateDocSchemaType = z.infer<typeof DateDocSchema>
export type EnumDocSchemaType = z.infer<typeof EnumDocSchema>
export type ReferenceDocSchemaType = z.infer<typeof ReferenceDocSchema>
export type CollectionSchemaType = z.infer<typeof CollectionSchema>

// Manual type definitions untuk recursive schemas
export interface ArrayDocSchemaType extends BaseDocSchemaType {
  type: 'array'
  default?: any[]
  properties: DocSchemaType
  validation?: {
    min?: number
    max?: number
    length?: number
    unique?: boolean
  }
}

export interface ObjectDocSchemaType extends BaseDocSchemaType {
  type: 'object'
  default?: any
  properties: DocSchemaType[]
  validation?: {
    strict?: boolean
    passthrough?: boolean
    unknownKeys?: 'allow' | 'deny' | 'strip'
  }
}

export type DocSchemaType =
  | StringDocSchemaType
  | NumberDocSchemaType
  | BooleanDocSchemaType
  | DateDocSchemaType
  | EnumDocSchemaType
  | ReferenceDocSchemaType
  | ArrayDocSchemaType
  | ObjectDocSchemaType

// Utility types untuk hasil generated schema
export type ExtractResultType<T extends DocSchemaType> = T extends StringDocSchemaType
  ? string
  : T extends NumberDocSchemaType
    ? number
    : T extends BooleanDocSchemaType
      ? boolean
      : T extends DateDocSchemaType
        ? Date
        : T extends EnumDocSchemaType
          ? string
          : T extends ReferenceDocSchemaType
            ? string
            : T extends ArrayDocSchemaType
              ? Array<ExtractResultType<T['properties']>>
              : T extends ObjectDocSchemaType
                ? {
                    [K in T['properties'][number]['name']]: ExtractResultType<
                      Extract<T['properties'][number], { name: K }>
                    >
                  }
                : never

export type CollectionDocument<T extends CollectionSchemaType> = {
  [K in T['fields'][number]['name']]: ExtractResultType<Extract<T['fields'][number], { name: K }>>
} & {
  id: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}
