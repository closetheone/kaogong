import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  XCircle,
  Timer,
  Calendar,
  BarChart3,
  Trophy,
  ArrowRight,
  Flame,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Brain,
  FileQuestion,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'
import { cn } from '@/lib/utils'

const subjects = [
  {
    name: '常识判断',
    key: '常识判断',
    desc: '政治·法律·经济·历史',
    emoji: '💡',
    color: 'bg-amber-500',
    progress: 0,
  },
  {
    name: '言语理解与表达',
    key: '言语理解',
    desc: '逻辑填空·片段阅读',
    emoji: '📖',
    color: 'bg-blue-500',
    progress: 0,
  },
  {
    name: '数量关系',
    key: '数量关系',
    desc: '数学运算·数字推理',
    emoji: '🔢',
    color: 'bg-violet-500',
    progress: 0,
  },
  {
    name: '判断推理',
    key: '判断推理',
    desc: '图推·定义·类比·逻辑',
    emoji: '🧠',
    color: 'bg-emerald-500',
    progress: 0,
  },
  {
    name: '资料分析',
    key: '资料分析',
    desc: '文字·表格·图表',
    emoji: '📊',
    color: 'bg-rose-500',
    progress: 0,
  },
]

export default function Home() {
  const nav = useNavigate()
  const { records } = usePracticeStore()
  const { nickname, targetExam } = useUserStore()
  const [todayCount, setTodayCount] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([])

  useEffect(() => {
    const today = new Date()
    const todayStr = today.toDateString()
    setTodayCount(records.filter((r) => new Date(r.answeredAt).toDateString() === todayStr).length)

    // 连续打卡
    const days = new Set(records.map((r) => new Date(r.answeredAt).toDateString()))
    let streak = 0
    const d = new Date()
    while (days.has(d.toDateString())) {
      streak++
      d.setDate(d.getDate() - 1)
    }
    setStreakDays(streak)

    // 最近7天数据
    const week = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const dayStr = day.toDateString()
      const count = records.filter((r) => new Date(r.answeredAt).toDateString() === dayStr).length
      week.push({
        day: ['日', '一', '二', '三', '四', '五', '六'][day.getDay()],
        count,
      })
    }
    setWeeklyData(week)
  }, [records])

  const total = records.length
  const correct = records.filter((r) => r.isCorrect).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const wrong = records.filter((r) => !r.isCorrect).length

  const maxWeekCount = Math.max(...weeklyData.map((d) => d.count), 10)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome strip */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            你好，{nickname} <span className="text-muted-foreground font-normal text-base">👋</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {targetExam} ·
            {streakDays > 0 ? (
              <span className="text-amber-600 ml-1">
                <Flame className="inline h-3.5 w-3.5 -mt-0.5" /> 已连续打卡 {streakDays} 天
              </span>
            ) : (
              <span className="ml-1">今天还没开始，加油！</span>
            )}
          </p>
        </div>
        <Button onClick={() => nav('/practice')} size="sm" className="gap-1.5">
          开始刷题 <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">今日刷题</div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums">{todayCount}</span>
              <span className="text-sm text-muted-foreground">题</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {todayCount >= 20 ? '✅ 达标' : `还差 ${Math.max(0, 20 - todayCount)} 题达标`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">累计刷题</div>
              <FileQuestion className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums">{total}</span>
              <span className="text-sm text-muted-foreground">题</span>
            </div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> 累计进度
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">正确率</div>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums">{accuracy}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <Progress value={accuracy} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">错题待攻克</div>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums text-rose-500">{wrong}</span>
              <span className="text-sm text-muted-foreground">道</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-rose-600 -ml-2 mt-1 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => nav('/wrong')}
            >
              去复习 →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧：专项练习 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  专项练习
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => nav('/practice')}>
                  查看全部 <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid sm:grid-cols-2 gap-3">
                {subjects.map((s) => (
                  <button
                    key={s.key}
                    onClick={() =>
                      nav(`/practice/${encodeURIComponent(s.key)}`, { state: { name: s.name } })
                    }
                    className="group flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
                  >
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white shrink-0', s.color)}>
                      {s.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={s.progress} className="h-1 flex-1" />
                        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                          {s.progress}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 最近 7 天趋势 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                近 7 天刷题趋势
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end gap-2 h-32">
                {weeklyData.map((d, i) => {
                  const height = d.count === 0 ? 4 : Math.max(12, (d.count / maxWeekCount) * 100)
                  const isToday = i === 6
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="text-[10px] text-muted-foreground tabular-nums">{d.count || ''}</div>
                      <div
                        className={cn(
                          'w-full rounded-t-md transition-all',
                          isToday ? 'bg-primary' : 'bg-muted-foreground/20',
                        )}
                        style={{ height: `${height}%` }}
                      />
                      <div className={cn('text-[11px]', isToday ? 'text-primary font-medium' : 'text-muted-foreground')}>
                        {d.day}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：快捷功能 + 提示 */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">快捷入口</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-10 font-normal text-sm"
                onClick={() => nav('/practice')}
              >
                <Brain className="h-4 w-4 mr-2.5 text-indigo-500" />
                随机抽题 10 道
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-10 font-normal text-sm"
                onClick={() => nav('/wrong')}
              >
                <XCircle className="h-4 w-4 mr-2.5 text-rose-500" />
                复习错题（{wrong}）
              </Button>
              <Button variant="ghost" className="w-full justify-start h-10 font-normal text-sm" disabled>
                <Timer className="h-4 w-4 mr-2.5 text-amber-500" />
                模拟考试
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  即将上线
                </Badge>
              </Button>
              <Button variant="ghost" className="w-full justify-start h-10 font-normal text-sm" disabled>
                <Trophy className="h-4 w-4 mr-2.5 text-yellow-500" />
                排行榜
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  即将上线
                </Badge>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border-indigo-100">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                今日建议
              </div>
              <ul className="space-y-2 text-sm text-indigo-800/80">
                <li className="flex gap-2">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0 text-indigo-400" />
                  每天至少 20 道题保持题感
                </li>
                <li className="flex gap-2">
                  <Target className="h-4 w-4 mt-0.5 shrink-0 text-indigo-400" />
                  专项训练后再做套题模考
                </li>
                <li className="flex gap-2">
                  <Brain className="h-4 w-4 mt-0.5 shrink-0 text-indigo-400" />
                  错题必须看解析搞懂考点
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 text-white border-0">
            <CardContent className="p-5">
              <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                <span className="text-indigo-400">"</span> 每日一句
              </div>
              <p className="text-sm leading-relaxed italic text-zinc-200">
                道阻且长，行则将至；<br />行而不辍，未来可期。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
