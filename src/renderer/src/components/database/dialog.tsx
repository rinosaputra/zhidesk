// File: src/renderer/src/components/database/CreateTableDialog.tsx
import React from 'react'
import { Dialog } from '@renderer/components/ui/dialog'
import useDatabaseStore from './store'
import DatabaseFormTable from './table.form'

export const DatabaseDialog: React.FC = () => {
  const {
    modal: { open, type },
    setModal
  } = useDatabaseStore()

  return (
    <Dialog open={open} onOpenChange={setModal}>
      {type === 'table' && <DatabaseFormTable />}
    </Dialog>
  )
}
