# Database Component Documentation

## 📁 Overview

The `database` component is a comprehensive database management system for Zhidesk that provides a user-friendly interface for managing databases, tables, and records. It features a sidebar navigation, table structure visualization, data browsing, and AI-powered table generation.

## 🏗️ Component Structure

```
src/renderer/components/database/
├── _default.tsx          # Default landing page when no table is selected
├── _layout.tsx          # Main layout wrapper with header and navigation
├── _root.tsx           # Root component with dialog management
├── client.ts           # Database client utilities and schema management
├── const.ts            # Field type definitions and icons
├── dialog.tsx          # Modal dialog management for forms
├── field.editor.tsx    # Field editor component for table schema
├── field.form.tsx      # Form component for record creation/editing
├── manajer.tsx         # Database initialization and management
├── router.tsx          # React Router configuration
├── sidebar.tsx         # Database sidebar navigation
├── store.ts            # Zustand state management
├── table.ai.tsx        # AI-powered table generation
├── table.data.tsx      # Data table display component
├── table.filters.tsx   # Filter management component
├── table.form.tsx      # Table creation form
├── table.structure.tsx # Table structure visualization
├── table.tsx           # Main table component
├── types.ts            # TypeScript type definitions
└── README.md           # This documentation file
```

## 🎯 Key Features

### 1. Database Management

- **Multi-database support**: Switch between different databases
- **Table navigation**: Browse tables with search functionality
- **Schema visualization**: View table structures and relationships

### 2. Data Operations

- **CRUD operations**: Create, read, update, and delete records
- **Advanced filtering**: Complex query building with multiple conditions
- **Pagination**: Efficient data browsing with pagination controls
- **Sorting**: Column-based sorting in both directions

### 3. AI Integration

- **AI Table Generation**: Generate table schemas using natural language descriptions
- **Google Gemini Integration**: Powered by Google's AI for schema generation
- **Smart suggestions**: AI-powered field recommendations

### 4. Schema Management

- **Flexible field types**: Support for string, number, boolean, date, enum, reference, array, and object fields
- **Validation rules**: Comprehensive validation system with Zod schemas
- **Relationship management**: Reference fields for table relationships

## 🛠️ Technical Implementation

### State Management

Uses Zustand for global state management with the following store structure:

```typescript
interface DatabaseStore {
  ready: boolean
  error: null | { message: string; type: DatabaseErrorType }
  databaseId: string
  tableName: string
  tableSchema: null | Table
  modal: { open: boolean; type: DatabaseModalType } & DatabaseStoreModalGen
  searchTable: string
  sidebar: boolean
  query: { show: boolean; filters: FilterCondition[] }
  pagination: Record<'limit' | 'skip', number>
  sort: Record<string, 'asc' | 'desc' | undefined>
}
```

### Data Flow

1. **Initialization**: Database is initialized via `DatabaseManajer`
2. **Schema Loading**: Table schemas are loaded and cached using `DatabaseClient`
3. **Data Fetching**: Data is queried using TanStack Query with ORPC
4. **UI Rendering**: Components render based on the current state and data

### Performance Optimizations

- **Debounced search**: 500ms debounce on table search
- **Efficient queries**: Optimized database operations with O(1) lookups
- **Memoized components**: React.memo and useMemo for performance
- **Virtual scrolling**: For large data sets

## 🎨 UI Components

### Sidebar (`sidebar.tsx`)

- Database selection dropdown
- Table search and filtering
- Table list with context menus
- Quick actions (create table, refresh)

### Data Table (`table.data.tsx`)

- Responsive table layout
- Type-specific cell rendering
- Checkbox selection
- Timestamp display

### Forms (`field.form.tsx`, `table.form.tsx`)

- Dynamic form generation based on schema
- Field-type specific inputs
- Validation and error handling
- Array and object field support

## 🔌 Integration Points

### ORPC Communication

Uses ORPC for type-safe communication between renderer and main processes:

```typescript
// Example ORPC calls
const { data } = useQuery(database.table.getAll.queryOptions({ enabled }))
const mutation = useMutation(database.document.create.mutationOptions())
```

### Routing

Integrated with React Router with the following routes:

- `/database` - Default landing page
- `/database/:databaseId` - Database-specific view
- `/database/:databaseId/:tableName` - Table data view
- `/database/:databaseId/:tableName/structure` - Table structure view

## 🚀 Usage Examples

### Creating a Table Programmatically

```typescript
const tableConfig = {
  name: 'users',
  label: 'Users',
  fields: [
    {
      name: 'email',
      label: 'Email Address',
      type: 'string',
      required: true,
      unique: true,
      validation: { format: 'email' }
    },
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      validation: { min: 0, max: 120 }
    }
  ],
  timestamps: true
}

await database.table.create.mutateAsync({
  databaseId: 'my-app',
  tableConfig
})
```

### Querying Data

```typescript
// Find documents with filters
const { data } = useQuery(
  database.document.find.queryOptions({
    input: {
      databaseId: 'my-app',
      tableName: 'users',
      query: { age: { $gt: 18 } },
      options: { limit: 10, skip: 0 }
    }
  })
)

// Count documents
const count = useQuery(
  database.document.count.queryOptions({
    input: { databaseId: 'my-app', tableName: 'users', query: { active: true } }
  })
)
```

## 🔧 Development

### Adding New Field Types

1. **Define the schema** in `types.ts`
2. **Add field type configuration** in `const.ts`
3. **Create input component** in `field.form.tsx`
4. **Add rendering logic** in `table.data.tsx`

### Customizing Validation

Validation rules are defined using Zod schemas in `types.ts`. Each field type has its own validation configuration.

### Styling

Components use Tailwind CSS with custom styles from the UI library. The design follows the ChadcnUI component system.

## 📊 Performance Considerations

- Large datasets should use pagination with reasonable limits
- Complex queries should be optimized with indexes
- Array and object fields have higher rendering overhead
- Virtual scrolling is recommended for tables with 1000+ rows

## 🔮 Future Enhancements

- Real-time data synchronization
- Advanced aggregation pipelines
- Export/import functionality
- Relationship visualization
- Bulk operations
- Data validation rules UI
- Custom query builder

## 📝 License

Part of the Zhidesk project - MIT License.
