// File: src/renderer/src/routers.tsx
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from './routes'
import AppLayout from './pages/_layout'

export const routers = createBrowserRouter([
  {
    path: ROUTES.ROOT.$path(),
    element: <AppLayout />,
    errorElement: <div>Error Boundary</div>,
    children: [
      // // Dashboard
      // {
      //   path: ROUTES.DASHBOARD_OVERVIEW.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/dashboard/overview')).default
      //   })
      // },
      // {
      //   path: ROUTES.DASHBOARD_ANALYTICS.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/dashboard/analytics')).default
      //   })
      // },

      // // Data Management
      // {
      //   path: ROUTES.DATA_COLLECTIONS.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collections')).default
      //   })
      // },
      // {
      //   path: ROUTES.DATA_COLLECTION_LIST.$path({
      //     collectionName: ':collectionName'
      //   }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collection-list')).default
      //   })
      // },
      // {
      //   path: ROUTES.DATA_COLLECTION_CREATE.$path({
      //     collectionName: ':collectionName'
      //   }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collection-create')).default
      //   })
      // },
      // {
      //   path: ROUTES.DATA_COLLECTION_EDIT.$path({
      //     collectionName: ':collectionName',
      //     id: ':id'
      //   }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collection-edit')).default
      //   })
      // },
      // {
      //   path: ROUTES.DATA_COLLECTION_VIEW.$path({
      //     collectionName: ':collectionName',
      //     id: ':id'
      //   }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collection-view')).default
      //   })
      // },

      // // Form Builder
      // {
      //   path: ROUTES.FORMS_LIST.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/forms/list')).default
      //   })
      // },
      // {
      //   path: ROUTES.FORMS_CREATE.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/forms/create')).default
      //   })
      // },
      // {
      //   path: ROUTES.FORMS_EDIT.$path({ id: ':id' }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/forms/edit')).default
      //   })
      // },
      // {
      //   path: ROUTES.FORMS_PREVIEW.$path({ id: ':id' }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/forms/preview')).default
      //   })
      // },

      // // Report Builder
      // {
      //   path: ROUTES.REPORTS_LIST.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/reports/list')).default
      //   })
      // },
      // {
      //   path: ROUTES.REPORTS_CREATE.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/reports/create')).default
      //   })
      // },
      // {
      //   path: ROUTES.REPORTS_EDIT.$path({ id: ':id' }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/reports/edit')).default
      //   })
      // },
      // {
      //   path: ROUTES.REPORTS_GENERATE.$path({ id: ':id' }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/reports/generate')).default
      //   })
      // },

      // // Settings
      // {
      //   path: ROUTES.SETTINGS_GENERAL.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/settings/general')).default
      //   })
      // },
      // {
      //   path: ROUTES.SETTINGS_DATABASE.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/settings/database')).default
      //   })
      // },
      // {
      //   path: ROUTES.SETTINGS_THEMES.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/settings/themes')).default
      //   })
      // },

      // Root redirect to dashboard
      {
        index: true,
        lazy: async () => ({
          Component: (await import('./pages/dashboard/overview')).default
        })
      },

      // 404 Not Found
      {
        path: ROUTES.NOT_FOUND.$path(),
        lazy: async () => ({
          Component: (await import('./pages/not-found')).default
        })
      }
    ]
  }
])
