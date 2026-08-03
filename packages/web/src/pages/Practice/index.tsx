import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/types'
import { questionApi } from '@/utils/request'
import { cn } from '@/lib/utils'

const defaultCategories: Category[] = [
  { id: '常识判断', name: '常识判断', icon: '💡', count: 0 },
  { id: '言语理解', name: '言语理解与表达', icon: '📖', count: 0 },
  { id: '数量关系', name: '数量关系', icon: '🔢', count: 0 },
  { id: '判断推理', name: '判断推理', icon: '🧠', count: 0 },
  { id: '资料分析', name: '资料分析', icon: '📊', count: 0 },
]

const subjectMeta: Record<string, { desc: string; emoji: string; color: string }> = {
  常识判断: { desc: '政治、法律、经济、历史、文化、地理、科技', emoji: '💡', color: 'from-amber-400 to-orange-500' },
  言语理解: { desc: '逻辑填空、片段阅读、语句表达', emoji: '📖', color: 'from-blue-400 to-indigo-500' },
  数量关系: { desc: '数学运算、数字推理', emoji: '🔢', color: 'from-violet-400 to-purple-500' },
  判断推理: { desc: '图形推理、定义判断、类比推理、逻辑判断', emoji: '🧠', color: 'from-emerald-400 to-teal-500' },
  资料分析: { desc: '文字、表格、图表资料综合分析', emoji: '📊', color: 'from-rose-400 to-pink-500' },
}

export default function Practice() {
  const nav = useNavigate()
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    questionApi
      .getCountByCategory()
      .then((counts) => {
        setCategories(
          defaultCategories.map((c) => ({
            ...c,
            count: counts[c.id] || counts[c.name] || 0,
          })),
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      {/* Banner */}
      <Card className="border-0 bg-gradient-to-r from-primary to-violet-600 text-primary-foreground shadow-lg">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-5 w-5" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">专项刷题</h1>
          </div>
          <p className="text-sm md:text-base opacity-80">
            选择一个模块，开始 10 道一组的精练 · 2026 国考行测真题
          </p>
        </CardContent>
      </Card>

      {/* 模块卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const meta = subjectMeta[cat.name] || { desc: '', emoji: '📝', color: 'from-gray-400 to-gray-500' }
          return (
            <Card
              key={cat.id}
              className="group cursor-pointer border transition-all hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
              onClick={() =>
                nav(`/practice/${encodeURIComponent(cat.id)}`, { state: { name: cat.name } })
              }
            >
              <CardContent className="p-5 md:p-6 flex gap-4 items-start relative">
                <div
                  className={cn(
                    'shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl text-white shadow-lg bg-gradient-to-br',
                    meta.color,
                  )}
                >
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base md:text-lg">{cat.name}</h3>
                    {cat.count > 0 ? (
                      <Badge variant="secondary" className="font-normal">
                        {cat.count} 题
                      </Badge>
                    ) : loading ? (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    ) : (
                      <Badge variant="outline" className="font-normal">
                        本地真题
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{meta.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                    开始练习 <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 提示 */}
      <Card className="bg-muted/40 border-dashed">
        <CardContent className="p-5 md:p-6">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span>💡</span> 刷题建议
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <span className="text-primary font-bold">1</span>
              <span>按模块循序渐进，先攻强项再补弱项</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-bold">2</span>
              <span>每题控制 1-2 分钟，培养时间感</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary font-bold">3</span>
              <span>错题必须看解析，理解比记答案重要</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
