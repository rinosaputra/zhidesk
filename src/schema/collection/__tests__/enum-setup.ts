// File: src/schema/generator/zod/__tests__/enum-setup.ts
import { createEnumSchema } from '../doc.class'
import { EnumStudentStatuses, EnumGender, EnumReligion } from './database/const'

// Enum schemas untuk database
export const genderEnumSchema = createEnumSchema({
  name: 'gender',
  label: 'Gender',
  validation: {
    values: [...EnumGender],
    caseSensitive: false
  }
})

export const statusEnumSchema = createEnumSchema({
  name: 'status',
  label: 'Student Status',
  validation: {
    values: [...EnumStudentStatuses],
    caseSensitive: false
  }
})

export const religionEnumSchema = createEnumSchema({
  name: 'religion',
  label: 'Religion',
  validation: {
    values: [...EnumReligion],
    caseSensitive: false
  }
})

export const enumSchemas = [genderEnumSchema, statusEnumSchema, religionEnumSchema]
