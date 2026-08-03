import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  BookOpen,
  XCircle,
  User as UserIcon,
  Menu,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
// 页面
import HomePage from '@/pages/Home'
import Practice from '@/pages/Practice'
import PracticeDetail from '@/pages/PracticeDetail'
import PracticeResult from '@/pages/PracticeDetail/result'
import Wrong from '@/pages/Wrong'
import Profile from '@/pages/Profile'
import { useUserStore } from '@/store/useUserStore'

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/practice', label: '专项刷题', icon: BookOpen },
  { to: '/wrong', label: '错题本', icon: XCircle },
  { to: '/profile', label: '我的', icon: UserIcon },
]

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { nickname } = useUserStore()
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          考
        </div>
        <span className="font-bold tracking-tight">考公助手</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Daily Quote */}
      <div className="m-3 rounded-xl bg-gradient-to-br from-primary to-violet-600 p-4 text-primary-foreground">
        <div className="flex items-center gap-1.5 text-xs opacity-80 mb-1.5">
          <Sparkles className="h-3 w-3" />
          每日一句
        </div>
        <p className="text-sm font-medium leading-snug">
          道阻且长，行则将至；<br />行而不辍，未来可期。
        </p>
      </div>

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-xs">
              {nickname?.slice(0, 1) || '考'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{nickname || '考公人'}</div>
            <div className="text-xs text-muted-foreground">上岸进行中</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopTopBar() {
  const location = useLocation()
  const titleMap: Record<string, string> = {
    '/': '概览',
    '/practice': '专项刷题',
    '/wrong': '错题本',
    '/profile': '个人中心',
  }
  const title = titleMap[location.pathname] || ''
  if (!title) return null
  return (
    <header className="hidden md:flex h-14 items-center justify-between px-8 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <h1 className="font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground hidden lg:block">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <BarChart3 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

function MobileHeader() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const hideHeader = location.pathname.startsWith('/practice/')
  const titleMap: Record<string, string> = {
    '/': '考公助手',
    '/practice': '选择模块',
    '/wrong': '错题本',
    '/profile': '个人中心',
  }
  if (hideHeader) return null
  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4">
        <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold">{titleMap[location.pathname] || '考公助手'}</h1>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <Sidebar onNavigate={() => setOpen(false)} />
      </Sheet>
    </>
  )
}

function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-lg">
        {navItems.map((t) => {
          const Icon = t.icon
          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {t.label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 border-r bg-background fixed inset-y-0 left-0 z-40 flex-col">
        <Sidebar />
      </aside>

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <MobileHeader />
        <DesktopTopBar />
        <main className="flex-1 pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:category" element={<PracticeDetail />} />
            <Route path="/practice/result" element={<PracticeResult />} />
            <Route path="/wrong" element={<Wrong />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
      <MobileTabBar />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
