import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get the auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the requesting user is an admin
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: requestingUser }, error: authError } = await anonClient.auth.getUser();
    if (authError || !requestingUser) {
      console.log("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if requesting user is admin
    const { data: roleData, error: roleError } = await anonClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.log("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Only admins can view users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service role client to get all users
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all users
    const { data: usersData, error: usersError } = await serviceClient.auth.admin.listUsers();

    if (usersError) {
      console.log("Users fetch error:", usersError);
      return new Response(
        JSON.stringify({ error: usersError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all roles
    const { data: rolesData, error: rolesError } = await serviceClient
      .from("user_roles")
      .select("*");

    if (rolesError) {
      console.log("Roles fetch error:", rolesError);
    }

    // Combine users with their roles
    const usersWithRoles = usersData.users.map((user) => {
      const userRole = rolesData?.find((r) => r.user_id === user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || "",
        role: userRole?.role || null,
        role_id: userRole?.id || null,
        created_at: user.created_at,
      };
    });

    // Filter to only show users with roles
    const usersWithRolesOnly = usersWithRoles.filter((u) => u.role !== null);

    console.log("Fetched users:", usersWithRolesOnly.length);

    return new Response(
      JSON.stringify({ users: usersWithRolesOnly }),
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
