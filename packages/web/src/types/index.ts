export interface Question {
  id: string
  source: string
  year: number
  examType: string
  category: string
  subCategory?: string
  number: number
  content: string
  options: Record<string, string>
  answer: string
  explanation: string
  difficulty: number
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

export interface UserStats {
  todayCount: number
  totalCount: number
  accuracy: number
  studyDays: number
}

export interface WrongQuestion {
  id: string
  questionId: string
  question: Question
  userAnswer: string
  wrongTime: string
}

export interface PracticeRecord {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent: number
  answeredAt: string
}
