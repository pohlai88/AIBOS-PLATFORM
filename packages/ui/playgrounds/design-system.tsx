// packages/ui/playgrounds/design-system.tsx
"use client";

import { Button } from "../src/components/button";
import { Card } from "../src/components/card";
import { Badge } from "../src/components/badge";
import { Input } from "../src/components/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../src/components/tabs";
import { AppShell } from "../src/layouts/layout-shell";
import { MetricCard } from "../src/layouts/metric-card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../src/components/dropdown-menu";
import { DashboardLayout } from "../src/layouts/dashboard-layout";
import { useEffect, useState } from "react";

export default function DesignSystemPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = stored === "true" || (!stored && prefersDark);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <AppShell
      sidebar={<DemoSidebar />}
      headerTitle="AI-BOS Design System"
      headerRight={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={toggleDarkMode}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full">
                👤 User Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="space-y-12">
        {/* Dashboard Layout Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Dashboard Layout</h2>
          <p className="text-fg-muted">
            Complete dashboard layout combining Metric Cards, Tabs, and Cards.
          </p>
          <DashboardLayout
            metrics={[
              {
                label: "MRR",
                value: "$84,200",
                description: "Monthly recurring revenue across all tenants.",
                tone: "success",
                trendValue: "+12%",
                trendLabel: "vs last month",
              },
              {
                label: "Active Tenants",
                value: "128",
                description:
                  "Subscribed tenants with active sessions this week.",
                tone: "default",
              },
              {
                label: "Error Rate",
                value: "0.24%",
                description: "App-wide error rate in the last 24 hours.",
                tone: "danger",
                trendValue: "+0.05%",
                trendLabel: "vs baseline",
              },
            ]}
            tabs={{
              defaultValue: "overview",
              tabs: [
                {
                  value: "overview",
                  label: "Overview",
                  content: (
                    <div className="space-y-4">
                      <p className="text-fg-muted">
                        Overview tab content with key metrics and insights.
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <h3 className="mb-2 text-lg font-semibold text-fg">
                            Recent Activity
                          </h3>
                          <p className="text-fg-muted">
                            Track recent user activity and system events.
                          </p>
                        </Card>
                        <Card>
                          <h3 className="mb-2 text-lg font-semibold text-fg">
                            Quick Actions
                          </h3>
                          <p className="text-fg-muted">
                            Common actions and shortcuts for daily tasks.
                          </p>
                        </Card>
                      </div>
                    </div>
                  ),
                },
                {
                  value: "analytics",
                  label: "Analytics",
                  content: (
                    <div className="space-y-4">
                      <p className="text-fg-muted">
                        Analytics tab with detailed reports and charts.
                      </p>
                      <Card>
                        <h3 className="mb-2 text-lg font-semibold text-fg">
                          Performance Metrics
                        </h3>
                        <p className="text-fg-muted">
                          View detailed performance metrics and trends.
                        </p>
                      </Card>
                    </div>
                  ),
                },
                {
                  value: "settings",
                  label: "Settings",
                  content: (
                    <div className="space-y-4">
                      <p className="text-fg-muted">
                        Configure dashboard settings and preferences.
                      </p>
                      <Card>
                        <h3 className="mb-2 text-lg font-semibold text-fg">
                          Preferences
                        </h3>
                        <p className="text-fg-muted">
                          Customize your dashboard experience.
                        </p>
                      </Card>
                    </div>
                  ),
                },
              ],
            }}
            cards={[
              {
                title: "Quick Stats",
                content: (
                  <p className="text-fg-muted">
                    Additional information cards can be added here.
                  </p>
                ),
              },
              {
                title: "Notifications",
                content: (
                  <p className="text-fg-muted">
                    Recent notifications and alerts appear here.
                  </p>
                ),
              },
              {
                title: "Resources",
                content: (
                  <p className="text-fg-muted">
                    Helpful resources and documentation links.
                  </p>
                ),
              },
            ]}
          />
        </section>

        {/* Metric Cards Section (Standalone) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Metric Cards</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="MRR"
              value="$84,200"
              description="Monthly recurring revenue across all tenants."
              tone="success"
              trendValue="+12%"
              trendLabel="vs last month"
            />
            <MetricCard
              label="Active Tenants"
              value="128"
              description="Subscribed tenants with active sessions this week."
              tone="default"
            />
            <MetricCard
              label="Error Rate"
              value="0.24%"
              description="App-wide error rate in the last 24 hours."
              tone="danger"
              trendValue="+0.05%"
              trendLabel="vs baseline"
            />
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Buttons</h2>
          <Card className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                Variants
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                States
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Normal</Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button variant="primary" className="opacity-50">
                  Custom Opacity
                </Button>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                With Layout Classes
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" className="w-full sm:w-auto">
                  Full Width (sm:auto)
                </Button>
                <Button variant="secondary" className="min-w-[200px]">
                  Min Width
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Cards</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <h3 className="mb-2 text-lg font-semibold text-fg">Card Title</h3>
              <p className="text-fg-muted">
                This is a card component using the card token preset. It
                automatically uses bg-elevated, border, radius, and shadow
                tokens.
              </p>
            </Card>
            <Card>
              <h3 className="mb-2 text-lg font-semibold text-fg">
                Another Card
              </h3>
              <p className="text-fg-muted">
                Cards provide a consistent elevated surface for content
                grouping.
              </p>
            </Card>
            <Card>
              <h3 className="mb-2 text-lg font-semibold text-fg">
                Card with Badge
              </h3>
              <div className="mb-2 flex gap-2">
                <Badge variant="primary">New</Badge>
                <Badge variant="muted">Updated</Badge>
              </div>
              <p className="text-fg-muted">
                Cards can contain other components like badges.
              </p>
            </Card>
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Badges</h2>
          <Card className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                Variants
              </h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="primary">Primary Badge</Badge>
                <Badge variant="muted">Muted Badge</Badge>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                Usage Examples
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="primary">New</Badge>
                <Badge variant="primary">Featured</Badge>
                <Badge variant="muted">Draft</Badge>
                <Badge variant="muted">Archived</Badge>
                <span className="text-fg-muted">Status: </span>
                <Badge variant="primary">Active</Badge>
              </div>
            </div>
          </Card>
        </section>

        {/* Input Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Inputs</h2>
          <Card className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                Basic Input
              </h3>
              <div className="space-y-3">
                <Input type="text" placeholder="Enter your name" />
                <Input type="email" placeholder="email@example.com" />
                <Input type="password" placeholder="Password" />
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                With Layout Classes
              </h3>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Full width input"
                  className="w-full"
                />
                <Input
                  type="text"
                  placeholder="Max width input"
                  className="max-w-md"
                />
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                States
              </h3>
              <div className="space-y-3">
                <Input type="text" placeholder="Normal input" />
                <Input type="text" placeholder="Disabled input" disabled />
                <Input
                  type="text"
                  defaultValue="Read-only value"
                  readOnly
                  className="bg-bg-muted"
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Dropdown Menu Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Dropdown Menu</h2>
          <Card className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                User Menu
              </h3>
              <div className="flex flex-wrap gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">👤 User Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary">⚙️ Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Create New</DropdownMenuItem>
                    <DropdownMenuItem>Import</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      Archive (disabled)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                Command Palette Style
              </h3>
              <div className="flex flex-wrap gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">⌘ Command Palette</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[16rem]">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <span className="flex items-center gap-2">
                        <span>⌘</span>
                        <span>Search</span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="flex items-center gap-2">
                        <span>⌘</span>
                        <span>New Document</span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="flex items-center gap-2">
                        <span>⌘</span>
                        <span>Settings</span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                    <DropdownMenuItem>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem>Analytics</DropdownMenuItem>
                    <DropdownMenuItem>Reports</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        </section>

        {/* Tabs Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Tabs</h2>
          <Card className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                Basic Tabs
              </h3>
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList>
                  <TabsTrigger value="tab1">Overview</TabsTrigger>
                  <TabsTrigger value="tab2">Settings</TabsTrigger>
                  <TabsTrigger value="tab3">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <p className="text-fg-muted">
                    This is the overview tab content. Tabs use Radix primitives
                    for behavior and tokens for styling.
                  </p>
                </TabsContent>
                <TabsContent value="tab2">
                  <p className="text-fg-muted">
                    Settings tab content. All styling comes from tokens, no raw
                    colors or palette classes.
                  </p>
                </TabsContent>
                <TabsContent value="tab3">
                  <p className="text-fg-muted">
                    Analytics tab content. The active state uses
                    data-[state=active] with token-based colors.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-fg-muted uppercase tracking-wide">
                Tabs with Content
              </h3>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-fg">
                      Profile Information
                    </h4>
                    <p className="text-fg-muted">
                      Manage your profile settings and personal information.
                    </p>
                    <div className="flex gap-3 pt-2">
                      <Button variant="primary">Save</Button>
                      <Button variant="ghost">Cancel</Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="account">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-fg">
                      Account Settings
                    </h4>
                    <p className="text-fg-muted">
                      Update your account preferences and security settings.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="notifications">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-fg">
                      Notification Preferences
                    </h4>
                    <p className="text-fg-muted">
                      Configure how you receive notifications.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </section>

        {/* Combined Example */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Combined Example</h2>
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-fg">User Profile</h3>
                <p className="text-sm text-fg-muted">
                  Edit your profile information
                </p>
              </div>
              <Badge variant="primary">Active</Badge>
            </div>
            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg">
                  Full Name
                </label>
                <Input type="text" placeholder="John Doe" className="w-full" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="primary">Save Changes</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Token Reference */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-fg">Token Reference</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="mb-3 text-lg font-semibold text-fg">
                Color Tokens
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-bg border border-border" />
                  <code className="text-fg-muted">bg-bg</code>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-bg-muted border border-border" />
                  <code className="text-fg-muted">bg-bg-muted</code>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-bg-elevated border border-border" />
                  <code className="text-fg-muted">bg-bg-elevated</code>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-primary" />
                  <code className="text-fg-muted">bg-primary</code>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-secondary" />
                  <code className="text-fg-muted">bg-secondary</code>
                </div>
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 text-lg font-semibold text-fg">
                Text Tokens
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-fg">text-fg (primary text)</p>
                <p className="text-fg-muted">text-fg-muted (secondary text)</p>
                <p className="text-fg-subtle">text-fg-subtle (tertiary text)</p>
                <p className="text-primary-foreground bg-primary px-2 py-1 rounded inline-block">
                  text-primary-foreground
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Dark Mode Info */}
        <Card className="border-primary-soft bg-primary-soft/20">
          <h3 className="mb-2 text-lg font-semibold text-fg">
            Dark Mode Testing
          </h3>
          <p className="text-fg">
            Use the toggle in the top right to switch between light and dark
            modes. All tokens automatically adapt via CSS variables defined in{" "}
            <code className="rounded bg-bg-muted px-1.5 py-0.5 text-sm">
              globals.css
            </code>
            . Verify:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-fg-muted">
            <li>Background surfaces maintain proper contrast</li>
            <li>Text remains readable in both modes</li>
            <li>Buttons and cards feel consistent</li>
            <li>Focus states are visible</li>
            <li>Borders and shadows adapt appropriately</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}

function DemoSidebar() {
  return (
    <nav className="flex flex-col gap-1 p-4">
      <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide">
        Navigation
      </span>
      <button className="text-left text-sm py-1">Overview</button>
      <button className="text-left text-sm py-1">Design System</button>
      <button className="text-left text-sm py-1">Tokens</button>
      <button className="text-left text-sm py-1">Components</button>
    </nav>
  );
}
