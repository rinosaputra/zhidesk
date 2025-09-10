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
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { Button } from '@renderer/components/ui/button'
import { Settings, Plus, Trash2, GripVertical } from 'lucide-react'
import { EnumField, FieldType, StringField, Table } from '@service/database/types'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { fieldTypes } from './const'

interface FieldEditorProps {
  index: number
}

function setName<T extends string>({
  index,
  name
}: {
  index: number
  name: T
}): `fields.${number}.${T}` {
  return `fields.${index}.${name}`
}

const EnumInputOptions: React.FC<FieldEditorProps> = ({ index }) => {
  const { control } = useFormContext<{ fields: EnumField[] }>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: setName({ index, name: 'options' })
  })
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
                name={setName({ index, name: `options.${optionIndex}.label` })}
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
                name={setName({ index, name: `options.${optionIndex}.value` })}
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

const StringInputValidation: React.FC<FieldEditorProps> = ({ index }) => {
  const { control } = useFormContext<{ fields: StringField[] }>()
  return (
    <>
      <FormField
        control={control}
        name={setName({ index, name: 'validation.max' })}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="number" placeholder="Max length" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={setName({ index, name: 'validation.min' })}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="number" placeholder="Min length" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ index }) => {
  const { control, watch } = useFormContext<Table>()
  const type = watch(setName({ index, name: 'type' }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={setName({ index, name: 'name' })}
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
          name={setName({ index, name: 'label' })}
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
        name={setName({ index, name: 'type' })}
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
                    <SelectItem key={type} value={type}>
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
        name={setName({ index, name: 'description' })}
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
      {type === 'enum' && <EnumInputOptions index={index} />}

      {/* Validation settings based on type */}
      {(type === 'string' || type === 'number') && (
        <div className="space-y-2">
          <Label>Validation Rules</Label>
          <div className="grid grid-cols-2 gap-4">
            {type === 'string' && <StringInputValidation index={index} />}
            {type === 'number' && <StringInputValidation index={index} />}
          </div>
        </div>
      )}

      {/* <div className="space-y-2">
        <Label>Default Value</Label>
        <Input
          placeholder="Default value for this field"
          value={field.defaultValue || ''}
          onChange={(e) => updateField({ defaultValue: e.target.value })}
        />
      </div> */}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={setName({ index, name: 'required' })}
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled
                  aria-readonly
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel>Required</FormLabel>
                {/* <FormDescription>Receive emails about your account security.</FormDescription> */}
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={setName({ index, name: 'unique' })}
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled
                  aria-readonly
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel>Unique</FormLabel>
                {/* <FormDescription>Receive emails about your account security.</FormDescription> */}
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={setName({ index, name: 'hidden' })}
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled
                  aria-readonly
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel>Hidden</FormLabel>
                {/* <FormDescription>Receive emails about your account security.</FormDescription> */}
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={setName({ index, name: 'readonly' })}
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled
                  aria-readonly
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel>Readonly</FormLabel>
                {/* <FormDescription>Receive emails about your account security.</FormDescription> */}
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
