// File: src/types/database/utils.ts
import { ModelAcademicYear, ModelBaseEntity, ModelStudent, ModelTeacher } from './model'

// ==================== TYPE GUARDS & UTILITIES ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FnGuard<T> = (entity: any) => entity is T

export const isStudent: FnGuard<ModelStudent> = (entity): entity is ModelStudent => {
  return entity && 'nisn' in entity && 'currentClassId' in entity
}

export const isTeacher: FnGuard<ModelTeacher> = (entity): entity is ModelTeacher => {
  return entity && 'nip' in entity && 'subjects' in entity
}

export const isAcademicYear: FnGuard<ModelAcademicYear> = (entity): entity is ModelAcademicYear => {
  return entity && 'year' in entity && 'semester' in entity
}

// Utility types for CRUD operations
export type CreateDTO<T> = Omit<T, keyof ModelBaseEntity | 'id'>
export type UpdateDTO<T> = Partial<Omit<T, keyof ModelBaseEntity>>
export type PartialWithId<T> = Partial<T> & { id: string }
