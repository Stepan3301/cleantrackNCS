// Debug scripts for working hours submission issues
// Copy and paste these functions into your browser console
import { supabase } from './supabase';

// Define window extensions for TypeScript
declare global {
  interface Window {
    debugScripts?: {
      checkTable: () => Promise<boolean>;
      testDirect: () => Promise<any>;
      testService: () => Promise<any>;
      runAll: () => Promise<void>;
    };
  }
}

/**
 * Checks if the working_hours table exists and creates it if it doesn't
 */
async function checkAndCreateWorkingHoursTable() {
  console.log('Checking if working_hours table exists...');
  
  try {
    const { error } = await supabase
      .from('working_hours')
      .select('id')
      .limit(1);
      
    if (error) {
      if (error.code === '42P01') {
        console.log('Table does not exist. Attempting to create it...');
        
        // Create a simple version of the table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.working_hours (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            date TEXT NOT NULL,
            hours_worked NUMERIC(5,2) NOT NULL,
            location TEXT,
            description TEXT,
            status TEXT DEFAULT 'approved',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        
        if (createError) {
          console.error('Error creating table:', createError);
          return false;
        }
        
        console.log('Table created successfully!');
        return true;
      } else {
        console.error('Error checking table:', error);
        return false;
      }
    }
    
    console.log('Table exists!');
    return true;
  } catch (err) {
    console.error('Exception checking/creating table:', err);
    return false;
  }
}

/**
 * Tests direct insertion into the working_hours table
 */
async function testDirectInsert() {
  console.log('Testing direct insert to working_hours table...');
  
  try {
    // Get the authenticated user
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    
    if (!user) {
      console.error('No authenticated user found!');
      return;
    }
    
    console.log('Authenticated user:', user.email, user.id);
    
    // Create test record
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const testRecord = {
      user_id: user.id,
      date: formattedDate,
      hours_worked: 8,
      location: 'Console Test',
      description: 'Direct insert test from console',
      status: 'approved'
    };
    
    console.log('Inserting record:', testRecord);
    
    const { data, error } = await supabase
      .from('working_hours')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.error('Insert error:', error);
      
      if (error.code === '23505') {
        console.log('Record already exists for today. Trying update instead...');
        
        const { data: updateData, error: updateError } = await supabase
          .from('working_hours')
          .update({
            hours_worked: 8.5,
            location: 'Console Update',
            description: 'Updated from console'
          })
          .eq('user_id', user.id)
          .eq('date', formattedDate)
          .select();
          
        if (updateError) {
          console.error('Update error:', updateError);
        } else {
          console.log('Update successful:', updateData);
          return updateData;
        }
      }
    } else {
      console.log('Insert successful:', data);
      return data;
    }
  } catch (err) {
    console.error('Exception during direct insert test:', err);
  }
}

/**
 * Tests the workingHoursService.submitWorkingHours function
 */
async function testServiceSubmit() {
  console.log('Testing workingHoursService.submitWorkingHours...');
  
  try {
    if (!window.workingHoursService) {
      console.error('workingHoursService not available on window!');
      return;
    }
    
    // Get the authenticated user
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    
    if (!user) {
      console.error('No authenticated user found!');
      return;
    }
    
    console.log('Authenticated user:', user.email, user.id);
    
    // Create a unique date
    const now = new Date();
    // Use a timestamp to make the date unique
    const timestamp = Date.now();
    const formattedDate = `${now.toISOString().split('T')[0]}-${timestamp}`;
    
    console.log('Using unique date:', formattedDate);
    
    const result = await window.workingHoursService.submitWorkingHours({
      user_id: user.id,
      date: formattedDate,
      hours_worked: 7,
      location: 'Service Console Test',
      description: 'Service test from console'
    });
    
    console.log('Service submission result:', result);
    return result;
  } catch (err) {
    console.error('Exception during service test:', err);
  }
}

/**
 * Full debug sequence - runs all tests in order
 */
async function runFullDebug() {
  console.log('========== STARTING FULL DEBUG SEQUENCE ==========');
  
  // Step 1: Check table
  console.log('\n----- STEP 1: Check/Create Table -----');
  const tableExists = await checkAndCreateWorkingHoursTable();
  if (!tableExists) {
    console.error('Failed to verify/create table. Stopping tests.');
    return;
  }
  
  // Step 2: Direct insert
  console.log('\n----- STEP 2: Test Direct Insert -----');
  const directResult = await testDirectInsert();
  
  // Step 3: Service test
  console.log('\n----- STEP 3: Test Service Submit -----');
  const serviceResult = await testServiceSubmit();
  
  console.log('\n========== DEBUG SEQUENCE COMPLETE ==========');
  console.log('Direct insert result:', directResult);
  console.log('Service result:', serviceResult);
}

// Export functions so they're available in console
window.debugScripts = {
  checkTable: checkAndCreateWorkingHoursTable,
  testDirect: testDirectInsert,
  testService: testServiceSubmit,
  runAll: runFullDebug
};

// Instructions
console.log(`
Debug scripts loaded! Run these functions in the console:

1. debugScripts.checkTable() - Check if working_hours table exists and create it if needed
2. debugScripts.testDirect() - Test direct insertion to the working_hours table
3. debugScripts.testService() - Test submission via workingHoursService
4. debugScripts.runAll() - Run all tests in sequence

For quick debugging of hours submission, copy these into your console:

    debugWorkingHours.directInsert()
    
Or with a specific date:

    debugWorkingHours.directInsert('2023-11-15')
`);

// Export just the code to copy and paste
const debugScriptText = `
// Function to check and create working_hours table
async function checkAndCreateWorkingHoursTable() {
  console.log('Checking if working_hours table exists...');
  
  try {
    const { error } = await supabase
      .from('working_hours')
      .select('id')
      .limit(1);
      
    if (error) {
      if (error.code === '42P01') {
        console.log('Table does not exist. Attempting to create it...');
        
        // Create a simple version of the table
        const createTableSQL = \`
          CREATE TABLE IF NOT EXISTS public.working_hours (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            date TEXT NOT NULL,
            hours_worked NUMERIC(5,2) NOT NULL,
            location TEXT,
            description TEXT,
            status TEXT DEFAULT 'approved',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        \`;
        
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        
        if (createError) {
          console.error('Error creating table:', createError);
          return false;
        }
        
        console.log('Table created successfully!');
        return true;
      } else {
        console.error('Error checking table:', error);
        return false;
      }
    }
    
    console.log('Table exists!');
    return true;
  } catch (err) {
    console.error('Exception checking/creating table:', err);
    return false;
  }
}

// Test direct insertion
async function testDirectInsert() {
  console.log('Testing direct insert to working_hours table...');
  
  try {
    // Get the authenticated user
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    
    if (!user) {
      console.error('No authenticated user found!');
      return;
    }
    
    console.log('Authenticated user:', user.email, user.id);
    
    // Create test record
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const testRecord = {
      user_id: user.id,
      date: formattedDate,
      hours_worked: 8,
      location: 'Console Test',
      description: 'Direct insert test from console',
      status: 'approved'
    };
    
    console.log('Inserting record:', testRecord);
    
    const { data, error } = await supabase
      .from('working_hours')
      .insert(testRecord)
      .select();
      
    if (error) {
      console.error('Insert error:', error);
      
      if (error.code === '23505') {
        console.log('Record already exists for today. Trying update instead...');
        
        const { data: updateData, error: updateError } = await supabase
          .from('working_hours')
          .update({
            hours_worked: 8.5,
            location: 'Console Update',
            description: 'Updated from console'
          })
          .eq('user_id', user.id)
          .eq('date', formattedDate)
          .select();
          
        if (updateError) {
          console.error('Update error:', updateError);
        } else {
          console.log('Update successful:', updateData);
          return updateData;
        }
      }
    } else {
      console.log('Insert successful:', data);
      return data;
    }
  } catch (err) {
    console.error('Exception during direct insert test:', err);
  }
}

// Copy these to paste in the console
console.log("Copy and paste this in your browser console:");
console.log("debugWorkingHours.directInsert()");
`;

// Don't actually export the functions/variables to window here
// That would be done when the user copies and pastes the text into the console
export { debugScriptText }; 