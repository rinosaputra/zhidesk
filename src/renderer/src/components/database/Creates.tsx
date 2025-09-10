import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { Button } from '@renderer/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateTableDialog } from './CreateTableDialog'

interface CreateState {
  open: boolean
  type: 'table'
}

const Creates: React.FC = () => {
  const [state, setState] = React.useState<CreateState>({
    open: false,
    type: 'table'
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={'icon'}>
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setState({ open: true, type: 'table' })}>
              Table
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Aturan</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateTableDialog
        open={state.open && state.type === 'table'}
        onOpenChange={(open) => setState({ open, type: 'table' })}
      />
    </>
  )
}

export default Creates
