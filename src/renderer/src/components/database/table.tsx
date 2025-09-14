import React from 'react'
import useDatabaseStore from './store'
import { RouteLoading } from '../routers'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import DatabaseTableData from './table.data'

const DatabaseTable: React.FC = () => {
  const { query, databaseId, tableName, tableSchema, error, getQueryOptions } = useDatabaseStore()
  if (!tableSchema) return <RouteLoading />
  if (error?.type === 'table')
    return (
      <div className="flex-1 flex items-center justify-center select-none">
        <Alert variant="destructive" className="max-w-md bg-destructive/10">
          <AlertCircle />
          <AlertTitle>Failed to load table data.</AlertTitle>
          <AlertDescription>
            <p>{error?.message ?? 'UNKNOWN'}</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  return (
    <DatabaseTableData
      {...{ databaseId, query, tableName, tableSchema, options: getQueryOptions() }}
    />
  )
}

export default DatabaseTable
