// File: src/types/database/const.ts

// ==================== STATUS & ENUM CONSTANTS ====================

export const EnumAcademicYearStatus = ['planning', 'active', 'completed', 'archived'] as const
export type EnumAcademicYearStatus = (typeof EnumAcademicYearStatus)[number]

export const EnumStudentStatuses = ['active', 'inactive', 'graduated', 'transferred'] as const
export type EnumStudentStatuses = (typeof EnumStudentStatuses)[number]

export const EnumStudentPromotions = ['promoted', 'retained', 'pending'] as const
export type EnumStudentPromotions = (typeof EnumStudentPromotions)[number]

export const EnumSubjectGradeTypes = ['A', 'B', 'C', 'D', 'E'] as const
export type EnumSubjectGradeTypes = (typeof EnumSubjectGradeTypes)[number]

export const EnumClassAcademicStatuses = ['active', 'completed', 'archived'] as const
export type EnumClassAcademicStatuses = (typeof EnumClassAcademicStatuses)[number]

export const EnumTeacherAssignmentRoles = [
  'teacher',
  'homeroom',
  'coordinator',
  'principal'
] as const
export type EnumTeacherAssignmentRoles = (typeof EnumTeacherAssignmentRoles)[number]

export const EnumTeacherAssignmentStatuses = ['active', 'inactive'] as const
export type EnumTeacherAssignmentStatuses = (typeof EnumTeacherAssignmentStatuses)[number]

export const EnumTeacherStatuses = ['active', 'inactive', 'retired'] as const
export type EnumTeacherStatuses = (typeof EnumTeacherStatuses)[number]

export const EnumSubjectCategories = [
  'wajib',
  'peminatan',
  'muatan_lokal',
  'ekstrakurikuler'
] as const
export type EnumSubjectCategories = (typeof EnumSubjectCategories)[number]

export const EnumSubjectStatuses = ['active', 'inactive'] as const
export type EnumSubjectStatuses = (typeof EnumSubjectStatuses)[number]

export const EnumSubjectDifficulties = ['easy', 'medium', 'hard'] as const
export type EnumSubjectDifficulties = (typeof EnumSubjectDifficulties)[number]

export const EnumPromotionHistoryStatuses = ['promoted', 'retained', 'transferred'] as const
export type EnumPromotionHistoryStatuses = (typeof EnumPromotionHistoryStatuses)[number]

export const EnumGender = ['male', 'female', 'other'] as const
export type EnumGender = (typeof EnumGender)[number]

export const EnumReligion = [
  'islam',
  'kristen',
  'katolik',
  'hindu',
  'buddha',
  'konghucu',
  'other'
] as const
export type EnumReligion = (typeof EnumReligion)[number]

export const EnumBloodType = ['A', 'B', 'AB', 'O', 'unknown'] as const
export type EnumBloodType = (typeof EnumBloodType)[number]

export const EnumDisability = [
  'none',
  'visual',
  'hearing',
  'mobility',
  'learning',
  'other'
] as const
export type EnumDisability = (typeof EnumDisability)[number]

export const EnumDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
] as const
export type EnumDays = (typeof EnumDays)[number]

export const EnumGradeTypes = [
  'daily',
  'quiz',
  'assignment',
  'midterm',
  'final',
  'project'
] as const
export type EnumGradeTypes = (typeof EnumGradeTypes)[number]

export const EnumAttendanceStatuses = ['present', 'absent', 'late', 'excused', 'sick'] as const
export type EnumAttendanceStatuses = (typeof EnumAttendanceStatuses)[number]

export const EnumAttendanceSessions = ['morning', 'afternoon', 'full_day'] as const
export type EnumAttendanceSessions = (typeof EnumAttendanceSessions)[number]

export const EnumSemester = [1, 2] as const
export type EnumSemester = (typeof EnumSemester)[number]

export const EnumLanguages = ['id', 'en'] as const
export type EnumLanguages = (typeof EnumLanguages)[number]

export const EnumThemes = ['light', 'dark', 'system'] as const
export type EnumThemes = (typeof EnumThemes)[number]

export const EnumUserRoles = ['admin', 'teacher', 'student'] as const
export type EnumUserRoles = (typeof EnumUserRoles)[number]

export const EnumPriorityLevels = ['low', 'medium', 'high'] as const
export type EnumPriorityLevels = (typeof EnumPriorityLevels)[number]

export const EnumMessageCategories = [
  'announcement',
  'notification',
  'personal',
  'reminder'
] as const
export type EnumMessageCategories = (typeof EnumMessageCategories)[number]

export const EnumReceiverTypes = [...EnumUserRoles, 'class', 'all'] as const
export type EnumReceiverTypes = (typeof EnumReceiverTypes)[number]

export const EnumFileTypes = ['pdf', 'doc', 'ppt', 'video', 'image', 'audio', 'link'] as const
export type EnumFileTypes = (typeof EnumFileTypes)[number]

export const EnumCurriculumStatus = ['draft', 'active', 'archived'] as const
export type EnumCurriculumStatus = (typeof EnumCurriculumStatus)[number]

export const EnumClassStatus = ['active', 'completed', 'archived'] as const
export type EnumClassStatus = (typeof EnumClassStatus)[number]

export const EnumBackupStatuses = ['completed', 'failed', 'in-progress'] as const
export type EnumBackupStatuses = (typeof EnumBackupStatuses)[number]

export const EnumBackupTypes = ['full', 'partial'] as const
export type EnumBackupTypes = (typeof EnumBackupTypes)[number]

export const EnumSystemStatusDatabase = ['connected', 'disconnected', 'error'] as const
export type EnumSystemStatusDatabase = (typeof EnumSystemStatusDatabase)[number]

// ==================== VALIDATION CONSTANTS ====================

export const ValidationConstants = {
  NISN_LENGTH: 10,
  NIP_LENGTH: 18,
  PHONE_MIN: 10,
  PHONE_MAX: 15,
  EMAIL_MAX: 255,
  NAME_MIN: 2,
  NAME_MAX: 100,
  PASSWORD_MIN: 8,
  ADDRESS_MAX: 500,
  NOTES_MAX: 1000,
  DESCRIPTION_MAX: 2000,
  CODE_MAX: 20,
  TITLE_MAX: 200,
  FILE_SIZE_LIMIT: 10 * 1024 * 1024, // 10MB
  MAX_CLASS_CAPACITY: 40,
  MIN_CLASS_CAPACITY: 10,
  MAX_TEACHING_HOURS: 40,
  MAX_SUBJECTS_PER_TEACHER: 5,
  MAX_CLASSES_PER_TEACHER: 3,
  MAX_STUDENTS_PER_CLASS: 40,
  MIN_GRADE_SCORE: 0,
  MAX_GRADE_SCORE: 100,
  MAX_ATTACHMENTS: 5,
  MAX_TAGS: 10,
  MAX_DISABILITIES: 5
} as const

// ==================== DEFAULT VALUES ====================

export const DefaultValues = {
  GRADE_WEIGHT: 1,
  MAXIMUM_SCORE: 100,
  BACKUP_INTERVAL: 24,
  BACKUP_RETENTION: 30,
  LATE_THRESHOLD: 15,
  ABSENCE_THRESHOLD: 25,
  ATTENDANCE_RATE_THRESHOLD: 75,
  PROMOTION_GRADE_THRESHOLD: 75,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  DEFAULT_SORT_BY: 'createdAt',
  DEFAULT_SORT_ORDER: 'desc'
} as const

// ==================== ERROR MESSAGES ====================

export const ErrorMessages = {
  REQUIRED: 'Field wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PHONE: 'Format telepon tidak valid',
  INVALID_DATE: 'Format tanggal tidak valid',
  INVALID_NISN: 'NISN harus 10 digit',
  INVALID_NIP: 'NIP harus 18 digit',
  MIN_LENGTH: 'Minimal {min} karakter',
  MAX_LENGTH: 'Maksimal {max} karakter',
  MIN_VALUE: 'Nilai minimal {min}',
  MAX_VALUE: 'Nilai maksimal {max}',
  UNIQUE: 'Data sudah ada',
  NOT_FOUND: 'Data tidak ditemukan',
  UNAUTHORIZED: 'Tidak memiliki akses',
  INVALID_CREDENTIALS: 'Kredensial tidak valid',
  INVALID_FILE_TYPE: 'Tipe file tidak diizinkan',
  FILE_TOO_LARGE: 'File terlalu besar',
  DATABASE_ERROR: 'Terjadi kesalahan database',
  NETWORK_ERROR: 'Terjadi kesalahan jaringan'
} as const
