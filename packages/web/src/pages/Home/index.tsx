import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

export default function Home() {
  const nav = useNavigate()
  const { records } = usePracticeStore()
  const { nickname } = useUserStore()
  const [todayCount, setTodayCount] = useState(0)

  useEffect(() => {
    const today = new Date().toDateString()
    const cnt = records.filter(
      (r) => new Date(r.answeredAt).toDateString() === today,
    ).length
    setTodayCount(cnt)
  }, [records])

  const totalCount = records.length
  const correctCount = records.filter((r) => r.isCorrect).length
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  const quickEntries = [
    { icon: '📝', label: '开始刷题', color: 'bg-indigo-50 text-indigo-600', onClick: () => nav('/practice') },
    { icon: '❌', label: '错题本', color: 'bg-red-50 text-red-600', onClick: () => nav('/wrong') },
    { icon: '🎯', label: '模拟考试', color: 'bg-amber-50 text-amber-600', onClick: () => {} },
    { icon: '📅', label: '学习计划', color: 'bg-emerald-50 text-emerald-600', onClick: () => {} },
  ]

  return (
    <PageContainer>
      {/* 顶部用户区 */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-500 px-5 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <div className="text-white font-semibold text-lg">{nickname}</div>
            <div className="text-white/80 text-sm">每天进步一点点，上岸就在眼前</div>
          </div>
        </div>

        {/* 今日/累计统计 */}
        <div className="mt-6 bg-white/15 rounded-2xl p-4 flex backdrop-blur-sm">
          <div className="flex-1 text-center">
            <div className="text-white text-2xl font-bold">{todayCount}</div>
            <div className="text-white/70 text-xs mt-1">今日刷题</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex-1 text-center">
            <div className="text-white text-2xl font-bold">{totalCount}</div>
            <div className="text-white/70 text-xs mt-1">累计刷题</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex-1 text-center">
            <div className="text-white text-2xl font-bold">{accuracy}%</div>
            <div className="text-white/70 text-xs mt-1">正确率</div>
          </div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="text-sm font-semibold text-gray-800 mb-3">快速开始</div>
          <div className="grid grid-cols-4 gap-2">
            {quickEntries.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center gap-2 py-2 rounded-xl active:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-2xl`}>
                  {item.icon}
                </div>
                <span className="text-xs text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 激励语 */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <div className="text-sm text-amber-800">
            💪 坚持就是胜利，每天练 10 道，上岸不再遥远！
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
