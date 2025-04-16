import React, { createContext, useState, useContext, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { User as AuthUser } from "@supabase/supabase-js"

// Update UserRole type to match database expectations
export type UserRole = "owner" | "head_manager" | "manager" | "supervisor" | "cleaner"

// User interface with more explicit optional fields to handle all combinations
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  supervisorId?: string
  managerId?: string
}

// Context interface
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: any) => Promise<boolean>
  loading: boolean
  users: User[]
  assignSupervisor: (userId: string, supervisorId: string) => Promise<void>
  assignManager: (supervisorId: string, managerId: string) => Promise<void>
  deactivateUser: (userId: string) => Promise<void>
  isUserManager: (userId: string) => boolean
  isUserSupervisor: (userId: string) => boolean
  canUserManage: (currentUser: User | null, targetUserId: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
      
      if (error) throw error
      
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    // First set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user
        setAuthUser(currentUser || null)
        
        if (currentUser) {
          const { data: profile } = await supabase
            .from('users_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single()
            
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              supervisorId: profile.supervisor_id,
              managerId: profile.manager_id
            })
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user
      setAuthUser(currentUser || null)
      
      if (currentUser) {
        supabase
          .from('users_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                supervisorId: profile.supervisor_id,
                managerId: profile.manager_id
              })
            }
          })
      }
      setLoading(false)
    })

    // Fetch all users initially
    fetchUsers()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setAuthUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Register function
  const register = async (userData: any): Promise<boolean> => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      })
      
      if (error) throw error
      
      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Assign supervisor to staff member
  const assignSupervisor = async (userId: string, supervisorId: string) => {
    try {
      const { error } = await supabase
        .from('users_profiles')
        .update({ supervisor_id: supervisorId })
        .eq('id', userId)
      
      if (error) throw error
      
      await fetchUsers()
    } catch (error) {
      console.error('Error assigning supervisor:', error)
    }
  }

  // Assign manager to supervisor
  const assignManager = async (supervisorId: string, managerId: string) => {
    try {
      const { error } = await supabase
        .from('users_profiles')
        .update({ manager_id: managerId })
        .eq('id', supervisorId)
      
      if (error) throw error
      
      await fetchUsers()
    } catch (error) {
      console.error('Error assigning manager:', error)
    }
  }

  // Deactivate user
  const deactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users_profiles')
        .delete()
        .eq('id', userId)
      
      if (error) throw error
      
      await fetchUsers()
    } catch (error) {
      console.error('Error deactivating user:', error)
    }
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
