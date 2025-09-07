// File: src/schema/generator/crud.ts
import { z } from 'zod'
import { FormConfigSchema } from './form'

export const ColumnConfigSchema = z.object({
  key: z.string(),
  header: z.string(),
  type: z.enum(['text', 'number', 'date', 'boolean', 'custom']).default('text'),
  sortable: z.boolean().default(false),
  filterable: z.boolean().default(false),
  width: z.number().optional(),
  align: z.enum(['left', 'center', 'right']).default('left'),
  format: z.string().optional() // For date/number formatting
})

export const FilterConfigSchema = z.object({
  type: z.enum(['search', 'select', 'date', 'range']),
  key: z.string(),
  label: z.string(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.any()
      })
    )
    .optional(),
  multiple: z.boolean().default(false)
})

export const CrudConfigSchema = z.object({
  entity: z.string(),
  title: z.string(),
  description: z.string().optional(),
  columns: z.array(ColumnConfigSchema),
  filters: z.array(FilterConfigSchema).optional(),
  actions: z.array(z.enum(['create', 'edit', 'delete', 'view', 'export'])).optional(),
  pagination: z
    .object({
      enabled: z.boolean().default(true),
      pageSize: z.number().min(1).max(100).default(10),
      pageSizes: z.array(z.number()).default([10, 25, 50, 100])
    })
    .optional(),
  sort: z
    .object({
      defaultField: z.string().optional(),
      defaultOrder: z.enum(['asc', 'desc']).default('asc')
    })
    .optional(),
  formConfig: FormConfigSchema.optional() // For create/edit forms
})

export type CrudConfig = z.infer<typeof CrudConfigSchema>
