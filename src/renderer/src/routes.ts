// File: src/renderer/src/routes.ts
import { route, string } from 'react-router-typesafe-routes'

const root = route({
  children: {
    // Dashboard
    dashboard: route({
      path: 'dashboard',
      children: {
        overview: route({ path: '' }),
        analytics: route({ path: 'analytics' })
      }
    }),

    // Data Management
    data: route({
      path: 'data',
      children: {
        collections: route({ path: '' }),
        collection: route({
          path: ':collectionName',
          params: { collectionName: string() },
          children: {
            list: route({ path: '' }),
            create: route({ path: 'create' }),
            edit: route({
              path: ':id/edit',
              params: { id: string() }
            }),
            view: route({
              path: ':id',
              params: { id: string() }
            })
          }
        })
      }
    }),

    // Form Builder
    forms: route({
      path: 'forms',
      children: {
        list: route({ path: '' }),
        create: route({ path: 'create' }),
        edit: route({
          path: ':id/edit',
          params: { id: string() }
        }),
        preview: route({
          path: ':id/preview',
          params: { id: string() }
        })
      }
    }),

    // Report Builder
    reports: route({
      path: 'reports',
      children: {
        list: route({ path: '' }),
        create: route({ path: 'create' }),
        edit: route({
          path: ':id/edit',
          params: { id: string() }
        }),
        generate: route({
          path: ':id/generate',
          params: { id: string() }
        })
      }
    }),

    // Settings
    settings: route({
      path: 'settings',
      children: {
        general: route({ path: '' }),
        appearance: route({ path: 'appearance' }),
        database: route({ path: 'database' }),
        notifications: route({ path: 'notifications' }),
        account: route({ path: 'account' })
      }
    }),

    // 404
    notFound: route({ path: '*' })
  }
})

// Export route objects
export const ROUTES = {
  ROOT: root,
  DASHBOARD: root.dashboard,
  DASHBOARD_OVERVIEW: root.dashboard.overview,
  DASHBOARD_ANALYTICS: root.dashboard.analytics,
  DATA: root.data,
  DATA_COLLECTIONS: root.data.collections,
  DATA_COLLECTION: root.data.collection,
  DATA_COLLECTION_LIST: root.data.collection.list,
  DATA_COLLECTION_CREATE: root.data.collection.create,
  DATA_COLLECTION_EDIT: root.data.collection.edit,
  DATA_COLLECTION_VIEW: root.data.collection.view,
  FORMS: root.forms,
  FORMS_LIST: root.forms.list,
  FORMS_CREATE: root.forms.create,
  FORMS_EDIT: root.forms.edit,
  FORMS_PREVIEW: root.forms.preview,
  REPORTS: root.reports,
  REPORTS_LIST: root.reports.list,
  REPORTS_CREATE: root.reports.create,
  REPORTS_EDIT: root.reports.edit,
  REPORTS_GENERATE: root.reports.generate,
  SETTINGS: root.settings,
  SETTINGS_GENERAL: root.settings.general,
  SETTINGS_APPEARANCE: root.settings.appearance,
  SETTINGS_DATABASE: root.settings.database,
  SETTINGS_NOTIFICATIONS: root.settings.notifications,
  SETTINGS_ACCOUNT: root.settings.account,
  NOT_FOUND: root.notFound
}

// Export types
export type ROUTES = typeof ROUTES
