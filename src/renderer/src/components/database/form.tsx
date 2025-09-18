import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, Save, Loader2, Table } from 'lucide-react'
import { toast } from 'sonner'
import { database } from '@renderer/lib/orpc-query'
import { DatabaseSchema, TableSchema } from './types'
import {
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { FieldEditor } from './field.editor'
import { fieldTypes } from './const'
import useDatabaseStore from './store'

const DatabaseForm: React.FC = () => {
  const queryClient = useQueryClient()
  const { setModal } = useDatabaseStore()
  const form = useForm({
    resolver: zodResolver(DatabaseSchema),
    defaultValues: {
      createdAt: new Date(),
      updatedAt: new Date(),
      name: '',
      tables: [],
      version: 1
    }
  })
  const { isPending, mutateAsync } = useMutation(database.table.create.mutationOptions())
  const columns = useFieldArray({ control: form.control, name: 'fields' })

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Table className="h-5 w-5" />
          Create Database
        </DialogTitle>
        <DialogDescription>Define your database</DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <Form {...form}>
          <Tabs defaultValue={'basic'}>
            <div className="flex items-center justify-between gap-2">
              <TabsList className="flex-1">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
              </TabsList>
              {/* <DatabaseTableAI onReset={(data) => form.reset(data)} /> */}
            </div>

            <TabsContent value="basic" className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., users, products, orders" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Users, Products, Orders" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Table Fields</Label>
                <Button
                  type="button"
                  onClick={() =>
                    columns.append({
                      type: 'string',
                      name: '',
                      label: '',
                      description: '',
                      default: '',
                      coerce: false,
                      hidden: false,
                      index: false,
                      readonly: false,
                      required: false,
                      unique: false,
                      validation: {
                        format: 'string',
                        length: -1,
                        max: -1,
                        min: -1,
                        pattern: '',
                        trim: true
                      }
                    })
                  }
                  size="sm"
                >
                  <Plus />
                  Add Field
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                {columns.fields.map((field, index) => {
                  const { icon: Icon } = fieldTypes[field.type]
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon />
                          <span className="font-medium">Field {index + 1}</span>
                        </div>
                        {columns.fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => columns.remove(index)}
                          >
                            <X />
                          </Button>
                        )}
                      </div>

                      <FieldEditor index={index} />
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="timestamps"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Timestamps</FormLabel>
                        <FormDescription>
                          Automatically add createdAt and updatedAt fields.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="softDelete"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Soft Delete</FormLabel>
                        <FormDescription>
                          Enable soft delete functionality with deletedAt field.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </Form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            onClick={form.handleSubmit((data) => {
              toast.promise(
                () =>
                  mutateAsync({
                    databaseId: 'default',
                    tableConfig: data
                  }),
                {
                  loading: `Creating...`,
                  success: (data) => {
                    if (data.error) return `Failed to create table: ${data.error}`
                    queryClient.invalidateQueries({
                      queryKey: database.table.getAll.queryKey({
                        input: { databaseId: 'default' }
                      })
                    })
                    setModal(false)
                    return `Table created successfully`
                  },
                  error: (error: Error) => `Failed to create table: ${error.message}`
                }
              )
            }, console.log)}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save />
                Create Table
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  )
}

export default DatabaseForm
