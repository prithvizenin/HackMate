import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbmubbaxqlwphcbearrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibXViYmF4cWx3cGhjYmVhcnJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ1NzgyMywiZXhwIjoyMDkwMDMzODIzfQ.asEx054BYPTZWk7KNHsXOJOBFEhIWmg6_he74bNxVMw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing Insert into team_requests with service role key...");
  // Use dummy users (we previously inserted tempuser@example.com as id=?)
  // Actually let's just use maybeSingle of users to find two user ids to connect
  
  const { data: users, error: usersErr } = await supabase.from('users').select('id').limit(2);
  
  if (usersErr || !users || users.length < 2) {
      console.error("Need at least 2 users to test", usersErr);
      return;
  }
  
  const senderId = users[0].id;
  const receiverId = users[1].id;
  
  // Clean up any existing request between them
  await supabase.from('team_requests').delete().or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`);

  // Test insert
  const { data: insData, error: insErr } = await supabase.from('team_requests')
    .insert([{ sender_id: senderId, receiver_id: receiverId, status: 'pending' }])
    .select('id');
    
  console.log("Insert data:", insData);
  console.log("Insert error:", insErr);
  
  // Clean it up
  if (insData && insData.length > 0) {
      console.log("Cleaning up test request...");
      await supabase.from('team_requests').delete().eq('id', insData[0].id);
  }
}

test();
