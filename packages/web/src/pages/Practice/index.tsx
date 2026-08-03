import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Category } from '@/types'
import { questionApi } from '@/utils/request'

const defaultCategories: Category[] = [
  { id: '常识判断', name: '常识判断', icon: '💡', count: 0 },
  { id: '言语理解', name: '言语理解与表达', icon: '📖', count: 0 },
  { id: '数量关系', name: '数量关系', icon: '🔢', count: 0 },
  { id: '判断推理', name: '判断推理', icon: '🧠', count: 0 },
  { id: '资料分析', name: '资料分析', icon: '📊', count: 0 },
]

const subjectDesc: Record<string, string> = {
  常识判断: '涵盖政治、法律、经济、历史、文化、地理等',
  言语理解: '逻辑填空、片段阅读、语句表达',
  数量关系: '数学运算、数字推理',
  判断推理: '图形推理、定义判断、类比推理、逻辑判断',
  资料分析: '文字、表格、图形资料综合分析',
}

const subjectColors: Record<string, string> = {
  常识判断: 'from-amber-400 to-orange-500',
  言语理解: 'from-blue-400 to-indigo-500',
  数量关系: 'from-violet-400 to-purple-500',
  判断推理: 'from-emerald-400 to-teal-500',
  资料分析: 'from-rose-400 to-pink-500',
}

export default function Practice() {
  const nav = useNavigate()
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const counts = await questionApi.getCountByCategory()
        setCategories(
          defaultCategories.map((c) => ({
            ...c,
            count: counts[c.id] || counts[c.name] || 0,
          })),
        )
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleStart = (category: Category) => {
    nav(`/practice/${encodeURIComponent(category.id)}`, { state: { name: category.name } })
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* 顶部 banner */}
      <div className="mb-8">
        <div className="rounded-2xl md:rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 md:p-8 text-white">
          <h1 className="text-xl md:text-2xl font-bold mb-2">专项刷题</h1>
          <p className="text-sm md:text-base opacity-80">选择一个模块，开始 10 道一组的精练</p>
        </div>
      </div>

      {/* 模块卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleStart(cat)}
            className="card-hover bg-white rounded-2xl p-5 md:p-6 text-left shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            {/* 装饰色块 */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${subjectColors[cat.name] || 'from-indigo-400 to-violet-500'} opacity-10 group-hover:opacity-20 transition-opacity`} />

            <div className="relative flex items-start gap-4">
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${subjectColors[cat.name] || 'from-indigo-400 to-violet-500'} flex items-center justify-center text-2xl md:text-3xl text-white shadow-lg shrink-0`}>
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base md:text-lg">{cat.name}</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed">
                  {subjectDesc[cat.name] || '精选真题'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-gray-400">
                    {cat.count > 0 ? `${cat.count} 题` : loading ? '加载中...' : '本地真题'}
                  </span>
                  <span className="text-xs text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
                    开始练习 →
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 提示 */}
      <div className="mt-8 bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3">💡 刷题建议</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex gap-2">
            <span className="text-indigo-500 font-bold">1</span>
            <span>按模块循序渐进，先攻强项再补弱项</span>
          </div>
          <div className="flex gap-2">
            <span className="text-indigo-500 font-bold">2</span>
            <span>每题控制在 1-2 分钟内，培养时间感</span>
          </div>
          <div className="flex gap-2">
            <span className="text-indigo-500 font-bold">3</span>
            <span>错题必须看解析，理解比记答案重要</span>
          </div>
        </div>
      </div>
    </div>
  )
}
