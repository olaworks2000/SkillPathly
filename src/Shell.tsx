import React, { useState } from 'react'
import { Menu } from 'lucide-react'

interface ShellProps {
  sidebar: React.ReactNode
  appName?: string
  children: React.ReactNode
}

export function Shell({ sidebar, appName = 'App', children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Sidebar — hidden on mobile unless toggled, always visible on md+ */}
      <div
        className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex w-64 flex-col border-r border-border bg-sidebar`}
      >
        {sidebar}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header — hamburger + app name, only shown below md breakpoint */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-1 rounded hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-sm">{appName}</span>
        </div>

        {/* Page content */}
        {children}
      </div>
    </div>
  )
}
