import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, BookX, Home, Clock, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatTime(s: number) {
  if (!s) return '--'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}分${sec}秒`
}

export default function PracticeResult() {
  const location = useLocation()
  const nav = useNavigate()
  const { total = 0, correct = 0, category = '', time = 0 } =
    (location.state as { total?: number; correct?: number; category?: string; time?: number }) || {}

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const wrong = total - correct

  let comment = ''
  let emoji = ''
  let color = ''
  let grade = ''
  if (accuracy >= 90) {
    comment = '学霸级别！这模块你拿捏了'
    emoji = '🏆'
    color = 'from-amber-400 to-orange-500'
    grade = '优秀'
  } else if (accuracy >= 70) {
    comment = '表现不错，再巩固一下错题'
    emoji = '👍'
    color = 'from-emerald-400 to-teal-500'
    grade = '良好'
  } else if (accuracy >= 50) {
    comment = '还需努力，多刷几道找感觉'
    emoji = '💪'
    color = 'from-blue-400 to-indigo-500'
    grade = '及格'
  } else {
    comment = '别灰心，去错题本好好复盘'
    emoji = '📚'
    color = 'from-rose-400 to-red-500'
    grade = '需加强'
  }

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (accuracy / 100) * circumference

  return (
    <div className="bg-zinc-50 min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => nav('/')} className="-ml-2 gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
        {/* Result Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className={`bg-gradient-to-br ${color} p-8 md:p-10 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-white/20 text-white border-0 mb-3">{category}</Badge>
                <div className="flex items-center gap-3">
                  <span className="text-5xl md:text-6xl">{emoji}</span>
                  <div>
                    <div className="text-lg opacity-90">{comment}</div>
                    <div className="text-2xl font-bold mt-1">{grade}</div>
                  </div>
                </div>
              </div>

              <div className="relative w-32 h-32 md:w-36 md:h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
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
                  <div className="text-xs opacity-80 mt-0.5">正确率</div>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="grid grid-cols-4 divide-x">
              <div className="text-center py-5">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground mt-1">总题数</div>
              </div>
              <div className="text-center py-5">
                <div className="text-2xl font-bold text-emerald-600">{correct}</div>
                <div className="text-xs text-muted-foreground mt-1">答对</div>
              </div>
              <div className="text-center py-5">
                <div className="text-2xl font-bold text-red-500">{wrong}</div>
                <div className="text-xs text-muted-foreground mt-1">答错</div>
              </div>
              <div className="text-center py-5">
                <div className="text-2xl font-bold text-muted-foreground">{formatTime(time)}</div>
                <div className="text-xs text-muted-foreground mt-1">用时</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats details */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">平均每题</div>
                <div className="font-semibold text-sm">
                  {total > 0 ? `${Math.round((time || 0) / total)}秒` : '--'}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">目标正确率</div>
                <div className="font-semibold text-sm">70%</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">状态</div>
                <div className="font-semibold text-sm">
                  {accuracy >= 70 ? '👍 不错' : accuracy >= 50 ? '💪 加油' : '📚 继续'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <Button size="lg" className={`w-full bg-gradient-to-r ${color} border-0 hover:opacity-90`} onClick={() => nav(-2)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              再来一组
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" variant="outline" onClick={() => nav('/wrong')}>
                <BookX className="h-4 w-4 mr-2" />
                查看错题
              </Button>
              <Button size="lg" variant="outline" onClick={() => nav('/')}>
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
