// File: src/renderer/src/routes.ts
import { route, string } from 'react-router-typesafe-routes'

// Define base routes dengan path yang benar
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

    // Database Studio (Tambahkan route baru)
    databaseStudio: route({
      path: 'database-studio',
      children: {
        id: route({
          path: ':databaseId',
          params: { databaseId: string() },
          children: {
            table: route({
              path: 'table/:tableName',
              params: { tableName: string() },
              children: {
                structure: route({ path: 'structure' })
              }
            })
          }
        })
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

  DATABASE: root.databaseStudio,
  DATABASE_ID: root.databaseStudio.id,
  DATABASE_TABLE: root.databaseStudio.id.table,
  DATABASE_STRUCTURE: root.databaseStudio.id.table.structure,

  NOT_FOUND: root.notFound
}

// Export types
export type AppRoutes = typeof ROUTES
