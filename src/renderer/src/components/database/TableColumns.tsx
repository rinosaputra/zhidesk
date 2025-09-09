// File: src/renderer/src/components/database/TableColumns.tsx
import React from 'react'
import { Table as DatabaseTable } from './types'
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'

interface TableColumnsProps {
  table?: DatabaseTable
}

export const TableColumns: React.FC<TableColumnsProps> = ({ table }) => {
  if (!table) {
    return <div className="text-center text-gray-500 p-8">Select a table to view columns</div>
  }

  return (
    <div className="border rounded-lg bg-white">
      <TableUI>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Constraints</TableHead>
            <TableHead>Default</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.fields.map((field) => (
            <TableRow key={field.name}>
              <TableCell className="font-medium">
                <div>
                  <div>{field.label}</div>
                  <div className="text-sm text-gray-600">{field.name}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{field.type}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {field.required && <Badge variant="secondary">Required</Badge>}
                  {field.unique && <Badge variant="secondary">Unique</Badge>}
                  {field.hidden && <Badge variant="secondary">Hidden</Badge>}
                </div>
              </TableCell>
              <TableCell>
                {field.default !== undefined ? (
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {String(field.default)}
                  </code>
                ) : (
                  <span className="text-gray-400">NULL</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableUI>

      <div className="p-4 border-t">
        <div className="text-sm text-gray-600">
          <strong>Timestamps:</strong> {table.timestamps ? 'Enabled' : 'Disabled'}
          {' | '}
          <strong>Soft Delete:</strong> {table.softDelete ? 'Enabled' : 'Disabled'}
        </div>
      </div>
    </div>
  )
}
