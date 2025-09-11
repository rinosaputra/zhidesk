// File: src/renderer/src/components/root/index.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { SiteHeader } from './site-header'
import DatabaseManajer from '../database/manajer'
import { DatabaseSidebar } from '../database/sidebar'

const Layout: React.FC = () => {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <DatabaseSidebar />
          <SidebarInset>
            <main className="flex-1 overflow-auto w-full max-h-(--height-main) bg-sidebar">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <DatabaseManajer />
    </div>
  )
}

export default Layout
