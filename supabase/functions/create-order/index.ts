import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders } from "../_shared/cors.ts";

type CartItem = {
  id: string;
  name_bn: string;
  quantity: number;
  price: number;
  sale_price?: number | null;
};

type CreateOrderBody = {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_address: string;
  city: string;
  area?: string | null;
  notes?: string | null;
  payment_method: string;
  transaction_id?: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  items: CartItem[];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as CreateOrderBody;

    if (!body?.items?.length) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // 1) Create order (order_number will be auto-generated numeric by DB trigger)
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_number: null,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email || null,
        shipping_address: body.shipping_address,
        city: body.city,
        area: body.area || null,
        notes: body.notes || null,
        subtotal: body.subtotal,
        shipping_cost: body.shipping_cost,
        total: body.total,
        payment_method: body.payment_method,
        transaction_id: body.transaction_id || null,
        payment_status: body.payment_method === "cod" ? "pending" : "awaiting_verification",
        order_status: "pending",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: orderError?.message || "Failed to create order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Create order items
    const orderItems = body.items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name_bn,
      quantity: item.quantity,
      price: item.sale_price ?? item.price,
    }));

    const { error: itemsError } = await admin.from("order_items").insert(orderItems);
    if (itemsError) {
      // Best-effort cleanup to avoid orphan order
      await admin.from("orders").delete().eq("id", order.id);
      return new Response(JSON.stringify({ error: itemsError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ orderId: order.id, orderNumber: order.order_number }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
