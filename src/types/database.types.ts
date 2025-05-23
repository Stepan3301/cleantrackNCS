export type UserRole = 'owner' | 'head_manager' | 'supervisor' | 'staff';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  supervisor_id: string | null;
  manager_id: string | null;
  is_active: boolean;
}

export interface WorkingHours {
  id: string;
  user_id: string;
  date: string;
  hours_worked: number;
  description: string | null;
  location: string | null;
  status: 'submitted' | 'approved' | 'rejected';
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkTime {
  id: string;
  user_id: string;
  date: string;
  hours_worked: number;
  description: string | null;
  location: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  record_type: 'staff' | 'supervisor' | null;
  equality: boolean | null;
}

export interface Request {
  id: string;
  user_id: string;
  request_type: 'leave' | 'equipment' | 'timesheet_correction' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  start_date: string | null;
  end_date: string | null;
  handled_by: string | null;
  response_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  date: string;
  location: string;
  description: string | null;
  workers_count: number;
  expenses: number;
  revenue: number;
  profit: number;
  client_name: string | null;
  client_contact: string | null;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  time_start: string;
  time_end: string;
  location: string;
  assigned_staff: string[]; // Array of user IDs
  supervisor_id: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: 'general' | 'direct';
  recipients: string[] | null; // Array of user IDs, null for general announcements
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Bonus {
  id: string;
  user_id: string;
  amount_per_hour: number;
  hours_threshold: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface User {
  id: string;
  email: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  user_id: string;
  performed_by: string;
  details: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      working_hours: {
        Row: WorkingHours;
        Insert: Omit<WorkingHours, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WorkingHours, 'id' | 'created_at' | 'updated_at'>>;
      };
      work_time: {
        Row: WorkTime;
        Insert: Omit<WorkTime, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WorkTime, 'id' | 'created_at' | 'updated_at'>>;
      };
      requests: {
        Row: Request;
        Insert: Omit<Request, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Request, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'profit'>;
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>;
      };
      bonuses: {
        Row: Bonus;
        Insert: Omit<Bonus, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Bonus, 'id' | 'created_at' | 'updated_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AuditLog, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      staff_with_bonuses: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          supervisor_name: string | null;
          manager_name: string | null;
          amount_per_hour: number;
          hours_threshold: number;
          current_month_bonus: number;
        };
      };
    };
    Functions: {
      calculate_user_bonus: {
        Args: {
          user_uuid: string;
          year_month: string;
        };
        Returns: number;
      };
    };
  };
} 