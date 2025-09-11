// File: src/renderer/src/components/root/app-sidebar.tsx
import * as React from 'react'
import {
  LayoutDashboard,
  Database,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  FileBox,
  FileCode,
  Brain,
  MessageSquare,
  LayoutGrid,
  SidebarIcon
} from 'lucide-react'

import { NavDocuments } from './nav-documents'
import { NavMain } from './nav-main'
import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@renderer/components/ui/sidebar'
import { ROUTES } from '@renderer/routes'

const data = {
  user: {
    name: 'Admin User',
    email: 'admin@zhidesk.com',
    avatar: '/avatars/admin.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: ROUTES.DASHBOARD_OVERVIEW.$path(),
      icon: LayoutDashboard
    },
    {
      title: 'Data Management',
      url: '/data',
      icon: Database
    },
    {
      title: 'Forms',
      url: '/forms',
      icon: FileText
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: BarChart3
    },
    {
      title: 'AI Assistant',
      url: '/ai',
      icon: Brain
    }
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings
    },
    {
      title: 'Help & Support',
      url: '/help',
      icon: HelpCircle,
      disabled: true
    },
    {
      title: 'Search',
      url: '/search',
      icon: Search,
      disabled: true
    }
  ],
  documents: [
    {
      name: 'Database Studio',
      url: ROUTES.DATABASE.$path(),
      icon: LayoutGrid
    },
    {
      name: 'Report Templates',
      url: '/reports/templates',
      icon: FileBox
    },
    {
      name: 'Form Builder',
      url: '/forms/builder',
      icon: FileCode
    },
    {
      name: 'AI Prompts',
      url: '/ai/prompts',
      icon: MessageSquare
    }
  ]
}

const CollapsibleMenu: React.FC = () => {
  const { toggleSidebar } = useSidebar()
  return (
    <SidebarMenuButton onClick={toggleSidebar} tooltip={'Collapse Menu'}>
      <SidebarIcon />
      <span>Collapse Menu</span>
    </SidebarMenuButton>
  )
}

export const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = (props) => {
  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader className="border-b">
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      {/* <SidebarSeparator className="mx-0" /> */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <CollapsibleMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
