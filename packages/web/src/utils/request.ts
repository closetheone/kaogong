import axios from 'axios'
import type { Question } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE || '/api'

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

request.interceptors.response.use(
  (res) => {
    const { code, message, data } = res.data
    if (code === 0) return data
    return Promise.reject(new Error(message || '请求失败'))
  },
  (err) => Promise.reject(err),
)

// ============ API ============

// 题目相关
export const questionApi = {
  getList: (params?: { category?: string; page?: number; pageSize?: number }) =>
    request.get<any, { list: Question[]; total: number }>('/question', { params }),
  getById: (id: string) => request.get<any, Question>(`/question/${id}`),
  getCategories: () => request.get<any, { id: string; name: string; count: number }[]>('/question/categories'),
  getCountByCategory: () => request.get<any, Record<string, number>>('/question/count'),
  getRandom: (category: string, count = 10, excludeIds: string[] = []) =>
    request.get<any, Question[]>(`/question/random/${encodeURIComponent(category)}`, {
      params: { count, excludeIds: excludeIds.join(',') || undefined },
    }),
}

// 练习相关
export const practiceApi = {
  submit: (data: { questionId: string; userAnswer: string; timeSpent: number; userId?: string }) =>
    request.post('/practice/submit', data),
  getHistory: (userId: string, page = 1, pageSize = 20) =>
    request.get(`/practice/history/${userId}`, { params: { page, pageSize } }),
  getStats: (userId: string, days = 7) => request.get(`/practice/stats/${userId}`, { params: { days } }),
}

// 模拟考试
export const mockExamApi = {
  create: (userId: string, examType: string, duration: number) =>
    request.post('/mock-exam/create', { userId, examType, duration }),
  submit: (examId: string, userId: string, answers: { questionId: string; answer: string }[]) =>
    request.post('/mock-exam/submit', { examId, userId, answers }),
  getHistory: (userId: string, page = 1, pageSize = 10) =>
    request.get('/mock-exam/history', { params: { userId, page, pageSize } }),
  getDetail: (examId: string, userId: string) =>
    request.get(`/mock-exam/detail/${examId}`, { params: { userId } }),
}

export default request
