'use client'

/**
 * Login Page - Client Component (auth form)
 * Phase 2 Integration Test: /auth/login
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card } from '@aibos/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate auth
    if (email === 'test@example.com' && password === 'password') {
      router.push('/dashboard')
    } else {
      setError('Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-8">
      <Card variant="elevated" size="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-fg">Sign In</h1>
          <p className="text-fg-muted mt-2">Welcome back to AI-BOS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-label="Password"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-fg-muted mt-6">
          Test: test@example.com / password
        </p>
      </Card>
    </div>
  )
}

