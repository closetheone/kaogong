import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import type { Category } from '@/types'
import { questionApi } from '@/utils/request'

// 默认模块（当后端暂无数据时显示）
const defaultCategories: Category[] = [
  { id: '常识判断', name: '常识判断', icon: '💡', count: 0 },
  { id: '言语理解', name: '言语理解', icon: '📖', count: 0 },
  { id: '数量关系', name: '数量关系', icon: '🔢', count: 0 },
  { id: '判断推理', name: '判断推理', icon: '🧠', count: 0 },
  { id: '资料分析', name: '资料分析', icon: '📊', count: 0 },
]

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
        // 后端没启动时保持默认
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleStart = (category: Category) => {
    nav(`/practice/${encodeURIComponent(category.id)}`, {
      state: { name: category.name },
    })
  }

  return (
    <PageContainer title="选择练习模块">
      <div className="px-4 pt-2">
        <div className="text-sm text-gray-500 mb-4">2026年国考行测真题</div>

        <div className="space-y-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleStart(cat)}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl">
                {cat.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">{cat.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {cat.count > 0 ? `共 ${cat.count} 题` : '题库加载中...'}
                </div>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center text-xs text-gray-400 mt-6">连接题库服务中...</div>
        )}

        <div className="mt-6 bg-blue-50 rounded-2xl p-4">
          <div className="text-sm font-semibold text-blue-900 mb-2">💡 刷题建议</div>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 建议按模块顺序练习，循序渐进</li>
            <li>• 每题控制在 1-2 分钟内</li>
            <li>• 错题及时复习，巩固知识点</li>
          </ul>
        </div>
      </div>
    </PageContainer>
  )
}
