// File: src/renderer/src/components/database/TableList.tsx
import React from 'react'
import { Table, Loader2 } from 'lucide-react'
import { Table as DatabaseTable } from './types'

interface TableListProps {
  tables: DatabaseTable[]
  selectedTable: string
  onSelectTable: (tableName: string) => void
  loading: boolean
}

export const TableList: React.FC<TableListProps> = ({
  tables,
  selectedTable,
  onSelectTable,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-2">
      {tables.map((table) => (
        <div
          key={table.name}
          className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
            selectedTable === table.name
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelectTable(table.name)}
        >
          <div className="flex items-center gap-3">
            <Table className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{table.label}</div>
              <div className="text-sm text-gray-600 truncate">{table.name}</div>
            </div>
            <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {table.fields.length} fields
            </div>
          </div>
        </div>
      ))}

      {tables.length === 0 && <div className="text-center text-gray-500 p-8">No tables found</div>}
    </div>
  )
}
