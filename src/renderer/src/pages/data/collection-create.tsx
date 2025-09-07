// File: src/renderer/src/pages/data/CreateCollectionPage.tsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
import { Switch } from '@renderer/components/ui/switch'
import { ArrowLeft, Plus } from 'lucide-react'
import { ROUTES } from '@renderer/routes'
import { orpc } from '@renderer/lib/orpc-query'

const CreateCollectionPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    timestamps: true,
    softDelete: false
  })

  const mutation = useMutation(
    orpc.collection.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.collection.getAll.key() })
        navigate(ROUTES.DATA_COLLECTIONS.$path())
      }
    })
  )

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    mutation.mutate({
      name: formData.name,
      label: formData.label,
      description: formData.description,
      timestamps: formData.timestamps,
      softDelete: formData.softDelete,
      fields: [] // Fields akan diimplementasikan nanti
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Buat Collection Baru</h1>
          <p className="text-muted-foreground">Buat collection baru untuk menyimpan data Anda</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Collection</CardTitle>
          <CardDescription>Isi informasi dasar untuk collection baru Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Collection *</Label>
                <Input
                  id="name"
                  placeholder="users"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Nama harus unik dan hanya boleh mengandung huruf, angka, dan underscore
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  placeholder="Users"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Nama yang akan ditampilkan di interface
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Collection untuk menyimpan data pengguna..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="timestamps">Timestamps</Label>
                  <p className="text-sm text-muted-foreground">
                    Tambahkan createdAt dan updatedAt otomatis
                  </p>
                </div>
                <Switch
                  id="timestamps"
                  checked={formData.timestamps}
                  onCheckedChange={(checked) => setFormData({ ...formData, timestamps: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="softDelete">Soft Delete</Label>
                  <p className="text-sm text-muted-foreground">
                    Jangan hapus data permanen, tapi tandai sebagai deleted
                  </p>
                </div>
                <Switch
                  id="softDelete"
                  checked={formData.softDelete}
                  onCheckedChange={(checked) => setFormData({ ...formData, softDelete: checked })}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  'Membuat...'
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Collection
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Batal
              </Button>
            </div>

            {mutation.error && (
              <div className="text-destructive text-sm">Error: {mutation.error.message}</div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateCollectionPage
