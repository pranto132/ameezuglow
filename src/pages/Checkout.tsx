import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, Truck, CreditCard, Smartphone } from "lucide-react";
import { z } from "zod";

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "নাম প্রয়োজন"),
  customer_phone: z.string().min(11, "সঠিক ফোন নম্বর দিন").max(14),
  customer_email: z.string().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),
  shipping_address: z.string().min(10, "সম্পূর্ণ ঠিকানা দিন"),
  city: z.string().min(2, "শহরের নাম দিন"),
  area: z.string().optional(),
  notes: z.string().optional(),
  payment_method: z.string(),
  transaction_id: z.string().optional(),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_address: "",
    city: "ঢাকা",
    area: "",
    notes: "",
    payment_method: "cod",
    transaction_id: "",
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: courierServices } = useQuery({
    queryKey: ["courier-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courier_services")
        .select("*")
        .eq("is_active", true)
        .limit(1);
      if (error) throw error;
      return data?.[0];
    },
  });

  const subtotal = getTotal();
  const isInsideDhaka = formData.city.toLowerCase().includes("ঢাকা") || formData.city.toLowerCase().includes("dhaka");
  const shippingCost = courierServices
    ? (isInsideDhaka ? Number(courierServices.inside_dhaka_charge) : Number(courierServices.outside_dhaka_charge))
    : 60;
  const freeDeliveryMin = courierServices?.free_delivery_min_order ? Number(courierServices.free_delivery_min_order) : 2000;
  const isFreeDelivery = subtotal >= freeDeliveryMin;
  const finalShipping = isFreeDelivery ? 0 : shippingCost;
  const total = subtotal + finalShipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validated = checkoutSchema.parse(formData);

      // Generate order number
      const orderNumber = `AMZ-${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: validated.customer_name,
          customer_phone: validated.customer_phone,
          customer_email: validated.customer_email || null,
          shipping_address: validated.shipping_address,
          city: validated.city,
          area: validated.area || null,
          notes: validated.notes || null,
          subtotal,
          shipping_cost: finalShipping,
          total,
          payment_method: validated.payment_method,
          transaction_id: validated.transaction_id || null,
          payment_status: validated.payment_method === "cod" ? "pending" : "awaiting_verification",
          order_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name_bn,
        quantity: item.quantity,
        price: item.sale_price || item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and redirect
      clearCart();
      toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
      navigate(`/order-success?order=${orderNumber}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("অর্ডার প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPaymentMethod = paymentMethods?.find((p) => p.type === formData.payment_method);

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground mb-8"
          >
            চেকআউট
          </motion.h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    আপনার তথ্য
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_name">নাম *</Label>
                      <Input
                        id="customer_name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        placeholder="আপনার নাম"
                        className={errors.customer_name ? "border-destructive" : ""}
                      />
                      {errors.customer_name && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="customer_phone">ফোন নম্বর *</Label>
                      <Input
                        id="customer_phone"
                        name="customer_phone"
                        value={formData.customer_phone}
                        onChange={handleChange}
                        placeholder="01XXXXXXXXX"
                        className={errors.customer_phone ? "border-destructive" : ""}
                      />
                      {errors.customer_phone && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_phone}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="customer_email">ইমেইল (ঐচ্ছিক)</Label>
                      <Input
                        id="customer_email"
                        name="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Shipping Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    <Truck className="w-5 h-5 inline mr-2" />
                    ডেলিভারি ঠিকানা
                  </h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">শহর *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="ঢাকা"
                          className={errors.city ? "border-destructive" : ""}
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">{errors.city}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="area">এলাকা</Label>
                        <Input
                          id="area"
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          placeholder="মিরপুর, উত্তরা..."
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="shipping_address">সম্পূর্ণ ঠিকানা *</Label>
                      <Textarea
                        id="shipping_address"
                        name="shipping_address"
                        value={formData.shipping_address}
                        onChange={handleChange}
                        placeholder="বাড়ি নং, রোড নং, এলাকা..."
                        className={errors.shipping_address ? "border-destructive" : ""}
                      />
                      {errors.shipping_address && (
                        <p className="text-sm text-destructive mt-1">{errors.shipping_address}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="notes">অর্ডার নোট (ঐচ্ছিক)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="বিশেষ কোন নির্দেশনা থাকলে লিখুন..."
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    <CreditCard className="w-5 h-5 inline mr-2" />
                    পেমেন্ট পদ্ধতি
                  </h2>
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, payment_method: value }))}
                    className="space-y-3"
                  >
                    {paymentMethods?.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                          formData.payment_method === method.type
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={method.type} id={method.type} className="mt-1" />
                        <label htmlFor={method.type} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            {method.type === "cod" ? (
                              <Truck className="w-5 h-5 text-primary" />
                            ) : (
                              <Smartphone className="w-5 h-5 text-primary" />
                            )}
                            <span className="font-medium text-foreground">{method.name_bn}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{method.instructions_bn}</p>
                          {method.account_number && (
                            <p className="text-sm font-medium text-primary mt-1">
                              নম্বর: {method.account_number}
                            </p>
                          )}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Transaction ID for mobile payments */}
                  {selectedPaymentMethod && selectedPaymentMethod.type !== "cod" && (
                    <div className="mt-4">
                      <Label htmlFor="transaction_id">Transaction ID</Label>
                      <Input
                        id="transaction_id"
                        name="transaction_id"
                        value={formData.transaction_id}
                        onChange={handleChange}
                        placeholder="আপনার Transaction ID দিন"
                      />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 sticky top-24"
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    অর্ডার সারসংক্ষেপ
                  </h2>

                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground/80 line-clamp-1">
                          {item.name_bn} × {item.quantity}
                        </span>
                        <span className="font-medium shrink-0 ml-2">
                          ৳{((item.sale_price || item.price) * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2 mb-4">
                    <div className="flex justify-between text-foreground/80">
                      <span>সাবটোটাল</span>
                      <span>৳{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-foreground/80">
                      <span>ডেলিভারি চার্জ</span>
                      {isFreeDelivery ? (
                        <span className="text-green-600">ফ্রি!</span>
                      ) : (
                        <span>৳{finalShipping}</span>
                      )}
                    </div>
                    {!isFreeDelivery && (
                      <p className="text-xs text-muted-foreground">
                        ৳{freeDeliveryMin}+ অর্ডারে ফ্রি ডেলিভারি
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold text-foreground">
                      <span>মোট</span>
                      <span className="text-primary">৳{total.toFixed(0)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        প্রসেসিং...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        অর্ডার কনফার্ম করুন
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
