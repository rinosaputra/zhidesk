// File: src/renderer/src/hooks/useTableManagement.ts
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { database } from '@renderer/lib/orpc-query'
import { toast } from 'sonner'
import { CreateTableOutput, Table } from './types'

type CreateMutation = UseMutationResult<CreateTableOutput, Error, Table>
// type DeleteMutation = UseMutationResult<DeleteTableOutput, Error, DeleteTableInput>

export const useTableManagement = ({
  databaseId = 'default'
}: {
  databaseId?: string
}): { createTable: CreateMutation; isLoading: boolean } => {
  const queryClient = useQueryClient()

  const createTable: CreateMutation = useMutation({
    mutationFn: async (tableConfig) => {
      const result = await database.table.create.call({
        databaseId,
        tableConfig
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create table')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database', 'tables'] })
      toast.success('Table created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create table: ${error.message}`)
    }
  })

  // const deleteTable = useMutation({
  //   mutationFn: async (tableName: string) => {
  //     // Implement delete functionality
  //     // This would require adding a deleteTable method to the database router
  //     toast.info('Delete functionality coming soon')
  //     return { success: true }
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['database', 'tables'] })
  //     toast.success('Table deleted successfully')
  //   }
  // })

  return {
    createTable,
    // deleteTable,
    isLoading: createTable.isPending // || deleteTable.isPending
  }
}
