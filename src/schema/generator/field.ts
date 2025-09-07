// File: src/schema/generator/field.ts
import { z } from 'zod'

// Base field schema
export const BaseFieldSchema = z.object({
  type: z.string(),
  name: z.string(),
  label: z.string(),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  helpText: z.string().optional()
})

// Text field
export const TextFieldSchema = BaseFieldSchema.extend({
  type: z.literal('text'),
  validation: z
    .object({
      minLength: z.number().min(0).optional(),
      maxLength: z.number().min(1).optional(),
      pattern: z.string().optional()
    })
    .optional()
})

// Email field
export const EmailFieldSchema = BaseFieldSchema.extend({
  type: z.literal('email'),
  validation: z
    .object({
      pattern: z.string().default('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
    })
    .optional()
})

// Number field
export const NumberFieldSchema = BaseFieldSchema.extend({
  type: z.literal('number'),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional()
    })
    .optional()
})

// Select field
export const SelectFieldSchema = BaseFieldSchema.extend({
  type: z.literal('select'),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.any(),
      disabled: z.boolean().optional()
    })
  ),
  multiple: z.boolean().default(false)
})

// Date field
export const DateFieldSchema = BaseFieldSchema.extend({
  type: z.literal('date'),
  validation: z
    .object({
      minDate: z.string().optional(),
      maxDate: z.string().optional()
    })
    .optional()
})

// Union of all field types
export const FieldSchema = z.discriminatedUnion('type', [
  TextFieldSchema,
  EmailFieldSchema,
  NumberFieldSchema,
  SelectFieldSchema,
  DateFieldSchema
])

export type FieldConfig = z.infer<typeof FieldSchema>
