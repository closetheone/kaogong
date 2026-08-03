import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Question } from '@/types'
import { usePracticeStore } from '@/store/usePracticeStore'
import clsx from 'clsx'

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
    ;(async () => {
      try {
        const res = await fetch('/data/2026行测真题.json')
        const json = await res.json()
        const all: Question[] = json.questions || []
        const map: Record<string, Question> = {}
        for (const q of all) map[q.id] = q
        setQuestionCache(map)
      } catch {
        // ignore
      }
    })()
  }, [])

  const wrongList = useMemo(() => {
    const wrong = records.filter((r) => !r.isCorrect)
    const map = new Map<string, WrongItem>()
    for (const r of wrong) {
      const q = questionCache[r.questionId] || ({
        id: r.questionId,
        content: '（题目详情暂无，请连接后端服务）',
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
      map.set(r.questionId, {
        question: q,
        userAnswer: r.userAnswer,
        wrongTime: r.answeredAt,
      })
    }
    return Array.from(map.values())
  }, [records, questionCache])

  const categories = useMemo(() => {
    const set = new Set(wrongList.map((w) => w.question.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [wrongList])

  const filtered = filter === 'all' ? wrongList : wrongList.filter((w) => w.question.category === filter)

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
      {/* 顶部统计 */}
      <div className="mb-6 md:mb-8">
        <div className="rounded-2xl md:rounded-3xl bg-gradient-to-r from-rose-500 to-red-600 p-6 md:p-8 text-white">
          <div className="text-sm opacity-80 mb-1">错题本</div>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-4xl md:text-5xl font-bold">{wrongList.length}</div>
              <div className="text-sm opacity-80 mt-1">道错题待攻克</div>
            </div>
            <div className="pb-1 text-sm opacity-70">
              💡 每道错题都是提分机会
            </div>
          </div>
        </div>
      </div>

      {/* 分类筛选 */}
      {wrongList.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={clsx(
                'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                filter === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300',
              )}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 md:py-24 bg-white rounded-2xl border border-gray-100">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-gray-700 font-medium mb-1">太棒了！</div>
          <div className="text-gray-400 text-sm">
            {wrongList.length === 0 ? '还没有错题，去刷一组题吧' : '该分类暂无错题'}
          </div>
          {wrongList.length === 0 && (
            <button
              onClick={() => nav('/practice')}
              className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              开始刷题
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filtered.map((item) => {
            const { question, userAnswer } = item
            const isOpen = expanded === question.id
            const correctAnswer = question.answer
            return (
              <div key={question.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  className="w-full text-left p-5"
                  onClick={() => setExpanded(isOpen ? null : question.id)}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-xs font-medium">
                      {question.category || '未知'}
                    </span>
                    {question.subCategory && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {question.subCategory}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(item.wrongTime).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div className="text-sm md:text-[15px] text-gray-800 leading-relaxed line-clamp-2 whitespace-pre-wrap">
                    {question.content}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400 text-xs">你的答案</span>
                      <span className="text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded">
                        {userAnswer}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400 text-xs">正确答案</span>
                      <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                        {correctAnswer || '-'}
                      </span>
                    </span>
                    <span className="ml-auto text-xs text-gray-400">
                      {isOpen ? '收起 ▲' : '解析 ▼'}
                    </span>
                  </div>
                </button>

                {isOpen && question.explanation && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-900 mb-2">📖 答案解析</div>
                      <div className="text-sm text-gray-700 leading-7 whitespace-pre-wrap bg-gray-50 rounded-xl p-4">
                        {question.explanation.replace(/^公考[\s\S]*?\f/, '').trim()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {wrongList.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              if (confirm('确定清空所有练习记录？此操作不可恢复')) {
                resetAll()
                setExpanded(null)
              }
            }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            清空所有记录
          </button>
        </div>
      )}
    </div>
  )
}
