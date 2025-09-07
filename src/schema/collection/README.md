# Zod Generator

A powerful, type-safe schema generator that automatically creates Zod schemas from configuration objects. This library provides a declarative way to define validation schemas with full TypeScript inference.

## Features

- 🚀 **Automatic Zod Schema Generation**: Convert configuration objects to Zod schemas
- 🛡️ **Full Type Safety**: Complete TypeScript type inference
- 🔧 **Custom Validation**: Support for min, max, regex, email, URL, UUID validations
- ⚡ **Coercion Support**: Automatic type coercion for strings, numbers, booleans, and dates
- 🏗️ **Nested Structures**: Support for objects and arrays with recursive schemas
- 📝 **Default Values**: Automatic default value extraction
- 🎯 **Modifier Support**: nullable, optional, noempty modifiers
- 🗃️ **Collection Support**: Database collection schema generation

## Installation

```bash
npm install your-package-name
```

## Quick Start

```typescript
import {
  DocGenerator,
  createStringSchema,
  createNumberSchema,
  createObjectSchema
} from '@schema/collection/doc.class'

// Define your schemas
const userSchemas = [
  createStringSchema({
    name: 'name',
    label: 'Full Name',
    coerce: true,
    validation: { min: 2, max: 100 }
  }),
  createNumberSchema({
    name: 'age',
    label: 'Age',
    coerce: true,
    validation: { min: 0, max: 120, int: true }
  })
]

// Create generator instance
const generator = new DocGenerator(userSchemas)

// Generate and use schemas
const nameSchema = generator.generate('name')
const ageSchema = generator.generate('age')

// Parse and validate data
const validName = nameSchema.parse('John Doe') // Returns: "John Doe"
const validAge = ageSchema.parse('25') // Returns: 25 (coerced from string)
```

## Core Concepts

### DocGenerator
The main class that handles schema registration and generation.

### Schema Types
- **String**: Text fields with validation
- **Number**: Numeric fields with range validation
- **Boolean**: True/false fields with coercion
- **Date**: Date fields with range validation
- **Enum**: Predefined value validation
- **Reference**: Relationship to other collections
- **Array**: Lists of items with validation
- **Object**: Nested structures with validation

## Schema Types

### String Schema

```typescript
createStringSchema({
  name: 'email',
  label: 'Email Address',
  coerce: true,
  default: '',
  validation: {
    min: 5,
    max: 255,
    regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    format: 'email', // or 'url', 'uuid', 'phone', 'password'
    trim: true
  }
})
```

### Number Schema

```typescript
createNumberSchema({
  name: 'age',
  label: 'Age',
  coerce: true,
  default: 0,
  validation: {
    min: 0,
    max: 120,
    int: true,
    positive: true,
    nonnegative: true,
    multipleOf: 0.5
  }
})
```

### Boolean Schema

```typescript
createBooleanSchema({
  name: 'isActive',
  label: 'Active Status',
  coerce: true,
  default: false,
  validation: {
    isTrue: true // or isFalse: true
  }
})
```

### Date Schema

```typescript
createDateSchema({
  name: 'birthDate',
  label: 'Birth Date',
  coerce: true,
  validation: {
    min: new Date('1900-01-01'),
    max: new Date(),
    past: true, // or future: true
  }
})
```

### Enum Schema

```typescript
createEnumSchema({
  name: 'gender',
  label: 'Gender',
  validation: {
    values: ['male', 'female', 'other'],
    caseSensitive: false
  }
})
```

### Array Schema

```typescript
createArraySchema({
  name: 'hobbies',
  label: 'Hobbies',
  properties: createStringSchema({
    name: 'hobby',
    label: 'Hobby',
    validation: { min: 1 }
  }),
  validation: {
    min: 1,
    max: 10,
    unique: true
  }
})
```

### Object Schema

```typescript
createObjectSchema({
  name: 'address',
  label: 'Address',
  properties: [
    createStringSchema({
      name: 'street',
      label: 'Street Address',
      validation: { min: 1 }
    }),
    createStringSchema({
      name: 'city',
      label: 'City',
      validation: { min: 1 }
    })
  ],
  validation: {
    strict: true,
    unknownKeys: 'strip' // or 'allow', 'deny'
  }
})
```

### Collection Schema

```typescript
createCollection({
  name: 'users',
  label: 'Users',
  fields: [
    createStringSchema({ name: 'name', label: 'Name' }),
    createNumberSchema({ name: 'age', label: 'Age' })
  ],
  timestamps: true,
  softDelete: false,
  validation: {
    strict: true
  }
})
```

## Advanced Usage

### Type Inference

```typescript
const generator = new DocGenerator(userSchemas)

// Get inferred type from generated schema
const userSchema = generator.generate('user')
type User = z.infer<typeof userSchema>

// Example usage
const user: User = {
  name: 'John Doe',
  age: 25,
  // ... other fields
}
```

### Default Values Extraction

```typescript
const defaults = generator.extractDefaults('user')

console.log(defaults)
// {
//   name: '',
//   age: 0,
//   isActive: false,
//   hobbies: [],
//   address: { street: '', city: '' }
// }
```

### Collection Schema Generation

```typescript
// Register collection
generator.registerCollection(userCollection)

// Generate complete collection schema with metadata fields
const collectionSchema = generator.generateCollectionSchema('users')

// Use with timestamps and soft delete
const userData = {
  name: 'John Doe',
  age: 25,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Custom Coercion

The library provides intelligent coercion:

```typescript
// Boolean coercion handles various truthy/falsy values
const boolSchema = generator.generate('isActive')
boolSchema.parse('true') // → true
boolSchema.parse('false') // → false
boolSchema.parse('1') // → true
boolSchema.parse('0') // → false
boolSchema.parse(1) // → true
boolSchema.parse(0) // → false

// Date coercion
const dateSchema = generator.generate('birthDate')
dateSchema.parse('2023-01-01') // → Date object
dateSchema.parse(1672531200000) // → Date object from timestamp

// Number coercion
const numSchema = generator.generate('age')
numSchema.parse('25') // → 25 (number)
numSchema.parse('25.5') // → 25.5 (number)
```

## API Reference

### DocGenerator Class

#### Constructor

```typescript
new DocGenerator(schemas?: DocSchemaType[])
```

#### Methods

- `generate(schemaName: string): z.ZodTypeAny` - Generate Zod schema
- `generateCollectionSchema(collectionName: string): z.ZodObject<any>` - Generate collection schema with metadata
- `registerSchema(schema: DocSchemaType, fullName?: string): void` - Register schema
- `registerCollection(collection: CollectionSchemaType): void` - Register collection
- `extractDefaults(schemaName: string): any` - Extract default values
- `getCollection(collectionName: string): CollectionSchemaType | undefined` - Get collection definition
- `clearCache(): void` - Clear generated schema cache

### Schema Creation Functions

- `createStringSchema(config: Omit<StringDocSchemaType, 'type'>)`
- `createNumberSchema(config: Omit<NumberDocSchemaType, 'type'>)`
- `createBooleanSchema(config: Omit<BooleanDocSchemaType, 'type'>)`
- `createDateSchema(config: Omit<DateDocSchemaType, 'type'>)`
- `createArraySchema(config: Omit<ArrayDocSchemaType, 'type'>)`
- `createObjectSchema(config: Omit<ObjectDocSchemaType, 'type'>)`
- `createEnumSchema(config: Omit<EnumDocSchemaType, 'type'>)`
- `createReferenceSchema(config: Omit<ReferenceDocSchemaType, 'type'>)`
- `createCollection(config: CollectionSchemaType)`

## Validation Features

### String Validation
- `min`, `max`, `length` constraints
- `regex` pattern matching
- `email`, `url`, `uuid`, `phone`, `password` format validation
- `trim` whitespace trimming

### Number Validation
- `min`, `max` range constraints
- `int` for integers only
- `positive`, `nonnegative` constraints
- `multipleOf` for divisible values

### Boolean Validation
- `isTrue`, `isFalse` specific value requirements
- Intelligent string-to-boolean coercion

### Date Validation
- `min`, `max` date range constraints
- `past`, `future` relative date constraints
- String and timestamp coercion

### Array Validation
- `min`, `max`, `length` constraints
- `unique` for unique values only
- Nested schema validation for items

### Object Validation
- `strict` mode (no extra properties)
- `passthrough` mode (allow extra properties)
- `unknownKeys` handling ('allow', 'deny', 'strip')
- Nested property validation

### Enum Validation
- Predefined value validation
- Case insensitive option

## Modifiers

- `coerce: boolean` - Enable type coercion
- `nullable: boolean` - Allow null values
- `optional: boolean` - Make field optional
- `noempty: boolean` - Disallow empty values
- `default: any` - Default value
- `hidden: boolean` - Hidden field
- `readonly: boolean` - Readonly field

## Error Handling

The generator produces Zod schemas that throw detailed validation errors:

```typescript
try {
  schema.parse(invalidData)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors)
    // [
    //   {
    //     "code": "too_small",
    //     "minimum": 2,
    //     "type": "string",
    //     "inclusive": true,
    //     "message": "String must contain at least 2 character(s)",
    //     "path": ["name"]
    //   }
    // ]
  }
}
```

## Database Integration

### Collection Metadata
- `timestamps: boolean` - Adds createdAt, updatedAt fields
- `softDelete: boolean` - Adds deletedAt field
- `indexes: string[]` - Field indexes
- `validation.strict: boolean` - Strict mode validation

### Example Database Schema

```typescript
const studentSchema = createObjectSchema({
  name: 'student',
  label: 'Student',
  properties: [
    createStringSchema({
      name: 'nisn',
      label: 'NISN',
      validation: { length: 10, regex: '^\\d+$' }
    }),
    createStringSchema({
      name: 'name',
      label: 'Full Name',
      validation: { min: 2, max: 100 }
    }),
    createDateSchema({
      name: 'birthDate',
      label: 'Birth Date',
      validation: { max: new Date() }
    })
  ]
})

const studentCollection = createCollection({
  name: 'students',
  label: 'Students',
  fields: studentSchema.properties,
  timestamps: true,
  softDelete: true,
  validation: { strict: true }
})

// Register and use
generator.registerCollection(studentCollection)
const studentDocSchema = generator.generateCollectionSchema('students')
```

## Testing

Run tests with:

```bash
npm test
```

The test suite includes comprehensive coverage for:
- Basic schema generation
- Type inference and coercion
- Validation rules
- Nested structures
- Default values extraction
- Error messages
- Collection metadata

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for your changes
4. Submit a pull request
5. Ensure all tests pass

## License

MIT License - see LICENSE file for details
