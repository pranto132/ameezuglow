import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { corsHeaders } from "../_shared/cors.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schemas
const CartItemSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
  name_bn: z.string().min(1).max(200),
  quantity: z.number().int().positive().max(1000),
  price: z.number().positive(),
  sale_price: z.number().positive().optional().nullable(),
});

const CreateOrderSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").trim(),
  customer_phone: z.string().regex(/^0\d{10}$/, "Phone must be 11 digits starting with 0"),
  customer_email: z.string().email("Invalid email").max(255).optional().nullable().or(z.literal("")),
  shipping_address: z.string().min(10, "Address must be at least 10 characters").max(500, "Address too long").trim(),
  city: z.string().min(2).max(100).trim(),
  area: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  payment_method: z.enum(["cod", "bkash", "nagad", "rocket", "bank"]),
  transaction_id: z.string().max(100).optional().nullable(),
  subtotal: z.number().positive().max(10000000),
  discount: z.number().min(0).max(10000000).optional().default(0),
  coupon_code: z.string().max(50).optional().nullable(),
  shipping_cost: z.number().min(0).max(10000),
  total: z.number().positive().max(10000000),
  items: z.array(CartItemSchema).min(1, "Cart cannot be empty").max(100),
});

type CreateOrderBody = z.infer<typeof CreateOrderSchema>;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) {
      console.error("Server misconfigured: missing env vars");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and validate input
    let body: CreateOrderBody;
    try {
      const rawBody = await req.json();
      body = CreateOrderSchema.parse(rawBody);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        const firstError = validationError.errors[0];
        return new Response(JSON.stringify({ 
          error: firstError?.message || "Invalid input data" 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate that total approximately equals subtotal - discount + shipping_cost
    const discountAmount = body.discount || 0;
    const expectedTotal = body.subtotal - discountAmount + body.shipping_cost;
    if (Math.abs(body.total - expectedTotal) > 1) {
      console.error("Total mismatch:", { total: body.total, expected: expectedTotal, discount: discountAmount });
      return new Response(JSON.stringify({ error: "Total amount mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean email - convert empty string to null
    const cleanEmail = body.customer_email && body.customer_email.trim() !== "" 
      ? body.customer_email.trim() 
      : null;

    const admin = createClient(supabaseUrl, serviceKey);

    // 1) Create order (order_number will be auto-generated numeric by DB trigger)
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_number: null,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: cleanEmail,
        shipping_address: body.shipping_address,
        city: body.city,
        area: body.area || null,
        notes: body.notes || null,
        subtotal: body.subtotal,
        discount: discountAmount,
        shipping_cost: body.shipping_cost,
        total: body.total,
        payment_method: body.payment_method,
        transaction_id: body.transaction_id || null,
        payment_status: body.payment_method === "cod" ? "pending" : "awaiting_verification",
        order_status: "pending",
      })
      .select("id, order_number")
      .single();

    // 2) If coupon was used, increment used_count
    if (body.coupon_code && order) {
      await admin.rpc("increment_coupon_usage", { coupon_code_param: body.coupon_code });
    }

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
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
      console.error("Order items error:", itemsError);
      // Best-effort cleanup to avoid orphan order
      await admin.from("orders").delete().eq("id", order.id);
      return new Response(JSON.stringify({ error: itemsError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Order created successfully:", order.id, order.order_number);

    return new Response(JSON.stringify({ orderId: order.id, orderNumber: order.order_number }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
