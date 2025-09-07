// File: src/renderer/src/components/root/index.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { SiteHeader } from './site-header'

const Layout: React.FC = () => {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-auto min-h-[calc(100vh-4rem)]">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
