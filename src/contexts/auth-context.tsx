
import React, { createContext, useState, useContext, useEffect } from "react"

// Define user roles
export type UserRole = "owner" | "head_manager" | "manager" | "supervisor" | "staff"

// User interface
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  supervisorId?: string  // ID of the supervisor (for staff)
  managerId?: string     // ID of the manager (for supervisors)
}

// Context interface
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: any) => Promise<boolean>
  loading: boolean
  users: any[]  // Expose users to check hierarchy
  assignSupervisor: (userId: string, supervisorId: string) => void
  assignManager: (supervisorId: string, managerId: string) => void
  deactivateUser: (userId: string) => void
  isUserManager: (userId: string) => boolean
  isUserSupervisor: (userId: string) => boolean
  canUserManage: (currentUser: User | null, targetUserId: string) => boolean
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
    role: "supervisor" as UserRole,
    managerId: "7" // Assigned to Khaled Rahman (manager)
  },
  { 
    id: "4", 
    name: "Staff Member", 
    email: "staff@sparkle.ae", 
    password: "staff123", 
    role: "staff" as UserRole,
    supervisorId: "3" // Assigned to Supervisor
  }
]

// Provider component
export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState(mockUsers)

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
      
      const foundUser = users.find(
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

  // Register function (actually adds the user to our mock database)
  const register = async (userData: any): Promise<boolean> => {
    setLoading(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate unique ID
      const id = (users.length + 1).toString()
      
      // Create new user object
      const newUser = {
        id,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role as UserRole
      }
      
      // Add to mock users array
      setUsers(prevUsers => [...prevUsers, newUser])
      
      console.log("Registration submitted:", userData)
      
      // Set the user as logged in
      const { password: _, ...safeUser } = newUser
      setUser(safeUser)
      localStorage.setItem("user", JSON.stringify(safeUser))
      localStorage.setItem("isAuthenticated", "true")
      
      setLoading(false)
      return true
    } catch (error) {
      console.error("Registration error", error)
      setLoading(false)
      return false
    }
  }

  // Assign supervisor to staff member
  const assignSupervisor = (userId: string, supervisorId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, supervisorId } : user
      )
    )
    
    // Update current user if it's the one being modified
    if (user && user.id === userId) {
      setUser({ ...user, supervisorId })
      localStorage.setItem("user", JSON.stringify({ ...user, supervisorId }))
    }
  }

  // Assign manager to supervisor
  const assignManager = (supervisorId: string, managerId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === supervisorId ? { ...user, managerId } : user
      )
    )
    
    // Update current user if it's the one being modified
    if (user && user.id === supervisorId) {
      setUser({ ...user, managerId })
      localStorage.setItem("user", JSON.stringify({ ...user, managerId }))
    }
  }

  // Deactivate user (in a real app, you'd likely set a status flag rather than delete)
  const deactivateUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
  }
  
  // Helper functions for role checks
  const isUserManager = (userId: string) => {
    const foundUser = users.find(u => u.id === userId)
    return foundUser?.role === "manager"
  }
  
  const isUserSupervisor = (userId: string) => {
    const foundUser = users.find(u => u.id === userId)
    return foundUser?.role === "supervisor" 
  }
  
  // Function to check if current user can manage/see target user
  const canUserManage = (currentUser: User | null, targetUserId: string): boolean => {
    if (!currentUser) return false
    
    // Owner and head manager can see everyone
    if (currentUser.role === "owner" || currentUser.role === "head_manager") return true
    
    const targetUser = users.find(u => u.id === targetUserId)
    if (!targetUser) return false
    
    // Managers can see their supervisors and those supervisors' staff
    if (currentUser.role === "manager") {
      if (targetUser.role === "supervisor" && targetUser.managerId === currentUser.id) return true
      if (targetUser.role === "staff") {
        const supervisor = users.find(u => u.id === targetUser.supervisorId)
        return supervisor?.managerId === currentUser.id
      }
      return false
    }
    
    // Supervisors can only see their staff
    if (currentUser.role === "supervisor") {
      return targetUser.role === "staff" && targetUser.supervisorId === currentUser.id
    }
    
    // Staff can't manage anyone
    return false
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      loading, 
      users,
      assignSupervisor,
      assignManager,
      deactivateUser,
      isUserManager,
      isUserSupervisor,
      canUserManage
    }}>
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
