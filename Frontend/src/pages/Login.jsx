import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { loginUser } = useApp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await authApi.login(email, password)
      loginUser(data)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestMode = () => {
    loginUser({
      id: 999,
      email: 'guest@gymx.fit',
      userName: 'Guest Athlete',
      accessToken: 'guest_token',
    })
    navigate('/')
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-md border border-zinc-800/90 bg-[#111114] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Brand */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-zinc-900 border border-zinc-800 mb-2">
            <span className="font-mono text-base font-bold text-zinc-100">
              G<span className="text-orange-500">X</span>
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 m-0">Sign in to GymX</h1>
          <p className="text-xs text-zinc-400">
            Access your workouts, progressive overload logs, and PRs
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded bg-red-950/30 border border-red-900/60 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-zinc-400">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@gymx.fit"
              className="bg-zinc-900 text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-zinc-400">Password</label>
            </div>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="bg-zinc-900 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold h-10 gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-[#111114] px-2 text-zinc-500">or</span>
          </div>
        </div>

        {/* Guest Mode Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGuestMode}
          className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs h-9"
        >
          Continue as Guest
        </Button>

        {/* Switch to Register */}
        <div className="text-center text-xs text-zinc-400 pt-1">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium underline-offset-4 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}
