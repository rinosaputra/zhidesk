// File: src/renderer/src/components/database/FieldEditor.tsx
import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
import { Badge } from '@renderer/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import {
  Type,
  Hash,
  CheckSquare,
  Calendar,
  List,
  Link,
  Layers,
  Box,
  Settings,
  LucideIcon,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react'
import {
  ArrayFieldSchema,
  BooleanFieldSchema,
  DateFieldSchema,
  EnumFieldSchema,
  Field,
  FieldType,
  NumberFieldSchema,
  ObjectFieldSchema,
  ReferenceFieldSchema,
  StringFieldSchema
} from '@service/database/types'
import z from 'zod'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { EnumField } from './types'
import { Button } from '../ui/button'

// const fieldTypes: { value: Field; label: string; icon: React.ReactNode }[] = [
//   { value: 'string', label: 'String', icon: <Type className="h-4 w-4" /> },
//   { value: 'number', label: 'Number', icon: <Hash className="h-4 w-4" /> },
//   { value: 'boolean', label: 'Boolean', icon: <CheckSquare className="h-4 w-4" /> },
//   { value: 'date', label: 'Date', icon: <Calendar className="h-4 w-4" /> },
//   { value: 'enum', label: 'Enum', icon: <List className="h-4 w-4" /> },
//   { value: 'reference', label: 'Reference', icon: <Link className="h-4 w-4" /> },
//   { value: 'array', label: 'Array', icon: <Layers className="h-4 w-4" /> },
//   { value: 'object', label: 'Object', icon: <Box className="h-4 w-4" /> }
// ]

type FieldTypes = Record<
  FieldType,
  {
    schema: z.ZodType<Field>
    icon: LucideIcon
  }
>

const fieldTypes: FieldTypes = {
  array: {
    icon: Layers,
    schema: ArrayFieldSchema
  },
  boolean: {
    icon: CheckSquare,
    schema: BooleanFieldSchema
  },
  date: {
    icon: Calendar,
    schema: DateFieldSchema
  },
  enum: {
    icon: List,
    schema: EnumFieldSchema
  },
  number: {
    icon: Hash,
    schema: NumberFieldSchema
  },
  object: {
    icon: Box,
    schema: ObjectFieldSchema
  },
  reference: {
    icon: Link,
    schema: ReferenceFieldSchema
  },
  string: {
    icon: Type,
    schema: StringFieldSchema
  }
}

const EnumEditor: React.FC = () => {
  const { control } = useFormContext<EnumField>()
  const { fields, append, remove } = useFieldArray({ control, name: 'options' })
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Enum Options</CardTitle>
          <Button type="button" onClick={() => append({ label: '', value: '' })} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {fields.map((option, optionIndex) => (
          <div
            className="flex items-start gap-3 p-4 border rounded-lg bg-secondary"
            key={option.id}
          >
            {/* Drag Handle */}
            <Button type="button" variant="ghost" size="icon" disabled>
              <GripVertical className="h-4 w-4" />
            </Button>

            {/* Option Inputs */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={control}
                name={`options.${optionIndex}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option Label *</FormLabel>
                    <FormControl>
                      <Input placeholder="Display label" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`options.${optionIndex}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option Value *</FormLabel>
                    <FormControl>
                      <Input placeholder="Unique value" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Remove Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(optionIndex)}
              className="bg-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No options added yet</p>
            <p className="text-sm">
              Click {'"'}Add Option{'"'} to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const FieldEditor: React.FC = () => {
  const { control } = useFormContext<Field>()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., email, price, is_active" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Label *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Email Address, Price, Is Active" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Field Type *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.values(FieldType).map((type) => {
                  const { icon: Icon } = fieldTypes[type]
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{type}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe what this field is used for..." {...field} rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Field-specific settings based on type */}
      {/* {field.type === 'enum' && (
        <div className="space-y-2">
          <Label>Enum Options</Label>
          <Input
            placeholder="comma,separated,values"
            value={field.validation?.options?.join(',') || ''}
            onChange={(e) =>
              updateField({
                validation: {
                  ...field.validation,
                  options: e.target.value
                    .split(',')
                    .map((opt) => opt.trim())
                    .filter((opt) => opt)
                }
              })
            }
          />
          <p className="text-sm text-gray-500">Enter options separated by commas</p>
        </div>
      )} */}

      {/* Validation settings based on type */}
      {(field.type === 'string' || field.type === 'number') && (
        <div className="space-y-2">
          <Label>Validation Rules</Label>
          <div className="grid grid-cols-2 gap-4">
            {field.type === 'string' && (
              <>
                <Input
                  type="number"
                  placeholder="Min length"
                  value={field.validation?.min || ''}
                  onChange={(e) =>
                    updateField({
                      validation: {
                        ...field.validation,
                        min: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max length"
                  value={field.validation?.max || ''}
                  onChange={(e) =>
                    updateField({
                      validation: {
                        ...field.validation,
                        max: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    })
                  }
                />
              </>
            )}
            {field.type === 'number' && (
              <>
                <Input
                  type="number"
                  placeholder="Minimum value"
                  value={field.validation?.min || ''}
                  onChange={(e) =>
                    updateField({
                      validation: {
                        ...field.validation,
                        min: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Maximum value"
                  value={field.validation?.max || ''}
                  onChange={(e) =>
                    updateField({
                      validation: {
                        ...field.validation,
                        max: e.target.value ? parseFloat(e.target.value) : undefined
                      }
                    })
                  }
                />
              </>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Default Value</Label>
        <Input
          placeholder="Default value for this field"
          value={field.defaultValue || ''}
          onChange={(e) => updateField({ defaultValue: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`field-required-${field.name}`}
            checked={field.required}
            onCheckedChange={(checked) => updateField({ required: checked })}
          />
          <Label htmlFor={`field-required-${field.name}`}>Required</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`field-unique-${field.name}`}
            checked={field.unique}
            onCheckedChange={(checked) => updateField({ unique: checked })}
          />
          <Label htmlFor={`field-unique-${field.name}`}>Unique</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`field-hidden-${field.name}`}
            checked={field.hidden}
            onCheckedChange={(checked) => updateField({ hidden: checked })}
          />
          <Label htmlFor={`field-hidden-${field.name}`}>Hidden</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`field-readonly-${field.name}`}
            checked={field.readonly}
            onCheckedChange={(checked) => updateField({ readonly: checked })}
          />
          <Label htmlFor={`field-readonly-${field.name}`}>Readonly</Label>
        </div>
      </div>

      {/* Field summary */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Field Summary</span>
          </div>
          <div className="flex gap-2">
            {field.required && <Badge variant="secondary">Required</Badge>}
            {field.unique && <Badge variant="secondary">Unique</Badge>}
            {field.hidden && <Badge variant="secondary">Hidden</Badge>}
            {field.readonly && <Badge variant="secondary">Readonly</Badge>}
          </div>
        </div>
      </div>
    </div>
  )
}
