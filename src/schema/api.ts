import z from 'zod'

export const ApiVariant = {
  database: 'database',
  ai: 'ai'
} as const

export type ApiVariant = keyof typeof ApiVariant

type ApiGenerate<Variant extends ApiVariant, Options> = {
  variant: Variant
  options: Options
}

export type ApiDatabase = ApiGenerate<
  'database',
  {
    _id: string
  }
>

export const ApiDatabase = z.object({
  variant: z.literal(ApiVariant.database),
  options: z.object({
    _id: z.uuidv4()
  })
})

export type ApiAI = ApiGenerate<
  'ai',
  {
    apiKey: string
  }
>

export const ApiAI = z.object({
  variant: z.literal(ApiVariant.ai),
  options: z.object({
    apiKey: z.string()
  })
})

export type ApiQuery = ApiDatabase | ApiAI

export const ApiQuery: z.ZodType<ApiQuery> = z.discriminatedUnion('variant', [ApiDatabase, ApiAI])
