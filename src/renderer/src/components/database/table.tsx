import React from 'react'
import useDatabaseStore from './store'
import { RouteLoading } from '../routers'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

const DatabaseTable: React.FC = () => {
  const { tableSchema, error } = useDatabaseStore()
  if (!tableSchema) return <RouteLoading />
  if (error?.type === 'table')
    return (
      <div className="flex-1 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md bg-destructive/10">
          <AlertCircle />
          <AlertTitle>Failed to load table data.</AlertTitle>
          <AlertDescription>
            <p>{error?.message ?? 'UNKNOWN'}</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  return <div>Database</div>
}

export default DatabaseTable
