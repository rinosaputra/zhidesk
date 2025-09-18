import z from 'zod'
import { v4 as uuid } from 'uuid'

export const SchemaCore = z.object({
  _id: z
    .uuid()
    .describe('Unique identifier for the document')
    .default(() => uuid()),
  _createdAt: z
    .date()
    .describe('Timestamp when the document was created')
    .default(() => new Date()),
  _updatedAt: z
    .date()
    .describe('Timestamp when the document was last updated')
    .default(() => new Date())
})

export type SchemaCore = z.infer<typeof SchemaCore>

export type OmitSchemaCore<T extends SchemaCore> = Omit<T, keyof SchemaCore> & Partial<SchemaCore>

export const getSchemaCore = (): SchemaCore => ({
  _id: uuid(),
  _createdAt: new Date(),
  _updatedAt: new Date()
})
