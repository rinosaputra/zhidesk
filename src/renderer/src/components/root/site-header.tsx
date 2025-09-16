// File: src/renderer/src/components/root/site-header.tsx
import { Separator } from '@renderer/components/ui/separator'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '@renderer/routes'
import React from 'react'
import { Info, Zap } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { cn } from '@renderer/lib/utils'
import { ThemeSwitcher } from '../theme/switch'
import { Status, StatusIndicator, StatusLabel } from '../ui/status'
import useDatabaseStore from '../database/store'

const getHeaderTitle = (pathname: string): string => {
  if (pathname.startsWith(ROUTES.DATABASE.$path())) return 'Database Studio'
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

const StatusInfo: React.FC = () => {
  const { ready, error } = useDatabaseStore()
  return (
    <Status status={error ? 'offline' : ready ? 'online' : 'maintenance'}>
      <StatusIndicator />
      <StatusLabel />
    </Status>
  )
}

export const SiteHeader: React.FC<React.ComponentProps<'header'>> = ({ className, ...props }) => {
  return (
    <header
      {...props}
      className={cn(
        'sticky top-0 z-50 flex w-full items-center border-b bg-background dark:bg-sidebar select-none',
        className
      )}
    >
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Link to="/">
          <Zap className="size-6 text-primary" />
        </Link>
        <Separator orientation="vertical" className="mx-2 h-4" />
        <Title />
        <div className="ml-auto flex items-center gap-2">
          <StatusInfo />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
