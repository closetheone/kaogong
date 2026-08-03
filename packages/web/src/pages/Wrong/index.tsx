import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronDown, ChevronUp, Trash2, PartyPopper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
      const q =
        questionCache[r.questionId] ||
        ({
          id: r.questionId,
          content: '（题目详情暂无，请连接后端服务后查看）',
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
      map.set(r.questionId, { question: q, userAnswer: r.userAnswer, wrongTime: r.answeredAt })
    }
    return Array.from(map.values())
  }, [records, questionCache])

  const categories = useMemo(() => {
    const set = new Set(wrongList.map((w) => w.question.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [wrongList])

  const filtered = filter === 'all' ? wrongList : wrongList.filter((w) => w.question.category === filter)

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg">
        <CardContent className="p-6 md:p-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
              <BookOpen className="h-4 w-4" /> 错题本
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl md:text-5xl font-bold tabular-nums">{wrongList.length}</span>
              <span className="text-sm opacity-80 pb-2">道待攻克</span>
            </div>
            <p className="text-sm opacity-80 mt-2">💡 每道错题都是提分机会</p>
          </div>
          <div className="text-5xl opacity-30 hidden md:block">❌</div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      {wrongList.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
              className="rounded-full shrink-0"
            >
              {cat === 'all' ? '全部' : cat}
            </Button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="text-center">
          <CardContent className="py-16 md:py-24">
            <PartyPopper className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-semibold mb-1">太棒了！</p>
            <p className="text-sm text-muted-foreground mb-6">
              {wrongList.length === 0 ? '还没有错题，去刷一组题吧' : '该分类暂无错题'}
            </p>
            {wrongList.length === 0 && (
              <Button onClick={() => nav('/practice')}>开始刷题</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const { question, userAnswer } = item
            const isOpen = expanded === question.id
            return (
              <Card key={question.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <button
                  className="w-full text-left p-5"
                  onClick={() => setExpanded(isOpen ? null : question.id)}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <Badge variant="error">{question.category || '未知'}</Badge>
                    {question.subCategory && (
                      <Badge variant="secondary" className="font-normal">
                        {question.subCategory}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(item.wrongTime).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-sm md:text-[15px] text-foreground leading-relaxed line-clamp-2 whitespace-pre-wrap">
                    {question.content}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">你的答案</span>
                      <Badge variant="error" className="font-semibold">
                        {userAnswer}
                      </Badge>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">正确答案</span>
                      <Badge variant="success" className="font-semibold">
                        {question.answer || '-'}
                      </Badge>
                    </span>
                    <span className="ml-auto text-muted-foreground flex items-center text-xs">
                      {isOpen ? (
                        <>
                          收起 <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          解析 <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </span>
                  </div>
                </button>

                {isOpen && question.explanation && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="pt-4 border-t">
                      <div className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        📖 答案解析
                      </div>
                      <div className="text-sm text-muted-foreground leading-7 whitespace-pre-wrap bg-muted/50 rounded-lg p-4">
                        {question.explanation.replace(/^公考[\s\S]*?\f/, '').trim()}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {wrongList.length > 0 && (
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive gap-1"
            onClick={() => {
              if (confirm('确定清空所有练习记录？此操作不可恢复')) {
                resetAll()
                setExpanded(null)
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空所有记录
          </Button>
        </div>
      )}
    </div>
  )
}
