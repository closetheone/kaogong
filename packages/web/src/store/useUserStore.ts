import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  userId: string
  nickname: string
  avatar: string
  targetExam: string
  setUser: (u: Partial<UserState>) => void
}

// 本地匿名用户，后续接入真实登录时再替换
const defaultUserId = 'local_' + Math.random().toString(36).slice(2, 10)

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: defaultUserId,
      nickname: '考公人',
      avatar: '',
      targetExam: '2026年国考',
      setUser: (u) => set((s) => ({ ...s, ...u })),
    }),
    { name: 'kaogong-user' },
  ),
)
