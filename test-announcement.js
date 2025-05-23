const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with your project URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAnnouncement() {
  try {
    console.log('Fetching admin user to use as author...');
    
    // Get a head_manager or owner user to use as the author
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .or('role.eq.head_manager,role.eq.owner')
      .limit(1);
      
    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }
    
    if (!profiles || profiles.length === 0) {
      throw new Error('No admin users found to use as announcement author');
    }
    
    const authorId = profiles[0].id;
    console.log(`Using admin user with ID ${authorId} as announcement author`);
    
    // Insert test announcement
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: 'Important Dashboard Update',
        content: 'Welcome to our newly redesigned dashboard! This announcement confirms that the announcements system is working correctly.',
        announcement_type: 'general',
        author_id: authorId,
        created_at: new Date().toISOString()
      })
      .select();
      
    if (error) {
      throw new Error(`Error creating announcement: ${error.message}`);
    }
    
    console.log('Successfully created test announcement:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createTestAnnouncement(); 