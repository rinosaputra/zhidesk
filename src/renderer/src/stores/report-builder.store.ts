// File: src/renderer/src/stores/report-builder.store.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
// import { PdfConfig } from '@types/pdf'
type PdfConfig = {
  title: string
}

interface ReportBuilderState {
  currentReport: PdfConfig | null
  reports: PdfConfig[]
  selectedSection: string | null
  generatedData: any[]

  // Actions
  setCurrentReport: (report: PdfConfig | null) => void
  setReports: (reports: PdfConfig[]) => void
  addReport: (report: PdfConfig) => void
  updateReport: (id: string, updates: Partial<PdfConfig>) => void
  deleteReport: (id: string) => void
  setSelectedSection: (sectionId: string | null) => void
  setGeneratedData: (data: any[]) => void
}

export const useReportBuilderStore = create<ReportBuilderState>()(
  devtools(
    (set) => ({
      // Initial state
      currentReport: null,
      reports: [],
      selectedSection: null,
      generatedData: [],

      // Actions
      setCurrentReport: (report) => set({ currentReport: report }),
      setReports: (reports) => set({ reports }),
      addReport: (report) => set((state) => ({ reports: [...state.reports, report] })),
      updateReport: (id, updates) =>
        set((state) => ({
          reports: state.reports.map((report) =>
            report.title === id ? { ...report, ...updates } : report
          ),
          currentReport:
            state.currentReport?.title === id
              ? { ...state.currentReport, ...updates }
              : state.currentReport
        })),
      deleteReport: (id) =>
        set((state) => ({
          reports: state.reports.filter((report) => report.title !== id),
          currentReport: state.currentReport?.title === id ? null : state.currentReport
        })),
      setSelectedSection: (sectionId) => set({ selectedSection: sectionId }),
      setGeneratedData: (data) => set({ generatedData: data })
    }),
    {
      name: 'report-builder-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)
