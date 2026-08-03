import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

const menuGroups = [
  {
    title: '学习',
    items: [
      { icon: '📊', label: '学习统计', desc: '查看详细学习数据' },
      { icon: '🎯', label: '目标设置', desc: '设定考试目标' },
      { icon: '📅', label: '学习日历', desc: '打卡记录' },
    ],
  },
  {
    title: '设置',
    items: [
      { icon: '🔔', label: '消息提醒', desc: '每日刷题提醒' },
      { icon: '🌙', label: '深色模式', desc: '即将上线' },
      { icon: '🌐', label: '服务地址', desc: '配置后端 API' },
    ],
  },
  {
    title: '其他',
    items: [
      { icon: '💬', label: '意见反馈', desc: '' },
      { icon: '⭐', label: '给个好评', desc: '' },
      { icon: 'ℹ️', label: '关于', desc: 'v1.0.0' },
    ],
  },
]

export default function Profile() {
  const nav = useNavigate()
  void nav
  const { records, resetAll } = usePracticeStore()
  const { nickname, setUser, targetExam } = useUserStore()
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState(nickname)

  const total = records.length
  const correct = records.filter((r) => r.isCorrect).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const days = new Set(records.map((r) => new Date(r.answeredAt).toDateString())).size
  const wrong = records.filter((r) => !r.isCorrect).length

  const handleSave = () => {
    setUser({ nickname: newName.trim() || '考公人' })
    setEditing(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 md:px-10 pt-10 pb-16 md:pb-20 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl md:text-5xl border-2 border-white/30">
            👤
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="bg-white/20 rounded-lg px-3 py-1.5 text-base text-white placeholder-white/60 outline-none w-36"
                  placeholder="昵称"
                  maxLength={12}
                  autoFocus
                />
                <button onClick={handleSave} className="text-sm bg-white/20 px-3 py-1.5 rounded-lg">
                  保存
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold">{nickname}</h1>
                  <button
                    onClick={() => {
                      setNewName(nickname)
                      setEditing(true)
                    }}
                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
                  >
                    编辑
                  </button>
                </div>
                <div className="text-sm opacity-80 mt-1">🎯 目标：{targetExam}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 数据统计卡片 - 负margin 浮出 */}
      <div className="px-4 md:px-10 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-500/5 p-5 md:p-6 grid grid-cols-4 gap-2 md:gap-4">
          {[
            { label: '学习天数', value: days, color: 'text-indigo-600' },
            { label: '总题数', value: total, color: 'text-gray-900' },
            { label: '答对', value: correct, color: 'text-green-600' },
            { label: '正确率', value: `${accuracy}%`, color: 'text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-xl md:text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] md:text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 内容 */}
      <div className="px-4 md:px-10 py-6 space-y-6">
        {/* 错题快捷入口 */}
        {wrong > 0 && (
          <button
            onClick={() => history.length > 1 ? history.back() : null}
            className="w-full bg-gradient-to-r from-rose-50 to-red-50 border border-rose-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xl">
              ❌
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-rose-900 text-sm md:text-base">
                有 {wrong} 道错题等待复习
              </div>
              <div className="text-xs text-rose-600/70 mt-0.5">及时复盘，巩固知识点</div>
            </div>
            <span className="text-rose-400">→</span>
          </button>
        )}

        {/* 菜单组 */}
        {menuGroups.map((group) => (
          <div key={group.title}>
            <div className="text-xs text-gray-400 font-medium px-1 mb-2 md:mb-3">
              {group.title}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {group.items.map((item, idx) => (
                <button
                  key={item.label}
                  className={
                    'w-full px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left ' +
                    (idx > 0 ? 'border-t border-gray-100' : '')
                  }
                >
                  <span className="text-xl md:text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm md:text-[15px] font-medium text-gray-800">{item.label}</div>
                    {item.desc && <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>}
                  </div>
                  <span className="text-gray-300">›</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* 清空数据 */}
        {total > 0 && (
          <button
            onClick={() => {
              if (confirm('确定清空所有刷题记录？')) resetAll()
            }}
            className="w-full py-4 text-center text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            清空刷题数据
          </button>
        )}

        <div className="text-center text-xs text-gray-300 pt-4">
          考公智能助手 v1.0.0 · Web 版
        </div>
      </div>
    </div>
  )
}
