// File: test_db.js
// Purpose: quick Supabase query validation for lessons table.
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://vagrglarsxjtnsusyonv.supabase.co", "sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK");
async function run() {
  const { data, error } = await supabase.from('lessons').select('*').limit(1);
  console.log(data, error);
}
run();
