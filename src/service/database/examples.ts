// File: src/service/database/examples.ts
import {
  createArrayField,
  createBooleanField,
  createDateField,
  createEnumField,
  createNumberField,
  createObjectField,
  createReferenceField,
  createStringField,
  createTable
} from './factories'

// Example usage
export const exampleUserTable = createTable({
  name: 'users',
  label: 'Users',
  description: 'User accounts table',
  timestamps: true,
  softDelete: true,
  fields: [
    createStringField({
      name: 'email',
      label: 'Email Address',
      required: true,
      unique: true,
      validation: {
        format: 'email',
        max: 255
      }
    }),
    createStringField({
      name: 'password',
      label: 'Password',
      required: true,
      hidden: true,
      validation: {
        format: 'password',
        min: 8
      }
    }),
    createStringField({
      name: 'firstName',
      label: 'First Name',
      required: true,
      validation: {
        min: 2,
        max: 50
      }
    }),
    createStringField({
      name: 'lastName',
      label: 'Last Name',
      required: true,
      validation: {
        min: 2,
        max: 50
      }
    }),
    createEnumField({
      name: 'role',
      label: 'User Role',
      options: [
        {
          label: 'admin',
          value: 'admin'
        },
        {
          label: 'user',
          value: 'user'
        },
        {
          label: 'moderator',
          value: 'moderator'
        }
      ],
      default: 'user'
    }),
    createBooleanField({
      name: 'isActive',
      label: 'Active Status',
      default: true
    }),
    createDateField({
      name: 'lastLogin',
      label: 'Last Login'
    })
  ]
})

export const examplePostTable = createTable({
  name: 'posts',
  label: 'Blog Posts',
  timestamps: true,
  fields: [
    createStringField({
      name: 'title',
      label: 'Post Title',
      required: true,
      validation: {
        min: 5,
        max: 200
      }
    }),
    createStringField({
      name: 'content',
      label: 'Post Content',
      required: true
    }),
    createReferenceField({
      name: 'authorId',
      label: 'Author',
      reference: {
        tableName: 'users'
      },
      required: true
    }),
    createArrayField({
      name: 'tags',
      label: 'Tags',
      items: createStringField({
        name: 'tag',
        label: 'Tag',
        validation: {
          max: 20
        }
      }),
      validation: {
        max: 10
      }
    }),
    createObjectField({
      name: 'metadata',
      label: 'Post Metadata',
      fields: [
        createNumberField({
          name: 'wordCount',
          label: 'Word Count'
        }),
        createNumberField({
          name: 'readTime',
          label: 'Read Time (minutes)'
        })
      ]
    })
  ]
})
