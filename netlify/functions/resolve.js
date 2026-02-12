import { createClient } from '@supabase/supabase-js';

// Initialize Supabase using your Netlify Environment Variables
const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_ANON_KEY
);

// Stage 3: The Quishing Defense
const BLACKLIST = ['bit.ly', 'tinyurl.com', 'malware-site.net', 'phish-link.org'];

export const handler = async (event) => {
  const id = event.queryStringParameters.id;

  // 1. Fetch the real URL from your Supabase 'dynamic_codes' table
  const { data, error } = await supabase
    .from('dynamic_codes')
    .select('url')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { statusCode: 404, body: 'QR Code not found' };
  }

  // 2. Blacklist Check
  const isMalicious = BLACKLIST.some(domain => data.url.toLowerCase().includes(domain));
  
  if (isMalicious) {
    return {
      statusCode: 302,
      headers: { Location: '/blocked-warning' }
    };
  }

  // 3. Log the scan to your 'scans' table (Analytics)
  await supabase.from('scans').insert([{ link_id: id }]);

  // 4. Send the user to their destination
  return {
    statusCode: 302,
    headers: { Location: data.url }
  };
};
