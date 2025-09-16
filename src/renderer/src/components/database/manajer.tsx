import React from 'react'

import { useTypedParams } from 'react-router-typesafe-routes'
import { ROUTES } from '@renderer/routes'
import { database } from '@renderer/lib/orpc-query'
import useDatabaseStore from './store'
import { toast } from 'sonner'
import { getTableSchema } from './client'

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
            databaseName: 'Default'
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
    if (setTableName(tableName))
      getTableSchema(
        {
          databaseId,
          tableName
        },
        setTableSchema
      )
  }, [tableName, databaseId, setTableName, setTableSchema])

  return null
}

export default DatabaseManajer
