import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, RotateCcw, BookX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PracticeResult() {
  const location = useLocation()
  const nav = useNavigate()
  const { total = 0, correct = 0, category = '' } =
    (location.state as { total?: number; correct?: number; category?: string }) || {}

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const wrong = total - correct

  let comment = ''
  let emoji = ''
  let color = ''
  if (accuracy >= 90) {
    comment = '学霸级别！这模块你拿捏了'
    emoji = '🏆'
    color = 'from-amber-400 to-orange-500'
  } else if (accuracy >= 70) {
    comment = '表现不错，再巩固一下错题'
    emoji = '👍'
    color = 'from-emerald-400 to-teal-500'
  } else if (accuracy >= 50) {
    comment = '还需努力，多刷几道找感觉'
    emoji = '💪'
    color = 'from-blue-400 to-indigo-500'
  } else {
    comment = '别灰心，去错题本好好复盘'
    emoji = '📚'
    color = 'from-rose-400 to-red-500'
  }

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (accuracy / 100) * circumference

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => nav('/')} className="-ml-2 gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        {/* Result Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className={`bg-gradient-to-br ${color} p-8 md:p-12 text-white text-center relative`}>
            <div className="text-6xl mb-4">{emoji}</div>
            <p className="text-sm md:text-base opacity-90 mb-8">{comment}</p>

            <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="white"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-bold">{accuracy}%</div>
                <div className="text-xs opacity-80 mt-1">正确率</div>
              </div>
            </div>

            {category && <p className="mt-6 text-sm opacity-80">{category}</p>}
          </div>

          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x">
              <div className="text-center py-5">
                <div className="text-2xl md:text-3xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground mt-1">总题数</div>
              </div>
              <div className="text-center py-5">
                <div className="text-2xl md:text-3xl font-bold text-emerald-600">{correct}</div>
                <div className="text-xs text-muted-foreground mt-1">答对</div>
              </div>
              <div className="text-center py-5">
                <div className="text-2xl md:text-3xl font-bold text-red-500">{wrong}</div>
                <div className="text-xs text-muted-foreground mt-1">答错</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            size="lg"
            className={`w-full bg-gradient-to-r ${color} shadow-lg border-0 hover:opacity-90`}
            onClick={() => nav(-2)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            再来一组
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => nav('/wrong')}>
            <BookX className="h-4 w-4 mr-2" />
            查看错题本
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => nav('/')}>
            <Home className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>
      </div>
    </div>
  )
}
