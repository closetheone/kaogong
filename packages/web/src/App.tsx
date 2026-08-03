import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import Home from '@/pages/Home'
import Practice from '@/pages/Practice'
import PracticeDetail from '@/pages/PracticeDetail'
import PracticeResult from '@/pages/PracticeDetail/result'
import Wrong from '@/pages/Wrong'
import Profile from '@/pages/Profile'

const navItems = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/practice', label: '刷题', icon: '📝' },
  { to: '/wrong', label: '错题本', icon: '❌' },
  { to: '/profile', label: '我的', icon: '👤' },
]

function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 flex-col bg-white border-r border-gray-100 fixed left-0 top-0 bottom-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          考
        </div>
        <span className="ml-2.5 font-bold text-gray-900 text-lg">考公助手</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-xs opacity-80 mb-1">每日一句</div>
          <div className="text-sm font-medium leading-relaxed">
            道阻且长，行则将至
          </div>
        </div>
      </div>
    </aside>
  )
}

function MobileTopBar() {
  const location = useLocation()
  const titleMap: Record<string, string> = {
    '/': '考公助手',
    '/practice': '选择模块',
    '/wrong': '错题本',
    '/profile': '个人中心',
  }
  // 详情/结果页不显示topbar（自己有header）
  const hideTopbar = location.pathname.startsWith('/practice/')
  if (hideTopbar) return null

  const title = titleMap[location.pathname] || '考公助手'
  return (
    <header className="md:hidden sticky top-0 z-40 glass border-b border-gray-200/50 h-14 flex items-center px-4">
      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs mr-2">
        考
      </div>
      <h1 className="font-bold text-gray-900">{title}</h1>
    </header>
  )
}

function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200/50">
      <div className="flex h-16 max-w-lg mx-auto">
        {navItems.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                isActive ? 'text-indigo-600' : 'text-gray-400',
              )
            }
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className="text-[11px]">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function DesktopTopBar() {
  const location = useLocation()
  const titleMap: Record<string, string> = {
    '/': '首页',
    '/practice': '专项刷题',
    '/wrong': '错题本',
    '/profile': '个人中心',
  }
  const title = titleMap[location.pathname] || ''
  if (!title) return null
  return (
    <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-gray-100 bg-white">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm">
          👤
        </div>
      </div>
    </header>
  )
}

function Layout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileTopBar />
      <div className="md:pl-60 lg:pl-64 min-h-screen flex flex-col">
        <DesktopTopBar />
        <main className="flex-1 pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
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
