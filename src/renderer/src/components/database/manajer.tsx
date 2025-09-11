import React from 'react'

import { useTypedParams } from 'react-router-typesafe-routes'
import { ROUTES } from '@renderer/routes'
import { database } from '@renderer/lib/orpc-query'
import useDatabaseStore from './store'
import { toast } from 'sonner'

const DatabaseManajer: React.FC = () => {
  const { databaseId = 'default', tableId = '' } = useTypedParams(ROUTES.DATABASE_TABLE_ID)
  const { setDatabaseId, setTableId, setInitialize } = useDatabaseStore()

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
    if (tableId) setTableId(tableId)
  }, [tableId, setTableId])

  return null
}

export default DatabaseManajer
