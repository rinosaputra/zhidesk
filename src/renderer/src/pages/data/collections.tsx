// File: src/renderer/src/pages/data/DataPage.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Badge } from '@renderer/components/ui/badge'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { Plus, Search, Database, FileText, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@renderer/routes'
import { orpc } from '@renderer/lib/orpc-query'

type CollectionCardProps = {
  name: string
  count: number
}

const CollectionCard: React.FC<CollectionCardProps> = (collection) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold capitalize">{collection.name}</CardTitle>
          <Badge variant="secondary">{collection.count} docs</Badge>
        </div>
        <CardDescription>Collection untuk menyimpan data {collection.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              to={ROUTES.DATA_COLLECTION_LIST.$buildPath({
                params: { collectionName: collection.name }
              })}
            >
              Lihat Data
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link
              to={ROUTES.DATA_COLLECTION_CREATE.$buildPath({
                params: { collectionName: collection.name }
              })}
            >
              Tambah Data
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const DataPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('collections')

  const { data: collectionsData, isLoading: collectionsLoading } = useQuery(
    orpc.collection.getAll.queryOptions()
  )

  const collections = collectionsData?.collections || []

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground">Kelola collections dan data aplikasi Anda</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.DATA_COLLECTION_CREATE.$path()}>
            <Plus className="w-4 h-4 mr-2" />
            Collection Baru
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {collectionsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCollections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tidak ada collections</h3>
                <p className="text-muted-foreground mb-4">
                  Mulai dengan membuat collection pertama Anda
                </p>
                <Button asChild>
                  <Link to={ROUTES.DATA_COLLECTION_CREATE.$path()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Collection
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCollections.map((collection) => (
                <CollectionCard key={collection.name} {...collection} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents Overview</CardTitle>
              <CardDescription>Lihat dan kelola documents across all collections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Fitur documents overview akan segera hadir.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Data Analytics</CardTitle>
              <CardDescription>Analytics dan insights untuk data Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Fitur analytics akan segera hadir.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DataPage
