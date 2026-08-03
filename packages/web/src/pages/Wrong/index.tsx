import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookX,
  ChevronDown,
  Trash2,
  PartyPopper,
  Search,
  Filter,
  RefreshCw,
  CheckCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Question } from '@/types'
import { wrongApi, type WrongQuestionItem } from '@/utils/request'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

interface DisplayWrongItem {
  id: string
  questionId: string
  question: Question
  userAnswer: string
  correctAnswer: string
  wrongTime: string
  wrongCount?: number
  mastered?: boolean
  source: 'server' | 'local'
}

// 选项清洗
function cleanOption(raw: Record<string, string>, key: string, keys: string[]): string {
  let t = String(raw?.[key] || '').replace(/\s+/g, ' ').trim().replace(new RegExp(`^${key}[\\.\\s、]*`), '')
  for (const k of keys) {
    if (k === key) continue
    const idx = t.search(new RegExp(`\\s+${k}[\\.\\s、]`))
    if (idx > 0) t = t.substring(0, idx).trim()
  }
  return t
}

function deserializeQuestion(q: any): Question {
  if (!q) return q
  let options = q.options
  if (typeof options === 'string') {
    try { options = JSON.parse(options) } catch { options = {} }
  }
  return { ...q, options }
}

export default function Wrong() {
  const nav = useNavigate()
  const { records, resetAll } = usePracticeStore()
  const userId = useUserStore((s) => s.userId)
  const isLoaded = useUserStore((s) => s.isLoaded)

  const [serverItems, setServerItems] = useState<WrongQuestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(false)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [questionCache, setQuestionCache] = useState<Record<string, Question>>({})
  const [search, setSearch] = useState('')

  // 加载本地真题 cache（用于本地错题 fallback）
  useEffect(() => {
    fetch('/data/2026行测真题.json')
      .then((r) => r.json())
      .then((json) => {
        const map: Record<string, Question> = {}
        ;(json.questions || []).forEach((q: Question) => (map[q.id] = q))
        setQuestionCache(map)
      })
      .catch(() => {})
  }, [])

  // 从后端拉错题
  const fetchServerWrong = useCallback(async () => {
    if (!userId || userId.startsWith('local_') || !isLoaded) return
    setLoading(true)
    try {
      const data = await wrongApi.getList(userId, 1, 200)
      setServerItems(data.list || [])
      setServerError(false)
    } catch {
      setServerError(true)
    } finally {
      setLoading(false)
    }
  }, [userId, isLoaded])

  useEffect(() => {
    fetchServerWrong()
  }, [fetchServerWrong])

  // 合并服务端和本地错题
  const wrongList = useMemo<DisplayWrongItem[]>(() => {
    const map = new Map<string, DisplayWrongItem>()

    // 服务端错题（优先）
    if (!serverError && !userId.startsWith('local_')) {
      for (const w of serverItems) {
        const q = deserializeQuestion(w.question)
        map.set(w.questionId, {
          id: w.id,
          questionId: w.questionId,
          question: q,
          userAnswer: '',
          correctAnswer: q.answer,
          wrongTime: w.lastWrongAt,
          wrongCount: w.wrongCount,
          source: 'server',
        })
      }
    }

    // 本地错题（合并进去，补充 userAnswer）
    const wrong = records.filter((r) => !r.isCorrect)
    const seen = new Set<string>()
    for (let i = wrong.length - 1; i >= 0; i--) {
      const r = wrong[i]
      if (seen.has(r.questionId)) continue
      seen.add(r.questionId)
      const cached = questionCache[r.questionId]
      const q: Question =
        map.get(r.questionId)?.question ||
        cached ||
        ({
          id: r.questionId,
          content: '题目详情需连接后端服务查看',
          options: {},
          answer: '',
          explanation: '',
          category: '未知',
          source: '',
          year: 0,
          examType: '',
          number: 0,
          difficulty: 1,
        } as Question)
      const options = typeof q.options === 'string' ? JSON.parse(q.options || '{}') : q.options
      map.set(r.questionId, {
        id: r.questionId,
        questionId: r.questionId,
        question: { ...q, options },
        userAnswer: r.userAnswer,
        correctAnswer: q.answer,
        wrongTime: r.answeredAt,
        source: map.get(r.questionId) ? 'server' : 'local',
      })
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.wrongTime).getTime() - new Date(a.wrongTime).getTime(),
    )
  }, [records, serverItems, serverError, userId, questionCache])

  const categories = useMemo(() => {
    const set = new Set(wrongList.map((w) => w.question.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [wrongList])

  let filtered = filter === 'all' ? wrongList : wrongList.filter((w) => w.question.category === filter)
  if (search) {
    filtered = filtered.filter((w) => w.question.content.includes(search))
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookX className="h-6 w-6 text-rose-500" />
            错题本
          </h2>
          <p className="text-sm text-muted-foreground mt-1">共 {wrongList.length} 道错题 · 查漏补缺</p>
        </div>
        <div className="flex items-center gap-2">
          {!userId.startsWith('local_') && (
            <Button variant="ghost" size="icon" onClick={fetchServerWrong} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          )}
          {wrongList.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                if (confirm('确定清空本地错题记录？')) resetAll()
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              清空
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* 分类统计 */}
          {wrongList.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {categories
                .filter((c) => c !== 'all')
                .map((cat) => {
                  const count = wrongList.filter((w) => w.question.category === cat).length
                  return (
                    <Card
                      key={cat}
                      className={cn(
                        'cursor-pointer transition-colors',
                        filter === cat ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                      )}
                      onClick={() => setFilter(cat)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-xl font-bold text-rose-500 tabular-nums">{count}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{cat}</div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}

          {/* 搜索+筛选 */}
          {wrongList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索题目..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={filter === cat ? 'default' : 'outline'}
                    className="cursor-pointer shrink-0"
                    onClick={() => setFilter(cat)}
                  >
                    {cat === 'all' ? '全部' : cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 空态 */}
          {wrongList.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <PartyPopper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-semibold mb-1">太棒了！🎉</p>
                <p className="text-sm text-muted-foreground mb-6">还没有错题，去刷一组题吧</p>
                <Button onClick={() => nav('/practice')}>开始刷题</Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                没有匹配的错题
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                {filtered.map((item, idx) => {
                  const { question, userAnswer: localAns, correctAnswer, wrongTime, wrongCount, source } = item
                  const isOpen = expanded === question.id
                  const optionKeys = Object.keys(question.options || {}).sort()
                  return (
                    <div key={question.id}>
                      {idx > 0 && <div className="h-px bg-border" />}
                      <button
                        className="w-full text-left p-5 hover:bg-muted/40 transition-colors"
                        onClick={() => setExpanded(isOpen ? null : question.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge variant="error">{question.category || '未知'}</Badge>
                              {question.subCategory && (
                                <Badge variant="secondary" className="font-normal text-xs">
                                  {question.subCategory}
                                </Badge>
                              )}
                              {wrongCount && wrongCount > 1 && (
                                <Badge variant="outline" className="text-rose-500">
                                  错 {wrongCount} 次
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(wrongTime).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed line-clamp-2 whitespace-pre-wrap">
                              {question.content}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              {localAns && (
                                <span className="text-muted-foreground">
                                  你的答案：<span className="text-rose-600 font-semibold">{localAns}</span>
                                </span>
                              )}
                              <span className="text-muted-foreground">
                                正确答案：<span className="text-emerald-600 font-semibold">{correctAnswer}</span>
                              </span>
                              <span className="ml-auto text-muted-foreground flex items-center text-xs">
                                解析
                                <ChevronDown
                                  className={cn('h-4 w-4 transition-transform ml-0.5', isOpen && 'rotate-180')}
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                      {isOpen && question.explanation && (
                        <div className="px-5 pb-5 pt-0">
                          <div className="ml-10 pl-4 border-l-2 border-rose-200">
                            <div className="text-sm font-medium mb-2 text-rose-700 flex items-center gap-1.5">
                              <CheckCheck className="h-4 w-4" />
                              答案解析
                            </div>
                            <div className="text-sm text-muted-foreground leading-7 whitespace-pre-wrap bg-muted/40 rounded-lg p-4">
                              {question.explanation.replace(/^公考[\s\S]*?\f/, '').trim()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
