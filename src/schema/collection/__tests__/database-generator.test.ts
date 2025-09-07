// File: src/schema/generator/zod/__tests__/database-generator.test.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest'
import { z } from 'zod'
import { DocGenerator } from '../doc.class'
import { databaseSchemas } from './database-schema-setup'
import {
  EnumAcademicYearStatus,
  EnumStudentStatuses,
  EnumGender,
  EnumReligion,
  ValidationConstants
} from './database/const'

describe('Database Zod Generator - Comprehensive Tests', () => {
  let generator: DocGenerator

  beforeEach(() => {
    generator = new DocGenerator(databaseSchemas)
  })

  describe('Student Schema Validation', () => {
    it('should validate student with all required fields', () => {
      const schema = generator.generate('student')

      const validStudent = {
        nisn: '1234567890',
        name: 'John Doe',
        email: 'john.doe@school.edu',
        dateOfBirth: new Date('2010-05-15'),
        gender: 'male',
        currentClassId: 'class-1',
        status: 'active'
      }

      expect(() => schema.parse(validStudent)).not.toThrow()
    })

    it('should validate NISN format and length', () => {
      const schema = generator.generate('student')

      // Test valid NISN
      expect(() =>
        schema.parse({
          nisn: '1234567890',
          name: 'Test Student',
          email: 'test@school.edu',
          dateOfBirth: new Date('2010-05-15'),
          gender: 'male',
          currentClassId: 'class-1',
          status: 'active'
        })
      ).not.toThrow()

      // Test invalid NISN
      expect(() =>
        schema.parse({
          nisn: '12345', // Too short
          name: 'Test Student',
          email: 'test@school.edu',
          dateOfBirth: new Date('2010-05-15'),
          gender: 'male',
          currentClassId: 'class-1',
          status: 'active'
        })
      ).toThrow()

      expect(() =>
        schema.parse({
          nisn: 'abc123def', // Contains letters
          name: 'Test Student',
          email: 'test@school.edu',
          dateOfBirth: new Date('2010-05-15'),
          gender: 'male',
          currentClassId: 'class-1',
          status: 'active'
        })
      ).toThrow()
    })

    it('should validate enum values for gender and status', () => {
      const schema = generator.generate('student')

      // Test all valid enum values
      EnumGender.forEach((gender) => {
        EnumStudentStatuses.forEach((status) => {
          expect(() =>
            schema.parse({
              nisn: '1234567890',
              name: 'Test Student',
              email: 'test@school.edu',
              dateOfBirth: new Date('2010-05-15'),
              gender,
              currentClassId: 'class-1',
              status
            })
          ).not.toThrow()
        })
      })

      // Test invalid enum values
      expect(() =>
        schema.parse({
          nisn: '1234567890',
          name: 'Test Student',
          email: 'test@school.edu',
          dateOfBirth: new Date('2010-05-15'),
          gender: 'invalid-gender',
          currentClassId: 'class-1',
          status: 'active'
        })
      ).toThrow()

      expect(() =>
        schema.parse({
          nisn: '1234567890',
          name: 'Test Student',
          email: 'test@school.edu',
          dateOfBirth: new Date('2010-05-15'),
          gender: 'male',
          currentClassId: 'class-1',
          status: 'invalid-status'
        })
      ).toThrow()
    })
  })

  describe('Teacher Schema Validation', () => {
    it('should validate teacher with NIP format', () => {
      const schema = generator.generate('teacher')

      const validTeacher = {
        nip: '123456789012345678',
        name: 'Jane Smith',
        email: 'jane.smith@school.edu',
        subjects: ['math', 'physics']
      }

      expect(() => schema.parse(validTeacher)).not.toThrow()

      // Test invalid NIP
      expect(() =>
        schema.parse({
          nip: '12345', // Too short
          name: 'Jane Smith',
          email: 'jane.smith@school.edu',
          subjects: ['math']
        })
      ).toThrow()
    })
  })

  describe('Academic Year Schema Validation', () => {
    it('should validate academic year format', () => {
      const schema = generator.generate('academicYear')

      const validAcademicYear = {
        year: '2024/2025',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2025-06-15'),
        isActive: true,
        status: 'planning'
      }

      expect(() => schema.parse(validAcademicYear)).not.toThrow()

      // Test invalid year format
      expect(() =>
        schema.parse({
          ...validAcademicYear,
          year: '2024' // Invalid format
        })
      ).toThrow()
    })

    it('should validate academic year status enum', () => {
      const schema = generator.generate('academicYear')

      // Test all valid status values
      EnumAcademicYearStatus.forEach((status) => {
        expect(() =>
          schema.parse({
            year: '2024/2025',
            startDate: new Date('2024-07-15'),
            endDate: new Date('2025-06-15'),
            isActive: true,
            status
          })
        ).not.toThrow()
      })
    })
  })

  describe('Subject Schema Validation', () => {
    it('should validate subject with category enum', () => {
      const schema = generator.generate('subject')

      const validSubject = {
        name: 'Mathematics',
        code: 'MATH101',
        credits: 4,
        category: 'wajib',
        status: 'active'
      }

      expect(() => schema.parse(validSubject)).not.toThrow()

      // Test invalid category
      expect(() =>
        schema.parse({
          ...validSubject,
          category: 'invalid-category'
        })
      ).toThrow()
    })
  })

  describe('Type Inference and Coercion', () => {
    it('should coerce string values to proper types', () => {
      const studentSchema = generator.generate('student')

      const coercedStudent = {
        nisn: 1234567890, // Number to string
        name: 'John Doe',
        email: 'john.doe@school.edu',
        dateOfBirth: '2010-05-15', // String to Date
        gender: 'male',
        currentClassId: 'class-1',
        status: 'active'
      }

      const result = studentSchema.parse(coercedStudent)
      expect(result.nisn).toBe('1234567890')
      expect(result.dateOfBirth).toBeInstanceOf(Date)
    })

    it('should infer correct types for generated schemas', () => {
      const schema = generator.generate('student')
      type StudentType = z.infer<typeof schema>

      const student: StudentType = {
        nisn: '1234567890',
        name: 'John Doe',
        email: 'john.doe@school.edu',
        dateOfBirth: new Date('2010-05-15'),
        gender: 'male',
        currentClassId: 'class-1',
        status: 'active'
      }

      expect(student.name).toBe('John Doe')
      expect(student.nisn).toHaveLength(ValidationConstants.NISN_LENGTH)
      expect(student.gender).toBe('male')
    })
  })

  describe('Enum Schema Validation', () => {
    it('should validate religion enum values', () => {
      const schema = generator.generate('religion')

      // Test all valid religion values
      EnumReligion.forEach((religion) => {
        expect(() => schema.parse(religion)).not.toThrow()
      })

      // Test invalid value
      expect(() => schema.parse('invalid-religion')).toThrow()
    })
  })

  describe('Complex Object Validation', () => {
    it('should validate nested address object', () => {
      const schema = generator.generate('address')

      const validAddress = {
        street: '123 Main Street',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345'
      }

      expect(() => schema.parse(validAddress)).not.toThrow()
    })

    it('should validate contact information', () => {
      const schema = generator.generate('contactInfo')

      const validContact = {
        phone: '081234567890',
        email: 'test@example.com'
      }

      expect(() => schema.parse(validContact)).not.toThrow()

      // Test invalid phone
      expect(() =>
        schema.parse({
          phone: '123', // Too short
          email: 'test@example.com'
        })
      ).toThrow()
    })
  })

  describe('Error Messages', () => {
    it('should provide meaningful error messages for validation failures', () => {
      const schema = generator.generate('student')

      try {
        schema.parse({
          nisn: '123', // Invalid length
          name: 'J', // Too short
          email: 'invalid-email',
          dateOfBirth: 'invalid-date',
          gender: 'invalid-gender',
          currentClassId: 'class-1',
          status: 'invalid-status'
        })
        expect.fail('Should have thrown validation error')
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.issues.length).toBeGreaterThan(0)
          // Should contain error messages for multiple validation failures
          expect(error.issues.some((e) => e.message.includes('Too small'))).toBe(true)
          expect(error.issues.some((e) => e.message.includes('email'))).toBe(true)
        }
      }
    })
  })

  describe('generateWithDefaults', () => {
    it('should generate schema with default values for student', () => {
      const defaults = generator.extractDefaults('student')
      expect(defaults).toEqual({
        nisn: '',
        name: '',
        email: '',
        dateOfBirth: undefined,
        gender: '',
        currentClassId: '',
        status: '',
        parentInfo: {
          fatherName: '',
          motherName: '',
          parentPhone: ''
        },
        religion: ''
      })

      // Test with partial data
      const partialStudent = {
        nisn: '1234567890',
        name: 'John Doe'
      }

      const schema = generator.generate('student')
      const result = schema.partial().parse(partialStudent)
      expect(result.nisn).toBe('1234567890')
      expect(result.name).toBe('John Doe')
      expect(result.email).toBe(undefined) // Default value
      expect(result.gender).toBe(undefined) // Default value
    })
  })

  describe('Edge Cases', () => {
    it('should handle optional fields correctly', () => {
      const schema = generator.generate('student')

      // Should work without optional fields
      const studentWithoutOptional = {
        nisn: '1234567890',
        name: 'John Doe',
        email: 'john.doe@school.edu',
        dateOfBirth: new Date('2010-05-15'),
        gender: 'male',
        currentClassId: 'class-1',
        status: 'active'
      }

      expect(() => schema.parse(studentWithoutOptional)).not.toThrow()
    })

    it('should handle array fields correctly', () => {
      const schema = generator.generate('teacher')

      const teacherWithEmptySubjects = {
        nip: '123456789012345678',
        name: 'Jane Smith',
        email: 'jane.smith@school.edu',
        subjects: []
      }

      expect(() => schema.parse(teacherWithEmptySubjects)).not.toThrow()
    })
  })
})
