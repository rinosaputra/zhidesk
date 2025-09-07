// File: src/schema/generator/form.ts
import { z } from 'zod'
import { FieldSchema } from './field'

export const FormConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FieldSchema),
  layout: z.enum(['vertical', 'horizontal', 'grid']).default('vertical'),
  gridColumns: z.number().min(1).max(4).default(1),
  submitButton: z
    .object({
      text: z.string().default('Submit'),
      loadingText: z.string().optional()
    })
    .optional(),
  cancelButton: z
    .object({
      text: z.string().default('Cancel'),
      show: z.boolean().default(true)
    })
    .optional(),
  validation: z.enum(['onSubmit', 'onChange', 'onBlur']).default('onSubmit')
})

export type FormConfig = z.infer<typeof FormConfigSchema>
