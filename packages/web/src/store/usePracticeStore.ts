import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { practiceApi } from '@/utils/request'

interface PracticeState {
  records: LocalRecord[]
  currentSession: {
    category: string
    answers: Record<string, string>
  } | null
  serverOnline: boolean // 后端是否可用
  // actions
  startSession: (category: string) => void
  answerQuestion: (questionId: string, answer: string) => void
  submitAnswer: (
    userId: string,
    questionId: string,
    userAnswer: string,
  ) => Promise<{ isCorrect: boolean; correctAnswer: string } | null>
  addRecord: (record: LocalRecord) => void
  clearSession: () => void
  getAccuracy: () => number
  getWrongIds: () => string[]
  resetAll: () => void
}

interface LocalRecord {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent: number
  answeredAt: string
  category?: string
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      records: [],
      currentSession: null,
      serverOnline: true,

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

      submitAnswer: async (userId, questionId, userAnswer) => {
        const isLocal = userId.startsWith('local_')
        let result: { isCorrect: boolean; correctAnswer: string } | null = null

        if (!isLocal && get().serverOnline) {
          try {
            result = await practiceApi.submit(userId, {
              questionId,
              userAnswer,
              timeSpent: 0,
            })
            set({ serverOnline: true })
          } catch (e) {
            // 后端不可用，降级为本地
            set({ serverOnline: false })
          }
        }

        // 本地也记录一份（无论后端是否成功）
        const record: LocalRecord = {
          questionId,
          userAnswer,
          isCorrect: result ? result.isCorrect : false, // 后端没返回时等本地判断
          timeSpent: 0,
          answeredAt: new Date().toISOString(),
        }

        set((s) => ({
          records: [...s.records, record],
        }))

        return result
      },

      addRecord: (record: LocalRecord) => {
        // 兼容旧代码直接调用
        set((s) => ({ records: [...s.records, record] }))
      },

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
