import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

const tabs = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/practice', label: '刷题', icon: '📝' },
  { to: '/wrong', label: '错题', icon: '❌' },
  { to: '/profile', label: '我的', icon: '👤' },
]

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-md mx-auto">
      <div className="flex h-14">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center text-xs gap-0.5 transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-400',
              )
            }
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
