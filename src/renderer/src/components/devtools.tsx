import * as React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const DevTools: React.FC = () => {
  if (process.env.NODE_ENV === 'development') {
    return <ReactQueryDevtools initialIsOpen={false} />
  }
  return null
}
