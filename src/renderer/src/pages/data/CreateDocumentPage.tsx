/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/renderer/src/pages/data/CreateDocumentPage.tsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Switch } from '@renderer/components/ui/switch'
import { Badge } from '@renderer/components/ui/badge'
import { ArrowLeft, Save, Plus } from 'lucide-react'
import { ROUTES } from '@renderer/routes'
import { orpc } from '@renderer/lib/orpc-query'
import { toast } from 'sonner'
import { DocSchemaType } from '@schema/collection/doc'

export const CreateDocumentPage: React.FC = () => {
  const { collectionName } = useParams<{ collectionName: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return await orpc.collection.document.create.call({
        collectionName: collectionName!,
        data
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.collection.document.getAll.key({
          input: {
            collectionName: collectionName!
          }
        })
      })
      toast.success('Document created successfully')
      navigate(
        ROUTES.DATA_COLLECTION_LIST.$buildPath({
          params: { collectionName: collectionName! }
        })
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create document')
    }
  })

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    setErrors({})

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name) {
      newErrors.name = 'Name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    mutation.mutate(formData)
  }

  const handleInputChange = (field: string, value: any): void => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Sample fields based on collection type
  const getFieldsConfig = (): DocSchemaType[] => {
    switch (collectionName) {
      case 'users':
        return [
          { name: 'name', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            options: ['admin', 'user', 'guest'],
            required: true
          },
          { name: 'isActive', label: 'Active', type: 'boolean', default: true },
          { name: 'bio', label: 'Bio', type: 'textarea' }
        ]
      case 'products':
        return [
          { name: 'name', label: 'Product Name', type: 'text', required: true },
          { name: 'price', label: 'Price', type: 'number', required: true },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            options: ['electronics', 'clothing', 'books'],
            required: true
          },
          { name: 'inStock', label: 'In Stock', type: 'boolean', default: true },
          { name: 'description', label: 'Description', type: 'textarea' }
        ]
      default:
        return [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' }
        ]
    }
  }

  const fields = getFieldsConfig()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link
            to={ROUTES.DATA_COLLECTION_LIST.$buildPath({
              params: { collectionName: collectionName! }
            })}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold capitalize">Create {collectionName}</h1>
          <p className="text-muted-foreground">Add new document to {collectionName} collection</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
          <CardDescription>Fill in the details for the new document</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                    <Input
                      id={field.name}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                      className={errors[field.name] ? 'border-destructive' : ''}
                    />
                  ) : field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className={errors[field.name] ? 'border-destructive' : ''}
                    />
                  ) : field.type === 'select' ? (
                    <Select
                      value={formData[field.name] || ''}
                      onValueChange={(value) => handleInputChange(field.name, value)}
                    >
                      <SelectTrigger className={errors[field.name] ? 'border-destructive' : ''}>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'boolean' ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        id={field.name}
                        checked={formData[field.name] ?? field.default}
                        onCheckedChange={(checked) => handleInputChange(field.name, checked)}
                      />
                      <Label htmlFor={field.name} className="cursor-pointer">
                        {(formData[field.name] ?? field.default) ? 'Yes' : 'No'}
                      </Label>
                    </div>
                  ) : null}

                  {errors[field.name] && (
                    <p className="text-destructive text-sm">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-6">
              <Button type="button" variant="outline" asChild>
                <Link
                  to={ROUTES.DATA_COLLECTION_LIST.$buildPath({
                    params: { collectionName: collectionName! }
                  })}
                >
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2">⏳</div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Document
                  </>
                )}
              </Button>
            </div>

            {mutation.error && (
              <div className="text-destructive text-sm">Error: {mutation.error.message}</div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Collection Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Collection:</span>
                <Badge variant="secondary" className="capitalize">
                  {collectionName}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Fields:</span>
                <Badge variant="secondary">{fields.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Add Another
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              📋 Duplicate
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
