import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userApi } from '@/utils/request'

interface UserState {
  userId: string
  nickname: string
  avatar: string
  targetExam: string
  isLoaded: boolean
  setUser: (u: Partial<UserState>) => void
  // 启动时调用：如果没有 userId 就 guest 登录
  ensureUser: () => Promise<string>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: '',
      nickname: '考公人',
      avatar: '',
      targetExam: '2026年国考',
      isLoaded: false,

      setUser: (u) => set((s) => ({ ...s, ...u })),

      ensureUser: async () => {
        const { userId } = get()
        if (userId) {
          set({ isLoaded: true })
          return userId
        }
        try {
          const user = await userApi.guestLogin('考公人')
          set({
            userId: user.id,
            nickname: user.nickname || '考公人',
            isLoaded: true,
          })
          return user.id
        } catch (e) {
          // 后端没启动时，用本地随机 ID 作为 fallback
          const localId = 'local_' + Math.random().toString(36).slice(2, 10)
          set({ userId: localId, isLoaded: true })
          return localId
        }
      },
    }),
    { name: 'kaogong-user' },
  ),
)
