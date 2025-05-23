// RLS (Row Level Security) Permission Check Tool
// This script will test if current user has appropriate permissions for work_time operations

async function checkRLSPermissions() {
  console.group("Supabase RLS Permissions Check");
  
  try {
    const supabase = window.supabase;
    if (!supabase) {
      throw new Error("Supabase client not found in window object. Make sure you're on a page where Supabase is initialized.");
    }
    
    // 1. Check authentication state
    console.log("Step 1: Checking authentication state...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
      return { error: "Authentication error", details: authError };
    }
    if (!user) {
      console.warn("❌ No authenticated user found. RLS will likely block operations.");
      return { error: "Not authenticated", permissions: "denied" };
    }
    console.log("✅ Authenticated as:", {
      id: user.id,
      email: user.email,
      role: user.role || user.app_metadata?.role
    });
    
    // 2. Test SELECT permission
    console.log("Step 2: Testing SELECT permission...");
    const { data: selectData, error: selectError } = await supabase
      .from('work_time')
      .select('id')
      .limit(1);
    if (selectError) {
      console.error("SELECT error:", selectError);
      if (selectError.code === "PGRST301") {
        console.warn("❌ RLS policy is blocking SELECT operations");
      }
    } else {
      console.log("✅ SELECT permission granted");
    }
    
    // 3. Test INSERT permission with a dummy record
    console.log("Step 3: Testing INSERT permission...");
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    const testDate = futureDate.toISOString().split('T')[0];
    const testRecord = {
      user_id: user.id,
      date: testDate,
      hours_worked: 1,
      location: "RLS Test",
      description: "Testing RLS permissions"
    };
    const { data: insertData, error: insertError } = await supabase
      .from('work_time')
      .insert(testRecord)
      .select();
    if (insertError) {
      console.error("INSERT error:", insertError);
      if (insertError.code === "PGRST301") {
        console.warn("❌ RLS policy is blocking INSERT operations");
      }
    } else {
      console.log("✅ INSERT permission granted");
      if (insertData && insertData.length > 0) {
        const recordId = insertData[0].id;
        console.log(`Cleaning up test record with ID: ${recordId}`);
        const { error: deleteError } = await supabase
          .from('work_time')
          .delete()
          .eq('id', recordId);
        if (deleteError) {
          console.error("DELETE error (cleanup):", deleteError);
        } else {
          console.log("✅ Test record cleaned up successfully");
        }
      }
    }
    
    // 4. Check RLS policies directly if available
    console.log("Step 4: Attempting to check RLS policies (may require admin access)...");
    try {
      const { data: policiesData, error: policiesError } = await supabase
        .rpc('get_policies_for_table', { table_name: 'work_time' });
      if (policiesError) {
        console.log("Cannot get RLS policies directly:", policiesError);
      } else if (policiesData) {
        console.log("RLS policies:", policiesData);
      }
    } catch (policyError) {
      console.log("RLS policy check failed (expected if not admin):", policyError);
    }
    
    return {
      authenticated: !!user,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || user.app_metadata?.role
      },
      permissions: {
        select: !selectError,
        insert: !insertError,
        selectError: selectError?.message || null,
        insertError: insertError?.message || null
      }
    };
    
  } catch (error) {
    console.error("Test execution error:", error);
    return {
      error: error.message,
      stack: error.stack
    };
  } finally {
    console.groupEnd();
  }
}

window.checkRLSPermissions = checkRLSPermissions;