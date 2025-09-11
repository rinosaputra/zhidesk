import * as React from 'react'
import {
  Plus,
  Search,
  Table,
  Check,
  ChevronsUpDown,
  RefreshCcw,
  MoreHorizontal,
  Trash,
  Eraser,
  GitFork
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@renderer/components/ui/sidebar'
import { Label } from '@renderer/components/ui/label'
import { cn } from '@renderer/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@renderer/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '@renderer/routes'
import { Button } from '../ui/button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { database } from '@renderer/lib/orpc-query'
import useDatabaseStore from './store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { useIsMobile } from '@renderer/hooks/use-mobile'
import { useDebounce } from 'use-debounce'

const SelectTable: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const { ready: enabled } = useDatabaseStore()
  const { data, isLoading } = useQuery(database.getAll.queryOptions({ enabled }))
  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent className="flex items-center gap-1">
        <Button size={'icon'} variant={'outline'} className="size-8">
          <Plus />
        </Button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border h-8"
              disabled={isLoading}
            >
              {data?.databases.find((database) => database === value) ?? 'Select database...'}
              <ChevronsUpDown className="ml-auto opacity-50" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 p-0">
            <Command>
              <CommandInput placeholder="Search database..." className="h-9" />
              <CommandList>
                <CommandEmpty>No database found.</CommandEmpty>
                <CommandGroup>
                  {data?.databases.map((database) => (
                    <CommandItem
                      key={database}
                      value={database}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? '' : currentValue)
                        setOpen(false)
                      }}
                    >
                      {database}
                      <Check
                        className={cn('ml-auto', value === database ? 'opacity-100' : 'opacity-0')}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const RefreshTable: React.FC = () => {
  const queryClient = useQueryClient()
  const { databaseId } = useDatabaseStore()

  return (
    <Button
      variant={'outline'}
      size={'icon'}
      className="size-8"
      onClick={() =>
        queryClient.invalidateQueries({
          queryKey: database.table.getAll.queryKey({ input: { databaseId } })
        })
      }
    >
      <RefreshCcw />
    </Button>
  )
}

const SearchField: React.FC = () => {
  const { searchTable, setSearchTable } = useDatabaseStore()
  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent className="relative flex items-center gap-1">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Search Table"
          className="pl-8 bg-transparent"
          value={searchTable}
          onChange={(e) => {
            setSearchTable(e.target.value)
          }}
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        <RefreshTable />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

const TableLists: React.FC = () => {
  const isMobile = useIsMobile()
  const { ready: enabled, databaseId, searchTable } = useDatabaseStore()
  const [searchTerm] = useDebounce(searchTable, 500)
  const { data, isLoading } = useQuery(
    database.table.getAll.queryOptions({ enabled, input: { databaseId } })
  )
  const tables = React.useMemo(() => {
    if (!searchTerm) return data?.tables ?? []
    return (
      data?.tables.filter(
        (table) =>
          table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          table.label.toLowerCase().includes(searchTerm.toLowerCase())
      ) ?? []
    )
  }, [data, searchTerm])
  return (
    <SidebarGroup>
      <SidebarMenu>
        {tables.map((table) => (
          <DropdownMenu key={table.name}>
            <SidebarMenuItem>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  disabled={isLoading}
                >
                  {table.label} <MoreHorizontal className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
                className="min-w-56 rounded-lg"
              >
                <DropdownMenuItem>
                  <Table />
                  <span>Browser Data</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GitFork />
                  <span>Structure</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eraser />
                  <span>Clear Data</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Trash />
                  <span>Drop</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </SidebarMenuItem>
          </DropdownMenu>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export const DatabaseSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
  const location = useLocation()
  if (!location.pathname.startsWith(ROUTES.DATABASE.$path())) return null
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-(--header-height) h-[calc(100svh-var(--header-height))]! border-r bg-secondary/50"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to={ROUTES.DATABASE.$path()}>
                <span className="text-base font-semibold">Database Studio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SelectTable />
        <SearchField />
      </SidebarHeader>
      <SidebarContent>
        <TableLists />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Table />
              <span>New Table</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
