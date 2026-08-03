import { useLocation, useNavigate } from 'react-router-dom'

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

  // 圆环进度
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (accuracy / 100) * circumference

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 glass border-b border-gray-200/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button onClick={() => nav('/')} className="flex items-center gap-1 text-gray-600 text-sm">
            <span>←</span> 返回首页
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* 结果卡片 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className={`bg-gradient-to-br ${color} p-8 md:p-10 text-white text-center relative`}>
            <div className="text-5xl md:text-6xl mb-3">{emoji}</div>
            <div className="text-sm md:text-base opacity-80 mb-5">{comment}</div>

            {/* 圆环 */}
            <div className="relative w-36 h-36 md:w-40 md:h-40 mx-auto">
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
                <div className="text-xs opacity-80">正确率</div>
              </div>
            </div>

            {category && (
              <div className="mt-5 text-sm opacity-80">{category}</div>
            )}
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-100 p-4">
            <div className="text-center py-3">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-400 mt-1">总题数</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-bold text-green-600">{correct}</div>
              <div className="text-xs text-gray-400 mt-1">答对</div>
            </div>
            <div className="text-center py-3">
              <div className="text-2xl font-bold text-red-500">{wrong}</div>
              <div className="text-xs text-gray-400 mt-1">答错</div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={() => nav(-2)}
            className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${color} text-white font-semibold text-sm shadow-lg active:scale-[0.98] transition-transform`}
          >
            再来一组
          </button>
          <button
            onClick={() => nav('/wrong')}
            className="w-full py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
          >
            查看错题本
          </button>
          <button
            onClick={() => nav('/')}
            className="w-full py-3 text-gray-400 text-sm hover:text-gray-600"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}
