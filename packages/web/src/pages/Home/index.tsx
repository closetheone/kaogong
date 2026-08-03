import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

const features = [
  {
    icon: '📝',
    title: '专项刷题',
    desc: '按模块精练，逐个击破',
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50',
    to: '/practice',
  },
  {
    icon: '❌',
    title: '错题本',
    desc: '复盘巩固，查漏补缺',
    color: 'from-rose-500 to-red-600',
    bg: 'bg-rose-50',
    to: '/wrong',
  },
  {
    icon: '🎯',
    title: '模拟考试',
    desc: '真题限时，考场体验',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    to: '',
  },
  {
    icon: '📊',
    title: '学习报告',
    desc: '数据分析，精准提升',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    to: '',
  },
  {
    icon: '📅',
    title: '学习计划',
    desc: '科学规划，稳扎稳打',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    to: '',
  },
  {
    icon: '🏆',
    title: '排行榜',
    desc: '考友PK，共同进步',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    to: '',
  },
]

const subjects = [
  { name: '常识判断', icon: '💡', count: 0, color: 'bg-amber-100 text-amber-700', key: '常识判断' },
  { name: '言语理解', icon: '📖', count: 0, color: 'bg-blue-100 text-blue-700', key: '言语理解' },
  { name: '数量关系', icon: '🔢', count: 0, color: 'bg-violet-100 text-violet-700', key: '数量关系' },
  { name: '判断推理', icon: '🧠', count: 0, color: 'bg-emerald-100 text-emerald-700', key: '判断推理' },
  { name: '资料分析', icon: '📊', count: 0, color: 'bg-rose-100 text-rose-700', key: '资料分析' },
]

export default function Home() {
  const nav = useNavigate()
  const { records } = usePracticeStore()
  const { nickname, targetExam } = useUserStore()
  const [todayCount, setTodayCount] = useState(0)
  const [streakDays, setStreakDays] = useState(0)

  useEffect(() => {
    const today = new Date().toDateString()
    const cnt = records.filter((r) => new Date(r.answeredAt).toDateString() === today).length
    setTodayCount(cnt)

    // 计算连续打卡天数
    const days = new Set(records.map((r) => new Date(r.answeredAt).toDateString()))
    let streak = 0
    const d = new Date()
    while (days.has(d.toDateString())) {
      streak++
      d.setDate(d.getDate() - 1)
    }
    setStreakDays(streak)
  }, [records])

  const total = records.length
  const correct = records.filter((r) => r.isCorrect).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Hero 区 */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-10 text-white mb-8">
        {/* 装饰圆 */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-pink-400/20 blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-sm md:text-base opacity-80 mb-2">
              你好，{nickname} 👋
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">
              {targetExam}，一起上岸！
            </h1>
            <p className="text-sm md:text-base opacity-80">
              {streakDays > 0
                ? `已连续打卡 ${streakDays} 天，继续保持！`
                : '今天还没开始刷题，来练一组吧 💪'}
            </p>
          </div>
          <button
            onClick={() => nav('/practice')}
            className="shrink-0 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-indigo-900/20"
          >
            开始刷题 →
          </button>
        </div>

        {/* 统计卡 */}
        <div className="relative z-10 grid grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-10">
          {[
            { label: '今日刷题', value: todayCount, unit: '题' },
            { label: '累计刷题', value: total, unit: '题' },
            { label: '正确率', value: accuracy, unit: '%' },
          ].map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur rounded-xl md:rounded-2xl p-3 md:p-5">
              <div className="text-xl md:text-3xl font-bold">
                {s.value}
                <span className="text-sm md:text-base font-normal ml-0.5 opacity-80">{s.unit}</span>
              </div>
              <div className="text-xs md:text-sm opacity-70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 功能入口 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">功能中心</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {features.map((f) => (
            <button
              key={f.title}
              onClick={() => f.to && nav(f.to)}
              disabled={!f.to}
              className="card-hover bg-white rounded-xl p-4 flex flex-col items-center text-center gap-2 shadow-sm border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl md:text-3xl text-white shadow-md`}>
                {f.icon}
              </div>
              <div className="text-sm font-semibold text-gray-800 mt-1">{f.title}</div>
              <div className="text-xs text-gray-400 hidden md:block">{f.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 模块入口 + 最近练习 */}
      <section className="grid md:grid-cols-3 gap-6">
        {/* 专项模块 */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-gray-900">专项练习</h2>
            <button onClick={() => nav('/practice')} className="text-sm text-indigo-600 hover:text-indigo-700">
              全部 →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {subjects.map((s) => (
              <button
                key={s.name}
                onClick={() => nav(`/practice/${encodeURIComponent(s.key)}`, { state: { name: s.name } })}
                className="card-hover bg-white rounded-xl p-4 md:p-5 text-left shadow-sm border border-gray-100"
              >
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-xl mb-3`}>
                  {s.icon}
                </div>
                <div className="font-semibold text-gray-900 text-sm md:text-base">{s.name}</div>
                <div className="text-xs text-gray-400 mt-1">开始练习 →</div>
              </button>
            ))}
          </div>
        </div>

        {/* 学习提示 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-sm font-semibold text-gray-900 mb-3">📌 今日建议</div>
            <ul className="text-sm text-gray-600 space-y-2.5 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                每天刷 20-30 道题，保持题感
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                先专项训练，再套题模考
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">•</span>
                错题反复看，搞懂每一个考点
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm font-medium text-amber-900 mb-1">每日一句</div>
            <div className="text-sm text-amber-700 leading-relaxed italic">
              "道阻且长，行则将至；行而不辍，未来可期。"
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
