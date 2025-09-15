// File: src/renderer/src/components/database/table.ai.tsx
import React from 'react'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools
} from '@renderer/components/ai-elements/prompt-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import { Loader2, Database, Sparkles, Bug } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpc } from '@renderer/lib/orpc-query'
import { toast } from 'sonner'
import { Table, TableSchema } from './types'

const DatabaseTableAI: React.FC<{ onReset(data: Table): void }> = ({ onReset }) => {
  const [open, setOpen] = React.useState(false)
  const { isLoading, data } = useQuery(orpc.ai.validateApiKey.queryOptions({ enabled: open }))
  const {
    mutateAsync,
    isPending,
    data: result
  } = useMutation(orpc.ai.database.generateTableSchema.mutationOptions({}))
  const isReady = !(!isLoading && data?.valid && !isPending)
  console.log({ isLoading, data, isPending, result })

  const handleSubmit = (message: PromptInputMessage): void => {
    console.log(message)
    if (message.text) {
      toast.promise(
        () =>
          mutateAsync({
            description: message.text!
            // files: message.files
          }),
        {
          loading: `Generating...`,
          success: (data) => {
            if (data.error) return `Failed to generate table: ${data.error}`
            return `Table generated successfully`
          },
          error: (error: Error) => `Failed to generate table: ${error.message}`
        }
      )
      return
    }
    toast.error('Please enter a description')
    return
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size={'icon'} onClick={() => setOpen(true)}>
          <Sparkles className="text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            AI Table Generation
          </DialogTitle>
          <DialogDescription>
            Describe the table you want to create. You can provide details about columns, data
            types, and relationships.
          </DialogDescription>
        </DialogHeader>

        {!result?.table ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="ai-prompt">Describe your table structure</Label>
              <span className="text-muted-foreground text-xs font-normal ml-1">
                {'('}e.g., {'"'}Create a users table with id, name, email, and created_at columns
                {'"'}
                {')'}
              </span>

              <PromptInput onSubmit={handleSubmit} className="mt-1 relative">
                <PromptInputBody>
                  <PromptInputAttachments>
                    {(attachment) => <PromptInputAttachment data={attachment} />}
                  </PromptInputAttachments>
                  <PromptInputTextarea
                    placeholder="Describe the table you want to create..."
                    disabled={isReady}
                  />
                </PromptInputBody>
                <PromptInputToolbar>
                  <PromptInputTools>
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger disabled={isReady} />
                      <PromptInputActionMenuContent>
                        <PromptInputActionAddAttachments />
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                  </PromptInputTools>
                  <PromptInputSubmit disabled={isReady} status={isReady ? 'streaming' : 'ready'} />
                </PromptInputToolbar>
              </PromptInput>
            </div>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              const test = TableSchema.safeParse(result.table)
              if (test.data) {
                onReset(result.table)
                setOpen(false)
                return
              }
              toast.error(result.error || 'Invalid table schema')
              return
            }}
          >
            Buat {result.table.name}
          </Button>
        )}

        {isPending && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Generating your table structure...</span>
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Validating AI service...</span>
          </div>
        )}
        {data?.error && (
          <div className="flex items-center justify-center py-4">
            <Bug className="h-5 w-5 animate-spin mr-2" />
            <span>{data.error}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DatabaseTableAI
