// File: src/renderer/src/components/root/site-header.tsx
import { Button } from '@renderer/components/ui/button'
import { Separator } from '@renderer/components/ui/separator'
import { SidebarTrigger } from '@renderer/components/ui/sidebar'
import { useLocation } from 'react-router-dom'
import { ROUTES } from '@renderer/routes'
import React from 'react'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'

const getHeaderTitle = (pathname: string): string => {
  if (pathname.startsWith(ROUTES.DATA_COLLECTIONS.$path())) return 'Data Management'
  if (pathname.startsWith(ROUTES.FORMS_LIST.$path())) return 'Form Builder'
  if (pathname.startsWith(ROUTES.REPORTS_LIST.$path())) return 'Report Builder'
  if (pathname.startsWith(ROUTES.SETTINGS_GENERAL.$path())) return 'Settings'
  return 'Dashboard'
}

const Title: React.FC = () => {
  const location = useLocation()
  const title = getHeaderTitle(location.pathname)
  return (
    <div className="flex gap-2 items-center">
      <Tooltip>
        <TooltipTrigger>
          <Info className="size-4" />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-mono">{location.pathname}</p>
        </TooltipContent>
      </Tooltip>
      <h1 className="text-base font-medium font-mono">{title}</h1>
    </div>
  )
}

export const SiteHeader: React.FC = () => {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Title />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/your-username/zhidesk"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
