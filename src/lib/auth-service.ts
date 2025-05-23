import { supabase } from './supabase';
import { User, Profile, UserRole } from '@/types/database.types';
import { PostgrestError } from '@supabase/supabase-js';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
}

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// Cache for storing user data to reduce Supabase calls
const userCache = new Map<string, CacheEntry<Profile | Profile[]>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

class AuthService {
  private handleError(error: Error | PostgrestError, context: string): Error {
    console.error(`[AuthService] ${context} Error:`, error);
    return new Error((error as Error).message || `Error during ${context}`);
  }

  /**
   * Clear cache entries with TTL exceeded
   */
  private cleanCache() {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
      if (value.expiry < now) {
        userCache.delete(key);
      }
    }
  }

  /**
   * Get current user from Supabase Auth
   */
  async getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (error) {
      throw this.handleError(error, "getCurrentUser");
    }
  }

  /**
   * Get current user profile with role information
   */
  async getCurrentUserProfile() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return null;
      }
      
      // Check cache first
      const cachedProfile = userCache.get(user.id);
      if (cachedProfile && cachedProfile.expiry > Date.now()) {
        return cachedProfile.data;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      // Cache the result with expiration
      userCache.set(user.id, {
        data,
        expiry: Date.now() + CACHE_TTL
      });
      
      return data;
    } catch (error) {
      throw this.handleError(error, "getCurrentUserProfile");
    }
  }

  /**
   * Sign up a new user and create profile
   */
  async signUp(userData: RegisterData) {
    try {
      // Validate user data
      if (!userData.email || !userData.password || !userData.name || !userData.role) {
        throw new Error("Missing required fields for registration");
      }
      
      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }
      
      // Create a profile for the user with status set to 'pending_approval'
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name: userData.name,
        role: userData.role,
        phone_number: userData.phone || null,
        status: "pending_approval",
        is_active: true
      });
      
      if (profileError) {
        // If profile creation fails, try to clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
      
      // Create a registration request in the requests table
      const { error: requestError } = await supabase.from("requests").insert({
        user_id: authData.user.id,
        request_type: "registration",
        title: "New Registration",
        description: `User ${userData.name} (${userData.email}) has completed email confirmation and is awaiting approval.`,
        status: "pending"
      });
      
      if (requestError) {
        console.error("Error creating registration request:", requestError);
        // Continue even if request creation fails, just log the error
      }
      
      return authData.user;
    } catch (error) {
      throw this.handleError(error, "signUp");
    }
  }

  /**
   * Sign in a user with email and password
   */
  async signIn({ email, password }: { email: string; password: string }) {
    try {
      // Clear any expired cache entries
      this.cleanCache();
      
      // Check if there is a pending registration request for this email
      try {
        const { data: registrationRequests } = await supabase
          .from('registration_requests')
          .select('status')
          .eq('email', email)
          .order('created_at', { ascending: false })
          .limit(1);
          
        // If there's a pending request, prevent login
        if (registrationRequests && registrationRequests.length > 0) {
          const request = registrationRequests[0];
          if (request.status === 'pending') {
            throw new Error('Your registration is pending approval by an administrator. Please try again later.');
          } else if (request.status === 'rejected') {
            throw new Error('Your registration request has been rejected. Please contact an administrator for more information.');
          }
        }
      } catch (requestError) {
        // If the error is specifically about pending/rejected registration, rethrow
        if (requestError instanceof Error && 
           (requestError.message.includes('pending approval') || 
            requestError.message.includes('rejected'))) {
          throw requestError;
        }
        // Otherwise log and continue (might be a DB error but we don't want to block login)
        console.error("Error checking registration status:", requestError);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Verify the user has an active profile and check approval status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_active, status')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        throw new Error('Failed to verify user profile status');
      }
      
      // If user account has been deactivated, prevent login
      if (profile && profile.is_active === false) {
        // Sign out immediately
        await this.signOut();
        throw new Error('Your account has been deactivated. Please contact an administrator.');
      }
      
      // If user account is pending approval, prevent login
      if (profile && profile.status === 'pending_approval') {
        // Sign out immediately
        await this.signOut();
        throw new Error('Your account is pending approval by an administrator. Please try again later.');
      }
      
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      throw this.handleError(error, "signIn");
    }
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear user cache on sign out
      userCache.clear();
      
      return true;
    } catch (error) {
      throw this.handleError(error, "signOut");
    }
  }

  /**
   * Check if a user is signed in
   */
  async isAuthenticated() {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      throw this.handleError(error, "isAuthenticated");
    }
  }

  /**
   * Get a user by ID
   */
  async getUserById(userId: string) {
    try {
      // Check cache first
      const cachedUser = userCache.get(userId);
      if (cachedUser && cachedUser.expiry > Date.now()) {
        return cachedUser.data;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      // Cache the result with expiration
      userCache.set(userId, {
        data,
        expiry: Date.now() + CACHE_TTL
      });
      
      return data;
    } catch (error) {
      throw this.handleError(error, "getUserById");
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<Profile[]> {
    try {
      // For collections, we use a special cache key
      const cacheKey = "all_users";
      const cachedUsers = userCache.get(cacheKey);
      
      if (cachedUsers && cachedUsers.expiry > Date.now()) {
        return cachedUsers.data as Profile[];
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");
        
      if (error) {
        throw error;
      }
      
      // Cache the result with expiration
      userCache.set(cacheKey, {
        data,
        expiry: Date.now() + CACHE_TTL
      });
      
      return data as Profile[];
    } catch (error) {
      console.error("Error fetching all users:", error);
      return []; // Return empty array as fallback
    }
  }

  /**
   * Assign a supervisor to a staff
   */
  async assignSupervisor(staffId: string, supervisorId: string) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ supervisor_id: supervisorId })
        .eq("id", staffId);
      
      if (error) {
        throw error;
      }
      
      // Invalidate cache for the staff member
      userCache.delete(staffId);
      
      // Invalidate all users cache as relationships changed
      userCache.delete("all_users");
      
      return true;
    } catch (error) {
      throw this.handleError(error, "assignSupervisor");
    }
  }

  /**
   * Assign a manager to a supervisor
   */
  async assignManager(supervisorId: string, managerId: string) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ manager_id: managerId })
        .eq("id", supervisorId);
        
      if (error) {
        throw error;
      }
      
      // Invalidate cache for the supervisor
      userCache.delete(supervisorId);
      
      // Invalidate all users cache as relationships changed
      userCache.delete("all_users");
      
      return true;
    } catch (error) {
      throw this.handleError(error, "assignManager");
    }
  }

  /**
   * Deactivate a user
   */
  async deactivateUser(userId: string) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "inactive" })
        .eq("id", userId);
        
      if (error) {
        throw error;
      }
      
      // Invalidate cache for the user
      userCache.delete(userId);
      
      // Invalidate all users cache
      userCache.delete("all_users");
      
      return true;
    } catch (error) {
      throw this.handleError(error, "deactivateUser");
    }
  }

  /**
   * Check if user can manage another user
   */
  async canUserManage(currentUserId: string, targetUserId: string) {
    try {
      // Get both user profiles
      const currentUser = await this.getUserById(currentUserId);
      const targetUser = await this.getUserById(targetUserId);
      
      if (!currentUser || !targetUser) {
        return false;
      }
      
      // Owner can manage everyone
      if (currentUser.role === "owner") {
        return true;
      }
      
      // Head Manager can manage everyone except owner
      if (currentUser.role === "head_manager" && targetUser.role !== "owner") {
        return true;
      }
      
      // Manager can manage supervisors and staff
      if (currentUser.role === "manager" && 
          (targetUser.role === "supervisor" || targetUser.role === "staff")) {
        return true;
      }
      
      // Supervisor can only manage staff assigned to them
      if (currentUser.role === "supervisor" && 
          targetUser.role === "staff" && 
          targetUser.supervisor_id === currentUserId) {
        return true;
      }
      
      return false;
    } catch (error) {
      throw this.handleError(error, "canUserManage");
    }
  }
  
  /**
   * Invalidate all cached data
   * Used when major data changes occur
   */
  invalidateCache() {
    userCache.clear();
  }
}

export const authService = new AuthService();

/* Comment out debug code
// Expose debug function globally if in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.debugAuth = {
    getUserId: () => authService.debugGetUserId()
  };
}
*/ 