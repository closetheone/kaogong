import { useMemo, useState } from 'react'
import PageContainer from '@/components/PageContainer'
import { usePracticeStore } from '@/store/usePracticeStore'
import type { Question } from '@/types'

interface WrongItem {
  question: Question
  userAnswer: string
  wrongTime: string
}

export default function Wrong() {
  const { records, resetAll } = usePracticeStore()
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [questionCache, setQuestionCache] = useState<Record<string, Question>>({})

  const wrongList = useMemo(() => {
    const wrong = records.filter((r) => !r.isCorrect)
    const map = new Map<string, WrongItem>()
    for (const r of wrong) {
      const q = questionCache[r.questionId] || ({
        id: r.questionId,
        content: '题目加载中...',
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

  // 尝试从本地真题数据加载错题详情
  useMemo(() => {
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

  const categories = useMemo(() => {
    const set = new Set(wrongList.map((w) => w.question.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [wrongList])

  const filtered = filter === 'all' ? wrongList : wrongList.filter((w) => w.question.category === filter)

  return (
    <PageContainer title="错题本">
      <div className="px-4 pt-2">
        <div className="text-sm text-gray-500 mb-3">共 {wrongList.length} 道错题</div>

        {/* 分类筛选 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ' +
                (filter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200')
              }
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-gray-400 text-sm">暂无错题，继续保持！</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const { question, userAnswer } = item
              const isOpen = expanded === question.id
              const correctAnswer = question.answer
              return (
                <div key={question.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <button
                    className="w-full text-left"
                    onClick={() => setExpanded(isOpen ? null : question.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">
                        {question.category || '未知'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.wrongTime).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800 leading-relaxed line-clamp-2 whitespace-pre-wrap">
                      {question.content}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-red-500">你的答案：{userAnswer}</span>
                      <span className="text-green-600">正确答案：{correctAnswer}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {question.explanation.replace(/^公考.*\f/, '')}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {wrongList.length > 0 && (
          <button
            onClick={() => {
              if (confirm('确定清空所有练习记录和错题吗？')) resetAll()
            }}
            className="mt-6 w-full py-2.5 text-xs text-gray-400"
          >
            清空记录
          </button>
        )}
      </div>
    </PageContainer>
  )
}
