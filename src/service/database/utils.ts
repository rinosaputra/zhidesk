import { TableFilterValue } from '@schema/database'

export const filterOperations = {
  equals: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return filterValue === value
  },

  notEquals: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return filterValue !== value
  },

  greaterThan: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return typeof filterValue === 'number' && typeof value === 'number' && value > filterValue
  },

  greaterThanOrEqual: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return typeof filterValue === 'number' && typeof value === 'number' && value >= filterValue
  },

  lessThan: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return typeof filterValue === 'number' && typeof value === 'number' && value < filterValue
  },

  lessThanOrEqual: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return typeof filterValue === 'number' && typeof value === 'number' && value <= filterValue
  },

  inRange: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    if (Array.isArray(filterValue) && filterValue.length === 2 && typeof value === 'number') {
      const [min, max] = filterValue as unknown as [number, number]
      return value >= min && value <= max
    }
    return false
  },

  notInRange: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    if (Array.isArray(filterValue) && filterValue.length === 2 && typeof value === 'number') {
      const [min, max] = filterValue as unknown as [number, number]
      return value < min || value > max
    }
    return false
  },

  contains: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return (
      typeof filterValue === 'string' && typeof value === 'string' && value.includes(filterValue)
    )
  },

  notContains: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return (
      typeof filterValue === 'string' && typeof value === 'string' && !value.includes(filterValue)
    )
  },

  startsWith: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return (
      typeof filterValue === 'string' && typeof value === 'string' && value.startsWith(filterValue)
    )
  },

  endsWith: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return (
      typeof filterValue === 'string' && typeof value === 'string' && value.endsWith(filterValue)
    )
  },

  notStartsWith: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return (
      typeof filterValue === 'string' && typeof value === 'string' && !value.startsWith(filterValue)
    )
  },

  notEndsWith: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return (
      typeof filterValue === 'string' && typeof value === 'string' && !value.endsWith(filterValue)
    )
  },

  isNull: (value: TableFilterValue): boolean => {
    return value === null || value === undefined
  },

  isNotNull: (value: TableFilterValue): boolean => {
    return value !== null && value !== undefined
  },

  between: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    if (Array.isArray(filterValue) && filterValue.length === 2 && typeof value === 'number') {
      const [start, end] = filterValue as unknown as [number, number]
      return value >= start && value <= end
    }
    return false
  },

  notBetween: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    if (Array.isArray(filterValue) && filterValue.length === 2 && typeof value === 'number') {
      const [start, end] = filterValue as unknown as [number, number]
      return value < start || value > end
    }
    return false
  },

  in: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return Array.isArray(filterValue) && filterValue.includes(value)
  },

  notIn: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    return Array.isArray(filterValue) && !filterValue.includes(value)
  },

  like: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    if (typeof filterValue === 'string' && typeof value === 'string') {
      const regex = new RegExp('^' + filterValue.replace(/%/g, '.*') + '$')
      return regex.test(value)
    }
    return false
  },

  notLike: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    if (typeof filterValue === 'string' && typeof value === 'string') {
      const regex = new RegExp('^' + filterValue.replace(/%/g, '.*') + '$')
      return !regex.test(value)
    }
    return false
  },

  iLike: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    if (typeof filterValue === 'string' && typeof value === 'string') {
      const regex = new RegExp('^' + filterValue.replace(/%/g, '.*') + '$', 'i')
      return regex.test(value)
    }
    return false
  },

  notILike: (value: TableFilterValue, filterValue: TableFilterValue): boolean => {
    if (typeof filterValue === 'string' && typeof value === 'string') {
      const regex = new RegExp('^' + filterValue.replace(/%/g, '.*') + '$', 'i')
      return !regex.test(value)
    }
    return false
  }
}

export const sortComparators = {
  asc: (a: TableFilterValue, b: TableFilterValue): number => {
    if (a === null || a === undefined) return 1
    if (b === null || b === undefined) return -1
    return a < b ? -1 : a > b ? 1 : 0
  },
  desc: (a: TableFilterValue, b: TableFilterValue): number => {
    if (a === null || a === undefined) return 1
    if (b === null || b === undefined) return -1
    return a > b ? -1 : a < b ? 1 : 0
  }
}
