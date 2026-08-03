import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  XCircle,
  User,
  Menu,
  Sparkles,
  Search,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'

import HomePage from '@/pages/Home'
import Practice from '@/pages/Practice'
import PracticeDetail from '@/pages/PracticeDetail'
import PracticeResult from '@/pages/PracticeDetail/result'
import Wrong from '@/pages/Wrong'
import Profile from '@/pages/Profile'
import { useUserStore } from '@/store/useUserStore'

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/practice', label: '题库练习', icon: BookOpen },
  { to: '/wrong', label: '错题本', icon: XCircle },
]

const secondaryNav = [{ to: '/profile', label: '个人中心', icon: User }]

function Sidebar({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const { nickname } = useUserStore()
  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-sm text-white">
          <GraduationCap className="h-4 w-4" />
        </div>
        <span className="font-bold text-lg tracking-tight">考公助手</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-muted-foreground font-mono ml-1 border border-sidebar-border">
          v1.0
        </span>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-muted-foreground" />
          <div className="w-full h-9 rounded-md bg-sidebar-accent/50 border border-sidebar-border pl-9 pr-2 flex items-center text-sm text-sidebar-muted-foreground gap-2 cursor-text">
            搜索题目...
            <kbd className="ml-auto text-[10px] text-sidebar-muted-foreground/70 bg-sidebar-background border border-sidebar-border px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
          学习
        </div>
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
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}

        <div className="px-3 py-2 mt-4 text-[11px] font-semibold text-sidebar-muted-foreground uppercase tracking-wider">
          账户
        </div>
        {secondaryNav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
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
      <div className="m-3 rounded-lg bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 p-3 dark:from-indigo-500/20 dark:to-violet-500/20">
        <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 dark:text-indigo-400 mb-1">
          <Sparkles className="h-3 w-3" />
          每日一句
        </div>
        <p className="text-xs text-sidebar-foreground/80 leading-snug italic">
          "道阻且长，行则将至"
        </p>
      </div>

      {/* User + Theme */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2 flex-1 hover:bg-sidebar-accent transition-colors cursor-pointer">
            <Avatar className="h-8 w-8 bg-sidebar-accent">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-muted-foreground text-xs">
                {nickname?.slice(0, 1) || '考'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{nickname || '考公人'}</div>
              <div className="text-[11px] text-sidebar-muted-foreground">2026 国考备考中</div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

function TopBar() {
  const location = useLocation()
  const titleMap: Record<string, { title: string; desc?: string }> = {
    '/': { title: '学习仪表盘', desc: '掌握你的备考进度' },
    '/practice': { title: '题库练习', desc: '2026 年国考行测真题' },
    '/wrong': { title: '错题本', desc: '查漏补缺，精准提升' },
    '/profile': { title: '个人中心' },
  }
  const info = titleMap[location.pathname]
  if (location.pathname.startsWith('/practice/')) return null
  if (!info) return null
  return (
    <header className="hidden md:flex h-16 items-center justify-between px-8 border-b bg-background/95 backdrop-blur">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{info.title}</h1>
        {info.desc && <p className="text-xs text-muted-foreground mt-0.5">{info.desc}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground hidden lg:block">
          {new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}

function MobileHeader() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const hideHeader = location.pathname.startsWith('/practice/') && location.pathname !== '/practice'
  const titleMap: Record<string, string> = {
    '/': '考公助手',
    '/practice': '题库练习',
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
        <h1 className="font-semibold flex-1">{titleMap[location.pathname] || '考公助手'}</h1>
        <ThemeToggle />
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <Sidebar onNavigate={() => setOpen(false)} className="w-72" />
      </Sheet>
    </>
  )
}

function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-lg">
        {[...navItems, ...secondaryNav].map((t) => {
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
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <MobileHeader />
        <TopBar />
        <main className="flex-1 pb-20 md:pb-0 bg-background">
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
