import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ArrowRight,
  Loader2,
  FileQuestion,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Category } from '@/types'
import { questionApi } from '@/utils/request'
import { cn } from '@/lib/utils'
import { usePracticeStore } from '@/store/usePracticeStore'

const defaultCategories: Category[] = [
  { id: '常识判断', name: '常识判断', icon: '💡', count: 0 },
  { id: '言语理解', name: '言语理解与表达', icon: '📖', count: 0 },
  { id: '数量关系', name: '数量关系', icon: '🔢', count: 0 },
  { id: '判断推理', name: '判断推理', icon: '🧠', count: 0 },
  { id: '资料分析', name: '资料分析', icon: '📊', count: 0 },
]

const subjectMeta: Record<
  string,
  {
    desc: string
    emoji: string
    color: string
    subItems: string[]
    tips: string
    questions: number
  }
> = {
  常识判断: {
    desc: '涵盖政治、法律、经济、历史、文化、地理、科技等',
    emoji: '💡',
    color: 'from-amber-400 to-orange-500',
    subItems: ['政治理论', '法律法规', '经济常识', '历史人文', '地理科技'],
    tips: '建议用时 30秒/题',
    questions: 20,
  },
  言语理解: {
    desc: '逻辑填空、片段阅读、语句表达',
    emoji: '📖',
    color: 'from-blue-400 to-indigo-500',
    subItems: ['逻辑填空', '片段阅读', '语句排序', '篇章阅读'],
    tips: '建议用时 50秒/题',
    questions: 40,
  },
  数量关系: {
    desc: '数学运算、数字推理',
    emoji: '🔢',
    color: 'from-violet-400 to-purple-500',
    subItems: ['数学运算', '行程问题', '工程问题', '概率问题'],
    tips: '建议用时 90秒/题',
    questions: 15,
  },
  判断推理: {
    desc: '图形推理、定义判断、类比推理、逻辑判断',
    emoji: '🧠',
    color: 'from-emerald-400 to-teal-500',
    subItems: ['图形推理', '定义判断', '类比推理', '逻辑判断'],
    tips: '建议用时 60秒/题',
    questions: 40,
  },
  资料分析: {
    desc: '文字、表格、图表资料综合分析',
    emoji: '📊',
    color: 'from-rose-400 to-pink-500',
    subItems: ['文字资料', '表格资料', '图形资料', '综合资料'],
    tips: '建议用时 90秒/题',
    questions: 20,
  },
}

export default function Practice() {
  const nav = useNavigate()
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [loading, setLoading] = useState(true)
  const { records } = usePracticeStore()

  useEffect(() => {
    questionApi
      .getCountByCategory()
      .then((counts) => {
        setCategories(
          defaultCategories.map((c) => ({
            ...c,
            count: counts[c.id] || counts[c.name] || 0,
          })),
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // 计算各模块进度（基于练习记录）
  const getProgress = (catName: string) => {
    const catRecords = records.filter((r) => r.questionId.includes(catName))
    if (catRecords.length === 0) return 0
    const correct = catRecords.filter((r) => r.isCorrect).length
    return Math.round((correct / (subjectMeta[catName]?.questions || 20)) * 100)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            题库练习
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            2026 年国考行测真题 · 按模块精练，逐个击破
          </p>
        </div>
      </div>

      {/* 练习模式选择 */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-primary/30 bg-primary/[0.02]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm">专项精练</div>
              <div className="text-xs text-muted-foreground mt-0.5">10 题一组，针对性练习</div>
            </div>
          </CardContent>
        </Card>
        <Card className="opacity-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                模拟考试 <Badge className="text-[10px] h-4">即将上线</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">130题，120分钟</div>
            </div>
          </CardContent>
        </Card>
        <Card className="opacity-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                每日一练 <Badge className="text-[10px] h-4">即将上线</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">精选 20 题，打卡刷题</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 模块列表 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">行测五大模块</CardTitle>
          <CardDescription>每个模块 10 题一组，选择模块开始练习</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y">
            {categories.map((cat) => {
              const meta = subjectMeta[cat.name] || {
                desc: '',
                emoji: '📝',
                color: 'from-gray-400 to-gray-500',
                subItems: [],
                tips: '',
                questions: 0,
              }
              const progress = getProgress(cat.name)
              return (
                <div
                  key={cat.id}
                  className="py-5 flex items-start gap-4 group hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div
                    className={cn(
                      'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white shadow-md bg-gradient-to-br',
                      meta.color,
                    )}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">{cat.name}</h3>
                      <Badge variant="secondary" className="font-normal text-xs">
                        {meta.questions} 题/套卷
                      </Badge>
                      {loading ? (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      ) : cat.count > 0 ? (
                        <span className="text-xs text-muted-foreground">题库 {cat.count} 题</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">本地真题</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{meta.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {meta.subItems.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-[10px] font-normal text-muted-foreground"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                    {progress > 0 && (
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={progress} className="h-1.5 flex-1 max-w-xs" />
                        <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {meta.tips}
                    </div>
                    <Button
                      onClick={() =>
                        nav(`/practice/${encodeURIComponent(cat.id)}`, { state: { name: cat.name } })
                      }
                      size="sm"
                      className="gap-1 group-hover:gap-2 transition-all"
                    >
                      开始练习
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
