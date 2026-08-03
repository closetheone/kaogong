import { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import PageContainer from '@/components/PageContainer'
import type { Question } from '@/types'
import { questionApi } from '@/utils/request'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

// 内置真题数据（后端不可用时使用）
const QUESTIONS_PER_SESSION = 10

export default function PracticeDetail() {
  const { category = '' } = useParams()
  const location = useLocation()
  const nav = useNavigate()
  const categoryName = (location.state as { name?: string } | null)?.name || decodeURIComponent(category)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(true)
  const [localQuestions, setLocalQuestions] = useState<Question[]>([])

  const { addRecord, answerQuestion, currentSession, startSession } = usePracticeStore()
  const { userId } = useUserStore()

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await questionApi.getRandom(decodeURIComponent(category), QUESTIONS_PER_SESSION)
      if (data && data.length > 0) {
        setQuestions(data)
        setLocalQuestions([])
        return
      }
    } catch {
      // 后端不可用，使用本地真题数据
    }

    // fallback: 加载本地真题 JSON
    try {
      const res = await fetch('/data/2026行测真题.json')
      const json = await res.json()
      const all: Question[] = json.questions || []
      const filtered = all.filter(
        (q) => q.category === decodeURIComponent(category) || q.category === categoryName,
      )
      const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_SESSION)
      setLocalQuestions(shuffled)
      setQuestions(shuffled)
    } catch {
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [category, categoryName])

  useEffect(() => {
    startSession(decodeURIComponent(category))
    loadQuestions()
  }, [category, loadQuestions, startSession])

  const currentQ = questions[currentIndex]

  const handleSelect = (key: string) => {
    if (showResult) return
    setSelectedAnswer(key)
  }

  const handleSubmit = () => {
    if (!selectedAnswer || !currentQ) return
    setShowResult(true)
    answerQuestion(currentQ.id, selectedAnswer)

    const isCorrect = selectedAnswer === currentQ.answer
    addRecord({
      questionId: currentQ.id,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpent: 0,
      answeredAt: new Date().toISOString(),
    })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer('')
      setShowResult(false)
    } else {
      // 结束，跳转到结果汇总
      const total = questions.length
      const correct = questions.filter((q, i) => {
        if (i === currentIndex) return selectedAnswer === q.answer
        return (currentSession?.answers[q.id] || selectedAnswer) === q.answer
      }).length
      nav(`/practice/result`, {
        state: { total, correct, category: categoryName },
        replace: true,
      })
    }
  }

  const optionKeys = ['A', 'B', 'C', 'D', 'E', 'F']

  if (loading) {
    return (
      <PageContainer title={categoryName}>
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">加载题目中...</div>
      </PageContainer>
    )
  }

  if (!currentQ) {
    return (
      <PageContainer title={categoryName}>
        <div className="px-4 pt-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-gray-500 text-sm">暂无该模块题目</div>
          <button
            onClick={() => nav(-1)}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-full text-sm"
          >
            返回
          </button>
        </div>
      </PageContainer>
    )
  }

  const optionEntries = Object.entries(currentQ.options)

  return (
    <PageContainer title={categoryName}>
      {/* 进度条 */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>
            第 {currentIndex + 1} / {questions.length} 题
          </span>
          <span>
            难度：{'⭐'.repeat(Math.min(currentQ.difficulty || 1, 5))}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="px-4 pt-2 pb-36">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[15px] leading-relaxed text-gray-900 whitespace-pre-wrap">
            {currentQ.content}
          </div>

          <div className="mt-5 space-y-2.5">
            {optionEntries.map(([key, text], idx) => {
              const isSelected = selectedAnswer === key
              const isCorrect = showResult && key === currentQ.answer
              const isWrong = showResult && isSelected && key !== currentQ.answer
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  disabled={showResult}
                  className={clsx(
                    'w-full text-left rounded-xl border-2 px-4 py-3 text-sm transition-all flex items-start gap-3',
                    isCorrect && 'border-green-500 bg-green-50 text-green-800',
                    isWrong && 'border-red-500 bg-red-50 text-red-800',
                    !showResult && isSelected && 'border-primary-500 bg-primary-50 text-primary-800',
                    !showResult && !isSelected && 'border-gray-200 bg-white active:bg-gray-50',
                  )}
                >
                  <span
                    className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                      isCorrect && 'bg-green-500 text-white',
                      isWrong && 'bg-red-500 text-white',
                      !showResult && isSelected && 'bg-primary-500 text-white',
                      !showResult && !isSelected && 'bg-gray-100 text-gray-500',
                    )}
                  >
                    {key}
                  </span>
                  <span className="flex-1 leading-relaxed whitespace-pre-wrap">
                    {String(text).replace(/^[A-F]\.\s*/, '').replace(/[\s]+[A-F]\.\s*.*$/, '')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 解析 */}
        {showResult && (
          <div
            className={clsx(
              'mt-4 rounded-2xl p-4 border',
              selectedAnswer === currentQ.answer
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200',
            )}
          >
            <div
              className={clsx(
                'font-semibold text-sm mb-2',
                selectedAnswer === currentQ.answer ? 'text-green-700' : 'text-red-700',
              )}
            >
              {selectedAnswer === currentQ.answer ? '✅ 回答正确' : `❌ 回答错误（正确答案：${currentQ.answer}）`}
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              <span className="font-semibold">解析：</span>
              {currentQ.explanation.replace(/^公考.*\f/, '')}
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-4 py-3 bg-white/95 backdrop-blur border-t border-gray-100 z-40">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className={clsx(
              'w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors',
              selectedAnswer ? 'bg-primary-600 active:bg-primary-700' : 'bg-gray-300',
            )}
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm active:bg-primary-700"
          >
            {currentIndex < questions.length - 1 ? '下一题 →' : '查看结果'}
          </button>
        )}
      </div>
    </PageContainer>
  )
}
