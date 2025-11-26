"use client";

/**
 * Settings Profile Page - Client Component (forms)
 * Phase 2 Integration Test: /settings/profile
 */

import { useState } from "react";
import { Button, Input, Card } from "@aibos/ui";

export default function ProfilePage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-fg">Profile Settings</h1>
        <p className="text-fg-muted mt-2">Manage your account settings</p>
      </header>

      <Card variant="default" size="lg" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Full Name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email Address"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
            {saved && (
              <span className="text-green-600 text-sm">Profile updated!</span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
