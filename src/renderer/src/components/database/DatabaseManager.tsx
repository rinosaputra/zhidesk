// File: src/renderer/src/components/database/DatabaseManager.tsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import {
  Search,
  Database,
  Table,
  Plus,
  RefreshCw,
  Settings,
  FileText,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

import { TableList } from './TableList'
import { TableColumns } from './TableColumns'
import { TableData } from './TableData'
import { TableFilters } from './TableFilters'
import { database } from '@renderer/lib/orpc-query'
import { FilterCondition, Pagination } from './types'
import {
  CreateInput,
  CreateOutput,
  // UpdateInput,
  // DeleteInput,
  QueryObject
} from '@service/database/types'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import Creates from './Creates'

export const DatabaseManager: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [pagination, setPagination] = useState<Omit<Pagination, 'total'>>({
    page: 1,
    pageSize: 50
  })
  const [activeTab, setActiveTab] = useState('data')

  const queryClient = useQueryClient()

  // Init
  const init = useQuery(
    {
      queryKey: database.initialize.queryKey(),
      queryFn: () =>
        database.initialize.call({
          databaseId: 'default',
          databaseName: 'Default',
          tables: []
        })
    }
    // database.initialize.queryOptions({
    //   input: {
    //     databaseId: 'default',
    //     databaseName: 'Default',
    //     tables: [],
    //     description: ''
    //   },
    //   initialData: {
    //     success: false,
    //     error: ''
    //   },
    //   context: {}
    // })
  )

  // Fetch all tables
  const {
    data: tables = [],
    isLoading: loadingTables,
    error: tablesError
  } = useQuery(
    database.table.getAll.queryOptions({
      input: { databaseId: 'default' },
      select: (data) => data.tables ?? []
    })
  )

  // Build query object from filters
  const buildQuery = (): QueryObject => {
    const query: QueryObject = {}

    filters.forEach((filter) => {
      switch (filter.operator) {
        case 'equals':
          query[filter.field] = filter.value
          break
        case 'contains':
          query[filter.field] = { $regex: filter.value, $options: 'i' }
          break
        case 'greaterThan':
          query[filter.field] = { $gt: Number(filter.value) }
          break
        case 'lessThan':
          query[filter.field] = { $lt: Number(filter.value) }
          break
        case 'notEquals':
          query[filter.field] = { $ne: filter.value }
          break
      }
    })

    return query
  }

  // Fetch table data dengan filters
  const {
    data: tableData,
    isLoading: loadingData,
    error: dataError
  } = useQuery({
    queryKey: ['database', 'table-data', selectedTable, filters, pagination],
    queryFn: async () => {
      if (!selectedTable) return { documents: [], total: 0 }

      const query = buildQuery()

      const [result, countResult] = await Promise.all([
        database.document.find.call({
          databaseId: 'default',
          tableName: selectedTable,
          query,
          options: {
            skip: (pagination.page - 1) * pagination.pageSize,
            limit: pagination.pageSize
          }
        }),
        database.document.count.call({
          databaseId: 'default',
          tableName: selectedTable,
          query
        })
      ])

      if (!result.success) throw new Error(result.error || 'Failed to fetch data')
      if (!countResult.success) throw new Error(countResult.error || 'Failed to count data')

      return {
        documents: result.documents || [],
        total: countResult.count || 0
      }
    },
    enabled: !!selectedTable,
    retry: 2
  })

  // Create new record mutation
  const createMutation = useMutation<CreateOutput, Error, CreateInput['data']>({
    mutationFn: async (data) => {
      const result = await database.document.create.call({
        databaseId: 'default',
        tableName: selectedTable,
        data
      })
      if (!result.success) {
        throw new Error(result.error || 'Failed to create record')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['database', 'table-data', selectedTable]
      })
      toast.success('Record created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create record: ${error.message}`)
    }
  })

  // Update record mutation
  const updateMutation = useMutation<void, Error, { id: string; data: Partial<QueryObject> }>({
    mutationFn: async ({ id, data }) => {
      const result = await database.document.update.call({
        databaseId: 'default',
        tableName: selectedTable,
        id,
        data
      })
      if (!result.success) {
        throw new Error(result.error || 'Failed to update record')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['database', 'table-data', selectedTable]
      })
      toast.success('Record updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update record: ${error.message}`)
    }
  })

  // Delete record mutation
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await database.document.delete.call({
        databaseId: 'default',
        tableName: selectedTable,
        id
      })
      if (!result.success || !result.deleted) {
        throw new Error(result.error || 'Failed to delete record')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['database', 'table-data', selectedTable]
      })
      toast.success('Record deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete record: ${error.message}`)
    }
  })

  // Refresh data
  const handleRefresh = (): void => {
    queryClient.invalidateQueries({
      queryKey: ['database', 'table-data', selectedTable]
    })
    toast.info('Data refreshed')
  }

  const filteredTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedTableData = tables.find((t) => t.name === selectedTable)

  if (!init.data?.success) return null
  return (
    <div className="flex h-screen">
      {/* Sidebar - Table List */}
      <div className="w-64 md:w-72 border-r bg-secondary">
        <div className="p-4 border-b border-input">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Database className="size-5" />
              <span className="text-ellipsis">Database Studio</span>
            </h2>
          </div>

          <div className="flex flex-row items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Creates />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)]">
          {tablesError && (
            <Alert variant="destructive" className="m-2 w-[calc(100%-1rem)]">
              <AlertCircle />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>Failed to load tables.</AlertDescription>
            </Alert>
          )}
          <TableList
            tables={filteredTables}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            loading={loadingTables}
          />
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{selectedTableData?.label ?? 'Select a table'}</h1>
              <p className="text-xs line-clamp-1 overflow-ellipsis">
                {selectedTableData?.description ?? 'Placeholder'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button size="sm" onClick={() => setActiveTab('data')} disabled={!selectedTable}>
                <Plus className="h-4 w-4" />
                Add Record
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {!selectedTable ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Welcome to Database Studio</CardTitle>
                <CardDescription>
                  Select a table from the sidebar to start managing your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Database className="h-16 w-16 mx-auto mb-4" />
                <p className="text-center text-sm">
                  Choose a table to view and edit data, manage columns, or apply filters
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 p-6">
            {dataError && (
              <div className="mb-4 p-4 borderrounded-lg text-destructive">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Failed to load table data: {dataError.message}
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="data">
                  <FileText className="h-4 w-4 mr-2" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="columns">
                  <Table className="h-4 w-4 mr-2" />
                  Columns
                </TabsTrigger>
                <TabsTrigger value="filters">
                  <Search className="h-4 w-4 mr-2" />
                  Filters
                </TabsTrigger>
              </TabsList>

              <TabsContent value="data">
                <TableData
                  data={tableData?.documents || []}
                  loading={loadingData}
                  table={selectedTableData}
                  pagination={{
                    ...pagination,
                    total: tableData?.total || 0
                  }}
                  onPaginationChange={setPagination}
                  onCreateRecord={createMutation.mutateAsync}
                  onUpdateRecord={async (id, data) => {
                    await updateMutation.mutateAsync({ id, data })
                  }}
                  onDeleteRecord={deleteMutation.mutateAsync}
                />
              </TabsContent>

              <TabsContent value="columns">
                <TableColumns table={selectedTableData} />
              </TabsContent>

              <TabsContent value="filters">
                <TableFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  table={selectedTableData}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
