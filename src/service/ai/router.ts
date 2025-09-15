// File: src/service/ai/router.ts
import { os } from '@orpc/server'
import { AIGenerator } from './generator'
import {
  generateTextInput,
  generateObjectInput,
  generateObjectsInput,
  updateAIConfigInput,
  generateTextOutput,
  generateObjectOutput,
  generateObjectsOutput,
  updateAIConfigOutput,
  validateApiKeyOutput
} from './types'
import { aiDatabaseRouter } from './database.router'

// Buat instance singleton
const aiGenerator = new AIGenerator()

export const aiRouter = {
  // Generate text
  generateText: os
    .input(generateTextInput)
    .output(generateTextOutput)
    .handler(async ({ input }) => {
      try {
        const result = await aiGenerator.generateText(input.prompt, input.options)
        return result
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate text'
        }
      }
    }),

  // Generate object
  generateObject: os
    .input(generateObjectInput)
    .output(generateObjectOutput)
    .handler(async ({ input }) => {
      try {
        // Parse schema dari string jika diperlukan
        const schema = typeof input.schema === 'string' ? JSON.parse(input.schema) : input.schema

        const result = await aiGenerator.generateObject(input.prompt, schema, input.options)
        return result
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate object'
        }
      }
    }),

  // Generate multiple objects
  generateObjects: os
    .input(generateObjectsInput)
    .output(generateObjectsOutput)
    .handler(async ({ input }) => {
      try {
        // Parse schema dari string jika diperlukan
        const schema = typeof input.schema === 'string' ? JSON.parse(input.schema) : input.schema

        const result = await aiGenerator.generateObjects(
          input.prompt,
          schema,
          input.count,
          input.options
        )
        return result
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate objects'
        }
      }
    }),

  // Update AI configuration
  updateAIConfig: os
    .input(updateAIConfigInput)
    .output(updateAIConfigOutput)
    .handler(async ({ input }) => {
      try {
        aiGenerator.updateConfig(input.config)
        return {
          success: true
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update AI config'
        }
      }
    }),

  // Validate API key
  validateApiKey: os.output(validateApiKeyOutput).handler(async () => {
    try {
      const result = await aiGenerator.validateApiKey()
      return result
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to validate API key'
      }
    }
  }),

  database: aiDatabaseRouter
}
