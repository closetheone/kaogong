import axios from 'axios'
import type { Question } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE || '/api'

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

// 统一响应格式 { code, message, data }
request.interceptors.response.use(
  (res) => {
    const { code, message, data } = res.data
    if (code === 0) return data
    return Promise.reject(new Error(message || '请求失败'))
  },
  (err) => {
    // 后端未启动时不抛错，让 fallback 处理
    return Promise.reject(err)
  },
)

// ============ API ============

// 用户
export const userApi = {
  guestLogin: (nickname?: string) =>
    request.post<any, any>('/user/guest', { nickname }),
  getById: (id: string) => request.get<any, any>(`/user/${id}`),
  update: (id: string, data: any) => request.put<any, any>(`/user/${id}`, data),
  getStats: (id: string) => request.get<any, any>(`/user/${id}/stats`),
  getDailyStats: (id: string, days = 7) =>
    request.get<any, { date: string; total: number; correct: number; accuracy: number }[]>(
      `/practice/stats/${id}`,
      { params: { days } },
    ),
}

// 题目
export const questionApi = {
  getList: (params?: { category?: string; page?: number; pageSize?: number }) =>
    request.get<any, { list: Question[]; total: number }>('/question', { params }),
  getById: (id: string) => request.get<any, Question>(`/question/${id}`),
  getCategories: () =>
    request.get<any, { id: string; name: string; count: number }[]>('/question/categories'),
  getCountByCategory: () => request.get<any, Record<string, number>>('/question/count'),
  getRandom: (category: string, count = 10, excludeIds: string[] = []) =>
    request.get<any, Question[]>(`/question/random/${encodeURIComponent(category)}`, {
      params: {
        count,
        excludeIds: excludeIds.length ? excludeIds.join(',') : undefined,
      },
    }),
}

// 练习
export interface SubmitAnswerParams {
  questionId: string
  userAnswer: string
  timeSpent?: number
  practiceType?: string
}
export const practiceApi = {
  submit: (userId: string, data: SubmitAnswerParams) =>
    request.post<any, { isCorrect: boolean; correctAnswer: string; explanation: string }>('/practice/submit', {
      userId,
      timeSpent: 0,
      practiceType: 'special',
      ...data,
    }),
  getHistory: (userId: string, page = 1, pageSize = 20) =>
    request.get<any, any>(`/practice/history/${userId}`, { params: { page, pageSize } }),
  getDailyStats: (userId: string, days = 7) =>
    request.get<any, { date: string; total: number; correct: number; accuracy: number }[]>(
      `/practice/stats/${userId}`,
      { params: { days } },
    ),
}

// 错题本
export interface WrongQuestionItem {
  id: string
  questionId: string
  wrongCount: number
  lastWrongAt: string
  nextReviewAt: string | null
  reviewCount: number
  mastered: boolean
  userNote: string | null
  question: Question
}
export const wrongApi = {
  getList: (userId: string, page = 1, pageSize = 50) =>
    request.get<any, { list: WrongQuestionItem[]; total: number; page: number; pageSize: number }>(
      `/wrong-question/${userId}`,
      { params: { page, pageSize } },
    ),
  getReview: (userId: string, count = 10) =>
    request.get<any, WrongQuestionItem[]>(`/wrong-question/${userId}/review`, { params: { count } }),
  review: (userId: string, questionId: string, isCorrect: boolean) =>
    request.post<any, any>(`/wrong-question/${userId}/review/${questionId}`, { isCorrect }),
  addNote: (userId: string, questionId: string, note: string) =>
    request.put<any, any>(`/wrong-question/${userId}/note/${questionId}`, { note }),
  getStats: (userId: string) => request.get<any, any>(`/wrong-question/${userId}/stats`),
}

// 模拟考试
export const mockExamApi = {
  create: (userId: string, examType: string, duration: number) =>
    request.post('/mock-exam/create', { userId, examType, duration }),
  submit: (examId: string, userId: string, answers: { questionId: string; answer: string }[]) =>
    request.post('/mock-exam/submit', { examId, userId, answers }),
}

export default request
