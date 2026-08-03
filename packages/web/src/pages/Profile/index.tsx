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
  XCircle,
  Flame,
  Award,
  Settings,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useUserStore } from '@/store/useUserStore'

interface MenuGroup {
  title: string
  items: {
    icon: any
    label: string
    desc?: string
    disabled?: boolean
    badge?: string
  }[]
}

const menuGroups: MenuGroup[] = [
  {
    title: '学习',
    items: [
      { icon: BarChart3, label: '学习统计', desc: '详细学习数据分析' },
      { icon: Target, label: '考试目标', desc: '设定目标考试和日期' },
      { icon: Calendar, label: '学习日历', desc: '查看打卡记录' },
    ],
  },
  {
    title: '设置',
    items: [
      { icon: Bell, label: '提醒设置', desc: '每日刷题提醒' },
      { icon: Moon, label: '深色模式', desc: '即将上线', disabled: true, badge: 'soon' },
      { icon: Globe, label: '服务地址', desc: '配置后端 API 地址' },
    ],
  },
  {
    title: '关于',
    items: [
      { icon: MessageSquare, label: '意见反馈' },
      { icon: Star, label: '给个好评' },
      { icon: Info, label: '关于考公助手', desc: 'v1.0.0 · Web' },
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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="border-0 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-white/20 bg-white/10">
              <AvatarFallback className="bg-white/10 text-2xl md:text-3xl">
                <UserIcon className="h-8 w-8 md:h-10 md:w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="h-9 w-40 bg-white/10 border-white/20 text-white"
                    maxLength={12}
                    autoFocus
                  />
                  <Button size="sm" variant="secondary" className="h-9" onClick={handleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold">{nickname}</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => {
                      setNewName(nickname)
                      setEditing(true)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" /> {targetExam}
                </span>
                {days > 0 && (
                  <span className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-amber-400" /> 已打卡 {days} 天
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-[10px]">天</Badge>
            </div>
            <div className="text-3xl font-bold tabular-nums">{days}</div>
            <div className="text-xs text-muted-foreground mt-0.5">学习天数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-[10px]">题</Badge>
            </div>
            <div className="text-3xl font-bold tabular-nums">{total}</div>
            <div className="text-xs text-muted-foreground mt-0.5">累计刷题</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-4 w-4 text-emerald-500" />
              <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px]">%</Badge>
            </div>
            <div className="text-3xl font-bold tabular-nums text-emerald-600">{accuracy}</div>
            <div className="text-xs text-muted-foreground mt-0.5">正确率</div>
            <Progress value={accuracy} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-4 w-4 text-rose-500" />
              <Badge variant="error" className="text-[10px]">道</Badge>
            </div>
            <div className="text-3xl font-bold tabular-nums text-rose-500">{wrong}</div>
            <div className="text-xs text-muted-foreground mt-0.5">错题待攻克</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick action */}
      {wrong > 0 && (
        <Card className="bg-rose-50 border-rose-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => nav('/wrong')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-rose-500 text-white flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-rose-900">
                有 {wrong} 道错题等待复习
              </div>
              <div className="text-xs text-rose-600/70 mt-0.5">及时复盘，巩固知识点</div>
            </div>
            <ChevronRight className="h-5 w-5 text-rose-400" />
          </CardContent>
        </Card>
      )}

      {/* Menu */}
      {menuGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {group.items.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={item.label}>
                  {idx > 0 && <Separator />}
                  <button
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 md:p-5 text-left transition-colors',
                      item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50 cursor-pointer',
                    )}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="text-[10px] h-4 font-normal">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.desc && <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {/* Danger */}
      {total > 0 && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive gap-2"
            onClick={() => {
              if (confirm('确定清空所有刷题记录？此操作不可恢复')) resetAll()
            }}
          >
            <Trash2 className="h-4 w-4" />
            清空刷题数据
          </Button>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground/50 pt-2 pb-4 flex items-center justify-center gap-1">
        <Settings className="h-3 w-3" />
        考公智能助手 v1.0.0 · Web
      </div>
    </div>
  )
}
