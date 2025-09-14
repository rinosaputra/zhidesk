import { database } from '@renderer/lib/orpc-query'
import { DatabaseGenerator } from '@service/database/generator'
import { toast } from 'sonner'
import { GetTableSchemaInput, GetTableSchemaOutput } from './types'

export const DatabaseClient = new DatabaseGenerator()
export const getTableSchema = async (
  props: GetTableSchemaInput,
  callback?: (result: GetTableSchemaOutput) => void
): Promise<void> => {
  toast.promise(() => database.table.getSchema.call(props), {
    loading: `Load Database`,
    success: (result) => {
      if (callback) callback(result)
      if (result.schema) DatabaseClient.registerTable(result.schema)
      if (result.error) return `Error ${result.error}`
      return `Success Load Database`
    }
  })
}
