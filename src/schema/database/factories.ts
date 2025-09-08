// File: src/schema/database/factories.ts
import {
  StringField,
  NumberField,
  BooleanField,
  DateField,
  EnumField,
  ReferenceField,
  ArrayField,
  ObjectField,
  Table
} from './types'

// Field factory functions
export const createStringField = (config: Omit<StringField, 'type'>): StringField => ({
  type: 'string',
  ...config
})

export const createNumberField = (config: Omit<NumberField, 'type'>): NumberField => ({
  type: 'number',
  ...config
})

export const createBooleanField = (config: Omit<BooleanField, 'type'>): BooleanField => ({
  type: 'boolean',
  ...config
})

export const createDateField = (config: Omit<DateField, 'type'>): DateField => ({
  type: 'date',
  ...config
})

export const createEnumField = (config: Omit<EnumField, 'type'>): EnumField => ({
  type: 'enum',
  ...config
})

export const createReferenceField = (config: Omit<ReferenceField, 'type'>): ReferenceField => ({
  type: 'reference',
  ...config
})

export const createArrayField = (config: Omit<ArrayField, 'type'>): ArrayField => ({
  type: 'array',
  ...config
})

export const createObjectField = (config: Omit<ObjectField, 'type'>): ObjectField => ({
  type: 'object',
  ...config
})

// Table factory function
export const createTable = (config: Table): Table => config
