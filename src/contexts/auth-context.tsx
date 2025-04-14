
import React, { createContext, useState, useContext, useEffect } from "react"

// Define user roles
export type UserRole = "owner" | "head_manager" | "manager" | "supervisor" | "staff"

// User interface
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// Context interface
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: any) => Promise<boolean>
  loading: boolean
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Sample user data for demo
const mockUsers = [
  { 
    id: "1", 
    name: "Admin User", 
    email: "admin@sparkle.ae", 
    password: "admin123", 
    role: "owner" as UserRole 
  },
  { 
    id: "2", 
    name: "Head Manager", 
    email: "manager@sparkle.ae", 
    password: "manager123", 
    role: "head_manager" as UserRole 
  },
  { 
    id: "3", 
    name: "Supervisor", 
    email: "supervisor@sparkle.ae", 
    password: "supervisor123", 
    role: "supervisor" as UserRole 
  },
  { 
    id: "4", 
    name: "Staff Member", 
    email: "staff@sparkle.ae", 
    password: "staff123", 
    role: "staff" as UserRole 
  }
]

// Provider component
export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    
    // In a real app, this would be an API call
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const foundUser = mockUsers.find(
        u => u.email === email && u.password === password
      )
      
      if (foundUser) {
        // Remove password before storing in state/localStorage
        const { password: _, ...safeUser } = foundUser
        setUser(safeUser)
        localStorage.setItem("user", JSON.stringify(safeUser))
        localStorage.setItem("isAuthenticated", "true")
        setLoading(false)
        return true
      }
      
      setLoading(false)
      return false
    } catch (error) {
      console.error("Login error", error)
      setLoading(false)
      return false
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("isAuthenticated")
  }

  // Register function (would submit for approval in real app)
  const register = async (userData: any): Promise<boolean> => {
    setLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, this would create a pending registration
      console.log("Registration submitted:", userData)
      
      setLoading(false)
      return true
    } catch (error) {
      console.error("Registration error", error)
      setLoading(false)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider")
  }
  return context
}
