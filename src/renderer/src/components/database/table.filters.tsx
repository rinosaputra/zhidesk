import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@renderer/components/ui/form'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { cn } from '@renderer/lib/utils'
import useDatabaseStore from './store'
import { FilterCondition, FilterConditionOperator } from './types'
import z from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'

type FilterSchema = {
  filters: FilterCondition[]
}

const FilterSchema = z.object({
  filters: z
    .object({
      field: z.string().nonempty(),
      operator: z.enum(FilterConditionOperator),
      value: z.string().nonempty()
    })
    .array()
    .min(1)
})

function setName<Name extends keyof FilterCondition>({
  index,
  name
}: {
  index: number
  name: Name
}): `filters.${number}.${Name}` {
  return `filters.${index}.${name}`
}

const DatabaseTableFilters: React.FC = () => {
  const { query, tableSchema, setFilters, openFilters } = useDatabaseStore()
  const form = useForm<FilterSchema>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      filters: []
    }
  })
  const { reset } = form
  const { fields, remove, append } = useFieldArray({ control: form.control, name: 'filters' })

  React.useEffect(() => {
    if (query.show) {
      reset({ filters: query.filters })
    }
  }, [query, reset])

  const handle = form.handleSubmit((data) => {
    const fields = tableSchema?.fields.map((e) => e.name) ?? []
    const result = FilterSchema.superRefine(({ filters }, ctx) => {
      const errorFields = filters
        .map((e, index) => (fields.some((f) => f === e.field) ? -1 : index))
        .filter((e) => e >= 0)
      if (errorFields.length)
        ctx.addIssue({
          code: 'invalid_value',
          path: errorFields.map((index) => setName({ index, name: 'field' })),
          values: fields
        })
    }).safeParse(data)
    console.log(result)
  }, console.log)

  return (
    <div
      className={cn('border-b p-3 select-none', query.show && fields.length ? undefined : 'hidden')}
    >
      <div className="gap-2 items-start flex">
        <Form {...form}>
          <div className="flex-col gap-2 mr-2 pr-4 border-r flex">
            {fields.map((_, index) => (
              <div key={index} className="flex gap-2">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    remove(index)
                    if (!index) openFilters(false)
                  }}
                >
                  <X />
                </Button>
                {/* Select Field */}
                <FormField
                  control={form.control}
                  name={setName({ index, name: 'field' })}
                  render={({ field }) => (
                    <FormItem>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select Field" className="truncate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tableSchema?.fields.map((field) => (
                            <SelectItem key={field.name} value={field.name}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Select Operator */}
                <FormField
                  control={form.control}
                  name={setName({ index, name: 'operator' })}
                  render={({ field }) => (
                    <FormItem>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Select Operator" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(FilterConditionOperator).map((type) => {
                            // const { icon: Icon } = fieldTypes[type]
                            return (
                              <SelectItem key={type} value={type}>
                                <div className="flex items-center gap-2">
                                  {/* <Icon className="h-4 w-4" /> */}
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
                {/* Select Operator */}
                <FormField
                  control={form.control}
                  name={setName({ index, name: 'value' })}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Value" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </Form>
        <div className="flex items-center gap-2">
          <Button size={'sm'} onClick={handle}>
            <span>Apply</span>
          </Button>
          <Button
            size={'sm'}
            variant={'secondary'}
            onClick={() => append({ field: '', operator: 'contains', value: '' })}
          >
            <Plus />
            <span>Add Filter</span>
          </Button>
          <Button size={'sm'} variant={'ghost'} onClick={() => setFilters([])}>
            <span>Clear Filters</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DatabaseTableFilters
