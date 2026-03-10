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
       // 1. Fetch target and current count
    const { data, error } = await supabase
      .from('dynamic_codes')
      .select('target_url, scan_count')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error("Database error or missing ID:", error);
      return { statusCode: 404, body: "Link not found" };
    }

    // 2. THE FIX: Update the count in Supabase
    await supabase
      .from('dynamic_codes')
      .update({ scan_count: (data.scan_count || 0) + 1 })
      .eq('id', id);

    const target = data.target_url;

    // For WiFi and Phone types, redirect to the branded landing page
    // instead of raw protocol URIs (which show blank pages in browsers)
    const isWifi = typeof target === 'string' && target.startsWith('WIFI:');
    const isPhone = typeof target === 'string' && target.startsWith('tel:');

    if (isWifi || isPhone) {
      return {
        statusCode: 302,
        headers: {
          'Location': `https://www.velagiofreeqr.com/go?id=${id}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        body: ''
      };
    }

    // For normal HTTP URLs, redirect directly
    return {
      statusCode: 302,
      headers: { 
        'Location': target,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: ''
    };
  } catch (err) {
    console.error("Critical Error:", err.message);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
