// File: src/service/ai/types.ts
import { z } from 'zod'

// Daftar model DeepSeek yang tersedia
export const AIModels = {
  'gemini-2.5-flash': 'gemini-2.5-flash'
} as const

export type AIModels = keyof typeof AIModels

// AI Configuration
export const AIConfigSchema = z.object({
  model: z.enum(AIModels).default('gemini-2.5-flash'),
  apiKey: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(4096).default(1024),
  topP: z.number().min(0).max(1).default(0.9),
  topK: z.number().min(0).max(100).default(40)
})

export type AIConfig = z.infer<typeof AIConfigSchema>

// Input schemas
export const generateTextInput = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  options: AIConfigSchema.optional()
})
export type GenerateTextInput = z.infer<typeof generateTextInput>

export const generateObjectInput = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  schema: z.any(), // Zod schema atau string representation
  options: AIConfigSchema.optional()
})
export type GenerateObjectInput = z.infer<typeof generateObjectInput>

export const generateObjectsInput = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  schema: z.any(), // Zod schema atau string representation
  count: z.number().min(1).max(10).default(1),
  options: AIConfigSchema.optional()
})
export type GenerateObjectsInput = z.infer<typeof generateObjectsInput>

export const updateAIConfigInput = z.object({
  config: AIConfigSchema
})
export type UpdateAIConfigInput = z.infer<typeof updateAIConfigInput>

// Schema untuk database - Input
export const generateTableSchemaInput = z.object({
  databaseId: z.string().min(1, 'Database ID is required'),
  description: z.string().min(1, 'Description is required'),
  options: AIConfigSchema.optional()
})
export type GenerateTableSchemaInput = z.infer<typeof generateTableSchemaInput>

export const generateSampleDataInput = z.object({
  databaseId: z.string().min(1, 'Database ID is required'),
  tableName: z.string().min(1, 'Table name is required'),
  count: z.number().min(1).max(100).default(5),
  options: AIConfigSchema.optional()
})
export type GenerateSampleDataInput = z.infer<typeof generateSampleDataInput>

export const generateQueryInput = z.object({
  databaseId: z.string().min(1, 'Database ID is required'),
  tableName: z.string().min(1, 'Table name is required'),
  naturalLanguageQuery: z.string().min(1, 'Query description is required'),
  options: AIConfigSchema.optional()
})
export type GenerateQueryInput = z.infer<typeof generateQueryInput>

export const analyzeDataInput = z.object({
  databaseId: z.string().min(1, 'Database ID is required'),
  tableName: z.string().min(1, 'Table name is required'),
  options: AIConfigSchema.optional()
})
export type AnalyzeDataInput = z.infer<typeof analyzeDataInput>

// Output schemas
const baseAIResponse = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  usage: z
    .object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional()
    })
    .optional()
})

export const generateTextOutput = baseAIResponse.extend({
  text: z.string().optional()
})
export type GenerateTextOutput = z.infer<typeof generateTextOutput>

export const generateObjectOutput = baseAIResponse.extend({
  object: z.any().optional()
})
export type GenerateObjectOutput = z.infer<typeof generateObjectOutput>

export const generateObjectsOutput = baseAIResponse.extend({
  objects: z.array(z.any()).optional()
})
export type GenerateObjectsOutput = z.infer<typeof generateObjectsOutput>

export const updateAIConfigOutput = baseAIResponse
export type UpdateAIConfigOutput = z.infer<typeof updateAIConfigOutput>

// Schema untuk database - Output
export const generateTableSchemaOutput = z.object({
  success: z.boolean(),
  table: z.any().optional(),
  error: z.string().optional()
})
export type GenerateTableSchemaOutput = z.infer<typeof generateTableSchemaOutput>

export const generateSampleDataOutput = z.object({
  success: z.boolean(),
  data: z.array(z.any()).optional(),
  error: z.string().optional()
})
export type GenerateSampleDataOutput = z.infer<typeof generateSampleDataOutput>

export const generateQueryOutput = z.object({
  success: z.boolean(),
  query: z.record(z.string(), z.any()).optional(),
  explanation: z.string().optional(),
  error: z.string().optional()
})
export type GenerateQueryOutput = z.infer<typeof generateQueryOutput>

export const analyzeDataOutput = z.object({
  success: z.boolean(),
  analysis: z.string().optional(),
  error: z.string().optional()
})
export type AnalyzeDataOutput = z.infer<typeof analyzeDataOutput>

// Validasi API key response
export const validateApiKeyOutput = z.object({
  success: z.boolean(),
  valid: z.boolean(),
  error: z.string().optional()
})
export type ValidateApiKeyOutput = z.infer<typeof validateApiKeyOutput>
