import { ROUTES } from '@renderer/routes'
import { RouteObject } from 'react-router-dom'

export const DatabaseRouter: RouteObject = {
  path: ROUTES.DATABASE.$path(),
  lazy: async () => ({
    Component: (await import('./_root')).default
  }),
  children: [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('./_default')).default
      })
    },
    {
      path: ROUTES.DATABASE_TABLE.$path(),
      lazy: async () => ({
        Component: (await import('./_layout')).default
      }),
      children: [
        {
          index: true,
          lazy: async () => ({
            Component: (await import('./table')).default
          })
        },
        {
          path: ROUTES.DATABASE_STRUCTURE.$path(),
          lazy: async () => ({
            Component: (await import('./table.structure')).default
          })
        }
      ]
    }
  ]
}
