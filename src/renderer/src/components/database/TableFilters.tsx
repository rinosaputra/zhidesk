// File: src/renderer/src/components/database/TableFilters.tsx
import React from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { FilterCondition, Table as DatabaseTable, FilterConditionOperator } from './types'
import { Plus, X } from 'lucide-react'

interface TableFiltersProps {
  filters: FilterCondition[]
  onFiltersChange: (filters: FilterCondition[]) => void
  table?: DatabaseTable
}

export const TableFilters: React.FC<TableFiltersProps> = ({ filters, onFiltersChange, table }) => {
  const addFilter = (): void => {
    onFiltersChange([...filters, { field: '', operator: 'equals', value: '' }])
  }

  const updateFilter = (index: number, updates: Partial<FilterCondition>): void => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], ...updates }
    onFiltersChange(newFilters)
  }

  const removeFilter = (index: number): void => {
    onFiltersChange(filters.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button onClick={addFilter} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Filter
        </Button>
      </div>

      {filters.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border rounded-lg">
          No filters applied. Add filters to narrow down your results.
        </div>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, index) => (
            <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
              <Select
                value={filter.field}
                onValueChange={(value) => updateFilter(index, { field: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  {table?.fields.map((field) => (
                    <SelectItem key={field.name} value={field.name}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filter.operator}
                onValueChange={(value: FilterConditionOperator) =>
                  updateFilter(index, { operator: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FilterConditionOperator.equals}>Equals</SelectItem>
                  <SelectItem value={FilterConditionOperator.contains}>Contains</SelectItem>
                  <SelectItem value={FilterConditionOperator.greaterThan}>Greater Than</SelectItem>
                  <SelectItem value={FilterConditionOperator.lessThan}>Less Than</SelectItem>
                  <SelectItem value={FilterConditionOperator.notEquals}>Not Equals</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Value"
                value={filter.value}
                onChange={(e) => updateFilter(index, { value: e.target.value })}
                className="flex-1"
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(index)}
                className="text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={() => onFiltersChange([])} variant="outline">
            Clear All Filters
          </Button>
          <Button>Apply Filters</Button>
        </div>
      )}
    </div>
  )
}
