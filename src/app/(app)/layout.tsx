"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Guitar,
  Radio,
  Save,
  Settings,
  User,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ConvexClientProvider } from "@/components/providers/convex-client-provider"
import { ConnectivityIndicator } from "@/components/connectivity-indicator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const navItems = [
  { label: "Signal Chain", href: "/rig", icon: Guitar },
  { label: "Live", href: "/live", icon: Radio },
  { label: "Presets", href: "/presets", icon: Save },
  { label: "Settings", href: "/settings", icon: Settings },
]

const profileItem = { label: "Profile", href: "/profile", icon: User }

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ConvexClientProvider>
  )
}

function TopNav() {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "shadow-[var(--glass-shadow)]"
      )}
    >
      <SidebarTrigger className="-ml-1" />

      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-[var(--brand-accent)]" />
        <span className="text-sm font-semibold tracking-tight hidden sm:inline">
          AmpSim
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ConnectivityIndicator />
      </div>
    </header>
  )
}

function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-2 px-2 py-1">
          <Zap className="h-5 w-5 shrink-0 text-[var(--brand-accent)]" />
          <span className="truncate text-sm font-bold tracking-tight">
            Amp Simulation
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[var(--glass-border)]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === profileItem.href}
              tooltip={profileItem.label}
            >
              <Link href={profileItem.href}>
                <profileItem.icon className="h-4 w-4" />
                <span>{profileItem.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
