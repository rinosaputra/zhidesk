// File: src/schema/collection/__tests__/zod-setup.ts
import {
  createStringSchema,
  createNumberSchema,
  createBooleanSchema,
  createDateSchema,
  createArraySchema,
  createObjectSchema
} from '../doc.class'
import {
  StringDocSchemaType,
  NumberDocSchemaType,
  BooleanDocSchemaType,
  DateDocSchemaType,
  ArrayDocSchemaType,
  ObjectDocSchemaType
} from '../doc'

// Test schemas
export const nisnSchema: StringDocSchemaType = createStringSchema({
  name: 'nisn',
  label: 'NISN',
  coerce: true,
  noempty: true,
  default: '',
  validation: {
    min: 10,
    max: 10,
    regex: '^\\d+$'
  }
})

export const nameSchema: StringDocSchemaType = createStringSchema({
  name: 'name',
  label: 'Nama Lengkap',
  coerce: true,
  noempty: true,
  default: '',
  validation: {
    min: 2,
    max: 100
  }
})

export const ageSchema: NumberDocSchemaType = createNumberSchema({
  name: 'age',
  label: 'Usia',
  coerce: true,
  default: 0,
  validation: {
    min: 5,
    max: 25,
    int: true // Add integer validation
  }
})

export const isActiveSchema: BooleanDocSchemaType = createBooleanSchema({
  name: 'isActive',
  label: 'Status Aktif',
  coerce: true,
  default: true
})

export const birthDateSchema: DateDocSchemaType = createDateSchema({
  name: 'birthDate',
  label: 'Tanggal Lahir',
  coerce: true,
  validation: {
    max: new Date('2019-01-01') // Max 5 years old
  }
})

export const hobbiesSchema: ArrayDocSchemaType = createArraySchema({
  name: 'hobbies',
  label: 'Hobi',
  properties: createStringSchema({
    name: 'hobby',
    label: 'Hobi',
    coerce: true,
    noempty: true
  }),
  default: [],
  validation: {
    min: 1,
    max: 5
  }
})

export const addressSchema: ObjectDocSchemaType = createObjectSchema({
  name: 'address',
  label: 'Alamat',
  properties: [
    createStringSchema({
      name: 'street',
      label: 'Jalan',
      coerce: true,
      noempty: true,
      default: ''
    }),
    createStringSchema({
      name: 'city',
      label: 'Kota',
      coerce: true,
      noempty: true,
      default: ''
    })
  ]
})

export const studentSchema: ObjectDocSchemaType = createObjectSchema({
  name: 'student',
  label: 'Data Siswa',
  properties: [
    nisnSchema,
    nameSchema,
    ageSchema,
    isActiveSchema,
    birthDateSchema,
    hobbiesSchema,
    addressSchema
  ]
})

export const testSchemas = [
  nisnSchema,
  nameSchema,
  ageSchema,
  isActiveSchema,
  birthDateSchema,
  hobbiesSchema,
  addressSchema,
  studentSchema
] as const

// Result types
export interface StudentResult {
  nisn: string
  name: string
  age: number
  isActive: boolean
  birthDate: Date
  hobbies: string[]
  address: {
    street: string
    city: string
  }
}

export interface TestSchemasResult {
  nisn: string
  name: string
  age: number
  isActive: boolean
  birthDate: Date
  hobbies: string[]
  address: {
    street: string
    city: string
  }
  student: StudentResult
}
