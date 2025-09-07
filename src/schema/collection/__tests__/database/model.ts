// File: src/types/database/model.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RecordAny = Record<string, any>
import {
  EnumAcademicYearStatus,
  EnumAttendanceSessions,
  EnumAttendanceStatuses,
  EnumBackupStatuses,
  EnumBackupTypes,
  EnumBloodType,
  EnumClassAcademicStatuses,
  EnumClassStatus,
  EnumCurriculumStatus,
  EnumDays,
  EnumDisability,
  EnumFileTypes,
  EnumGender,
  EnumGradeTypes,
  EnumLanguages,
  EnumMessageCategories,
  EnumPriorityLevels,
  EnumPromotionHistoryStatuses,
  EnumReceiverTypes,
  EnumReligion,
  EnumSemester,
  EnumStudentPromotions,
  EnumStudentStatuses,
  EnumSubjectCategories,
  EnumSubjectDifficulties,
  EnumSubjectGradeTypes,
  EnumSubjectStatuses,
  EnumSystemStatusDatabase,
  EnumTeacherAssignmentRoles,
  EnumTeacherAssignmentStatuses,
  EnumTeacherStatuses,
  EnumThemes,
  EnumUserRoles
} from './const'

// ==================== BASE ENTITY ====================

export interface ModelBaseEntity {
  _id: string
  _createdAt: Date
  _updatedAt: Date
  _createdBy?: string
  _updatedBy?: string
}

// ==================== UTILITY TYPES ====================

export interface MinMax {
  min: number
  max: number
}

export interface Address {
  street: string
  city: string
  province: string
  postalCode: string
  country?: string
}

export interface ContactInfo {
  phone: string
  email: string
  emergencyPhone?: string
  emergencyContact?: string
}

export interface FileAttachment {
  name: string
  url: string
  type: EnumFileTypes
  size: number
  uploadedAt: Date
}

// ==================== ACADEMIC YEAR & HISTORICAL DATA ====================

export interface ModelAcademicYear extends ModelBaseEntity {
  year: string // Format: "2024/2025"
  startDate: Date
  endDate: Date
  isActive: boolean
  semester: EnumSemester
  status: EnumAcademicYearStatus
  notes?: string
  totalStudents?: number
  totalTeachers?: number
  totalClasses?: number
}

export interface ModelStudentAcademicRecord extends ModelBaseEntity {
  studentId: string
  academicYear: string
  classId: string
  className: string
  semester: EnumSemester
  status: EnumStudentStatuses
  finalGrades?: ModelSubjectGrade[]
  attendanceSummary?: ModelAttendanceSummary
  promotionStatus: EnumStudentPromotions
  notes?: string
  finalGPA?: number
  totalCredits?: number
  rankInClass?: number
  behaviorScore?: number
}

export interface ModelSubjectGrade {
  subjectId: string
  subjectCode: string
  subjectName: string
  teacherId: string
  teacherName: string
  dailyScore: number
  quizScore: number
  assignmentScore: number
  midtermScore: number
  finalScore: number
  projectScore: number
  totalScore: number
  grade: EnumSubjectGradeTypes
  weight: number
  credits: number
  semester: EnumSemester
}

export interface ModelAttendanceSummary {
  totalSessions: number
  present: number
  absent: number
  late: number
  excused: number
  sick: number
  attendanceRate: number
  byMonth?: { month: string; rate: number }[]
  bySubject?: { subject: string; rate: number }[]
}

export interface ModelClassAcademic extends ModelBaseEntity {
  classId: string
  className: string
  academicYear: string
  teacherId: string
  teacherName: string
  studentCount: number
  averageGrade: number
  attendanceRate: number
  subjects: string[]
  capacity: number
  status: EnumClassAcademicStatuses
  rankInGrade?: number
  topStudents?: string[]
}

export interface ModelTeacherAssignment extends ModelBaseEntity {
  teacherId: string
  teacherName: string
  academicYear: string
  subjects: string[]
  subjectNames: string[]
  classes: string[]
  classNames: string[]
  role: EnumTeacherAssignmentRoles
  homeroomClassId?: string
  homeroomClassName?: string
  teachingHours: number
  status: EnumTeacherAssignmentStatuses
  workloadPercentage: number
}

export interface ModelCurriculumVersion extends ModelBaseEntity {
  academicYear: string
  version: string
  name: string
  subjects: ModelCurriculumSubject[]
  description?: string
  status: EnumCurriculumStatus
  totalCredits: number
  totalSubjects: number
}

export interface ModelCurriculumSubject {
  subjectId: string
  subjectCode: string
  name: string
  credits: number
  category: EnumSubjectCategories
  difficulty: EnumSubjectDifficulties
  prerequisites?: string[]
  semester: EnumSemester
  hoursPerWeek: number
  learningObjectives?: string[]
  materials?: string[]
}

export interface ModelPromotionHistory extends ModelBaseEntity {
  studentId: string
  studentName: string
  fromAcademicYear: string
  toAcademicYear: string
  fromClass: string
  fromClassName: string
  toClass: string
  toClassName: string
  promotionDate: Date
  status: EnumPromotionHistoryStatuses
  notes?: string
  finalGPA: number
  attendanceRate: number
  recommendation?: string
}

// ==================== MAIN ENTITIES ====================

export interface ModelStudent extends ModelBaseEntity {
  nisn: string
  name: string
  email: string
  phone?: string
  address?: string
  detailedAddress?: Address
  dateOfBirth: Date
  gender: EnumGender
  currentClassId: string
  currentClassName: string
  currentAcademicYear: string
  status: EnumStudentStatuses
  photo?: string
  parentInfo?: {
    fatherName?: string
    motherName?: string
    parentPhone?: string
    parentEmail?: string
    parentOccupation?: string
  }
  enrollmentDate: Date
  religion?: EnumReligion
  bloodType?: EnumBloodType
  disabilities?: EnumDisability[]
  medicalConditions?: string[]
  notes?: string
  academicRecords?: ModelStudentAcademicRecord[]
  emergencyContact?: ContactInfo
  previousSchools?: {
    name: string
    level: string
    year: string
  }[]
}

export interface ModelTeacher extends ModelBaseEntity {
  nip: string
  name: string
  email: string
  phone?: string
  address?: string
  detailedAddress?: Address
  dateOfBirth: Date
  gender: EnumGender
  subjects: string[]
  subjectNames: string[]
  status: EnumTeacherStatuses
  photo?: string
  education?: {
    degree: string
    major: string
    university: string
    year: number
  }[]
  certifications?: string[]
  joinDate: Date
  emergencyContact?: ContactInfo
  currentAcademicYear: string
  currentAssignments?: ModelTeacherAssignment[]
  teachingExperience?: number
  specializedSubjects?: string[]
  officeHours?: string
  bio?: string
}

export interface ModelClass extends ModelBaseEntity {
  name: string
  grade: number
  section: string
  teacherId: string
  teacherName: string
  capacity: number
  currentStudents: number
  roomNumber?: string
  academicYear: string
  schedule?: ModelClassSchedule[]
  notes?: string
  status: EnumClassStatus
  facilities?: string[]
  colorCode?: string
  subjects?: string[]
}

export interface ModelClassSchedule {
  day: EnumDays
  startTime: string
  endTime: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  academicYear: string
  room?: string
  isActive: boolean
}

export interface ModelSubject extends ModelBaseEntity {
  name: string
  code: string
  description?: string
  credits: number
  teacherId?: string
  teacherName?: string
  category: EnumSubjectCategories
  difficulty: EnumSubjectDifficulties
  colorCode?: string
  prerequisites?: string[]
  academicYear: string
  curriculumVersion: string
  status: EnumSubjectStatuses
  learningMaterials?: number
  totalStudents?: number
  averageGrade?: number
  syllabus?: string
  objectives?: string[]
  evaluationCriteria?: string
}

export interface ModelGrade extends ModelBaseEntity {
  studentId: string
  studentName: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  classId: string
  className: string
  score: number
  semester: EnumSemester
  academicYear: string
  gradeType: EnumGradeTypes
  maximumScore: number
  weight: number
  comments?: string
  assignmentName?: string
  assessmentDate?: Date
  isFinalized: boolean
}

export interface ModelAttendance extends ModelBaseEntity {
  studentId: string
  studentName: string
  classId: string
  className: string
  subjectId: string
  subjectName: string
  date: Date
  status: EnumAttendanceStatuses
  notes?: string
  session: EnumAttendanceSessions
  teacherId: string
  teacherName: string
  academicYear: string
  semester: EnumSemester
  timeIn?: Date
  timeOut?: Date
  duration?: number
  verifiedBy?: string
}

export interface ModelSchedule extends ModelBaseEntity {
  classId: string
  className: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  day: EnumDays
  startTime: string
  endTime: string
  room?: string
  semester: EnumSemester
  academicYear: string
  isActive: boolean
  recurring: boolean
  exceptions?: Date[]
  maxStudents?: number
  currentStudents?: number
}

export interface ModelSettings extends ModelBaseEntity {
  schoolInfo: {
    name: string
    address: string
    detailedAddress: Address
    phone: string
    email: string
    website?: string
    logo?: string
    principalName: string
    vicePrincipalName?: string
    accreditation?: string
    establishedYear?: number
  }
  academicSettings: {
    currentAcademicYear: string
    currentSemester: EnumSemester
    gradeScale: Record<EnumSubjectGradeTypes, MinMax>
    promotionCriteria: {
      minGrade: number
      minAttendance: number
      maxFailures: number
    }
    termDates: {
      startDate: Date
      endDate: Date
      holidays: { name: string; date: Date }[]
    }
  }
  attendanceSettings: {
    lateThreshold: number
    absenceThreshold: number
    excusedAbsenceTypes: string[]
    autoMarkAbsent: boolean
    notificationEnabled: boolean
  }
  systemSettings: {
    language: EnumLanguages
    theme: EnumThemes
    autoBackup: boolean
    backupInterval: number
    backupRetention: number
    dataRetention: number
    sessionTimeout: number
  }
  features: {
    enableMessaging: boolean
    enableAttendance: boolean
    enableGrading: boolean
    enableScheduling: boolean
    enableReports: boolean
    enableBackup: boolean
    enableNotifications: boolean
  }
  notificationSettings: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    gradeAlerts: boolean
    attendanceAlerts: boolean
    messageAlerts: boolean
  }
}

export interface ModelMessage extends ModelBaseEntity {
  senderId: string
  senderName: string
  senderType: EnumUserRoles
  receiverId: string
  receiverName: string
  receiverType: EnumReceiverTypes
  title: string
  content: string
  isRead: boolean
  priority: EnumPriorityLevels
  attachments?: FileAttachment[]
  category: EnumMessageCategories
  expiryDate?: Date
  actionRequired: boolean
  actionTaken?: boolean
  relatedEntity?: {
    type: string
    id: string
  }
}

export interface ModelUser extends ModelBaseEntity {
  username: string
  email: string
  passwordHash: string
  role: EnumUserRoles
  profileId: string
  profileName: string
  isActive: boolean
  lastLogin?: Date
  lastActivity?: Date
  permissions: string[]
  preferences?: {
    language: EnumLanguages
    theme: EnumThemes
    notifications: boolean
    emailUpdates: boolean
  }
  loginAttempts: number
  lockedUntil?: Date
  mustChangePassword: boolean
  passwordChangedAt?: Date
}

export interface ModelLearningMaterial extends ModelBaseEntity {
  title: string
  description?: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  classIds: string[]
  classNames: string[]
  fileUrl: string
  fileType: EnumFileTypes
  fileSize: number
  isPublic: boolean
  tags: string[]
  downloadCount: number
  viewCount: number
  rating?: number
  reviews?: number
  version: string
  prerequisites?: string[]
  learningObjectives?: string[]
  duration?: number
  difficulty?: EnumSubjectDifficulties
  thumbnail?: string
}

// ==================== DATABASE SCHEMA ====================

export interface ModelDatabaseSchema extends ModelSettings {
  // Data Master
  students: ModelStudent[]
  teachers: ModelTeacher[]
  classes: ModelClass[]
  subjects: ModelSubject[]
  users: ModelUser[]
  academicYears: ModelAcademicYear[]
  // System Data
  auditLogs: ModelAuditLog[]
  backups: ModelBackup[]

  // Transactional Data
  schedules: ModelSchedule[]
  grades: ModelGrade[]
  attendance: ModelAttendance[]
  messages: ModelMessage[]
  learningMaterials: ModelLearningMaterial[]

  // Academic Year & Historical Data
  studentAcademicRecords: ModelStudentAcademicRecord[]
  classAcademics: ModelClassAcademic[]
  teacherAssignments: ModelTeacherAssignment[]
  curriculumVersions: ModelCurriculumVersion[]
  promotionHistories: ModelPromotionHistory[]
}

// ==================== ADDITIONAL SYSTEM MODELS ====================

export interface ModelAuditLog extends ModelBaseEntity {
  action: string
  entity: string
  entityId: string
  userId: string
  userName: string
  userRole: EnumUserRoles
  changes: RecordAny
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

export interface ModelBackup extends ModelBaseEntity {
  filename: string
  path: string
  size: number
  type: EnumBackupTypes
  entities: string[]
  status: EnumBackupStatuses
  error?: string
  checksum?: string
  retentionDate: Date
}

// Response types for specific operations
export interface LoginResponse {
  user: ModelUser
  token: string
  refreshToken: string
  expiresIn: number
}

export interface BackupResponse {
  backup: ModelBackup
  downloadUrl?: string
  size: number
  entityCount: number
}

export interface ImportResult {
  success: number
  failed: number
  errors: string[]
  warnings: string[]
}

export interface SystemStatus {
  database: EnumSystemStatusDatabase
  storage: {
    total: number
    used: number
    free: number
  }
  memory: {
    total: number
    used: number
    free: number
  }
  lastBackup?: Date
  uptime: number
  version: string
}
