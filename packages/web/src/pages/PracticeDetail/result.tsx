import { useLocation, useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'

export default function PracticeResult() {
  const location = useLocation()
  const nav = useNavigate()
  const { total = 0, correct = 0, category = '' } =
    (location.state as { total?: number; correct?: number; category?: string }) || {}

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  let comment = ''
  let emoji = ''
  if (accuracy >= 90) {
    comment = '学霸级别！继续保持！'
    emoji = '🏆'
  } else if (accuracy >= 70) {
    comment = '表现不错，再接再厉！'
    emoji = '👍'
  } else if (accuracy >= 50) {
    comment = '还需努力，多刷几道！'
    emoji = '💪'
  } else {
    comment = '别灰心，错题本里见！'
    emoji = '📚'
  }

  return (
    <PageContainer title="练习结果" paddingBottom={false}>
      <div className="px-4 pt-8 flex flex-col items-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <div className="text-5xl font-bold text-primary-600 mb-2">{accuracy}%</div>
        <div className="text-sm text-gray-500 mb-1">{comment}</div>
        <div className="text-xs text-gray-400">
          {category} · 答对 {correct} / {total} 题
        </div>

        {/* 圆环 */}
        <div className="mt-8 w-full bg-white rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-400 mt-1">总题数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{correct}</div>
              <div className="text-xs text-gray-400 mt-1">答对</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{total - correct}</div>
              <div className="text-xs text-gray-400 mt-1">答错</div>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full space-y-3">
          <button
            onClick={() => nav(-2)}
            className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm active:bg-primary-700"
          >
            再来一组
          </button>
          <button
            onClick={() => nav('/wrong')}
            className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm"
          >
            查看错题
          </button>
          <button
            onClick={() => nav('/')}
            className="w-full py-3 rounded-xl text-gray-500 text-sm"
          >
            返回首页
          </button>
        </div>
      </div>
    </PageContainer>
  )
}
