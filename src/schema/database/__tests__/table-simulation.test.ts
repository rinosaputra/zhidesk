// File: src/schema/database/__tests__/table-simulation.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { DatabaseGenerator } from '../generator'
import {
  createStringField,
  createNumberField,
  createBooleanField,
  createDateField,
  createEnumField,
  createReferenceField,
  createArrayField,
  createObjectField,
  createTable
} from '../factories'

describe('Database Generator - Table Simulation', () => {
  let generator: DatabaseGenerator

  beforeEach(() => {
    generator = new DatabaseGenerator({
      name: 'school-db',
      version: 1,
      tables: []
    })
  })

  describe('Users Table', () => {
    const usersTable = createTable({
      name: 'users',
      label: 'Users',
      timestamps: true,
      softDelete: true,
      fields: [
        createStringField({
          name: 'email',
          label: 'Email',
          required: true,
          unique: true,
          validation: { format: 'email', max: 255 }
        }),
        createStringField({
          name: 'password',
          label: 'Password',
          required: true,
          hidden: true,
          validation: { format: 'password', min: 8 }
        }),
        createStringField({
          name: 'firstName',
          label: 'First Name',
          required: true,
          validation: { min: 2, max: 50 }
        }),
        createStringField({
          name: 'lastName',
          label: 'Last Name',
          required: true,
          validation: { min: 2, max: 50 }
        }),
        createEnumField({
          name: 'role',
          label: 'Role',
          options: ['admin', 'teacher', 'student', 'parent'],
          default: 'student'
        }),
        createBooleanField({
          name: 'isActive',
          label: 'Active',
          default: true
        })
      ]
    })

    it('should generate complete users table schema', () => {
      generator.registerTable(usersTable)
      const schema = generator.generateTableSchema('users')

      const validUser = {
        email: 'john.doe@example.com',
        password: 'securepassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        isActive: true
      }

      const result = schema.parse(validUser)

      expect(result).toMatchObject(validUser)
      expect(result._id).toBeDefined()
      expect(result._createdAt).toBeInstanceOf(Date)
      expect(result._updatedAt).toBeInstanceOf(Date)
      expect(result._deletedAt).toBeUndefined()
    })

    it('should validate user data correctly', () => {
      generator.registerTable(usersTable)
      const schema = generator.generateTableSchema('users')

      // Test invalid email
      expect(() =>
        schema.parse({
          email: 'invalid-email',
          password: 'short',
          firstName: 'J',
          lastName: 'D'
        })
      ).toThrow()

      // Test missing required fields
      expect(() =>
        schema.parse({
          email: 'test@example.com'
          // Missing password, firstName, lastName
        })
      ).toThrow()
    })
  })

  describe('Courses Table', () => {
    const coursesTable = createTable({
      name: 'courses',
      label: 'Courses',
      timestamps: true,
      fields: [
        createStringField({
          name: 'title',
          label: 'Title',
          required: true,
          validation: { min: 5, max: 200 }
        }),
        createStringField({
          name: 'description',
          label: 'Description',
          validation: { max: 1000 }
        }),
        createReferenceField({
          name: 'instructorId',
          label: 'Instructor',
          reference: {
            tableName: 'users'
          },
          required: true
        }),
        createNumberField({
          name: 'credits',
          label: 'Credits',
          validation: { min: 1, max: 6, integer: true }
        }),
        createArrayField({
          name: 'tags',
          label: 'Tags',
          items: createStringField({
            name: 'tag',
            label: 'Tag',
            validation: { max: 20 }
          }),
          validation: { max: 10 }
        }),
        createObjectField({
          name: 'schedule',
          label: 'Schedule',
          fields: [
            createStringField({
              name: 'days',
              label: 'Days',
              validation: {
                pattern: '^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(,(Mon|Tue|Wed|Thu|Fri|Sat|Sun))*$'
              }
            }),
            createStringField({
              name: 'time',
              label: 'Time',
              validation: { pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' }
            })
          ]
        })
      ]
    })

    it('should generate complete courses table schema', () => {
      generator.registerTable(coursesTable)
      const schema = generator.generateTableSchema('courses')

      const validCourse = {
        title: 'Advanced Mathematics',
        description: 'A course covering advanced mathematical concepts',
        instructorId: '123e4567-e89b-12d3-a456-426614174000',
        credits: 3,
        tags: ['math', 'advanced', 'calculus'],
        schedule: {
          days: 'Mon,Wed,Fri',
          time: '10:00'
        }
      }

      const result = schema.parse(validCourse)

      expect(result).toMatchObject(validCourse)
      expect(result._id).toBeDefined()
      expect(result._createdAt).toBeInstanceOf(Date)
      expect(result._updatedAt).toBeInstanceOf(Date)
    })

    it('should validate course data correctly', () => {
      generator.registerTable(coursesTable)
      const schema = generator.generateTableSchema('courses')

      // Test invalid credits
      expect(() =>
        schema.parse({
          title: 'Test Course',
          instructorId: '123e4567-e89b-12d3-a456-426614174000',
          credits: 0, // Below min
          tags: ['test'],
          schedule: { days: 'Mon', time: '10:00' }
        })
      ).toThrow()

      // Test invalid schedule format
      expect(() =>
        schema.parse({
          title: 'Test Course',
          instructorId: '123e4567-e89b-12d3-a456-426614174000',
          credits: 3,
          tags: ['test'],
          schedule: { days: 'InvalidDay', time: '25:00' } // Invalid day and time
        })
      ).toThrow()
    })
  })

  describe('Enrollments Table (Relationship Table)', () => {
    const enrollmentsTable = createTable({
      name: 'enrollments',
      label: 'Enrollments',
      timestamps: true,
      fields: [
        createReferenceField({
          name: 'studentId',
          label: 'Student',
          reference: {
            tableName: 'users'
          },
          required: true
        }),
        createReferenceField({
          name: 'courseId',
          label: 'Course',
          reference: {
            tableName: 'courses'
          },
          required: true
        }),
        createEnumField({
          name: 'status',
          label: 'Status',
          options: ['enrolled', 'completed', 'dropped', 'pending'],
          default: 'enrolled'
        }),
        createNumberField({
          name: 'grade',
          label: 'Grade',
          validation: { min: 0, max: 100 }
        }),
        createDateField({
          name: 'enrollmentDate',
          label: 'Enrollment Date',
          required: true
        }),
        createDateField({
          name: 'completionDate',
          label: 'Completion Date',
          validation: { min: new Date('2023-01-01') }
        })
      ]
    })

    it('should generate complete enrollments table schema', () => {
      generator.registerTable(enrollmentsTable)
      const schema = generator.generateTableSchema('enrollments')

      const validEnrollment = {
        studentId: '123e4567-e89b-12d3-a456-426614174000',
        courseId: '123e4567-e89b-12d3-a456-426614174001',
        status: 'enrolled',
        grade: 85.5,
        enrollmentDate: new Date('2023-09-01'),
        completionDate: new Date('2023-12-15')
      }

      const result = schema.parse(validEnrollment)

      expect(result).toMatchObject(validEnrollment)
      expect(result._id).toBeDefined()
    })

    it('should validate enrollment data correctly', () => {
      generator.registerTable(enrollmentsTable)
      const schema = generator.generateTableSchema('enrollments')

      // Test invalid grade
      expect(() =>
        schema.parse({
          studentId: '123e4567-e89b-12d3-a456-426614174000',
          courseId: '123e4567-e89b-12d3-a456-426614174001',
          status: 'enrolled',
          grade: 105, // Above max
          enrollmentDate: new Date('2023-09-01')
        })
      ).toThrow()

      // Test missing required fields
      expect(() =>
        schema.parse({
          studentId: '123e4567-e89b-12d3-a456-426614174000',
          courseId: '123e4567-e89b-12d3-a456-426614174001'
          // Missing enrollmentDate
        })
      ).toThrow()
    })
  })

  describe('Multiple Tables Integration', () => {
    it('should handle multiple registered tables', () => {
      const usersTable = createTable({
        name: 'users',
        label: 'Users',
        fields: [createStringField({ name: 'name', label: 'Name', required: true })]
      })

      const postsTable = createTable({
        name: 'posts',
        label: 'Posts',
        fields: [
          createStringField({ name: 'title', label: 'Title', required: true }),
          createReferenceField({
            name: 'authorId',
            label: 'Author',
            reference: {
              tableName: 'users'
            },
            required: true
          })
        ]
      })

      generator.registerTable(usersTable)
      generator.registerTable(postsTable)

      // Both tables should be accessible
      expect(generator.getTable('users')).toBeDefined()
      expect(generator.getTable('posts')).toBeDefined()

      // Should generate schemas for both tables
      const userSchema = generator.generateTableSchema('users')
      const postSchema = generator.generateTableSchema('posts')

      const user = userSchema.parse({ name: 'John Doe' })
      const post = postSchema.parse({
        title: 'Hello World',
        authorId: user._id
      })

      expect(user.name).toBe('John Doe')
      expect(post.title).toBe('Hello World')
      expect(post.authorId).toBe(user._id)
    })
  })

  describe('Database Operations', () => {
    const testTable = createTable({
      name: 'test',
      label: 'Test Table',
      timestamps: true,
      fields: [
        createStringField({
          name: 'name',
          label: 'Name',
          required: true
        }),
        createNumberField({
          name: 'value',
          label: 'Value',
          default: 0
        })
      ]
    })

    it('should extract defaults correctly', () => {
      generator.registerTable(testTable)
      const defaults = generator.extractDefaults('test')

      expect(defaults).toEqual({
        id: expect.any(String),
        name: '',
        value: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('should validate data against table schema', () => {
      generator.registerTable(testTable)

      const validData = {
        name: 'Test Name',
        value: 42
      }

      const validated = generator.validateData('test', validData)

      expect(validated).toMatchObject(validData)
      expect(validated._id).toBeDefined()
      expect(validated._createdAt).toBeInstanceOf(Date)
      expect(validated._updatedAt).toBeInstanceOf(Date)

      // Test invalid data
      expect(() =>
        generator.validateData('test', {
          value: 42
          // Missing required name field
        })
      ).toThrow()
    })
  })
})
