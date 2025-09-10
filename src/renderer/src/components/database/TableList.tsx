// File: src/renderer/src/components/database/TableList.tsx
import React from 'react'
import { Table, Loader2, Info } from 'lucide-react'
import { Table as DatabaseTable } from './types'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@renderer/components/ui/hover-card'
import { Button } from '@renderer/components/ui/button'
import { Badge } from '../ui/badge'

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
          className={`p-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${
            selectedTable === table.name
              ? 'bg-primary'
              : 'hover:bg-primary/10'
          }`}
          onClick={() => onSelectTable(table.name)}
        >
          <div className="flex items-center gap-2">
            <Table className="size-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {/* <div className="font-medium truncate">{table.label}</div> */}
              <div className="text-sm truncate">{table.name}</div>
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="size-4" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">{table.label}</h4>
                  <p className="text-sm">{table.description}</p>
                  <Badge>{table.fields.length} fields</Badge>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      ))}

      {tables.length === 0 && <div className="text-center text-gray-500 p-8">No tables found</div>}
    </div>
  )
}
