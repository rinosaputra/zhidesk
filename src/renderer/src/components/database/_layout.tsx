// File: src/renderer/src/components/database/_layout.tsx
import React from 'react'
import { DatabaseDialog } from './dialog'
import { Outlet } from 'react-router-dom'
import useDatabaseStore from './store'

const DatabaseLayout: React.FC = () => {
  const { ready } = useDatabaseStore()
  return (
    <>
      {ready && <Outlet />}
      <DatabaseDialog />
    </>
  )
}

export default DatabaseLayout
