import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Dumbbell,
  Library,
  History,
  User,
  LogOut,
  Play
} from 'lucide-react'

export function Navbar() {
  const location = useLocation()
  const {
    user,
    logoutUser,
    activeWorkout,
    isBackendHealthy
  } = useApp()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
      name: 'Workout Log',
      path: '/log',
      icon: Dumbbell,
      badge: activeWorkout ? 'ACTIVE' : null
    },
    { name: 'Exercises', path: '/exercises', icon: Library },
    { name: 'History', path: '/history', icon: History },
  ]

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-mono text-lg font-bold tracking-widest text-zinc-100 group-hover:text-white transition-colors">
                GYM<span className="text-orange-500">X</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isActive
                      ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  <span className="max-w-[100px] truncate">{user.userName || user.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={logoutUser}
                  title="Sign out"
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-zinc-300 hover:text-zinc-100">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-orange-400 border-zinc-700 hover:bg-zinc-800">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 border-t border-zinc-800/90 backdrop-blur-lg px-2 py-1 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-md text-[10px] font-medium transition-colors ${isActive
                ? 'text-orange-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                )}
              </div>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
