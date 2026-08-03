import { useState } from 'react'
import PageContainer from '@/components/PageContainer'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

export default function Profile() {
  const { records } = usePracticeStore()
  const { nickname, setUser, targetExam } = useUserStore()
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState(nickname)

  const totalQuestions = records.length
  const correct = records.filter((r) => r.isCorrect).length
  const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0
  const days = new Set(records.map((r) => new Date(r.answeredAt).toDateString())).size

  const menuItems = [
    { icon: '🎯', label: '目标设置', onClick: () => {} },
    { icon: '📊', label: '学习统计', onClick: () => {} },
    { icon: '⚙️', label: '设置', onClick: () => {} },
    { icon: 'ℹ️', label: '关于', onClick: () => {} },
  ]

  const handleSave = () => {
    setUser({ nickname: newName })
    setEditing(false)
  }

  return (
    <PageContainer title="我的">
      {/* 用户卡片 */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-500 mx-4 mt-2 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            👤
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-white/20 rounded px-2 py-1 text-sm text-white placeholder-white/60 outline-none w-24"
                  placeholder="昵称"
                  maxLength={12}
                />
                <button onClick={handleSave} className="text-xs bg-white/20 px-2 py-1 rounded">
                  保存
                </button>
              </div>
            ) : (
              <>
                <div className="font-semibold text-lg">{nickname}</div>
                <div className="text-white/80 text-xs mt-0.5">目标：{targetExam}</div>
              </>
            )}
          </div>
          {!editing && (
            <button
              onClick={() => {
                setNewName(nickname)
                setEditing(true)
              }}
              className="text-xs bg-white/20 px-3 py-1 rounded-full"
            >
              编辑
            </button>
          )}
        </div>

        <div className="mt-5 bg-white/15 rounded-xl p-4 flex backdrop-blur-sm">
          <div className="flex-1 text-center">
            <div className="text-xl font-bold">{days}</div>
            <div className="text-[10px] text-white/70 mt-0.5">学习天数</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex-1 text-center">
            <div className="text-xl font-bold">{totalQuestions}</div>
            <div className="text-[10px] text-white/70 mt-0.5">刷题总数</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex-1 text-center">
            <div className="text-xl font-bold">{accuracy}%</div>
            <div className="text-[10px] text-white/70 mt-0.5">正确率</div>
          </div>
        </div>
      </div>

      {/* 菜单 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        {menuItems.map((item, idx) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={
              'w-full px-4 py-3.5 flex items-center gap-3 active:bg-gray-50 transition-colors ' +
              (idx > 0 ? 'border-t border-gray-100' : '')
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="flex-1 text-left text-sm text-gray-800">{item.label}</span>
            <span className="text-gray-300">›</span>
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-gray-300 mt-8">考公智能助手 v1.0.0</div>
    </PageContainer>
  )
}
