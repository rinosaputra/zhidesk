// File: src/service/ai/database.router.ts
import { os } from '@orpc/server'
import { AIDatabaseService } from './database'
import {
  generateTextInput,
  generateObjectInput,
  updateAIConfigInput,
  generateTextOutput,
  generateObjectOutput,
  updateAIConfigOutput,
  generateTableSchemaInput,
  generateTableSchemaOutput,
  generateSampleDataInput,
  generateSampleDataOutput,
  generateQueryInput,
  generateQueryOutput,
  analyzeDataInput,
  analyzeDataOutput
} from './types'

const aiDatabaseService = AIDatabaseService.getInstance()

export const aiDatabaseRouter = {
  // AI Database Operations
  generateTableSchema: os
    .input(generateTableSchemaInput)
    .output(generateTableSchemaOutput)
    .handler(async ({ input }) => {
      try {
        const table = await aiDatabaseService.generateTableSchema(input)
        return {
          success: true,
          table
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate table schema'
        }
      }
    }),

  generateSampleData: os
    .input(generateSampleDataInput)
    .output(generateSampleDataOutput)
    .handler(async ({ input }) => {
      try {
        const data = await aiDatabaseService.generateSampleData(
          input.tableName,
          input.databaseId,
          input.count,
          input.options
        )
        return {
          success: true,
          data
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate sample data'
        }
      }
    }),

  generateQuery: os
    .input(generateQueryInput)
    .output(generateQueryOutput)
    .handler(async ({ input }) => {
      try {
        const result = await aiDatabaseService.generateQuery(
          input.databaseId,
          input.tableName,
          input.naturalLanguageQuery,
          input.options
        )
        return {
          success: true,
          query: result
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate query'
        }
      }
    }),

  analyzeData: os
    .input(analyzeDataInput)
    .output(analyzeDataOutput)
    .handler(async ({ input }) => {
      try {
        const analysis = await aiDatabaseService.analyzeData(
          input.databaseId,
          input.tableName,
          input.options
        )
        return {
          success: true,
          analysis
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to analyze data'
        }
      }
    }),

  // Basic AI Operations (delegated to underlying AI generator)
  generateText: os
    .input(generateTextInput)
    .output(generateTextOutput)
    .handler(async ({ input }) => {
      try {
        const result = await aiDatabaseService
          .getAIGenerator()
          .generateText(input.prompt, input.options)
        return result
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate text'
        }
      }
    }),

  generateObject: os
    .input(generateObjectInput)
    .output(generateObjectOutput)
    .handler(async ({ input }) => {
      try {
        const schema = typeof input.schema === 'string' ? JSON.parse(input.schema) : input.schema

        const result = await aiDatabaseService
          .getAIGenerator()
          .generateObject(input.prompt, schema, input.options)
        return result
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate object'
        }
      }
    }),

  updateAIConfig: os
    .input(updateAIConfigInput)
    .output(updateAIConfigOutput)
    .handler(async ({ input }) => {
      try {
        aiDatabaseService.updateAIConfig(input.config)
        return {
          success: true
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update AI config'
        }
      }
    })
}
