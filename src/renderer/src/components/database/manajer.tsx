import React from 'react'

import { useTypedParams } from 'react-router-typesafe-routes'
import { ROUTES } from '@renderer/routes'
import { database } from '@renderer/lib/orpc-query'
import useDatabaseStore from './store'
import { toast } from 'sonner'

const DatabaseManajer: React.FC = () => {
  const { databaseId = 'default' } = useTypedParams(ROUTES.DATABASE_ID)
  const { tableName = '' } = useTypedParams(ROUTES.DATABASE_TABLE)
  const { setDatabaseId, setTableName, setInitialize, setTableSchema } = useDatabaseStore()

  React.useEffect(() => {
    const init = async (): Promise<void> => {
      toast.promise(
        () =>
          database.initialize.call({
            databaseId: 'default',
            databaseName: 'Default',
            tables: []
          }),
        {
          loading: `Initialize Database`,
          success: (result) => {
            setInitialize(result)
            if (result.error) return `Error ${result.error}`
            return `Success Initialize Database`
          }
        }
      )
    }
    if (setDatabaseId(databaseId)) init()
  }, [databaseId, setDatabaseId, setInitialize])

  React.useEffect(() => {
    const init = async (): Promise<void> => {
      toast.promise(
        () =>
          database.table.getSchema.call({
            databaseId,
            tableName
          }),
        {
          loading: `Load Database`,
          success: (result) => {
            setTableSchema(result)
            if (result.error) return `Error ${result.error}`
            return `Success Load Database`
          }
        }
      )
    }
    if (setTableName(tableName)) init()
  }, [tableName, databaseId, setTableName, setTableSchema])

  return null
}

export default DatabaseManajer
