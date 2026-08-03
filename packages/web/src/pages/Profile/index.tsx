import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Pencil,
  Check,
  BarChart3,
  Target,
  Calendar,
  Bell,
  Moon,
  Globe,
  MessageSquare,
  Star,
  Info,
  Trash2,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

interface MenuItem {
  icon: any
  label: string
  desc?: string
  disabled?: boolean
}

const menuGroups: { title: string; items: MenuItem[] }[] = [
  {
    title: '学习',
    items: [
      { icon: BarChart3, label: '学习统计', desc: '查看详细学习数据' },
      { icon: Target, label: '目标设置', desc: '设定考试目标' },
      { icon: Calendar, label: '学习日历', desc: '打卡记录' },
    ],
  },
  {
    title: '设置',
    items: [
      { icon: Bell, label: '消息提醒', desc: '每日刷题提醒' },
      { icon: Moon, label: '深色模式', desc: '即将上线', disabled: true },
      { icon: Globe, label: '服务地址', desc: '配置后端 API' },
    ],
  },
  {
    title: '其他',
    items: [
      { icon: MessageSquare, label: '意见反馈' },
      { icon: Star, label: '给个好评' },
      { icon: Info, label: '关于', desc: 'v1.0.0 · Web' },
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
    <div className="max-w-3xl mx-auto pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-violet-600 to-purple-700 px-6 md:px-10 pt-10 pb-20 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-5">
          <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-white/30 bg-white/20 backdrop-blur">
            <AvatarFallback className="bg-white/10 text-3xl md:text-4xl">
              <UserIcon className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
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
                <Button size="sm" variant="secondary" className="h-8 px-3" onClick={handleSave}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">{nickname}</h1>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    setNewName(nickname)
                    setEditing(true)
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm opacity-80 mt-1">
              <Target className="h-3.5 w-3.5" />
              {targetExam}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-4 md:px-10 -mt-12 relative z-10">
        <Card className="shadow-xl border-0">
          <CardContent className="p-5 md:p-6">
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {[
                { label: '学习天数', value: days, color: 'text-primary' },
                { label: '总题数', value: total, color: 'text-foreground' },
                { label: '答对', value: correct, color: 'text-emerald-600' },
                { label: '正确率', value: `${accuracy}%`, color: 'text-amber-600' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={cn('text-xl md:text-3xl font-bold tabular-nums', s.color)}>
                    {s.value}
                  </div>
                  <div className="text-[11px] md:text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 md:px-10 pt-6 space-y-6">
        {/* 错题入口 */}
        {wrong > 0 && (
          <Card
            className="bg-gradient-to-r from-rose-50 to-red-50 border-rose-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => history.length > 1 ? history.back() : null}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-rose-900 text-sm md:text-base">
                  有 {wrong} 道错题等待复习
                </div>
                <div className="text-xs text-rose-600/70 mt-0.5">及时复盘，巩固知识点</div>
              </div>
              <ChevronRight className="h-5 w-5 text-rose-400" />
            </CardContent>
          </Card>
        )}

        {/* Menu groups */}
        {menuGroups.map((group) => (
          <div key={group.title}>
            <div className="text-xs font-medium text-muted-foreground px-1 mb-2">
              {group.title}
            </div>
            <Card>
              <CardContent className="p-0">
                {group.items.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      disabled={item.disabled}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 md:p-5 text-left transition-colors',
                        idx !== 0 && 'border-t',
                        item.disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-muted/50 cursor-pointer',
                      )}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.label}</div>
                        {item.desc && (
                          <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                        )}
                      </div>
                      {item.disabled ? (
                        <Badge variant="secondary" className="text-[10px]">
                          即将上线
                        </Badge>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Danger */}
        {total > 0 && (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-destructive gap-2"
            onClick={() => {
              if (confirm('确定清空所有刷题记录？此操作不可恢复')) resetAll()
            }}
          >
            <Trash2 className="h-4 w-4" />
            清空刷题数据
          </Button>
        )}

        <div className="text-center text-xs text-muted-foreground/50 pt-2">
          考公智能助手 v1.0.0 · Web 版
        </div>
      </div>
    </div>
  )
}
