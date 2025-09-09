import './styles/globals.css'
import './styles/inter/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { RouterProvider } from 'react-router-dom'
import { DevTools } from './components/devtools'
import { routers } from './routers'
import ThemeManajer from './components/theme/manajer'
import { Toaster } from './components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routers} />
      <DevTools />
    </QueryClientProvider>
    <ThemeManajer />
    <Toaster />
  </StrictMode>
)
