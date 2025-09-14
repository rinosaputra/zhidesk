/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { Button, buttonVariants } from '../ui/button'
import { Layout, Loader2, Save, Trash } from 'lucide-react'
import z from 'zod'
import { ArrayField, BaseField, Field, ObjectField, ReferenceField } from './types'
import {
  ControllerRenderProps,
  SubmitHandler,
  useFieldArray,
  useForm,
  useFormContext
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useQuery } from '@tanstack/react-query'
import { database } from '@renderer/lib/orpc-query'
import useDatabaseStore from './store'
import { Switch } from '../ui/switch'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { DatabaseClient } from './client'

type FieldLayoutProps = {
  onRemove?: () => void
  number?: number
}

type FieldProps<Config> = FieldLayoutProps & {
  field: ControllerRenderProps<any, string>
  config: Config
  hideLabel?: boolean
}

const RelationInput: React.FC<FieldProps<ReferenceField>> = ({ config, field }) => {
  const { databaseId } = useDatabaseStore()
  const { isLoading, data } = useQuery(
    database.document.find.queryOptions({
      input: {
        databaseId,
        tableName: config.reference.tableName
      }
    })
  )
  return (
    <Select value={field.value} onValueChange={field.onChange}>
      <FormControl>
        <SelectTrigger className="w-full" disabled={isLoading}>
          <SelectValue placeholder={`Select ${config.label}`} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {data?.documents?.map((option, key) => (
          <SelectItem key={key} value={option._id}>
            {option[config.reference.tableName] || Object.values(option)[0] || 'N/A'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const FieldLabel: React.FC<Pick<BaseField, 'label' | 'required'>> = (config) => (
  <FormLabel>
    {config.label}
    {config.required && <span className="text-destructive">*</span>}
  </FormLabel>
)

const FieldLayout: React.FC<React.PropsWithChildren<FieldLayoutProps>> = ({
  children,
  number,
  onRemove
}) => (
  <div className="flex items-center gap-2">
    {number && <div className={buttonVariants({ variant: 'outline', size: 'icon' })}>{number}</div>}
    <div className="flex-1 flex flex-col">{children}</div>
    {onRemove && (
      <Button variant={'destructive'} size={'icon'} onClick={onRemove}>
        <Trash />
      </Button>
    )}
  </div>
)

const FieldInput: React.FC<FieldProps<Field>> = ({ config, field, hideLabel, ...layout }) => {
  switch (config.type) {
    case 'string':
      return (
        <FormItem>
          {!hideLabel && <FieldLabel {...config} />}
          <FormControl>
            <FieldLayout {...layout}>
              <Input
                {...field}
                placeholder={config.label}
                type={
                  config.validation && config.validation.format !== 'string'
                    ? 'text'
                    : config.validation?.format
                }
              />
            </FieldLayout>
          </FormControl>
          {config.description && <FormDescription>{config.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )
    case 'number':
      return (
        <FormItem>
          {!hideLabel && <FieldLabel {...config} />}
          <FormControl>
            <FieldLayout {...layout}>
              <Input {...field} placeholder={config.label} type={'number'} />
            </FieldLayout>
          </FormControl>
          {config.description && <FormDescription>{config.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )
    case 'enum':
      return (
        <FormItem>
          {!hideLabel && <FieldLabel {...config} />}
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <FieldLayout {...layout}>
                <SelectTrigger className="flex-1 w-full">
                  <SelectValue placeholder={`Select ${config.label}`} />
                </SelectTrigger>
              </FieldLayout>
            </FormControl>
            <SelectContent>
              {config.options.map((option, key) => (
                <SelectItem key={key} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {config.description && <FormDescription>{config.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )
    case 'reference':
      return (
        <FormItem>
          {!hideLabel && <FieldLabel {...config} />}
          <FieldLayout {...layout}>
            <RelationInput config={config} field={field} />
          </FieldLayout>
          {config.description && <FormDescription>{config.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )
    case 'boolean':
      return (
        <FieldLayout {...layout}>
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              {!hideLabel && <FieldLabel {...config} />}
              <FormDescription>{config.description}</FormDescription>
              <FormMessage />
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        </FieldLayout>
      )
    case 'object':
      return (
        <FieldLayout {...layout}>
          <FormItem>
            <FormControl>
              <ObjectInput {...{ config, field }} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FieldLayout>
      )
    case 'array':
      return (
        <FieldLayout {...layout}>
          <FormItem>
            <FormControl>
              <ArrayInput {...{ config, field }} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FieldLayout>
      )
    default:
      return (
        <FormItem>
          {!hideLabel && <FieldLabel {...config} />}
          {config.description && <FormDescription>{config.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )
  }
}

const ObjectInput: React.FC<FieldProps<ObjectField>> = ({ config, field }) => {
  const { control } = useFormContext<Record<string, any[]>>()
  return (
    <Card className="py-3 gap-3">
      <CardHeader className="px-4">
        <CardTitle>
          {config.label}
          {config.required && <span className="text-destructive">*</span>}
        </CardTitle>
        {config.description && <CardDescription>{config.description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4 space-y-3">
        {config.fields.map((obj, index) => (
          <FormField
            key={index}
            control={control}
            name={[field.name, obj.name].join('.')}
            render={({ field }) => <FieldInput config={obj} field={field} hideLabel />}
          />
        ))}
      </CardContent>
    </Card>
  )
}

const ArrayInput: React.FC<FieldProps<ArrayField>> = ({ config, field }) => {
  const { control } = useFormContext<Record<string, any[]>>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: config.name,
    keyName: '_key'
  })
  return (
    <Card className="py-3 gap-3">
      <CardHeader className="px-4">
        <CardTitle>
          {config.label}
          {config.required && <span className="text-destructive">*</span>}
        </CardTitle>
        {config.description && <CardDescription>{config.description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4 space-y-3">
        {!fields.length ? (
          <div className="flex items-center h-24 w-full">
            <div className="m-auto font-medium text-foreground/50 text-base">Empty Values</div>
          </div>
        ) : (
          fields.map((e, index) => (
            <FormField
              key={e._key}
              control={control}
              name={[field.name, index].join('.')}
              render={({ field }) => (
                <FieldInput
                  config={config.items}
                  field={field}
                  number={index + 1}
                  onRemove={() => remove(index)}
                  hideLabel
                />
              )}
            />
          ))
        )}
      </CardContent>
      <CardFooter className="px-4">
        <Button onClick={() => append(DatabaseClient.getDefaultValueForType(config.items.type))}>
          Add Value
        </Button>
      </CardFooter>
    </Card>
  )
}

interface FieldFormProps<Schema extends z.ZodAny = z.ZodAny, Values = z.infer<Schema>> {
  schema: Schema
  defaultValues: Values
  fields: Field[]
  onOpen(value: boolean): void
  isPending: boolean
  onSubmit: SubmitHandler<Values>
}

const FieldForm: React.FC<FieldFormProps> = ({
  defaultValues,
  schema,
  fields,
  isPending,
  onOpen,
  onSubmit
}) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues
  })
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Create New Record
        </DialogTitle>
        <DialogDescription>Define your record data with fields and properties</DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <Form {...form}>
          {fields.map((config, i) => (
            <FormField
              key={i}
              control={form.control}
              name={config.name}
              render={({ field }) => <FieldInput config={config} field={field} />}
            />
          ))}
        </Form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit, console.log)}
          >
            {isPending ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Record
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  )
}

export default FieldForm
