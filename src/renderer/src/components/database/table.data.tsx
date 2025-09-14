import React from 'react'
import { Field, QueryObject, QueryOptions } from './types'
import { DatabaseStore } from './store'
import { useQuery } from '@tanstack/react-query'
import { database } from '@renderer/lib/orpc-query'
import { Filter } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Badge } from '../ui/badge'

type ResultProps = {
  field: Field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}

const Result: React.FC<ResultProps> = ({ field, value }) => {
  switch (field.type) {
    case 'string':
      return String(value)
    case 'number':
      return Number(value).toLocaleString()
    case 'boolean':
      return <Badge variant={value ? undefined : 'destructive'}>{value ? 'Yes' : 'No'}</Badge>
    case 'reference':
      return <span className="font-mono">{String(value).substring(0, 8)}...</span>
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'enum':
      return value
    case 'object':
      return (
        <Badge variant={'secondary'} className="font-mono">
          {'{'}...{'}'}
        </Badge>
      )
    case 'array':
      return <Badge variant={'outline'}>{value.length || 0}</Badge>
    default:
      return 'N/A'
  }
}

type DatabaseTableData = Pick<
  DatabaseStore,
  'databaseId' | 'tableName' | 'tableSchema' | 'query'
> & {
  options?: QueryOptions
}

const DatabaseTableData: React.FC<DatabaseTableData> = ({
  databaseId,
  query: { filters },
  tableName,
  tableSchema,
  options
}) => {
  const query = React.useMemo<QueryObject | undefined>(() => {
    if (!filters.length) return undefined
    return filters.reduce<QueryObject>((query, filter) => {
      switch (filter.operator) {
        case 'equals':
          query[filter.field] = filter.value
          return query
        case 'contains':
          query[filter.field] = { $regex: filter.value, $options: 'i' }
          return query
        case 'greaterThan':
          query[filter.field] = { $gt: Number(filter.value) }
          return query
        case 'lessThan':
          query[filter.field] = { $lt: Number(filter.value) }
          return query
        case 'notEquals':
          query[filter.field] = { $ne: filter.value }
          return query
        default:
          return query
      }
    }, {})
  }, [filters])
  const count = useQuery(
    database.document.count.queryOptions({
      input: { databaseId, tableName, query }
    })
  )
  const results = useQuery(
    database.document.find.queryOptions({
      input: {
        databaseId,
        tableName,
        query,
        options
      },
      enabled: !count.isLoading && !!count.data?.count
    })
  )
  {
    /* Data Table */
  }

  return (
    <ScrollArea className="overflow-auto text-sm  h-[calc(100svh-var(--header-height)-var(--header-height)-8px)]!">
      <ScrollBar orientation="horizontal" />
      <table className="select-none">
        <thead>
          <tr>
            <th className="p-1 px-2 border border-t-0 border-l-0 font-normal">
              <div className="flex items-center">
                <Checkbox />
              </div>
            </th>
            <th className="p-1 px-2 border border-t-0 font-medium text-nowrap">
              <span className="font-medium">Unique </span>
              <span className="font-mono text-xs italic">String</span>
            </th>
            {tableSchema?.fields.map((field) => (
              <th key={field.name} className="border border-t-0 font-normal text-nowrap">
                <div className="flex gap-1 px-2">
                  <div className="flex-1 p-1">
                    <span className="font-medium">{field.label} </span>
                    <span className="font-mono text-xs italic">{field.type}</span>
                  </div>
                  <button>
                    <Filter className="size-3" />
                  </button>
                </div>
              </th>
            ))}
            {tableSchema?.timestamps && (
              <>
                <th className="p-1 px-2 border border-t-0 font-medium text-nowrap">
                  <span className="font-medium">Created At </span>
                  <span className="font-mono text-xs italic">Date</span>
                </th>
                <th className="p-1 px-2 border border-t-0 font-medium text-nowrap">
                  <span className="font-medium">Updated At </span>
                  <span className="font-mono text-xs italic">Date</span>
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {results.data?.documents?.map((row) => (
            <tr key={row._id}>
              <td className="p-1 px-2 border border-t-0 border-l-0 font-normal">
                <div className="flex items-center">
                  <Checkbox />
                </div>
              </td>
              <td className="p-1 px-2 border border-t-0 font-mono">{row._id.substring(0, 8)}...</td>

              {tableSchema?.fields.map((field) => (
                <td key={field.name} className="p-1 px-2 border border-t-0">
                  <div className="truncate max-w-64 overflow-hidden space-x-1">
                    <Result field={field} value={row[field.name]} />
                  </div>
                </td>
              ))}
              {tableSchema?.timestamps && (
                <>
                  <td className="p-1 px-2 border border-t-0">
                    {row._createdAt ? new Date(row._createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-1 px-2 border border-t-0">
                    {row._updatedAt ? new Date(row._updatedAt).toLocaleDateString() : 'N/A'}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}

export default DatabaseTableData
