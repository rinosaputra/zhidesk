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
  Zap
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
  SidebarMenuItem
} from '@renderer/components/ui/sidebar'
import { useAuthStore } from '@renderer/stores/auth.store'
import { Link } from 'react-router-dom'

const data = {
  user: {
    name: 'Admin User',
    email: 'admin@zhidesk.com',
    avatar: '/avatars/admin.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
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
      name: 'Data Collections',
      url: '/data/collections',
      icon: Database
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

export const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = (props) => {
  const { user } = useAuthStore()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <Zap className="!size-5 text-primary" />
                <span className="text-base font-semibold">Zhidesk</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
