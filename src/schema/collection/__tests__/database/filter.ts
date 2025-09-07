// File: src/types/database/filter.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RecordAny = Record<string, any>
import {
  EnumAcademicYearStatus,
  EnumAttendanceStatuses,
  EnumClassStatus,
  EnumCurriculumStatus,
  EnumGender,
  EnumGradeTypes,
  EnumLanguages,
  EnumMessageCategories,
  EnumPriorityLevels,
  EnumPromotionHistoryStatuses,
  EnumReceiverTypes,
  EnumSemester,
  EnumStudentPromotions,
  EnumStudentStatuses,
  EnumSubjectCategories,
  EnumSubjectDifficulties,
  EnumSubjectStatuses,
  EnumTeacherAssignmentRoles,
  EnumTeacherAssignmentStatuses,
  EnumTeacherStatuses,
  EnumThemes,
  EnumUserRoles
} from './const'
import { ModelSettings } from './model'

// ==================== PAGINATION & SORTING ====================

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRangeFilter {
  startDate?: Date
  endDate?: Date
  dateFrom?: Date
  dateTo?: Date
}

// ==================== FILTER INTERFACES ====================

export interface FilterStudent {
  status?: EnumStudentStatuses
  classId?: string
  gender?: EnumGender
  search?: string
  academicYear?: string
  semester?: EnumSemester
  promotionStatus?: EnumStudentPromotions
  religion?: string
  bloodType?: string
  hasDisabilities?: boolean
}

export interface FilterTeacher {
  status?: EnumTeacherStatuses
  subjects?: string[]
  role?: EnumTeacherAssignmentRoles
  assignmentStatus?: EnumTeacherAssignmentStatuses
  search?: string
  gender?: EnumGender
  education?: string
}

export interface FilterClass {
  grade?: number
  section?: string
  teacherId?: string
  academicYear?: string
  status?: EnumClassStatus
  roomNumber?: string
  minCapacity?: number
  maxCapacity?: number
}

export interface FilterSubject {
  category?: EnumSubjectCategories
  difficulty?: EnumSubjectDifficulties
  status?: EnumSubjectStatuses
  teacherId?: string
  academicYear?: string
  curriculumVersion?: string
  search?: string
  credits?: number
}

export interface FilterGrade {
  studentId?: string
  subjectId?: string
  classId?: string
  semester?: EnumSemester
  academicYear?: string
  gradeType?: EnumGradeTypes
  minScore?: number
  maxScore?: number
  teacherId?: string
}

export interface FilterAttendance {
  studentId?: string
  classId?: string
  subjectId?: string
  dateFrom?: Date
  dateTo?: Date
  status?: EnumAttendanceStatuses
  session?: string
  teacherId?: string
  academicYear?: string
  semester?: EnumSemester
}

export interface FilterAcademicYear {
  status?: EnumAcademicYearStatus
  year?: string
  semester?: EnumSemester
  isActive?: boolean
}

export interface FilterAcademicRecord {
  studentId?: string
  academicYear?: string
  semester?: EnumSemester
  status?: EnumStudentStatuses
  classId?: string
  promotionStatus?: EnumStudentPromotions
}

export interface FilterTeacherAssignment {
  teacherId?: string
  academicYear?: string
  role?: EnumTeacherAssignmentRoles
  status?: EnumTeacherAssignmentStatuses
  subjectId?: string
  classId?: string
}

export interface FilterCurriculum {
  academicYear?: string
  version?: string
  status?: EnumCurriculumStatus
  subjectId?: string
  category?: EnumSubjectCategories
}

export interface FilterPromotion {
  studentId?: string
  fromAcademicYear?: string
  toAcademicYear?: string
  status?: EnumPromotionHistoryStatuses
  fromClass?: string
  toClass?: string
}

export interface FilterMessage {
  senderId?: string
  receiverId?: string
  receiverType?: EnumReceiverTypes
  priority?: EnumPriorityLevels
  category?: EnumMessageCategories
  isRead?: boolean
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface FilterLearningMaterial {
  subjectId?: string
  teacherId?: string
  classId?: string
  fileType?: string
  isPublic?: boolean
  tags?: string[]
  search?: string
  academicYear?: string
}

export interface FilterUser {
  role?: EnumUserRoles
  isActive?: boolean
  search?: string
  lastLoginFrom?: Date
  lastLoginTo?: Date
}

export interface FilterSettings {
  language?: EnumLanguages
  theme?: EnumThemes
  feature?: keyof ModelSettings['features']
}

// ==================== RESPONSE TYPES ====================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters?: RecordAny
}

export interface StatsResponse {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  activeStudents: number
  inactiveStudents: number
  graduatedStudents: number
  attendanceRate: number
  averageGrades: number
  currentAcademicYear: string
  semester: EnumSemester
  byGrade?: { grade: number; count: number }[]
  bySubject?: { subject: string; average: number }[]
}

export interface AcademicStatsResponse {
  academicYear: string
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  averageGrade: number
  averageAttendance: number
  promotionRate: number
  retentionRate: number
  topPerformingClasses: { class: string; averageGrade: number }[]
  subjectPerformance: { subject: string; averageScore: number; passRate: number }[]
}

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf'
  includeFields?: string[]
  excludeFields?: string[]
  filters?: RecordAny
  fileName?: string
}

// ==================== SEARCH OPTIONS ====================

export interface SearchOptions {
  query: string
  fields: string[]
  fuzzy?: boolean
  caseSensitive?: boolean
}

// ==================== AGGREGATION TYPES ====================

export interface AggregationResult {
  key: string
  count: number
  percentage: number
}

export interface DateAggregation {
  date: string
  count: number
}

export interface GradeDistribution {
  grade: string
  count: number
  percentage: number
}

export interface AttendanceSummary {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  sick: number
  rate: number
}
