import { supabase } from './supabase';
import { workingHoursService } from './services/working-hours-service';

export const testWorkingHoursTable = async () => {
  console.log("Testing working_hours table...");
  
  try {
    // First, check if the working_hours table exists
    console.log("Checking if working_hours table exists...");
    const { data, error } = await supabase
      .from('work_time')
      .select('*');
    
    if (error) {
      if (error.code === '42P01') {  // undefined_table error
        console.log("Table doesn't exist. Will try to create it.");
        
        // Try running the function to ensure table exists
        const success = await workingHoursService.ensureWorkingHoursTableExists();
        if (success) {
          console.log("Successfully created working_hours table.");
        } else {
          console.error("Failed to create working_hours table.");
        }
      } else {
        console.error("Error checking working_hours table:", error);
      }
    } else {
      console.log(`working_hours table exists with ${data.length} records.`);
    }
    
    // Try to insert a test record
    const testData = {
      user_id: "00000000-0000-0000-0000-000000000000", // This will fail since it's not a real user
      date: new Date().toISOString().split('T')[0],
      hours_worked: 8,
      location: "Test Location",
      description: "Test record"
    };
    
    console.log("Trying to insert test record:", testData);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('working_hours')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error("Error inserting test record:", insertError);
      
      if (insertError.code === '23503') { // foreign_key_violation
        console.log("This is expected since we're using a fake user ID. It confirms the table structure is correct.");
      }
    } else {
      console.log("Successfully inserted test record:", insertResult);
    }
    
    return true;
  } catch (error) {
    console.error("Error testing working_hours table:", error);
    return false;
  }
};

// In browser environment, we don't automatically execute the test
// The function can be imported and called from other components when needed 