// File: src/schema/generator/zod/__tests__/database-schema-setup.ts
import {
  createStringSchema,
  createNumberSchema,
  createBooleanSchema,
  createDateSchema,
  createArraySchema,
  createObjectSchema,
  createEnumSchema
} from '../doc.class'
import { ValidationConstants } from './database/const'

// ==================== ENUM SCHEMAS ====================

export const genderEnumSchema = createEnumSchema({
  name: 'gender',
  label: 'Gender',
  validation: {
    values: ['male', 'female', 'other'],
    caseSensitive: false
  }
})

export const statusEnumSchema = createEnumSchema({
  name: 'status',
  label: 'Student Status',
  validation: {
    values: ['active', 'inactive', 'graduated', 'transferred'],
    caseSensitive: false
  }
})

export const religionEnumSchema = createEnumSchema({
  name: 'religion',
  label: 'Religion',
  optional: true,
  validation: {
    values: ['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu', 'other'],
    caseSensitive: false
  }
})

// ==================== BASE SCHEMAS ====================

export const addressSchema = createObjectSchema({
  name: 'address',
  label: 'Address',
  properties: [
    createStringSchema({
      name: 'street',
      label: 'Street',
      coerce: true,
      validation: { max: ValidationConstants.ADDRESS_MAX }
    }),
    createStringSchema({
      name: 'city',
      label: 'City',
      coerce: true
    }),
    createStringSchema({
      name: 'province',
      label: 'Province',
      coerce: true
    }),
    createStringSchema({
      name: 'postalCode',
      label: 'Postal Code',
      coerce: true
    })
  ]
})

export const contactInfoSchema = createObjectSchema({
  name: 'contactInfo',
  label: 'Contact Information',
  properties: [
    createStringSchema({
      name: 'phone',
      label: 'Phone',
      coerce: true,
      validation: {
        min: ValidationConstants.PHONE_MIN,
        max: ValidationConstants.PHONE_MAX
      }
    }),
    createStringSchema({
      name: 'email',
      label: 'Email',
      coerce: true,
      validation: {
        max: ValidationConstants.EMAIL_MAX,
        format: 'email'
      }
    })
  ]
})

// ==================== STUDENT SCHEMA ====================

export const studentSchema = createObjectSchema({
  name: 'student',
  label: 'Student',
  properties: [
    createStringSchema({
      name: 'nisn',
      label: 'NISN',
      coerce: true,
      validation: {
        length: ValidationConstants.NISN_LENGTH,
        regex: '^\\d+$'
      }
    }),
    createStringSchema({
      name: 'name',
      label: 'Full Name',
      coerce: true,
      validation: {
        min: ValidationConstants.NAME_MIN,
        max: ValidationConstants.NAME_MAX
      }
    }),
    createStringSchema({
      name: 'email',
      label: 'Email',
      coerce: true,
      validation: {
        max: ValidationConstants.EMAIL_MAX,
        format: 'email'
      }
    }),
    createDateSchema({
      name: 'dateOfBirth',
      label: 'Date of Birth',
      coerce: true
    }),
    genderEnumSchema,
    createStringSchema({
      name: 'currentClassId',
      label: 'Current Class ID',
      coerce: true
    }),
    statusEnumSchema,
    createObjectSchema({
      name: 'parentInfo',
      label: 'Parent Information',
      properties: [
        createStringSchema({
          name: 'fatherName',
          label: "Father's Name",
          coerce: true,
          optional: true
        }),
        createStringSchema({
          name: 'motherName',
          label: "Mother's Name",
          coerce: true,
          optional: true
        }),
        createStringSchema({
          name: 'parentPhone',
          label: "Parent's Phone",
          coerce: true,
          optional: true,
          validation: {
            min: ValidationConstants.PHONE_MIN,
            max: ValidationConstants.PHONE_MAX
          }
        })
      ],
      optional: true
    }),
    religionEnumSchema
  ]
})

// ==================== TEACHER SCHEMA ====================

export const teacherSchema = createObjectSchema({
  name: 'teacher',
  label: 'Teacher',
  properties: [
    createStringSchema({
      name: 'nip',
      label: 'NIP',
      coerce: true,
      validation: {
        length: ValidationConstants.NIP_LENGTH,
        regex: '^\\d+$'
      }
    }),
    createStringSchema({
      name: 'name',
      label: 'Full Name',
      coerce: true,
      validation: {
        min: ValidationConstants.NAME_MIN,
        max: ValidationConstants.NAME_MAX
      }
    }),
    createStringSchema({
      name: 'email',
      label: 'Email',
      coerce: true,
      validation: {
        max: ValidationConstants.EMAIL_MAX,
        format: 'email'
      }
    }),
    createArraySchema({
      name: 'subjects',
      label: 'Subjects',
      properties: createStringSchema({
        name: 'subject',
        label: 'Subject'
      })
    })
  ]
})

// ==================== ACADEMIC YEAR SCHEMA ====================

export const academicYearSchema = createObjectSchema({
  name: 'academicYear',
  label: 'Academic Year',
  properties: [
    createStringSchema({
      name: 'year',
      label: 'Academic Year',
      coerce: true,
      validation: {
        regex: '^\\d{4}/\\d{4}$'
      }
    }),
    createDateSchema({
      name: 'startDate',
      label: 'Start Date',
      coerce: true
    }),
    createDateSchema({
      name: 'endDate',
      label: 'End Date',
      coerce: true
    }),
    createBooleanSchema({
      name: 'isActive',
      label: 'Is Active',
      coerce: true
    }),
    createEnumSchema({
      name: 'status',
      label: 'Status',
      validation: {
        values: ['planning', 'active', 'completed', 'archived']
      }
    })
  ]
})

// ==================== SUBJECT SCHEMA ====================

export const subjectSchema = createObjectSchema({
  name: 'subject',
  label: 'Subject',
  properties: [
    createStringSchema({
      name: 'name',
      label: 'Subject Name',
      coerce: true,
      validation: {
        min: 2,
        max: 100
      }
    }),
    createStringSchema({
      name: 'code',
      label: 'Subject Code',
      coerce: true,
      validation: {
        max: ValidationConstants.CODE_MAX
      }
    }),
    createNumberSchema({
      name: 'credits',
      label: 'Credits',
      coerce: true,
      validation: {
        min: 1,
        max: 10,
        int: true
      }
    }),
    createEnumSchema({
      name: 'category',
      label: 'Category',
      validation: {
        values: ['wajib', 'peminatan', 'muatan_lokal', 'ekstrakurikuler']
      }
    }),
    createEnumSchema({
      name: 'status',
      label: 'Status',
      validation: {
        values: ['active', 'inactive']
      }
    })
  ]
})

export const databaseSchemas = [
  studentSchema,
  teacherSchema,
  academicYearSchema,
  subjectSchema,
  genderEnumSchema,
  statusEnumSchema,
  religionEnumSchema,
  addressSchema,
  contactInfoSchema
]

export type DatabaseSchemas = typeof databaseSchemas
