import React from 'react'
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import useDatabaseStore from './store'
import { Pill, PillStatus } from '../ui/pill'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react'

const DatabaseTableStructure: React.FC = () => {
  const { tableSchema: table } = useDatabaseStore()
  if (!table) {
    return <div className="text-center p-8 select-none">Select a table to view columns</div>
  }

  return (
    <div className="container mx-auto py-6 select-none">
      <div className="border rounded-lg">
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
                    <div className="text-sm text-foreground/50 font-mono">{field.name}</div>
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
                    <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">
                      {String(field.default)}
                    </code>
                  ) : (
                    <span className="text-foreground">NULL</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableUI>
        <div className="p-4 border-t">
          <div className="space-x-2">
            <Pill>
              <PillStatus>
                {table.timestamps ? (
                  <CheckCircleIcon className="text-primary" size={12} />
                ) : (
                  <XCircleIcon className="text-destructive" size={12} />
                )}
                {table.timestamps ? 'Enabled' : 'Disabled'}
              </PillStatus>
              <span className="font-mono">Timestamps</span>
            </Pill>
            <Pill>
              <PillStatus>
                {table.timestamps ? (
                  <CheckCircleIcon className="text-primary" size={12} />
                ) : (
                  <XCircleIcon className="text-destructive" size={12} />
                )}
                {table.softDelete ? 'Enabled' : 'Disabled'}
              </PillStatus>
              <span className="font-mono">Soft Delete</span>
            </Pill>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatabaseTableStructure
