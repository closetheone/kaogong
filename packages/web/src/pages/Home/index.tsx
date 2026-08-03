import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  XCircle,
  Timer,
  Calendar,
  BarChart3,
  Trophy,
  ChevronRight,
  ArrowRight,
  Flame,
  Quote,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: BookOpen,
    title: '专项刷题',
    desc: '按模块精练',
    to: '/practice',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: XCircle,
    title: '错题本',
    desc: '查漏补缺',
    to: '/wrong',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: Timer,
    title: '模拟考试',
    desc: '限时模考',
    to: '',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: BarChart3,
    title: '学习报告',
    desc: '数据分析',
    to: '',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Calendar,
    title: '学习计划',
    desc: '科学规划',
    to: '',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Trophy,
    title: '排行榜',
    desc: '考友PK',
    to: '',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
]

const subjects = [
  { name: '常识判断', desc: '政治·法律·经济·历史', key: '常识判断', color: 'from-amber-400 to-orange-500' },
  { name: '言语理解', desc: '逻辑填空·片段阅读', key: '言语理解', color: 'from-blue-400 to-indigo-500' },
  { name: '数量关系', desc: '数学运算·数推', key: '数量关系', color: 'from-violet-400 to-purple-500' },
  { name: '判断推理', desc: '图推·定义·类比·逻辑', key: '判断推理', color: 'from-emerald-400 to-teal-500' },
  { name: '资料分析', desc: '文字·表格·图表', key: '资料分析', color: 'from-rose-400 to-pink-500' },
]

export default function Home() {
  const nav = useNavigate()
  const { records } = usePracticeStore()
  const { nickname, targetExam } = useUserStore()
  const [todayCount, setTodayCount] = useState(0)
  const [streakDays, setStreakDays] = useState(0)

  useEffect(() => {
    const today = new Date().toDateString()
    setTodayCount(records.filter((r) => new Date(r.answeredAt).toDateString() === today).length)

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
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      {/* Hero */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary via-violet-600 to-purple-600 text-primary-foreground shadow-xl">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-pink-400/20 blur-2xl" />
        <CardContent className="relative p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
                <span>👋 你好，{nickname}</span>
                {streakDays > 0 && (
                  <Badge className="bg-white/20 text-white border-0 gap-1">
                    <Flame className="h-3 w-3" />
                    连续 {streakDays} 天
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
                {targetExam}
              </h1>
              <p className="text-sm md:text-base opacity-80 max-w-md">
                {streakDays > 0 ? '坚持就是胜利，今天继续刷题吧 💪' : '今天还没开始，来练一组热身 💪'}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => nav('/practice')}
              className="bg-white text-primary hover:bg-white/90 shadow-lg self-start md:self-auto font-semibold"
            >
              开始刷题
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
            {[
              { label: '今日刷题', value: todayCount, unit: '题' },
              { label: '累计刷题', value: total, unit: '题' },
              { label: '正确率', value: accuracy, unit: '%' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/15 backdrop-blur p-4 md:p-5"
              >
                <div className="text-2xl md:text-4xl font-bold tabular-nums">
                  {s.value}
                  <span className="text-sm md:text-base font-normal ml-0.5 opacity-70">{s.unit}</span>
                </div>
                <div className="text-xs md:text-sm opacity-70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4 px-1">功能中心</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {features.map((f) => {
            const Icon = f.icon
            const disabled = !f.to
            return (
              <button
                key={f.title}
                onClick={() => f.to && nav(f.to)}
                disabled={disabled}
                className={cn(
                  'group relative flex flex-col items-center rounded-xl border bg-card p-4 shadow-sm transition-all',
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
                )}
              >
                <div className={cn('mb-2.5 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl shadow-md', f.bg)}>
                  <Icon className={cn('h-6 w-6 md:h-7 md:w-7', f.color)} />
                </div>
                <div className="text-sm font-medium">{f.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 hidden md:block">{f.desc}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Subjects + Side */}
      <section className="grid md:grid-cols-3 gap-6">
        {/* 专项练习 */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-semibold tracking-tight">专项练习</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => nav('/practice')}>
              全部 <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {subjects.map((s) => (
              <Card
                key={s.name}
                className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md border"
                onClick={() =>
                  nav(`/practice/${encodeURIComponent(s.key)}`, { state: { name: s.name } })
                }
              >
                <CardContent className="p-5">
                  <div className={cn('w-11 h-11 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xl shadow-sm mb-3', s.color)}>
                    {s.name[0]}
                  </div>
                  <div className="font-semibold text-sm md:text-base mb-1">{s.name}</div>
                  <div className="text-xs text-muted-foreground mb-3">{s.desc}</div>
                  <div className="text-xs text-primary font-medium flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    开始练习 <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Side widgets */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <span className="text-amber-500">📌</span>
                今日建议
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary">•</span>每天 20-30 道保持题感</li>
                <li className="flex gap-2"><span className="text-primary">•</span>先专项再套题模考</li>
                <li className="flex gap-2"><span className="text-primary">•</span>错题必复盘，搞懂考点</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <CardContent className="p-5">
              <Quote className="h-5 w-5 text-amber-500 mb-2" />
              <p className="text-sm font-medium text-amber-900 italic leading-relaxed">
                "道阻且长，行则将至；行而不辍，未来可期。"
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
