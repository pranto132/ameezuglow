import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PhoneSchema = z.object({
  phone_number: z.string().regex(/^01[3-9][0-9]{8}$/, "Invalid Bangladeshi phone number"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin/staff role
    const { data: roleData } = await anonClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input
    let validatedInput;
    try {
      const rawBody = await req.json();
      validatedInput = PhoneSchema.parse(rawBody);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ error: validationError.errors[0]?.message || "Invalid input" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { phone_number } = validatedInput;

    // Read fraud check config from site_settings using service role (bypasses RLS)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: settingsData } = await serviceClient
      .from("site_settings")
      .select("key, value")
      .in("key", ["fraud_check_service", "fraud_check_api_key", "fraud_check_api_secret"]);

    const configMap: Record<string, string> = {};
    settingsData?.forEach((s: any) => { configMap[s.key] = s.value || ""; });

    const service = configMap.fraud_check_service || "fraudbd";
    const apiKey = configMap.fraud_check_api_key || Deno.env.get("FRAUDBD_API_KEY") || "";
    const apiSecret = configMap.fraud_check_api_secret || "";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Fraud check API key is not configured. Go to Settings > ফ্রড চেক to set it up." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let fraudData: any;

    if (service === "fraudbd") {
      // FraudBD API
      const fraudResponse = await fetch("https://fraudbd.com/api/check-courier-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api_key": apiKey,
        },
        body: JSON.stringify({ phone_number }),
      });

      if (!fraudResponse.ok) {
        const errorText = await fraudResponse.text();
        console.error("FraudBD API error:", fraudResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "FraudBD API error. Please check your API key in Settings.", details: errorText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      fraudData = await fraudResponse.json();

    } else if (service === "steadfast") {
      // Steadfast API
      const fraudResponse = await fetch(`https://portal.steadfast.com.bd/api/v1/fraud-check/${phone_number}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": apiKey,
          "Secret-Key": apiSecret,
        },
      });

      if (!fraudResponse.ok) {
        const errorText = await fraudResponse.text();
        console.error("Steadfast API error:", fraudResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "Steadfast API error. Please check your API key/secret in Settings.", details: errorText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      fraudData = await fraudResponse.json();

    } else if (service === "fraudchecker") {
      // FraudChecker.link API
      const fraudResponse = await fetch("https://fraudchecker.link/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ phone: phone_number }),
      });

      if (!fraudResponse.ok) {
        const errorText = await fraudResponse.text();
        console.error("FraudChecker API error:", fraudResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "FraudChecker API error. Please check your API key in Settings.", details: errorText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      fraudData = await fraudResponse.json();

    } else {
      return new Response(
        JSON.stringify({ error: `Unknown service: ${service}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ...fraudData, _service: service }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
