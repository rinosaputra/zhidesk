// File: src/renderer/src/components/database/CreateTableDialog.tsx
import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import {
  Plus,
  X,
  Save,
  Table,
  Type,
  Hash,
  CheckSquare,
  Calendar,
  List,
  Link,
  Layers,
  Box
} from 'lucide-react'
import { toast } from 'sonner'
import { database } from '@renderer/lib/orpc-query'
import { Table as CreateTableFormData, Field as FieldFormData, FieldType } from './types'
import { FieldEditor } from './FieldEditor'

interface CreateTableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const defaultField: FieldFormData = {
  name: '',
  label: '',
  type: 'string',
  required: false,
  unique: false,
  hidden: false,
  readonly: false
}

export const CreateTableDialog: React.FC<CreateTableDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState<CreateTableFormData>({
    name: '',
    label: '',
    description: '',
    timestamps: true,
    softDelete: false,
    fields: [defaultField]
  })

  const createTableMutation = useMutation({
    mutationFn: async (tableData: CreateTableFormData) => {
      const result = await database.table.create.call({
        databaseId: 'default',
        tableConfig: {
          name: tableData.name,
          label: tableData.label,
          description: tableData.description,
          fields: tableData.fields.map((field) => ({
            name: field.name,
            label: field.label,
            type: field.type,
            description: field.description,
            required: field.required,
            unique: field.unique,
            hidden: field.hidden,
            readonly: field.readonly,
            default: field.defaultValue,
            validation: field.validation
          })),
          timestamps: tableData.timestamps,
          softDelete: tableData.softDelete
        }
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create table')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database', 'tables'] })
      toast.success('Table created successfully')
      onOpenChange(false)
      setFormData({
        name: '',
        label: '',
        description: '',
        timestamps: true,
        softDelete: false,
        fields: [defaultField]
      })
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(`Failed to create table: ${error.message}`)
    }
  })

  const addField = () => {
    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, { ...defaultField }]
    }))
  }

  const removeField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }))
  }

  const updateField = (index: number, updates: Partial<FieldFormData>) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((field, i) => (i === index ? { ...field, ...updates } : field))
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTableMutation.mutate(formData)
  }

  const fieldIcons: Record<FieldType, React.ReactNode> = {
    string: <Type className="h-4 w-4" />,
    number: <Hash className="h-4 w-4" />,
    boolean: <CheckSquare className="h-4 w-4" />,
    date: <Calendar className="h-4 w-4" />,
    enum: <List className="h-4 w-4" />,
    reference: <Link className="h-4 w-4" />,
    array: <Layers className="h-4 w-4" />,
    object: <Box className="h-4 w-4" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Create New Table
          </DialogTitle>
          <DialogDescription>
            Define your table structure with fields and properties
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Table Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., users, products, orders"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <p className="text-sm text-gray-500">Lowercase, snake_case recommended</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Display Label *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Users, Products, Orders"
                    value={formData.label}
                    onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this table is used for..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Table Fields</Label>
                <Button type="button" onClick={addField} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                {formData.fields.map((field, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {fieldIcons[field.type]}
                        <span className="font-medium">Field {index + 1}</span>
                      </div>
                      {formData.fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FieldEditor
                      field={field}
                      onChange={(updates) => updateField(index, updates)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Timestamps</Label>
                    <p className="text-sm text-gray-500">
                      Automatically add createdAt and updatedAt fields
                    </p>
                  </div>
                  <Switch
                    checked={formData.timestamps}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, timestamps: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Soft Delete</Label>
                    <p className="text-sm text-gray-500">
                      Enable soft delete functionality with deletedAt field
                    </p>
                  </div>
                  <Switch
                    checked={formData.softDelete}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, softDelete: checked }))
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTableMutation.isPending}>
              {createTableMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Table
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
