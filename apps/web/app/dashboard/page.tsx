/**
 * Dashboard Page - RSC Server Component
 * Phase 2 Integration Test: /dashboard
 */

import { Card } from '@aibos/ui'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-fg">Dashboard</h1>
        <p className="text-fg-muted mt-2">Welcome to AI-BOS Platform</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <Card variant="elevated" size="md">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-[var(--color-primary)]">1,234</p>
        </Card>

        <Card variant="elevated" size="md">
          <h3 className="text-lg font-semibold mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-[var(--color-primary)]">89</p>
        </Card>

        <Card variant="elevated" size="md">
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-[var(--color-primary)]">$45,678</p>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <section className="mt-8">
        <Card variant="default" size="lg">
          <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
          <div className="h-64 bg-bg-muted rounded-md flex items-center justify-center">
            <span className="text-fg-muted">Chart Component Placeholder</span>
          </div>
        </Card>
      </section>
    </div>
  )
}

