import { supabase } from '../supabase';
import { Order } from '@/types/database.types';

export interface OrderInput {
  date: string;
  location: string;
  description?: string;
  workers_count: number;
  expenses: number;
  revenue: number;
  client_name?: string;
  client_contact?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export const ordersService = {
  /**
   * Get all orders
   */
  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get an order by ID
   */
  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Create a new order
   */
  async createOrder(orderData: OrderInput) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('orders')
      .insert({
        date: orderData.date,
        location: orderData.location,
        description: orderData.description || null,
        workers_count: orderData.workers_count,
        expenses: orderData.expenses,
        revenue: orderData.revenue,
        client_name: orderData.client_name || null,
        client_contact: orderData.client_contact || null,
        status: orderData.status,
        created_by: userData.user.id
      })
      .select();
      
    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Update an order
   */
  async updateOrder(id: string, updates: Partial<OrderInput>) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates
      })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating order:', error);
      throw error;
    }
    
    return data?.[0];
  },
  
  /**
   * Delete an order
   */
  async deleteOrder(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
    
    return true;
  },
  
  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled') {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('date', { ascending: false });
      
    if (error) {
      console.error(`Error fetching ${status} orders:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get orders in a date range
   */
  async getOrdersInDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching orders in date range:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get summary statistics
   */
  async getOrderStats(period: 'week' | 'month' | 'year' = 'month') {
    let startDate: Date;
    const now = new Date();
    
    // Calculate the start date based on the period
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', now.toISOString().split('T')[0]);
      
    if (error) {
      console.error(`Error fetching order stats for ${period}:`, error);
      throw error;
    }
    
    // If no data, return zeros
    if (!data || data.length === 0) {
      return {
        count: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        totalProfit: 0,
        averageProfit: 0
      };
    }
    
    // Calculate summary statistics
    const count = data.length;
    const totalRevenue = data.reduce((sum, order) => sum + Number(order.revenue), 0);
    const totalExpenses = data.reduce((sum, order) => sum + Number(order.expenses), 0);
    const totalProfit = data.reduce((sum, order) => sum + Number(order.profit), 0);
    const averageProfit = totalProfit / count;
    
    return {
      count,
      totalRevenue,
      totalExpenses,
      totalProfit,
      averageProfit
    };
  }
}; 