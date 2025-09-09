// File: src/renderer/src/components/root/index.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { SiteHeader } from './site-header'

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader className="bg-sidebar" />
        <main className="flex-1 overflow-auto w-full max-h-(--height-main) bg-sidebar">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
