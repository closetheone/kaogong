import { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Question } from '@/types'
import { questionApi } from '@/utils/request'
import { usePracticeStore } from '@/store/usePracticeStore'

const QUESTIONS_PER_SESSION = 10

function cleanOptionText(text: string, currentKey: string, allKeys: string[]): string {
  let t = String(text).replace(/\s+/g, ' ').trim()
  t = t.replace(new RegExp(`^${currentKey}[\\.\\s、]*`), '')
  // 去掉混入的后续选项
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

  const { addRecord } = usePracticeStore()

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    let data: Question[] = []
    try {
      data = await questionApi.getRandom(decodeURIComponent(category), QUESTIONS_PER_SESSION)
    } catch {
      // fallback
    }

    if (!data || data.length === 0) {
      try {
        const res = await fetch('/data/2026行测真题.json')
        const json = await res.json()
        const all: Question[] = json.questions || []
        let filtered = all.filter(
          (q) => q.category === decodeURIComponent(category) || q.category === categoryName,
        )
        if (filtered.length === 0) filtered = all
        data = filtered.sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_SESSION)
      } catch {
        data = []
      }
    }
    setQuestions(data)
    setLoading(false)
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

  const handleSubmit = () => {
    if (!currentAnswer || !currentQ) return
    setSubmitted({ ...submitted, [currentIndex]: true })
    addRecord({
      questionId: currentQ.id,
      userAnswer: currentAnswer,
      isCorrect: currentAnswer === currentQ.answer,
      timeSpent: 0,
      answeredAt: new Date().toISOString(),
    })
  }

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return
    setCurrentIndex(idx)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinish = () => {
    let correct = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })
    nav(`/practice/result`, {
      state: { total: questions.length, correct, category: categoryName },
      replace: true,
    })
  }

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

  const progress = ((currentIndex + 1) / questions.length) * 100
  const allSubmitted = Object.keys(submitted).length === questions.length

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => nav('/practice')} className="gap-1 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="text-sm font-medium">{categoryName}</div>
          <div className="text-sm text-muted-foreground tabular-nums">
            {currentIndex + 1}/{questions.length}
          </div>
        </div>
        <Progress value={progress} className="h-0.5 rounded-none bg-muted" />
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-32 md:pb-8">
        <div className="grid md:grid-cols-[1fr_200px] gap-6">
          {/* 题目 */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 md:p-7">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="secondary" className="font-normal">
                    第 {currentQ.number} 题
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    {currentQ.subCategory || currentQ.category}
                  </Badge>
                  <Badge variant="outline" className="font-normal text-amber-600">
                    难度 {'★'.repeat(Math.min(currentQ.difficulty || 1, 5))}
                  </Badge>
                </div>

                {/* 题干 */}
                <div className="question-content text-[15px] md:text-base text-foreground mb-6">
                  {currentQ.content}
                </div>

                {/* 选项 */}
                <div className="space-y-2.5">
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
                          'w-full text-left rounded-lg border-2 px-4 py-3.5 text-sm transition-all flex items-start gap-3',
                          isCorrect && 'border-emerald-500 bg-emerald-50',
                          isWrong && 'border-red-500 bg-red-50',
                          !isSubmitted && isSelected && 'border-primary bg-primary/5',
                          !isSubmitted && !isSelected && 'border-border hover:border-muted-foreground/30 hover:bg-muted/30',
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
              </CardContent>
            </Card>

            {/* 解析 */}
            {isSubmitted && (
              <Card
                className={cn(
                  'border',
                  currentAnswer === currentQ.answer ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30',
                )}
              >
                <CardContent className="p-5 md:p-6">
                  <div
                    className={cn(
                      'font-semibold mb-3 flex items-center gap-2',
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
                  </div>
                  <div className="text-[15px] text-muted-foreground leading-7 whitespace-pre-wrap">
                    <span className="font-semibold text-foreground">解析：</span>
                    {currentQ.explanation.replace(/^公考[\s\S]*?\f/, '').trim()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Desktop 操作 */}
            <div className="hidden md:flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> 上一题
              </Button>
              {!isSubmitted ? (
                <Button size="lg" onClick={handleSubmit} disabled={!currentAnswer}>
                  提交答案
                </Button>
              ) : currentIndex < questions.length - 1 ? (
                <Button size="lg" onClick={() => goTo(currentIndex + 1)}>
                  下一题 <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="lg" onClick={handleFinish} className="bg-gradient-to-r from-primary to-violet-600">
                  完成练习 🎉
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === questions.length - 1}
                className="text-muted-foreground"
              >
                跳过 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* 答题卡 Desktop */}
          <aside className="hidden md:block">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <div className="font-semibold text-sm mb-3">答题卡</div>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((q, i) => {
                    const a = answers[i]
                    const s = submitted[i]
                    const isCur = i === currentIndex
                    return (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={cn(
                          'h-8 w-full rounded-md text-xs font-medium transition-colors',
                          isCur && 'ring-2 ring-primary ring-offset-1',
                          s && a === q.answer && 'bg-emerald-500 text-white',
                          s && a !== q.answer && 'bg-red-500 text-white',
                          !s && a && 'bg-primary/10 text-primary',
                          !s && !a && 'bg-muted text-muted-foreground hover:bg-muted-foreground/20',
                        )}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />正确
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />错误
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/10" />已答
                  </span>
                </div>
                {allSubmitted && (
                  <Button className="w-full mt-4" onClick={handleFinish}>
                    查看结果
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* 移动端底部操作 */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            {!isSubmitted ? (
              <Button className="w-full" onClick={handleSubmit} disabled={!currentAnswer}>
                提交答案
              </Button>
            ) : currentIndex < questions.length - 1 ? (
              <Button className="w-full" onClick={() => goTo(currentIndex + 1)}>
                下一题 →
              </Button>
            ) : (
              <Button className="w-full bg-gradient-to-r from-primary to-violet-600" onClick={handleFinish}>
                完成练习 🎉
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === questions.length - 1}
            className="shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {/* 小题号 */}
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
                  'shrink-0 h-6 w-6 rounded text-[10px] font-medium',
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
