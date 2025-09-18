// File: src/schema/database/__tests__/test-utils.ts
import { DatabaseGenerator } from '../generator'

export const createTestGenerator = (): DatabaseGenerator => {
  return new DatabaseGenerator({
    name: 'test-db',
    version: 1,
    tables: []
  })
}

export const mockDate = new Date('2023-01-01T00:00:00.000Z')
