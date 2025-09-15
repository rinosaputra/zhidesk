import React from 'react'
import { DatabaseDialog } from './dialog'
import { Outlet } from 'react-router-dom'

const DatabaseRoot: React.FC = () => {
  return (
    <>
      <Outlet />
      <DatabaseDialog />
    </>
  )
}

export default DatabaseRoot
