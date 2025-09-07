// File: src/renderer/src/pages/data/CollectionListPage.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { Plus, Search, ArrowLeft, Edit, Eye, Trash2 } from 'lucide-react'
import { ROUTES } from '@renderer/routes'
import { orpc } from '@renderer/lib/orpc-query'

const CollectionListPage: React.FC = () => {
  const { collectionName } = useParams<{ collectionName: string }>()
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: documents,
    isLoading,
    error
  } = useQuery(
    orpc.collection.document.getAll.queryOptions({
      input: { collectionName: collectionName! }
    })
  )

  const filteredDocuments = documents?.documents.filter((doc) =>
    Object.values(doc).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-destructive mb-4">Error: {error.message}</div>
            <Button asChild>
              <Link to={ROUTES.DATA_COLLECTIONS.$path()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Collections
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to={ROUTES.DATA_COLLECTIONS.$path()}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold capitalize">{collectionName}</h1>
          <p className="text-muted-foreground">
            Kelola documents dalam collection {collectionName}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {isLoading ? 'Loading...' : `${filteredDocuments?.length} documents ditemukan`}
              </CardDescription>
            </div>
            <Button asChild>
              <Link
                to={ROUTES.DATA_COLLECTION_CREATE.$buildPath({
                  params: { collectionName: collectionName! }
                })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Document
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredDocuments && filteredDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-mono text-sm">{doc.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-medium">
                      {doc.name || doc.title || doc.email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.deletedAt ? 'destructive' : 'default'}>
                        {doc.deletedAt ? 'Deleted' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={ROUTES.DATA_COLLECTION_VIEW.$buildPath({
                              params: {
                                collectionName: collectionName!,
                                id: doc.id
                              }
                            })}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={ROUTES.DATA_COLLECTION_EDIT.$buildPath({
                              params: {
                                collectionName: collectionName!,
                                id: doc.id
                              }
                            })}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tidak ada documents ditemukan dalam collection ini.
              </p>
              <Button asChild className="mt-4">
                <Link
                  to={ROUTES.DATA_COLLECTION_CREATE.$buildPath({
                    params: { collectionName: collectionName! }
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Document Pertama
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CollectionListPage
