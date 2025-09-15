// File: src/service/ai/generator.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText, generateObject, GenerateObjectResult, ModelMessage } from 'ai'
import { z } from 'zod'
import {
  AIConfig,
  GenerateObjectOutput,
  GenerateObjectsOutput,
  GenerateTextOutput,
  ValidateApiKeyOutput
} from './types'

export class AIGenerator {
  private config: AIConfig
  private provider: any

  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 1024,
      topP: 0.9,
      topK: 40,
      ...config,
      apiKey: process.env.GOOGLE_GENAI_API_KEY || 'AIzaSyAplkERukJRy93dk6tDilxPPos96uC6r7Q'
    }

    this.initializeProvider(this.config.apiKey || '')
  }

  private initializeProvider(apiKey: string): void {
    try {
      this.provider = createGoogleGenerativeAI({
        apiKey: apiKey
      })
    } catch (error) {
      console.error('Failed to initialize Google Generative AI provider:', error)
      throw new Error('Failed to initialize AI provider. Please check your API key.')
    }
  }

  /**
   * Generate text dari prompt
   */
  async generateText(prompt: string, options: Partial<AIConfig> = {}): Promise<GenerateTextOutput> {
    try {
      const mergedConfig = { ...this.config, ...options }

      const result = await generateText({
        model: this.provider(mergedConfig.model),
        prompt,
        temperature: mergedConfig.temperature,
        // maxTokens: mergedConfig.maxTokens,
        topP: mergedConfig.topP,
        topK: mergedConfig.topK
      })

      return {
        success: true,
        text: result.text,
        usage: {
          // promptTokens: result.usage?.promptTokens,
          // completionTokens: result.usage?.completionTokens,
          totalTokens: result.usage?.totalTokens
        }
      }
    } catch (error) {
      console.error('Error generating text:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate text'
      }
    }
  }

  /**
   * Generate object terstruktur dari prompt dengan Zod schema
   */
  async generateObject<T>(
    prompt: string | ModelMessage[],
    schema: z.ZodSchema<T>,
    options: Partial<AIConfig> = {}
  ): Promise<GenerateObjectOutput> {
    try {
      const mergedConfig = { ...this.config, ...options }

      const result: GenerateObjectResult<T> = await generateObject({
        model: this.provider(mergedConfig.model),
        schema,
        prompt,
        temperature: mergedConfig.temperature,
        maxTokens: mergedConfig.maxTokens,
        topP: mergedConfig.topP,
        topK: mergedConfig.topK,
        providerOptions: {
          google: {
            structuredOutputs: false
          }
        }
      })

      return {
        success: true,
        object: result.object,
        usage: {
          // promptTokens: result.usage?.promptTokens,
          // completionTokens: result.usage?.completionTokens,
          totalTokens: result.usage?.totalTokens
        }
      }
    } catch (error) {
      console.error('Error generating object:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate object'
      }
    }
  }

  /**
   * Generate multiple objects dari prompt dengan Zod schema
   */
  async generateObjects<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    count: number = 1,
    options: Partial<AIConfig> = {}
  ): Promise<GenerateObjectsOutput> {
    try {
      const results: T[] = []
      const totalUsage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }

      for (let i = 0; i < count; i++) {
        const result = await this.generateObject<T>(prompt, schema, options)

        if (!result.success || !result.object) {
          return {
            success: false,
            error: result.error || 'Failed to generate objects'
          }
        }

        results.push(result.object)

        // Aggregate usage
        if (result.usage) {
          totalUsage.promptTokens += result.usage.promptTokens || 0
          totalUsage.completionTokens += result.usage.completionTokens || 0
          totalUsage.totalTokens += result.usage.totalTokens || 0
        }
      }

      return {
        success: true,
        objects: results,
        usage: totalUsage
      }
    } catch (error) {
      console.error('Error generating objects:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate objects'
      }
    }
  }

  /**
   * Update konfigurasi
   */
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Reinitialize provider jika API key berubah
    if (newConfig.apiKey) {
      this.initializeProvider(newConfig.apiKey)
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AIConfig {
    return { ...this.config }
  }

  /**
   * Validasi API key
   */
  async validateApiKey(): Promise<ValidateApiKeyOutput> {
    try {
      // Test dengan prompt sederhana untuk validasi API key
      const result = await this.generateText('Hello')
      return {
        success: result.success,
        valid: result.success
      }
    } catch (error) {
      console.error('Error validating API key:', error)
      return {
        success: false,
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to validate API key'
      }
    }
  }
}

// Factory function untuk membuat instance AIGenerator
export const createAIGenerator = (config: Partial<AIConfig> = {}): AIGenerator => {
  return new AIGenerator(config)
}
