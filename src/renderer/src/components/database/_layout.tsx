// File: src/renderer/src/components/database/_layout.tsx
import React from 'react'
import { DatabaseDialog } from './dialog'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import useDatabaseStore from './store'
import { Button, buttonVariants } from '../ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Columns,
  Filter,
  GitFork,
  Layers,
  MoreHorizontal,
  Plus,
  SidebarIcon
} from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { Toggle } from '../ui/toggle'
import { ROUTES } from '@renderer/routes'
import DatabaseTableFilters from './table.filters'
import { cn } from '@renderer/lib/utils'

const ToggleFilter: React.FC = () => {
  const { query, openFilters } = useDatabaseStore()
  return (
    <Toggle
      variant="outline"
      aria-label="Toggle filters"
      pressed={query.show}
      onPressedChange={openFilters}
    >
      <Filter />
      Filters
    </Toggle>
  )
}

const DatabaseLayout: React.FC = () => {
  const { ready, sidebar, toggleSidebar, databaseId, tableName, openModal } = useDatabaseStore()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const structure = React.useMemo(
    () => ROUTES.DATABASE_STRUCTURE.$buildPath({ params: { databaseId, tableName } }),
    [databaseId, tableName]
  )

  return (
    <>
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="border-b p-3 sticky select-none">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant={'outline'} size={'icon'} onClick={toggleSidebar}>
                <SidebarIcon className={sidebar ? undefined : 'rotate-180'} />
                <span className="sr-only">Collapse Menu</span>
              </Button>
              <ToggleGroup
                variant="outline"
                value={structure === pathname ? 'structure' : 'data'}
                type="single"
                onValueChange={(value) => {
                  if (value === 'structure') return navigate(structure)
                  return navigate(
                    ROUTES.DATABASE_TABLE.$buildPath({ params: { databaseId, tableName } })
                  )
                }}
              >
                <ToggleGroupItem value="data" aria-label="Toggle data">
                  <Layers className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="structure" aria-label="Toggle strucure">
                  <GitFork className="size-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <div
                className={cn(
                  'items-center gap-2',
                  structure === pathname || !ready ? 'hidden' : 'flex'
                )}
              >
                <ToggleFilter />
                <Button variant={'outline'}>
                  <Columns />
                  <span>Columns</span>
                </Button>
                <Button
                  className="border-0"
                  onClick={() =>
                    openModal('record', { method: 'create', id: undefined, value: undefined })
                  }
                >
                  <Plus />
                  <span>Add Record</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md">
                <Button variant={'ghost'} size={'icon'}>
                  <ChevronLeft />
                  <span className="sr-only">Preview</span>
                </Button>
                <input
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                    className: 'rounded-none text-center border-r border-l'
                  })}
                />
                <input
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'icon',
                    className: 'rounded-none text-center border-r '
                  })}
                />
                <Button variant={'ghost'} size={'icon'}>
                  <ChevronRight />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
              <Button variant={'outline'} size={'icon'}>
                <MoreHorizontal />
                <span className="sr-only">More</span>
              </Button>
            </div>
          </div>
        </div>
        {/* Filter */}
        <DatabaseTableFilters />

        {/* Content */}
        {ready && <Outlet />}
      </div>
      <DatabaseDialog />
    </>
  )
}

export default DatabaseLayout
