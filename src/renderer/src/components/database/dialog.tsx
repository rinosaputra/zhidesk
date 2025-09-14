// File: src/renderer/src/components/database/CreateTableDialog.tsx
import React from 'react'
import { Dialog } from '@renderer/components/ui/dialog'
import useDatabaseStore from './store'
import DatabaseFormTable from './table.form'
import { DatabaseClient } from './client'
import FieldForm from './field.form'
import { database, orpc } from '@renderer/lib/orpc-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import z from 'zod'

const DatabaseFormRecord: React.FC = () => {
  const queryClient = useQueryClient()
  const {
    modal: { open, type, ...modal },
    tableName,
    setModal
  } = useDatabaseStore()

  const record = React.useMemo(() => {
    if (!(open && type === 'record')) return null
    return {
      schema: DatabaseClient.generateTableSchema(tableName) as unknown as z.ZodAny,
      defaultValues: DatabaseClient.extractDefaults(tableName),
      fields: DatabaseClient.getTable(tableName)?.fields ?? []
    }
  }, [open, type, tableName])
  const create = useMutation(database.document.create.mutationOptions())
  const update = useMutation(database.document.update.mutationOptions())

  if (!record) return null
  return (
    <FieldForm
      {...record}
      onOpen={setModal}
      isPending={create.isPending || update.isPending}
      onSubmit={(data) => {
        toast.promise(
          () => {
            if (modal.method === 'update') {
              return update.mutateAsync({
                databaseId: 'default',
                tableName,
                data,
                id: modal.id
              })
            }
            return create.mutateAsync({
              databaseId: 'default',
              tableName,
              data
            })
          },
          {
            loading: `Creating...`,
            success: (data) => {
              if (data.error) return `Failed to create table: ${data.error}`
              queryClient.invalidateQueries({
                queryKey: orpc.database.key({
                  input: { databaseId: 'default' }
                })
              })
              setModal(false)
              return `Table created successfully`
            },
            error: (error: Error) => `Failed to create table: ${error.message}`
          }
        )
      }}
    />
  )
}

export const DatabaseDialog: React.FC = () => {
  const {
    modal: { open, type },
    setModal
  } = useDatabaseStore()

  return (
    <Dialog open={open} onOpenChange={setModal}>
      {((): React.ReactNode => {
        switch (type) {
          case 'table':
            return <DatabaseFormTable />
          case 'record':
            return <DatabaseFormRecord />
          default:
            return null
        }
      })()}
    </Dialog>
  )
}
