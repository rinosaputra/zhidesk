import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Database } from 'lucide-react'

const DatanaseDefault: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center select-none">
      <Card className="w-96 max-w-full">
        <CardHeader>
          <CardTitle>Welcome to Database Studio</CardTitle>
          <CardDescription>
            Select a table from the sidebar to start managing your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Database className="h-16 w-16 mx-auto mb-4" />
          <p className="text-center text-sm">
            Choose a table to view and edit data, manage columns, or apply filters
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default DatanaseDefault
