// File: src/renderer/src/stores/form-builder.store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
// import { FormConfig } from '@types/form'
type FormConfig = {
  title: string
}

interface FormBuilderState {
  currentForm: FormConfig | null
  forms: FormConfig[]
  selectedField: string | null
  previewMode: boolean

  // Actions
  setCurrentForm: (form: FormConfig | null) => void
  setForms: (forms: FormConfig[]) => void
  addForm: (form: FormConfig) => void
  updateForm: (id: string, updates: Partial<FormConfig>) => void
  deleteForm: (id: string) => void
  setSelectedField: (fieldId: string | null) => void
  setPreviewMode: (preview: boolean) => void
}

export const useFormBuilderStore = create<FormBuilderState>()(
  devtools(
    (set) => ({
      // Initial state
      currentForm: null,
      forms: [],
      selectedField: null,
      previewMode: false,

      // Actions
      setCurrentForm: (form) => set({ currentForm: form }),
      setForms: (forms) => set({ forms }),
      addForm: (form) => set((state) => ({ forms: [...state.forms, form] })),
      updateForm: (id, updates) =>
        set((state) => ({
          forms: state.forms.map((form) => (form.title === id ? { ...form, ...updates } : form)),
          currentForm:
            state.currentForm?.title === id
              ? { ...state.currentForm, ...updates }
              : state.currentForm
        })),
      deleteForm: (id) =>
        set((state) => ({
          forms: state.forms.filter((form) => form.title !== id),
          currentForm: state.currentForm?.title === id ? null : state.currentForm
        })),
      setSelectedField: (fieldId) => set({ selectedField: fieldId }),
      setPreviewMode: (preview) => set({ previewMode: preview })
    }),
    {
      name: 'form-builder-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)
