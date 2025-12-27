import { useEffect, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, Truck, CreditCard, Smartphone } from "lucide-react";
import { z } from "zod";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { items, getTotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_address: "",
    city: language === "bn" ? "ঢাকা" : "Dhaka",
    area: "",
    notes: "",
    payment_method: "cod",
    transaction_id: "",
    delivery_area: "inside_dhaka" as "inside_dhaka" | "outside_dhaka",
  });

  const checkoutSchema = z.object({
    customer_name: z.string().min(2, t("নাম প্রয়োজন", "Name is required")),
    customer_phone: z.string().min(11, t("সঠিক ফোন নম্বর দিন", "Enter a valid phone number")).max(14),
    customer_email: z.string().email(t("সঠিক ইমেইল দিন", "Enter a valid email")).optional().or(z.literal("")),
    shipping_address: z.string().min(10, t("সম্পূর্ণ ঠিকানা দিন", "Enter complete address")),
    city: z.string().min(2, t("শহরের নাম দিন", "Enter city name")),
    area: z.string().optional(),
    notes: z.string().optional(),
    payment_method: z.string(),
    transaction_id: z.string().optional(),
  });

  // Pre-fill email from logged-in user
  useEffect(() => {
    if (user?.email && !formData.customer_email) {
      setFormData((prev) => ({ ...prev, customer_email: user.email || "" }));
    }
  }, [user]);

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
  const isInsideDhaka = formData.delivery_area === "inside_dhaka";
  const insideDhakaCharge = courierServices ? Number(courierServices.inside_dhaka_charge) : 60;
  const outsideDhakaCharge = courierServices ? Number(courierServices.outside_dhaka_charge) : 120;
  const shippingCost = isInsideDhaka ? insideDhakaCharge : outsideDhakaCharge;
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

      // Create order via backend function (returns numeric serial order number)
      const { data, error: fnError } = await supabase.functions.invoke("create-order", {
        body: {
          customer_name: validated.customer_name,
          customer_phone: validated.customer_phone,
          customer_email: validated.customer_email || null,
          shipping_address: validated.shipping_address,
          city: validated.city,
          area: validated.area || null,
          notes: validated.notes || null,
          payment_method: validated.payment_method,
          transaction_id: validated.transaction_id || null,
          subtotal,
          shipping_cost: finalShipping,
          total,
          items: items.map((item) => ({
            id: item.id,
            name_bn: item.name_bn,
            quantity: item.quantity,
            price: item.price,
            sale_price: item.sale_price,
          })),
        },
      });

      if (fnError) throw fnError;

      const orderNumber = (data as any)?.orderNumber as string | undefined;
      if (!orderNumber) throw new Error("Order number missing from server response");

      // Clear cart and redirect
      setDidSubmit(true);
      toast.success(t("অর্ডার সফলভাবে সম্পন্ন হয়েছে!", "Order placed successfully!"));
      navigate(`/order-success?order=${orderNumber}`);
      clearCart();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      // Show the real backend/browser error so we can diagnose instantly
      const message = typeof error?.message === "string" ? error.message : "";
      console.error("Checkout order placement failed:", error);
      toast.error(message ? t(`অর্ডার প্রসেস করতে সমস্যা হয়েছে: ${message}`, `Error processing order: ${message}`) : t("অর্ডার প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "Error processing order. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPaymentMethod = paymentMethods?.find((p) => p.type === formData.payment_method);

  useEffect(() => {
    // After successful submit we clear the cart, which would otherwise trigger the "empty cart" redirect.
    if (!isSubmitting && !didSubmit && items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [didSubmit, isSubmitting, items.length, navigate]);

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground mb-8"
          >
            {t("চেকআউট", "Checkout")}
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
                    {t("আপনার তথ্য", "Your Information")}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_name">{t("নাম", "Name")} *</Label>
                      <Input
                        id="customer_name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        placeholder={t("আপনার নাম", "Your name")}
                        className={errors.customer_name ? "border-destructive" : ""}
                      />
                      {errors.customer_name && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="customer_phone">{t("ফোন নম্বর", "Phone Number")} *</Label>
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
                      <Label htmlFor="customer_email">{t("ইমেইল (ঐচ্ছিক)", "Email (Optional)")}</Label>
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
                    {t("ডেলিভারি ঠিকানা", "Delivery Address")}
                  </h2>
                  <div className="space-y-4">
                    {/* Delivery Area Selector */}
                    <div>
                      <Label className="mb-3 block">{t("ডেলিভারি এরিয়া", "Delivery Area")} *</Label>
                      <RadioGroup
                        value={formData.delivery_area}
                        onValueChange={(value: "inside_dhaka" | "outside_dhaka") => 
                          setFormData((prev) => ({ ...prev, delivery_area: value }))
                        }
                        className="grid grid-cols-2 gap-3"
                      >
                        <label
                          htmlFor="inside_dhaka"
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                            formData.delivery_area === "inside_dhaka"
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="inside_dhaka" id="inside_dhaka" />
                          <div className="flex-1">
                            <span className="font-medium text-foreground block">{t("ঢাকার ভেতরে", "Inside Dhaka")}</span>
                            <span className="text-sm text-primary font-bold">
                              {isFreeDelivery ? (
                                <span className="text-green-600">{t("ফ্রি ডেলিভারি!", "Free Delivery!")}</span>
                              ) : (
                                <>৳{insideDhakaCharge}</>
                              )}
                            </span>
                          </div>
                        </label>
                        <label
                          htmlFor="outside_dhaka"
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                            formData.delivery_area === "outside_dhaka"
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value="outside_dhaka" id="outside_dhaka" />
                          <div className="flex-1">
                            <span className="font-medium text-foreground block">{t("ঢাকার বাইরে", "Outside Dhaka")}</span>
                            <span className="text-sm text-primary font-bold">
                              {isFreeDelivery ? (
                                <span className="text-green-600">{t("ফ্রি ডেলিভারি!", "Free Delivery!")}</span>
                              ) : (
                                <>৳{outsideDhakaCharge}</>
                              )}
                            </span>
                          </div>
                        </label>
                      </RadioGroup>
                      {freeDeliveryMin > 0 && !isFreeDelivery && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {t(`৳${freeDeliveryMin}+ অর্ডারে ফ্রি ডেলিভারি`, `Free delivery on orders ৳${freeDeliveryMin}+`)}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">{t("শহর", "City")} *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder={t("ঢাকা", "Dhaka")}
                          className={errors.city ? "border-destructive" : ""}
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">{errors.city}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="area">{t("এলাকা", "Area")}</Label>
                        <Input
                          id="area"
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          placeholder={t("মিরপুর, উত্তরা...", "Mirpur, Uttara...")}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="shipping_address">{t("সম্পূর্ণ ঠিকানা", "Full Address")} *</Label>
                      <Textarea
                        id="shipping_address"
                        name="shipping_address"
                        value={formData.shipping_address}
                        onChange={handleChange}
                        placeholder={t("বাড়ি নং, রোড নং, এলাকা...", "House no, Road no, Area...")}
                        className={errors.shipping_address ? "border-destructive" : ""}
                      />
                      {errors.shipping_address && (
                        <p className="text-sm text-destructive mt-1">{errors.shipping_address}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="notes">{t("অর্ডার নোট (ঐচ্ছিক)", "Order Notes (Optional)")}</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder={t("বিশেষ কোন নির্দেশনা থাকলে লিখুন...", "Any special instructions...")}
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
                    {t("পেমেন্ট পদ্ধতি", "Payment Method")}
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
                            <span className="font-medium text-foreground">{t(method.name_bn, method.name)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{t(method.instructions_bn || "", method.instructions || "")}</p>
                          {method.account_number && (
                            <p className="text-sm font-medium text-primary mt-1">
                              {t("নম্বর:", "Number:")} {method.account_number}
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
                        placeholder={t("আপনার Transaction ID দিন", "Enter your Transaction ID")}
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
                    {t("অর্ডার সারসংক্ষেপ", "Order Summary")}
                  </h2>

                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground/80 line-clamp-1">
                          {t(item.name_bn, item.name)} × {item.quantity}
                        </span>
                        <span className="font-medium shrink-0 ml-2">
                          ৳{((item.sale_price || item.price) * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2 mb-4">
                    <div className="flex justify-between text-foreground/80">
                      <span>{t("সাবটোটাল", "Subtotal")}</span>
                      <span>৳{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-foreground/80">
                      <span>{t("ডেলিভারি চার্জ", "Delivery Charge")}</span>
                      {isFreeDelivery ? (
                        <span className="text-green-600">{t("ফ্রি!", "Free!")}</span>
                      ) : (
                        <span>৳{finalShipping}</span>
                      )}
                    </div>
                    {!isFreeDelivery && (
                      <p className="text-xs text-muted-foreground">
                        {t(`৳${freeDeliveryMin}+ অর্ডারে ফ্রি ডেলিভারি`, `Free delivery on orders ৳${freeDeliveryMin}+`)}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold text-foreground">
                      <span>{t("মোট", "Total")}</span>
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
                        {t("প্রসেসিং...", "Processing...")}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t("অর্ডার কনফার্ম করুন", "Confirm Order")}
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