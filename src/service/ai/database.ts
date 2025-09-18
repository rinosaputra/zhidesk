/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/service/ai/database.ts
import { AIGenerator } from './generator'
import { DatabaseService } from '../database-v1/service'
import { Table, DocumentData, Database } from '../database-v1/types'
import { z } from 'zod'
import { GenerateTableSchemaInput, ValidateApiKeyOutput } from './types'
import { DatabaseUtils } from '@service/database-v1/utils'
import { readFileSync } from 'fs'
import { ModelMessage } from 'ai'

export class AIDatabaseService {
  private static instance: AIDatabaseService
  private aiGenerator: AIGenerator
  private databaseService: DatabaseService

  private constructor() {
    this.aiGenerator = new AIGenerator()
    this.databaseService = DatabaseService.getInstance()
  }

  static getInstance(): AIDatabaseService {
    if (!AIDatabaseService.instance) {
      AIDatabaseService.instance = new AIDatabaseService()
    }
    return AIDatabaseService.instance
  }

  /**
   * Validasi apakah AI service ready
   */
  private async validateAIService(): Promise<void> {
    const isValid = await this.aiGenerator.validateApiKey()
    if (!isValid) {
      throw new Error('AI service is not available. Please check your API key configuration.')
    }
    if (isValid.error) {
      throw new Error(isValid.error)
    }
  }

  /**
   * Generate table schema menggunakan AI
   */
  async generateTableSchema({
    databaseId,
    description,
    options
  }: GenerateTableSchemaInput): Promise<Table> {
    try {
      await this.validateAIService()

      // Path ke database existing
      const existingDatabaseContent = readFileSync(DatabaseUtils.getMetadataPathPath(), 'utf-8')
      const database = JSON.parse(existingDatabaseContent) as Record<string, Database>

      const prompt = `Create a complete database table schema based on this description: ${description}

Return a valid JSON object that strictly follows this Zod schema structure:

Table Schema:
- name: string (required, min 1 character)
- label: string (required, min 1 character)
- description: string (optional)
- fields: array of Field objects (required, min 1 field)
- indexes: array of strings (optional)
- timestamps: boolean (optional, defaults to true)
- softDelete: boolean (optional, defaults to false)
- validation: object with strict and additionalProperties booleans (optional)

Field Types Available:
1. string - { name, label, type: "string", description, required, unique, index, hidden, readonly, default, validation: {min, max, length, pattern, format, trim, transform, as} }
2. number - { name, label, type: "number", description, required, unique, index, hidden, readonly, default, validation: {min, max, integer, positive, nonnegative, multipleOf} }
3. boolean - { name, label, type: "boolean", description, required, unique, index, hidden, readonly, default, validation: {is, as} }
4. date - { name, label, type: "date", description, required, unique, index, hidden, readonly, default, validation: {min, max, past, future, format, as} }
5. enum - { name, label, type: "enum", description, required, unique, index, hidden, readonly, default, options: [{label, value}], validation: {as} }
6. reference - { name, label, type: "reference", description, required, unique, index, hidden, readonly, default, reference: {tableName, columnName, join, concat}, validation: {cascadeDelete, required} }

Requirements:
1. Use only the field types listed above
2. All fields must have both 'name' and 'label' properties
3. Include at least one required field
4. Set appropriate validation rules based on field type
5. For enum fields, provide at least 2 options with both 'label' and 'value'
6. For reference fields, specify the referenced tableName
7. Ensure the new table is consistent with the existing database structure

Return ONLY the JSON object without any additional text or explanation.`

      // Siapkan messages dengan attachment database existing jika ada
      const messages: ModelMessage[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'text',
              text: `EXISTING DATABASE STRUCTURE:\n${JSON.stringify({ databaseId: database[databaseId] }, null, 2)}\n\nPlease ensure the new table is consistent with this existing structure.`
            }
          ]
        }
      ]

      // Tambahkan schema types sebagai referensi
      // messages[0].content.push({
      //   type: 'file',
      //   data: readFileSync(join(process.cwd(), 'src/service/database/types.ts')),
      //   mediaType: mime.lookup('ts') || 'text/plain'
      // })

      const TableSchema = z.object({
        name: z.string().min(1, 'Table name is required'),
        label: z.string().min(1, 'Table label is required'),
        description: z.string().optional(),
        indexes: z.array(z.string()).optional(),
        timestamps: z.boolean().optional().default(true),
        softDelete: z.boolean().optional().default(false),
        validation: z
          .object({
            strict: z.boolean().optional().default(true),
            additionalProperties: z.boolean().optional().default(false)
          })
          .optional(),
        fields: z.array(z.any())
      })

      const result = await this.aiGenerator.generateObject(
        messages,
        TableSchema, // Gunakan TableSchema yang sudah di-import
        options
      )

      if (!result.success || !result.object) {
        throw new Error(result.error || 'Failed to generate table schema')
      }

      // Validasi tambahan
      const validatedTable = TableSchema.parse(result.object)

      return validatedTable as Table
    } catch (error) {
      console.error('Error generating table schema:', error)
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid schema generated: ${error.message}`)
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to generate table schema')
    }
  }

  /**
   * Generate sample data untuk table
   */
  async generateSampleData(
    tableName: string,
    databaseId: string,
    count: number = 5,
    options: Partial<Parameters<AIGenerator['generateObjects']>[3]> = {}
  ): Promise<DocumentData[]> {
    try {
      await this.validateAIService()

      const table = this.databaseService.getTableSchema(databaseId, tableName)
      if (!table) {
        throw new Error(`Table ${tableName} not found in database ${databaseId}`)
      }

      // Create schema dari table fields
      const shape: Record<string, z.ZodTypeAny> = {}
      for (const field of table.fields) {
        switch (field.type) {
          case 'string':
            shape[field.name] = z.string()
            break
          case 'number':
            shape[field.name] = z.number()
            break
          case 'boolean':
            shape[field.name] = z.boolean()
            break
          case 'date':
            shape[field.name] = z.date()
            break
          case 'enum':
            if (field.type === 'enum' && field.options) {
              shape[field.name] = z.enum(field.options.map((opt) => opt.value))
            }
            break
          default:
            shape[field.name] = z.any()
        }
      }

      const DataSchema = z.object(shape)
      const prompt = `Generate ${count} realistic sample data records for a ${tableName} table.
      The table has these fields: ${table.fields.map((f) => `${f.name} (${f.type})`).join(', ')}.
      Make the data realistic, varied, and appropriate for each field type.`

      const result = await this.aiGenerator.generateObjects(prompt, DataSchema, count, options)

      if (!result.success || !result.objects) {
        throw new Error(result.error || 'Failed to generate sample data')
      }

      return result.objects
    } catch (error) {
      console.error('Error generating sample data:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to generate sample data')
    }
  }

  /**
   * Generate query berdasarkan deskripsi natural language
   */
  async generateQuery(
    databaseId: string,
    tableName: string,
    naturalLanguageQuery: string,
    options: Partial<Parameters<AIGenerator['generateObject']>[2]> = {}
  ): Promise<Record<string, any>> {
    const QuerySchema = z.object({
      query: z.record(z.string(), z.any()),
      explanation: z.string()
    })

    const table = this.databaseService.getTableSchema(databaseId, tableName)
    if (!table) {
      throw new Error(`Table ${tableName} not found in database ${databaseId}`)
    }

    const prompt = `Convert this natural language query to a database query object: "${naturalLanguageQuery}"

    Table structure: ${JSON.stringify(table.fields.map((f) => ({ name: f.name, type: f.type })))}

    Return a JSON object with "query" (the query object) and "explanation" (how the query works).`

    const result = await this.aiGenerator.generateObject(prompt, QuerySchema, options)

    if (!result.success || !result.object) {
      throw new Error(result.error || 'Failed to generate query')
    }

    return result.object.query
  }

  /**
   * Analyze data dan berikan insights
   */
  async analyzeData(
    databaseId: string,
    tableName: string,
    options: Partial<Parameters<AIGenerator['generateText']>[1]> = {}
  ): Promise<string> {
    const data = await this.databaseService.find(databaseId, tableName, {})

    const prompt = `Analyze this dataset and provide insights:

    Table: ${tableName}
    Sample data: ${JSON.stringify(data.slice(0, 5), null, 2)}
    Total records: ${data.length}

    Provide analysis of patterns, trends, anomalies, and suggestions for data quality improvement.`

    const result = await this.aiGenerator.generateText(prompt, options)

    if (!result.success || !result.text) {
      throw new Error(result.error || 'Failed to analyze data')
    }

    return result.text
  }

  /**
   * Generate migration script antara dua schema
   */
  async generateMigration(
    oldTable: Table,
    newTable: Table,
    options: Partial<Parameters<AIGenerator['generateText']>[1]> = {}
  ): Promise<string> {
    const prompt = `Generate a database migration script between these two table schemas:

  OLD SCHEMA:
  ${JSON.stringify(oldTable, null, 2)}

  NEW SCHEMA:
  ${JSON.stringify(newTable, null, 2)}

  Provide a step-by-step migration script that handles:
  1. New fields addition
  2. Field modifications
  3. Field removals (with data preservation considerations)
  4. Data transformation if needed`

    const result = await this.aiGenerator.generateText(prompt, options)

    if (!result.success || !result.text) {
      throw new Error(result.error || 'Failed to generate migration script')
    }

    return result.text
  }

  /**
   * Get AI generator instance untuk custom operations
   */
  getAIGenerator(): AIGenerator {
    return this.aiGenerator
  }

  /**
   * Update AI configuration
   */
  updateAIConfig(config: Partial<Parameters<AIGenerator['updateConfig']>[0]>): void {
    this.aiGenerator.updateConfig(config)
  }

  /**
   * Validasi API key
   */
  async validateApiKey(): Promise<ValidateApiKeyOutput> {
    return await this.aiGenerator.validateApiKey()
  }
}
