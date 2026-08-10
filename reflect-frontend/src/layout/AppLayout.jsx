import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity,
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  Goal,
  Home,
  Lightbulb,
  LogOut,
  Moon,
  Sun,
  Target,
  User,
} from 'lucide-react'

export default function AppLayout({ auth }) {
  const navigate = useNavigate()
  const [theme, setTheme] = useState(localStorage.getItem('reflect_theme') || 'light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('reflect_theme', theme)
  }, [theme])

  const links = [
    ['/dashboard', Home, 'Dashboard'],
    ['/goals', Goal, 'Goals'],
    ['/activity-logs', ClipboardList, 'Activity'],
    ['/habits', CalendarCheck, 'Habits'],
    ['/self-assessment', BookOpenCheck, 'Assessment'],
    ['/insights', Lightbulb, 'Insights'],
    ['/profile', User, 'Profile'],
  ]

  function logout() {
    localStorage.removeItem('reflect_token')
    auth.setUser(null)
    navigate('/login')
  }

  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <Target size={26} />
          <span>Reflect</span>
        </div>
        <nav>
          {links.map(([to, Icon, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-info">
            <strong>{auth.user?.name || 'User'}</strong>
            <span>{auth.user?.email}</span>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="ghost" onClick={logout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
