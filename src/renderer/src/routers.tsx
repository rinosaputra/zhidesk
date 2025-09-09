// File: src/renderer/src/routers.tsx
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from './routes'
import Layout from './components/root'
import { ErrorBoundary, RouteLoading } from './components/routers'

export const routers = createBrowserRouter([
  {
    path: ROUTES.ROOT.$path(),
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Dashboard Routes
      {
        index: true,
        lazy: async () => ({
          Component: (await import('./pages/dashboard/overview')).default,
          loading: RouteLoading
        })
      },
      {
        path: ROUTES.DASHBOARD_OVERVIEW.$path(),
        lazy: async () => ({
          Component: (await import('./pages/dashboard/overview')).default,
          loading: RouteLoading
        })
      },
      // {
      //   path: ROUTES.DASHBOARD_ANALYTICS.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/dashboard/analytics')).default,
      //     loading: RouteLoading
      //   })
      // },

      // // Data Management Routes
      // {
      //   path: ROUTES.DATA_COLLECTIONS.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collections')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.DATA_COLLECTION_OVERVIEW.$path({
      //     collectionName: ':collectionName'
      //   }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collection-list')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.DATA_COLLECTION_CREATE.$path({
      //     collectionName: ':collectionName'
      //   }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collection-create')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.DATA_COLLECTION_EDIT.$path({
      //     collectionName: ':collectionName',
      //     id: ':id'
      //   }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collection-edit')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.DATA_COLLECTION_VIEW.$path({
      //     collectionName: ':collectionName',
      //     id: ':id'
      //   }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/data/collection-view')).default,
      //     loading: RouteLoading
      //   })
      // },

      // // Form Builder Routes
      // {
      //   path: ROUTES.FORMS_LIST.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/forms/list')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.FORMS_CREATE.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/forms/create')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.FORMS_EDIT.$path({ id: ':id' }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/forms/edit')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.FORMS_PREVIEW.$path({ id: ':id' }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/forms/preview')).default,
      //     loading: RouteLoading
      //   })
      // },

      // // Report Builder Routes
      // {
      //   path: ROUTES.REPORTS_LIST.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/reports/list')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.REPORTS_CREATE.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/reports/create')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.REPORTS_EDIT.$path({ id: ':id' }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/reports/edit')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.REPORTS_GENERATE.$path({ id: ':id' }),
      //   lazy: async () => ({
      //     Component: (await import('./pages/reports/generate')).default,
      //     loading: RouteLoading
      //   })
      // },

      // // Settings Routes
      // {
      //   path: ROUTES.SETTINGS.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/settings/general')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.SETTINGS_APPEARANCE.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/settings/appearance')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.SETTINGS_DATABASE.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/settings/database')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.SETTINGS_NOTIFICATIONS.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/settings/notifications')).default,
      //     loading: RouteLoading
      //   })
      // },
      // {
      //   path: ROUTES.SETTINGS_ACCOUNT.$path(),
      //   lazy: async () => ({
      //     Component: (await import('./pages/settings/account')).default,
      //     loading: RouteLoading
      //   })
      // },

      // Database Studio Route
      {
        path: ROUTES.DATABASE_STUDIO.$path(),
        lazy: async () => ({
          Component: (await import('./components/database/DatabaseManager')).DatabaseManager,
          loading: RouteLoading
        })
      },

      // 404 Not Found Route (harus di akhir)
      {
        path: ROUTES.NOT_FOUND.$path(),
        lazy: async () => ({
          Component: (await import('./pages/not-found')).default,
          loading: RouteLoading
        })
      }
    ]
  }
])
