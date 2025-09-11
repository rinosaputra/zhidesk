import { ROUTES } from '@renderer/routes'
import { RouteObject } from 'react-router-dom'

export const DatabaseRouter: RouteObject = {
  path: ROUTES.DATABASE.$path(),
  lazy: async () => ({
    // Component: (await import('./components/database/DatabaseManager')).DatabaseManager
    // loading: RouteLoading
    Component: (await import('./_layout')).default
  })
}
