import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbmubbaxqlwphcbearrk.supabase.co';
const supabaseKey = 'sb_publishable_w6VhGNRyw2mFUtPqcfHJbQ_Jbgdti6A';
const supabase = createClient(supabaseUrl, supabaseKey);


async function checkUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  console.log('Total users:', data.length);
  const emails = data.map(u => u.email);
  const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
  
  if (duplicates.length > 0) {
    console.warn('Duplicate emails found:', duplicates);
  } else {
    console.log('No duplicate emails found.');
  }

  // Check for weird entries
  data.forEach(u => {
    if (!u.name || !u.email) {
      console.warn('Incomplete user record:', u);
    }
  });
}

checkUsers();
