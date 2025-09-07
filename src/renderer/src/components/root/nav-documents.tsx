// File: src/renderer/src/components/root/nav-documents.tsx
import { MoreHorizontal, Folder, Share, Trash2, LucideIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@renderer/components/ui/sidebar'
import { Link } from 'react-router-dom'

export const NavDocuments: React.FC<{
  items: {
    name: string
    url: string
    icon: LucideIcon
    disabled?: boolean
  }[]
}> = ({ items }) => {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Resources</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            {!item.disabled ? (
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <item.icon className="size-4" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton disabled>
                <item.icon className="size-4" />
                <span>{item.name}</span>
              </SidebarMenuButton>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover className="data-[state=open]:bg-accent rounded-sm">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem>
                  <Folder className="size-4 mr-2" />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="size-4 mr-2" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 className="size-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
