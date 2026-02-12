import { createClient } from "npm:@supabase/supabase-js";
import { UAParser } from "npm:ua-parser-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("ID is required", { status: 400 });
    }

    // Fetch the dynamic code
    const { data: code, error: fetchError } = await supabase
      .from("dynamic_codes")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !code) {
      return new Response("QR Code not found", { status: 404 });
    }

    if (code.is_blocked) {
      // Redirect to a 'Link Blocked' page or show error
      // For now, let's redirect to a blocked page on the site
      const origin = url.origin;
      return Response.redirect(`${origin}/blocked`, 302);
    }

    // Parse User Agent
    const ua = req.headers.get("user-agent") || "";
    const parser = new UAParser(ua);
    const deviceType = parser.getDevice().type || "desktop"; // "mobile", "tablet", "console", "smarttv", "wearable", "embedded", or undefined (desktop)
    const browser = parser.getBrowser().name || "Unknown";
    const country = req.headers.get("x-country-code") || req.headers.get("cf-ipcountry") || "Unknown";

    // Increment scan count and log scan asynchronously (don't block the redirect)
    // We can use Promise.all or just fire and forget if we don't care about the result for the redirect
    
    // Log scan
    const logPromise = supabase.from("scans").insert({
      code_id: id,
      device_type: deviceType === "mobile" || deviceType === "tablet" ? "Mobile" : "Desktop",
      browser: browser,
      country: country,
    });

    // Increment count
    const countPromise = supabase.rpc("increment_scan_count", { code_id: id });
    // Note: I'll need to create this RPC if it doesn't exist, or just use a normal update.
    // Let's just use a normal update for simplicity if RPC is not there.
    const updatePromise = supabase
      .from("dynamic_codes")
      .update({ scan_count: (code.scan_count || 0) + 1 })
      .eq("id", id);

    // Wait for critical logs if necessary, but 301 is fast
    await Promise.allSettled([logPromise, updatePromise]);

    return Response.redirect(code.target_url, 301);
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

Deno.serve(handler);
