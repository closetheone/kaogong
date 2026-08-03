import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PracticeRecord } from '@/types'

interface PracticeState {
  records: PracticeRecord[]
  currentSession: {
    category: string
    answers: Record<string, string> // questionId -> userAnswer
  } | null
  // actions
  startSession: (category: string) => void
  answerQuestion: (questionId: string, answer: string) => void
  addRecord: (record: PracticeRecord) => void
  clearSession: () => void
  getAccuracy: () => number
  getWrongIds: () => string[]
  resetAll: () => void
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      records: [],
      currentSession: null,

      startSession: (category: string) =>
        set({ currentSession: { category, answers: {} } }),

      answerQuestion: (questionId, answer) => {
        const { currentSession } = get()
        if (!currentSession) return
        set({
          currentSession: {
            ...currentSession,
            answers: { ...currentSession.answers, [questionId]: answer },
          },
        })
      },

      addRecord: (record) =>
        set((state) => ({ records: [...state.records, record] })),

      clearSession: () => set({ currentSession: null }),

      getAccuracy: () => {
        const { records } = get()
        if (records.length === 0) return 0
        const correct = records.filter((r) => r.isCorrect).length
        return Math.round((correct / records.length) * 100)
      },

      getWrongIds: () => {
        const { records } = get()
        return [...new Set(records.filter((r) => !r.isCorrect).map((r) => r.questionId))]
      },

      resetAll: () => set({ records: [], currentSession: null }),
    }),
    { name: 'kaogong-practice' },
  ),
)
