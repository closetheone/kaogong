import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookX, ChevronDown, Trash2, PartyPopper, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Question } from '@/types'
import { usePracticeStore } from '@/store/usePracticeStore'

interface WrongItem {
  question: Question
  userAnswer: string
  wrongTime: string
}

export default function Wrong() {
  const nav = useNavigate()
  const { records, resetAll } = usePracticeStore()
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [questionCache, setQuestionCache] = useState<Record<string, Question>>({})
  const [search, setSearch] = useState('')

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

  const wrongList = useMemo(() => {
    const wrong = records.filter((r) => !r.isCorrect)
    const map = new Map<string, WrongItem>()
    for (const r of wrong) {
      const q = questionCache[r.questionId]
      if (!q) continue
      if (!map.has(r.questionId) || new Date(r.answeredAt) > new Date(map.get(r.questionId)!.wrongTime)) {
        map.set(r.questionId, { question: q, userAnswer: r.userAnswer, wrongTime: r.answeredAt })
      }
    }
    return Array.from(map.values())
  }, [records, questionCache])

  const categories = useMemo(() => {
    const set = new Set(wrongList.map((w) => w.question.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [wrongList])

  let filtered = filter === 'all' ? wrongList : wrongList.filter((w) => w.question.category === filter)
  if (search) {
    filtered = filtered.filter((w) => w.question.content.includes(search))
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookX className="h-6 w-6 text-rose-500" />
            错题本
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            共 {wrongList.length} 道错题 · 查漏补缺，精准提升
          </p>
        </div>
        {wrongList.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (confirm('确定清空所有错题记录？')) resetAll()
            }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> 清空
          </Button>
        )}
      </div>

      {/* Stats summary */}
      {wrongList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.filter((c) => c !== 'all').map((cat) => {
            const count = wrongList.filter((w) => w.question.category === cat).length
            return (
              <Card
                key={cat}
                className={cn(
                  'cursor-pointer transition-colors',
                  filter === cat ? 'border-primary bg-primary/[0.02]' : 'hover:bg-muted/50',
                )}
                onClick={() => setFilter(cat)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-rose-500 tabular-nums">{count}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{cat}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Search + Filter */}
      {wrongList.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索题目内容..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? '全部' : cat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {wrongList.length === 0 ? (
        <Card className="text-center">
          <CardContent className="py-20">
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
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>共 {filtered.length} 道错题</span>
              <span>点击展开查看解析</span>
            </div>
            <Separator />
          </CardHeader>
          <CardContent className="p-0">
            {filtered.map((item, idx) => {
              const { question, userAnswer, wrongTime } = item
              const isOpen = expanded === question.id
              return (
                <div key={question.id}>
                  {idx > 0 && <Separator />}
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
                            <Badge variant="outline" className="font-normal text-xs">
                              {question.subCategory}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(wrongTime).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed line-clamp-2 whitespace-pre-wrap text-foreground">
                          {question.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-muted-foreground">
                            我的答案：<span className="text-rose-600 font-semibold">{userAnswer}</span>
                          </span>
                          <span className="text-muted-foreground">
                            正确答案：<span className="text-emerald-600 font-semibold">{question.answer}</span>
                          </span>
                          <ChevronDown
                            className={cn(
                              'ml-auto h-4 w-4 text-muted-foreground transition-transform',
                              isOpen && 'rotate-180',
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="ml-10 pl-4 border-l-2 border-rose-200">
                        <div className="text-sm font-medium mb-2 flex items-center gap-1.5 text-rose-700">
                          📖 答案解析
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
    </div>
  )
}
