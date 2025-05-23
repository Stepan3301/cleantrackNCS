import { supabase } from '../supabase';
import { Task } from '@/types/database.types';

export interface TaskInput {
  title: string;
  description: string;
  date: string;
  time_start: string;
  time_end: string;
  location: string;
  assigned_staff: string[];
  supervisor_id: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

export const tasksService = {
  /**
   * Get all tasks
   */
  async getAllTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles!tasks_supervisor_id_fkey(name)')
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get a task by ID
   */
  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles!tasks_supervisor_id_fkey(name)')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Create a new task
   */
  async createTask(taskData: TaskInput) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        date: taskData.date,
        time_start: taskData.time_start,
        time_end: taskData.time_end,
        location: taskData.location,
        assigned_staff: taskData.assigned_staff,
        supervisor_id: taskData.supervisor_id,
        status: taskData.status,
        notes: taskData.notes || null,
        created_by: userData.user.id
      })
      .select();
      
    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Update a task
   */
  async updateTask(id: string, updates: Partial<TaskInput>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates
      })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Update task status
   */
  async updateTaskStatus(id: string, status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled', notes?: string) {
    const updates: Partial<TaskInput> = { status };
    
    if (notes) {
      updates.notes = notes;
    }
    
    return this.updateTask(id, updates);
  },
  
  /**
   * Delete a task
   */
  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
    
    return true;
  },
  
  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled') {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles!tasks_supervisor_id_fkey(name)')
      .eq('status', status)
      .order('date', { ascending: false });
      
    if (error) {
      console.error(`Error fetching ${status} tasks:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get tasks for a specific date
   */
  async getTasksForDate(date: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles!tasks_supervisor_id_fkey(name)')
      .eq('date', date)
      .order('time_start', { ascending: true });
      
    if (error) {
      console.error(`Error fetching tasks for ${date}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get tasks assigned to a specific staff member
   */
  async getTasksForStaff(staffId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles!tasks_supervisor_id_fkey(name)')
      .contains('assigned_staff', [staffId])
      .order('date', { ascending: true });
      
    if (error) {
      console.error(`Error fetching tasks for staff ${staffId}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get tasks for a specific supervisor
   */
  async getTasksForSupervisor(supervisorId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles!tasks_supervisor_id_fkey(name)')
      .eq('supervisor_id', supervisorId)
      .order('date', { ascending: true });
      
    if (error) {
      console.error(`Error fetching tasks for supervisor ${supervisorId}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(days: number = 7) {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*, profiles!tasks_supervisor_id_fkey(name)')
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching upcoming tasks:', error);
      throw error;
    }
    
    return data || [];
  }
}; 