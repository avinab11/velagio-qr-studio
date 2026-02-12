import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, body: "Internal Configuration Error" };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { id } = event.queryStringParameters || {};

  try {
    if (!id) {
      return { statusCode: 400, body: "Missing QR ID" };
    }

    // This section now matches your Supabase table names exactly
    const { data, error } = await supabase
      .from('dynamic_codes') 
      .select('target_url')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error("Database error or missing ID:", error);
      return { statusCode: 404, body: "Link not found" };
    }

    // Redirect the user to the destination found in your table
    return {
      statusCode: 302,
      headers: { 
        'Location': data.target_url,
        'Cache-Control': 'no-cache'
      },
      body: ''
    };
  } catch (err) {
    console.error("Critical Error:", err.message);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
