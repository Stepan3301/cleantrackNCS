
import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarContextProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

function useSidebarContext() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

function SidebarProvider({ 
  children, 
  defaultCollapsed = false 
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

function Sidebar({ children, className }: SidebarProps) {
  const { collapsed } = useSidebarContext()
  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-sidebar z-40 border-r border-sidebar-border transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {children}
    </aside>
  )
}

function SidebarHeader({ className, children }: { className?: string, children?: React.ReactNode }) {
  const { collapsed } = useSidebarContext()
  return (
    <div className={cn("px-3 py-4 border-b border-sidebar-border", className)}>
      {children || (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-semibold">
            S
          </div>
          {!collapsed && (
            <span className="ml-2 text-lg font-medium text-sidebar-foreground">
              Sparkle
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function SidebarContent({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className={cn("flex-1 overflow-auto", className)}>
      {children}
    </div>
  )
}

function SidebarFooter({ className, children }: { className?: string, children?: React.ReactNode }) {
  const { collapsed } = useSidebarContext()
  return (
    <div className={cn("px-3 py-3 mt-auto border-t border-sidebar-border", className)}>
      {children || (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            U
          </div>
          {!collapsed && (
            <span className="ml-2 text-sm font-medium text-sidebar-foreground">
              User
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function SidebarGroup({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className={cn("py-2", className)}>
      {children}
    </div>
  )
}

function SidebarGroupLabel({ className, children }: { className?: string, children?: React.ReactNode }) {
  const { collapsed } = useSidebarContext()
  if (collapsed) return null
  return (
    <div className={cn("px-3 py-2 text-xs font-medium text-sidebar-foreground/70", className)}>
      {children}
    </div>
  )
}

function SidebarGroupContent({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

function SidebarMenu({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <ul className={cn("space-y-1 px-2", className)}>
      {children}
    </ul>
  )
}

function SidebarMenuItem({ className, active, children }: { className?: string, active?: boolean, children?: React.ReactNode }) {
  return (
    <li className={cn("", className)}>
      {children}
    </li>
  )
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  active?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ asChild, active, className, ...props }, ref) => {
    const { collapsed } = useSidebarContext()
    const Comp = asChild ? React.Fragment : "button"
    
    return (
      <Comp
        {...(asChild ? {} : { ...props, ref })}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
          collapsed && "justify-center px-0",
          className
        )}
      >
        {asChild ? (
          props.children
        ) : (
          <>
            {props.children}
          </>
        )}
      </Comp>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

function SidebarTrigger({ className }: { className?: string }) {
  const { collapsed, setCollapsed } = useSidebarContext()
  return (
    <button
      onClick={() => setCollapsed(!collapsed)}
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {collapsed ? (
          <path d="M4 6h16M4 12h16M4 18h16" />
        ) : (
          <>
            <path d="M18 6L6 18" />
            <path d="M6 6L18 18" />
          </>
        )}
      </svg>
    </button>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarContext,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebarContext,
}
