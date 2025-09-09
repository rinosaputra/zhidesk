// File: src/renderer/src/components/database/TableData.tsx
import React, { useState } from 'react'
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Edit, Trash2, Eye, Loader2, ChevronLeft, ChevronRight, Plus, Save, X } from 'lucide-react'
import { DocumentData as TableDataType, Table as DatabaseTable } from './types'
import { CreateInput, CreateOutput } from '@service/database/types'

interface TableDataProps {
  data: TableDataType[]
  loading: boolean
  table?: DatabaseTable
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  onPaginationChange: (pagination: { page: number; pageSize: number }) => void
  onCreateRecord: (data: CreateInput['data']) => Promise<CreateOutput>
  onUpdateRecord?: (id: string, data: Partial<TableDataType>) => Promise<void>
  onDeleteRecord?: (id: string) => Promise<void>
}

interface EditState {
  id: string | null
  data: Partial<TableDataType>
}

export const TableData: React.FC<TableDataProps> = ({
  data,
  loading,
  table,
  pagination,
  onPaginationChange,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord
}) => {
  const [editing, setEditing] = useState<EditState>({ id: null, data: {} })
  const [newRecord, setNewRecord] = useState<Partial<TableDataType>>({})
  const [creating, setCreating] = useState(false)

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  const handleCreateRecord = async (): Promise<void> => {
    if (!table) return

    setCreating(true)
    try {
      await onCreateRecord(newRecord)
      setNewRecord({})
    } catch (error) {
      console.error('Failed to create record:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (id: string, record: TableDataType): void => {
    setEditing({ id, data: { ...record } })
  }

  const handleSaveEdit = async (): Promise<void> => {
    if (!editing.id || !onUpdateRecord) return

    try {
      await onUpdateRecord(editing.id, editing.data)
      setEditing({ id: null, data: {} })
    } catch (error) {
      console.error('Failed to update record:', error)
    }
  }

  const handleCancelEdit = (): void => {
    setEditing({ id: null, data: {} })
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!onDeleteRecord) return

    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await onDeleteRecord(id)
      } catch (error) {
        console.error('Failed to delete record:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const displayedFields = table?.fields.filter((field) => !field.hidden) || []

  return (
    <div className="space-y-4">
      {/* Add Record Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Add New Record</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedFields.map((field) => (
            <div key={field.name}>
              <label className="text-sm font-medium mb-1 block">{field.label}</label>
              <Input
                placeholder={field.label}
                value={(newRecord[field.name] as string) || ''}
                onChange={(e) =>
                  setNewRecord({
                    ...newRecord,
                    [field.name]: e.target.value
                  })
                }
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={handleCreateRecord} disabled={creating}>
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Record
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <TableUI>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              {displayedFields.map((field) => (
                <TableHead key={field.name}>{field.label}</TableHead>
              ))}
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row._id}>
                <TableCell className="font-mono text-sm">{row._id?.substring(0, 8)}...</TableCell>

                {displayedFields.map((field) => (
                  <TableCell key={field.name}>
                    {editing.id === row._id ? (
                      <Input
                        value={(editing.data[field.name] as string) || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: { ...editing.data, [field.name]: e.target.value }
                          })
                        }
                      />
                    ) : (
                      <span>{String(row[field.name] || 'N/A')}</span>
                    )}
                  </TableCell>
                ))}

                <TableCell>
                  {row._createdAt ? new Date(row._createdAt).toLocaleDateString() : 'N/A'}
                </TableCell>

                <TableCell>
                  {editing.id === row._id ? (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleSaveEdit}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(row._id!, row)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(row._id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableUI>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} records
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => onPaginationChange({ ...pagination, page: pagination.page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm">
              Page {pagination.page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === totalPages}
              onClick={() => onPaginationChange({ ...pagination, page: pagination.page + 1 })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) =>
                onPaginationChange({
                  ...pagination,
                  pageSize: parseInt(value),
                  page: 1
                })
              }
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
