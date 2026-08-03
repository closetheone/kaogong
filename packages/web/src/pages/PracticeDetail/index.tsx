import { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Clock,
  ListChecks,
  Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Question } from '@/types'
import { questionApi } from '@/utils/request'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

const QUESTIONS_PER_SESSION = 10

function cleanOptionText(text: string, currentKey: string, allKeys: string[]): string {
  let t = String(text).replace(/\s+/g, ' ').trim()
  t = t.replace(new RegExp(`^${currentKey}[\\.\\s、]*`), '')
  for (const k of allKeys) {
    if (k === currentKey) continue
    const idx = t.search(new RegExp(`\\s+${k}[\\.\\s、]`))
    if (idx > 0) t = t.substring(0, idx).trim()
  }
  return t
}

export default function PracticeDetail() {
  const { category = '' } = useParams()
  const location = useLocation()
  const nav = useNavigate()
  const categoryName =
    (location.state as { name?: string } | null)?.name || decodeURIComponent(category)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [elapsed, setElapsed] = useState(0)

  const { addRecord, submitAnswer } = usePracticeStore()
  const userId = useUserStore((s) => s.userId)

  // Timer
  useEffect(() => {
    if (loading || questions.length === 0) return
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(timer)
  }, [loading, questions.length])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    let data: Question[] = []
    try {
      data = await questionApi.getRandom(decodeURIComponent(category), QUESTIONS_PER_SESSION)
    } catch {}
    if (!data || data.length === 0) {
      try {
        const res = await fetch('/data/2026行测真题.json')
        const json = await res.json()
        const all: Question[] = json.questions || []
        let filtered = all.filter((q) => q.category === decodeURIComponent(category) || q.category === categoryName)
        if (filtered.length === 0) filtered = all
        data = filtered.sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_SESSION)
      } catch {
        data = []
      }
    }
    setQuestions(data)
    setLoading(false)
    setElapsed(0)
  }, [category, categoryName])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const currentQ = questions[currentIndex]
  const currentAnswer = answers[currentIndex] || ''
  const isSubmitted = submitted[currentIndex]

  const handleSelect = (key: string) => {
    if (isSubmitted) return
    setAnswers({ ...answers, [currentIndex]: key })
  }

  const handleSubmit = async () => {
    if (!currentAnswer || !currentQ) return
    setSubmitted({ ...submitted, [currentIndex]: true })

    // 先本地记录（确保 UI 响应）
    const isCorrect = currentAnswer === currentQ.answer
    addRecord({
      questionId: currentQ.id,
      userAnswer: currentAnswer,
      isCorrect,
      timeSpent: 0,
      answeredAt: new Date().toISOString(),
      category: currentQ.category,
    })

    // 提交到后端（不阻塞 UI）
    if (userId && !userId.startsWith('local_')) {
      submitAnswer(userId, currentQ.id, currentAnswer).catch(() => {})
    }
  }

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return
    setCurrentIndex(idx)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFlag = () => {
    const newSet = new Set(flagged)
    if (newSet.has(currentIndex)) newSet.delete(currentIndex)
    else newSet.add(currentIndex)
    setFlagged(newSet)
  }

  const handleFinish = () => {
    let correct = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })
    nav(`/practice/result`, {
      state: { total: questions.length, correct, category: categoryName, time: elapsed },
      replace: true,
    })
  }

  const answeredCount = Object.keys(answers).length
  const submittedCount = Object.keys(submitted).length
  const correctCount = questions.reduce(
    (acc, q, i) => acc + (submitted[i] && answers[i] === q.answer ? 1 : 0),
    0,
  )

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">加载题目中...</p>
        </div>
      </div>
    )
  }

  if (!currentQ) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="max-w-sm w-full text-center">
          <CardContent className="p-8">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-muted-foreground mb-4">暂无该模块题目</p>
            <Button onClick={() => nav('/practice')}>返回</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const optionKeys = ['A', 'B', 'C', 'D', 'E', 'F']
  const availableKeys = optionKeys.filter((k) => currentQ.options?.[k] !== undefined)

  return (
    <div className="bg-background min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => nav('/practice')} className="-ml-2 gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">返回题库</span>
          </Button>
          <div className="flex items-center gap-3 md:gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="tabular-nums font-mono">{formatTime(elapsed)}</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
              <span className="font-medium text-foreground tabular-nums">{submittedCount}</span>
              <span>/ {questions.length} 已答</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleFinish} disabled={submittedCount === 0}>
              {submittedCount === questions.length ? '交卷' : '结束练习'}
            </Button>
          </div>
        </div>
        <Progress value={(submittedCount / questions.length) * 100} className="h-0.5 rounded-none" />
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="grid md:grid-cols-[1fr_220px] gap-8">
          {/* 题目区 */}
          <div className="min-w-0">
            {/* Breadcrumb/meta */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge variant="secondary">{categoryName}</Badge>
              {currentQ.subCategory && (
                <Badge variant="outline">{currentQ.subCategory}</Badge>
              )}
              <Badge variant="outline" className="text-amber-600 border-amber-200">
                难度 {'★'.repeat(Math.min(currentQ.difficulty || 1, 5))}
              </Badge>
              <span className="text-sm text-muted-foreground ml-auto">
                第 {currentIndex + 1} / {questions.length} 题
              </span>
            </div>

            {/* 题干 */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {currentQ.number}
                </span>
                <div className="question-content text-[15px] md:text-base text-foreground leading-8 pt-0.5">
                  {currentQ.content}
                </div>
              </div>
            </div>

            {/* 选项 */}
            <div className="space-y-2.5 mb-6">
              {availableKeys.map((key) => {
                const text = cleanOptionText(currentQ.options[key], key, availableKeys)
                const isSelected = currentAnswer === key
                const isCorrect = isSubmitted && key === currentQ.answer
                const isWrong = isSubmitted && isSelected && key !== currentQ.answer
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    disabled={isSubmitted}
                    className={cn(
                      'w-full text-left rounded-lg border px-4 py-3.5 text-sm transition-all flex items-start gap-3',
                      isCorrect && 'border-emerald-500 bg-emerald-50',
                      isWrong && 'border-red-500 bg-red-50',
                      !isSubmitted && isSelected && 'border-primary bg-primary/5',
                      !isSubmitted && !isSelected && 'border-border hover:border-muted-foreground/30 hover:bg-muted/30',
                      isSubmitted && 'cursor-default',
                    )}
                  >
                    <span
                      className={cn(
                        'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5',
                        isCorrect && 'bg-emerald-500 text-white',
                        isWrong && 'bg-red-500 text-white',
                        !isSubmitted && isSelected && 'bg-primary text-primary-foreground',
                        !isSubmitted && !isSelected && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : isWrong ? <XCircle className="h-4 w-4" /> : key}
                    </span>
                    <span className="flex-1 leading-relaxed whitespace-pre-wrap">{text}</span>
                  </button>
                )
              })}
            </div>

            {/* 解析 */}
            {isSubmitted && (
              <Card
                className={cn(
                  'border',
                  currentAnswer === currentQ.answer ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30',
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle
                    className={cn(
                      'text-base flex items-center gap-2',
                      currentAnswer === currentQ.answer ? 'text-emerald-700' : 'text-red-700',
                    )}
                  >
                    {currentAnswer === currentQ.answer ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" /> 回答正确
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" /> 回答错误 · 正确答案：{currentQ.answer}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-[15px] text-muted-foreground leading-7 whitespace-pre-wrap">
                    {currentQ.explanation.replace(/^公考[\s\S]*?\f/, '').trim()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 操作 */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> 上一题
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFlag}
                  className={cn(flagged.has(currentIndex) && 'text-amber-500')}
                >
                  <Flag className="h-4 w-4" />
                </Button>
                {!isSubmitted ? (
                  <Button onClick={handleSubmit} disabled={!currentAnswer} size="lg">
                    提交答案
                  </Button>
                ) : currentIndex < questions.length - 1 ? (
                  <Button onClick={() => goTo(currentIndex + 1)} size="lg" className="gap-1">
                    下一题 <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleFinish} size="lg">
                    完成练习
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === questions.length - 1}
                className="gap-1"
              >
                下一题 <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 答题卡 */}
          <aside className="hidden md:block">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  答题卡
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((q, i) => {
                    const a = answers[i]
                    const s = submitted[i]
                    const isCur = i === currentIndex
                    const isFlagged = flagged.has(i)
                    return (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={cn(
                          'relative h-9 rounded-md text-xs font-medium transition-colors',
                          isCur && 'ring-2 ring-primary ring-offset-1',
                          s && a === q.answer && 'bg-emerald-500 text-white',
                          s && a !== q.answer && 'bg-red-500 text-white',
                          !s && a && 'bg-primary/10 text-primary',
                          !s && !a && 'bg-muted text-muted-foreground hover:bg-muted-foreground/20',
                        )}
                      >
                        {i + 1}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />正确
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />错误
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/10" />已答
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-muted" />未答
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-4 pt-3 border-t">
                  <div>
                    <div className="text-lg font-bold tabular-nums">{answeredCount}</div>
                    <div className="text-[10px] text-muted-foreground">已答</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600 tabular-nums">{correctCount}</div>
                    <div className="text-[10px] text-muted-foreground">正确</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-500 tabular-nums">{submittedCount - correctCount}</div>
                    <div className="text-[10px] text-muted-foreground">错误</div>
                  </div>
                </div>

                <Button className="w-full" onClick={handleFinish} disabled={submittedCount === 0}>
                  交卷
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* 移动端底部小题号 */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 border-t bg-background px-4 py-2">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {questions.map((q, i) => {
            const a = answers[i]
            const s = submitted[i]
            const isCur = i === currentIndex
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'shrink-0 h-7 w-7 rounded text-[11px] font-medium',
                  isCur && 'ring-2 ring-primary ring-offset-1',
                  s && a === q.answer && 'bg-emerald-500 text-white',
                  s && a !== q.answer && 'bg-red-500 text-white',
                  !s && a && 'bg-primary/10 text-primary',
                  !s && !a && 'bg-muted text-muted-foreground',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
