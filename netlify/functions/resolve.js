import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  // This log will finally appear in your Netlify dashboard
  console.log("Function triggered for ID:", event.queryStringParameters?.id);

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Environment Variables");
    return { statusCode: 500, body: "Internal Configuration Error" };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { id } = event.queryStringParameters || {};

  try {
    if (!id) {
      return { statusCode: 400, body: "Missing QR ID" };
    }

    const { data, error } = await supabase
      .from('qrs')
      .select('destination_url')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error("Database error or missing ID:", error);
      return { statusCode: 404, body: "Link not found" };
    }

    // Success! Redirect the user
    return {
      statusCode: 302,
      headers: { 
        'Location': data.destination_url,
        'Cache-Control': 'no-cache'
      },
      body: ''
    };
  } catch (err) {
    console.error("Critical Error:", err.message);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};

