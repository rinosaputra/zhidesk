// File: src/renderer/src/components/database/const.tsx
import {
  Field,
  FieldType,
  ArrayFieldSchema,
  BooleanFieldSchema,
  DateFieldSchema,
  EnumFieldSchema,
  NumberFieldSchema,
  ObjectFieldSchema,
  ReferenceFieldSchema,
  StringFieldSchema
} from '@service/database/types'
import {
  LucideIcon,
  Type,
  Hash,
  CheckSquare,
  Calendar,
  List,
  Link,
  Layers,
  Box
} from 'lucide-react'
import z from 'zod'

export type FieldTypes = Record<
  FieldType,
  {
    schema: z.ZodType<Field>
    icon: LucideIcon
  }
>

export const fieldTypes: FieldTypes = {
  array: {
    icon: Layers,
    schema: ArrayFieldSchema
  },
  boolean: {
    icon: CheckSquare,
    schema: BooleanFieldSchema
  },
  date: {
    icon: Calendar,
    schema: DateFieldSchema
  },
  enum: {
    icon: List,
    schema: EnumFieldSchema
  },
  number: {
    icon: Hash,
    schema: NumberFieldSchema
  },
  object: {
    icon: Box,
    schema: ObjectFieldSchema
  },
  reference: {
    icon: Link,
    schema: ReferenceFieldSchema
  },
  string: {
    icon: Type,
    schema: StringFieldSchema
  }
}
