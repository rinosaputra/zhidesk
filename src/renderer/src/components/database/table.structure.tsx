import React from 'react'
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Badge } from '@renderer/components/ui/badge'
import useDatabaseStore from './store'
import { Pill, PillStatus } from '../ui/pill'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { Button } from '../ui/button'

import type { BundledLanguage, CodeBlockData } from '../ui/code-block'
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue
} from '../ui/code-block'
import { getSchemaDescribe, printSchemaDescribe } from '@service/ai/describe-schema'
import { TableSchema } from './types'
import { ZodAny } from 'zod'
import { DatabaseClient } from './client'

/**
 * Contoh penggunaan:
 *
 * const tableDescribe = getSchemaDescribe(TableSchema)
 * console.log(printSchemaDescribe(tableDescribe))
 *
 * // Atau untuk field tertentu:
 * const fieldDescribe = getSchemaDescribe(StringFieldSchema)
 * console.log(printSchemaDescribe(fieldDescribe))
 */

// Test function untuk demonstrate functionality
// export function testSchemaDescribe() {
//   console.log('=== Table Schema Describe ===')
//   const tableDescribe = getSchemaDescribe(TableSchema)
//   console.log(printSchemaDescribe(tableDescribe))

//   console.log('\n=== String Field Schema Describe ===')
//   const stringFieldDescribe = getSchemaDescribe(StringFieldSchema)
//   console.log(printSchemaDescribe(stringFieldDescribe))

//   console.log('\n=== Number Field Schema Describe ===')
//   const numberFieldDescribe = getSchemaDescribe(NumberFieldSchema)
//   console.log(printSchemaDescribe(numberFieldDescribe))
// }

// Contoh penggunaan dalam application
// export function demonstrateSchemaDescribe() {
//   console.log('=== Database Schema Describes ===\n')

//   // Get table schema describe
//   console.log('Table Schema:')
//   console.log(SchemaDescribeUtils.getTableDescribe())

//   // Get specific field describe
//   console.log('\nString Field Schema:')
//   console.log(SchemaDescribeUtils.getFieldDescribe('string'))

//   // Get all field describes
//   console.log('\n=== All Field Types ===')
//   const allDescribes = SchemaDescribeUtils.getAllFieldDescribes()
//   for (const [fieldType, describe] of Object.entries(allDescribes)) {
//     console.log(`\n${fieldType.toUpperCase()} Field:`)
//     console.log(describe)
//   }
// }

// // Untuk penggunaan dengan ORPC, bisa ditambahkan endpoint
// export const describeRouter = {
//   getTableSchemaDescribe: () => SchemaDescribeUtils.getTableDescribe(),
//   getFieldSchemaDescribe: (fieldType: string) => SchemaDescribeUtils.getFieldDescribe(fieldType),
//   getAllSchemaDescribes: () => SchemaDescribeUtils.getAllFieldDescribes()
// }
/**
 *
perbaiki fungsi diatasi karena terdapat nilai "unknown,variant,pipe" saat memanggil:
call:
  printSchemaDescribe(getSchemaDescribe(TableSchema as unknown as ZodAny))
result:
  root: object
    name: string
    label: string
    description: string
    fields: array
      items:
        fields[]: union
          options: array
            items:
              option: variant
    indexes: array
      items:
        indexes[]: string
    timestamps: pipe
    softDelete: pipe
    validation: object
      strict: pipe
      additionalProperties: pipe
 */

const DatabaseTableStructure: React.FC = () => {
  const { tableSchema: table, tableName } = useDatabaseStore()
  if (!table) {
    return <div className="text-center p-8 select-none">Select a table to view columns</div>
  }

  const code: CodeBlockData[] = [
    // {
    //   language: 'json',
    //   filename: 'table.json',
    //   code: printSchemaDescribe(getSchemaDescribe(TableSchema as unknown as ZodAny))
    // },
    {
      language: 'json',
      filename: 'fields.json',
      code: printSchemaDescribe(
        getSchemaDescribe(DatabaseClient.generateTableSchema(tableName) as unknown as ZodAny)
      )
    }
  ]

  return (
    <div className="container mx-auto py-6 select-none">
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">View code</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] ">
            <DialogHeader>
              <DialogTitle>View code</DialogTitle>
              <DialogDescription>
                You can use the following code to start integrating your current prompt and settings
                into your application.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="rounded-md overflow-x-auto">
                <CodeBlock data={code} defaultValue={code[0].language}>
                  <CodeBlockHeader>
                    <CodeBlockFiles>
                      {(item) => (
                        <CodeBlockFilename key={item.language} value={item.language}>
                          {item.filename}
                        </CodeBlockFilename>
                      )}
                    </CodeBlockFiles>
                    <CodeBlockSelect>
                      <CodeBlockSelectTrigger>
                        <CodeBlockSelectValue />
                      </CodeBlockSelectTrigger>
                      <CodeBlockSelectContent>
                        {(item) => (
                          <CodeBlockSelectItem key={item.language} value={item.language}>
                            {item.language}
                          </CodeBlockSelectItem>
                        )}
                      </CodeBlockSelectContent>
                    </CodeBlockSelect>
                    <CodeBlockCopyButton
                      onCopy={() => console.log('Copied code to clipboard')}
                      onError={() => console.error('Failed to copy code to clipboard')}
                    />
                  </CodeBlockHeader>
                  <CodeBlockBody>
                    {(item) => (
                      <CodeBlockItem
                        key={item.language}
                        value={item.language}
                        className="overflow-auto max-h-64"
                      >
                        <CodeBlockContent language={item.language as BundledLanguage}>
                          {item.code}
                        </CodeBlockContent>
                      </CodeBlockItem>
                    )}
                  </CodeBlockBody>
                </CodeBlock>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Your API Key can be found here. You should use environment variables or a secret
                  management tool to expose your key to your applications.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <TableUI>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Constraints</TableHead>
              <TableHead>Default</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.fields.map((field) => (
              <TableRow key={field.name}>
                <TableCell className="font-medium">
                  <div>
                    <div>{field.label}</div>
                    <div className="text-sm text-foreground/50 font-mono">{field.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{field.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {field.required && <Badge variant="secondary">Required</Badge>}
                    {field.unique && <Badge variant="secondary">Unique</Badge>}
                    {field.hidden && <Badge variant="secondary">Hidden</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  {field.default !== undefined ? (
                    <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">
                      {String(field.default)}
                    </code>
                  ) : (
                    <span className="text-foreground">NULL</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableUI>
        <div className="p-4 border-t">
          <div className="space-x-2">
            <Pill>
              <PillStatus>
                {table.timestamps ? (
                  <CheckCircleIcon className="text-primary" size={12} />
                ) : (
                  <XCircleIcon className="text-destructive" size={12} />
                )}
                {table.timestamps ? 'Enabled' : 'Disabled'}
              </PillStatus>
              <span className="font-mono">Timestamps</span>
            </Pill>
            <Pill>
              <PillStatus>
                {table.timestamps ? (
                  <CheckCircleIcon className="text-primary" size={12} />
                ) : (
                  <XCircleIcon className="text-destructive" size={12} />
                )}
                {table.softDelete ? 'Enabled' : 'Disabled'}
              </PillStatus>
              <span className="font-mono">Soft Delete</span>
            </Pill>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatabaseTableStructure
