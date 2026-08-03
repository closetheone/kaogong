import { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import type { Question } from '@/types'
import { questionApi } from '@/utils/request'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

const QUESTIONS_PER_SESSION = 10

export default function PracticeDetail() {
  const { category = '' } = useParams()
  const location = useLocation()
  const nav = useNavigate()
  const categoryName = (location.state as { name?: string } | null)?.name || decodeURIComponent(category)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)

  const { addRecord } = usePracticeStore()
  const { userId } = useUserStore()
  void userId

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await questionApi.getRandom(decodeURIComponent(category), QUESTIONS_PER_SESSION)
      if (data && data.length > 0) {
        setQuestions(data)
        setLoading(false)
        return
      }
    } catch {
      // fallback
    }
    try {
      const res = await fetch('/data/2026行测真题.json')
      const json = await res.json()
      const all: Question[] = json.questions || []
      const filtered = all.filter(
        (q) => q.category === decodeURIComponent(category) || q.category === categoryName,
      )
      const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_SESSION)
      setQuestions(shuffled.length > 0 ? shuffled : all.slice(0, QUESTIONS_PER_SESSION))
    } catch {
      setQuestions([])
    } finally {
      setLoading(false)
    }
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
    const isCorrect = currentAnswer === currentQ.answer
    addRecord({
      questionId: currentQ.id,
      userAnswer: currentAnswer,
      isCorrect,
      timeSpent: 0,
      answeredAt: new Date().toISOString(),
    })
  }

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return
    setCurrentIndex(idx)
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

  const answeredCount = Object.keys(answers).length
  const submittedCount = Object.keys(submitted).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-gray-500">加载题目中...</div>
        </div>
      </div>
    )
  }

  if (!currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <div className="text-gray-500 mb-4">暂无该模块题目</div>
          <button
            onClick={() => nav('/practice')}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  // 整理选项
  const rawOptions = currentQ.options || {}
  const optionEntries: [string, string][] = []
  // 选项内容可能包含多个选项混在一起（原始JSON里option A可能把BCD都塞进去了），需要处理
  const keys = ['A', 'B', 'C', 'D', 'E', 'F']
  for (const k of keys) {
    const raw = rawOptions[k]
    if (raw === undefined || raw === null) continue
    // 清理：去掉内容里混入的其他选项
    let text = String(raw)
      .replace(/\s+/g, ' ')
      .trim()
    // 去掉开头的 "A." 之类
    text = text.replace(/^[A-F]\.\s*/, '')
    // 如果内容里含有 "B.xxx C.xxx" 这种串，说明是原始数据把后续选项塞进来了，截断
    const nextKeyIdx = text.search(/\s+[B-F]\.\s/)
    if (nextKeyIdx > 0 && k === 'A') {
      text = text.substring(0, nextKeyIdx).trim()
    }
    if (text) optionEntries.push([k, text])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航条 */}
      <header className="sticky top-0 z-30 glass border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => nav(-1)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm">
            <span>←</span> 返回
          </button>
          <div className="text-sm font-medium text-gray-900">{categoryName}</div>
          <div className="text-xs text-gray-500">
            {currentIndex + 1}/{questions.length}
          </div>
        </div>
        {/* 进度条 */}
        <div className="h-0.5 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-32 md:pb-8">
        <div className="grid md:grid-cols-[1fr_200px] gap-6">
          {/* 左侧：题目 */}
          <div>
            {/* 题目标签 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                第 {currentQ.number} 题
              </span>
              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {currentQ.subCategory || currentQ.category}
              </span>
              <span className="text-xs text-gray-400">
                难度：{'★'.repeat(Math.min(currentQ.difficulty || 1, 5))}
              </span>
            </div>

            {/* 题干 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-4">
              <div className="question-content text-[15px] md:text-base text-gray-900">
                {currentQ.content}
              </div>

              {/* 选项 */}
              <div className="mt-6 space-y-3">
                {optionEntries.map(([key, text]) => {
                  const isSelected = currentAnswer === key
                  const isCorrect = isSubmitted && key === currentQ.answer
                  const isWrong = isSubmitted && isSelected && key !== currentQ.answer
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(key)}
                      disabled={isSubmitted}
                      className={clsx(
                        'w-full text-left rounded-xl border-2 px-4 py-3.5 text-sm md:text-[15px] transition-all flex items-start gap-3',
                        isCorrect && 'border-green-500 bg-green-50',
                        isWrong && 'border-red-500 bg-red-50',
                        !isSubmitted && isSelected && 'border-indigo-500 bg-indigo-50',
                        !isSubmitted && !isSelected && 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                      )}
                    >
                      <span
                        className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                          isCorrect && 'bg-green-500 text-white',
                          isWrong && 'bg-red-500 text-white',
                          !isSubmitted && isSelected && 'bg-indigo-500 text-white',
                          !isSubmitted && !isSelected && 'bg-gray-100 text-gray-500',
                        )}
                      >
                        {key}
                      </span>
                      <span className="flex-1 leading-relaxed whitespace-pre-wrap">{text}</span>
                      {isCorrect && <span className="text-green-600 font-bold text-sm">✓</span>}
                      {isWrong && <span className="text-red-500 font-bold text-sm">✗</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 解析 */}
            {isSubmitted && (
              <div
                className={clsx(
                  'rounded-2xl p-6 border',
                  currentAnswer === currentQ.answer
                    ? 'bg-green-50/50 border-green-200'
                    : 'bg-red-50/50 border-red-200',
                )}
              >
                <div
                  className={clsx(
                    'font-bold text-base mb-3 flex items-center gap-2',
                    currentAnswer === currentQ.answer ? 'text-green-700' : 'text-red-700',
                  )}
                >
                  {currentAnswer === currentQ.answer ? (
                    <>✅ 回答正确</>
                  ) : (
                    <>❌ 回答错误，正确答案是 {currentQ.answer}</>
                  )}
                </div>
                <div className="text-[15px] text-gray-700 leading-7 whitespace-pre-wrap">
                  {currentQ.explanation.replace(/^公考[\s\S]*?\f/, '').trim()}
                </div>
              </div>
            )}

            {/* 操作按钮 - 桌面端 */}
            <div className="hidden md:flex items-center justify-between mt-6">
              <button
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← 上一题
              </button>
              <div className="flex items-center gap-3">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!currentAnswer}
                    className={clsx(
                      'px-8 py-2.5 rounded-lg font-semibold text-sm transition-colors',
                      currentAnswer
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                    )}
                  >
                    提交答案
                  </button>
                ) : currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => goTo(currentIndex + 1)}
                    className="px-8 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200"
                  >
                    下一题 →
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 shadow-md shadow-indigo-200"
                  >
                    完成练习 🎉
                  </button>
                )}
              </div>
              {currentIndex === questions.length - 1 && isSubmitted ? null : (
                <button
                  onClick={() => goTo(currentIndex + 1)}
                  disabled={currentIndex === questions.length - 1}
                  className="px-5 py-2.5 rounded-lg text-gray-400 text-sm hover:text-gray-600 disabled:opacity-40"
                >
                  跳过 →
                </button>
              )}
            </div>
          </div>

          {/* 右侧：答题卡（桌面端） */}
          <aside className="hidden md:block">
            <div className="sticky top-24 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="font-semibold text-sm text-gray-900 mb-3">答题卡</div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((_, i) => {
                  const a = answers[i]
                  const s = submitted[i]
                  const isCur = i === currentIndex
                  return (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={clsx(
                        'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                        isCur && 'ring-2 ring-indigo-500 ring-offset-1',
                        s && a === questions[i].answer && 'bg-green-500 text-white',
                        s && a !== questions[i].answer && 'bg-red-500 text-white',
                        !s && a && 'bg-indigo-100 text-indigo-700',
                        !s && !a && 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                      )}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-500 inline-block" /> 正确
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-500 inline-block" /> 错误
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-indigo-100 inline-block" /> 已答
                </span>
              </div>
              {submittedCount === questions.length && (
                <button
                  onClick={handleFinish}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium"
                >
                  查看结果
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* 移动端底部操作栏 */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 glass border-t border-gray-200/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center disabled:opacity-40"
          >
            ←
          </button>
          <div className="flex-1">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!currentAnswer}
                className={clsx(
                  'w-full py-2.5 rounded-lg font-semibold text-sm',
                  currentAnswer
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-400',
                )}
              >
                提交答案
              </button>
            ) : currentIndex < questions.length - 1 ? (
              <button
                onClick={() => goTo(currentIndex + 1)}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm"
              >
                下一题 →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm"
              >
                完成练习 🎉
              </button>
            )}
          </div>
          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === questions.length - 1}
            className="w-10 h-10 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center disabled:opacity-40"
          >
            →
          </button>
        </div>
        {/* 小题号进度 */}
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
          {questions.map((_, i) => {
            const a = answers[i]
            const s = submitted[i]
            const isCur = i === currentIndex
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={clsx(
                  'w-6 h-6 rounded text-[10px] font-medium shrink-0',
                  isCur && 'ring-2 ring-indigo-500',
                  s && a === questions[i].answer && 'bg-green-500 text-white',
                  s && a !== questions[i].answer && 'bg-red-500 text-white',
                  !s && a && 'bg-indigo-100 text-indigo-700',
                  !s && !a && 'bg-gray-100 text-gray-400',
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
