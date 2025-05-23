import { supabase } from '../supabase';
import fs from 'fs';
import path from 'path';

export const dbService = {
  /**
   * Apply a migration SQL file
   */
  async applyMigration(migrationName: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get the SQL content
      const sqlPath = path.join(process.cwd(), 'src', 'db', `${migrationName}.sql`);
      const sql = fs.readFileSync(sqlPath, 'utf8');

      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        console.error('Migration error:', error);
        return { success: false, message: `Migration failed: ${error.message}` };
      }

      return { success: true, message: `Migration ${migrationName} applied successfully.` };
    } catch (error) {
      console.error('Migration error:', error);
      return { 
        success: false, 
        message: `Migration failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  },

  /**
   * Apply the supervisor policies migration
   */
  async addSupervisorPolicies(): Promise<{ success: boolean; message: string }> {
    return this.applyMigration('add_supervisor_policies');
  }
};

export default dbService; 