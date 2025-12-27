import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const TrackOrder = () => {
  const { t } = useLanguage();
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrderNumber, setSearchedOrderNumber] = useState("");

  const statusSteps = [
    { value: "pending", label: t("পেন্ডিং", "Pending"), icon: Clock, color: "text-orange-500" },
    { value: "confirmed", label: t("কনফার্মড", "Confirmed"), icon: CheckCircle, color: "text-blue-500" },
    { value: "processing", label: t("প্রসেসিং", "Processing"), icon: Package, color: "text-purple-500" },
    { value: "shipped", label: t("শিপড", "Shipped"), icon: Truck, color: "text-indigo-500" },
    { value: "delivered", label: t("ডেলিভার্ড", "Delivered"), icon: CheckCircle, color: "text-green-500" },
  ];

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["track-order", searchedOrderNumber],
    queryFn: async () => {
      if (!searchedOrderNumber) return null;
      
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", searchedOrderNumber)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!searchedOrderNumber,
  });

  const { data: orderItems } = useQuery({
    queryKey: ["track-order-items", order?.id],
    queryFn: async () => {
      if (!order) return [];
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);
      if (error) throw error;
      return data;
    },
    enabled: !!order?.id,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchedOrderNumber(orderNumber.trim());
    }
  };

  const getStatusIndex = (status: string) => {
    if (status === "cancelled") return -1;
    return statusSteps.findIndex((s) => s.value === status);
  };

  const currentStatusIndex = order ? getStatusIndex(order.order_status || "pending") : -1;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto container-padding py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              {t("অর্ডার ট্র্যাক করুন", "Track Your Order")}
            </h1>
            <p className="text-muted-foreground">
              {t("আপনার অর্ডার নম্বর দিয়ে বর্তমান অবস্থা দেখুন", "Enter your order number to check the current status")}
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mb-12"
          >
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={t("অর্ডার নম্বর লিখুন (যেমন: 000123)", "Enter order number (e.g., 000123)")}
                  className="pl-12 h-14 text-lg rounded-xl border-border/50"
                />
              </div>
              <Button type="submit" className="btn-primary h-14 px-8" disabled={isLoading}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    {t("খুঁজুন", "Search")}
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Results */}
          {searchedOrderNumber && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              {error ? (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="py-8 text-center">
                    <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("কিছু সমস্যা হয়েছে", "Something went wrong")}</h3>
                    <p className="text-muted-foreground">{t("দয়া করে আবার চেষ্টা করুন", "Please try again")}</p>
                  </CardContent>
                </Card>
              ) : !order && !isLoading ? (
                <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20">
                  <CardContent className="py-8 text-center">
                    <Package className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("অর্ডার পাওয়া যায়নি", "Order Not Found")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t(`"${searchedOrderNumber}" নম্বরে কোনো অর্ডার নেই। সঠিক অর্ডার নম্বর দিয়ে আবার চেষ্টা করুন।`, `No order found with "${searchedOrderNumber}". Please try with the correct order number.`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("অর্ডার নম্বর আপনার অর্ডার কনফার্মেশন এসএমএস বা ইমেইলে পাবেন", "You can find your order number in the confirmation SMS or email")}
                    </p>
                  </CardContent>
                </Card>
              ) : order ? (
                <div className="space-y-6">
                  {/* Order Status Card */}
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("অর্ডার নম্বর", "Order Number")}</p>
                          <CardTitle className="text-2xl font-display">#{order.order_number}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.created_at || "").toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-8 pb-6">
                      {/* Status Timeline */}
                      {order.order_status === "cancelled" ? (
                        <div className="text-center py-8">
                          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-destructive mb-2">{t("অর্ডার বাতিল করা হয়েছে", "Order Cancelled")}</h3>
                          <p className="text-muted-foreground">{t("এই অর্ডারটি বাতিল করা হয়েছে", "This order has been cancelled")}</p>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Progress Line */}
                          <div className="absolute top-6 left-6 right-6 h-1 bg-muted rounded-full hidden md:block">
                            <div
                              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(0, (currentStatusIndex / (statusSteps.length - 1)) * 100)}%`,
                              }}
                            />
                          </div>

                          {/* Status Steps */}
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                            {statusSteps.map((step, index) => {
                              const isCompleted = index <= currentStatusIndex;
                              const isCurrent = index === currentStatusIndex;
                              const Icon = step.icon;

                              return (
                                <div key={step.value} className="flex md:flex-col items-center md:items-center gap-4 md:gap-2">
                                  <div
                                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                                      isCompleted
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                                        : "bg-muted text-muted-foreground"
                                    } ${isCurrent ? "ring-4 ring-primary/30 scale-110" : ""}`}
                                  >
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 md:flex-none md:text-center">
                                    <p
                                      className={`font-medium text-sm ${
                                        isCompleted ? "text-foreground" : "text-muted-foreground"
                                      }`}
                                    >
                                      {step.label}
                                    </p>
                                    {isCurrent && (
                                      <p className="text-xs text-primary mt-1">{t("বর্তমান অবস্থা", "Current Status")}</p>
                                    )}
                                  </div>
                                  {/* Mobile connector */}
                                  {index < statusSteps.length - 1 && (
                                    <div
                                      className={`w-0.5 h-8 md:hidden ${
                                        index < currentStatusIndex ? "bg-primary" : "bg-muted"
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Courier Info */}
                      {order.courier_name && (
                        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{order.courier_name}</p>
                              {order.tracking_number && (
                                <p className="text-sm text-muted-foreground">
                                  {t("ট্র্যাকিং নম্বর:", "Tracking Number:")} <span className="font-mono">{order.tracking_number}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Order Details Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Shipping Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MapPin className="w-5 h-5 text-primary" />
                          {t("ডেলিভারি ঠিকানা", "Delivery Address")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-muted-foreground">{order.shipping_address}</p>
                        <p className="text-muted-foreground">
                          {order.area && `${order.area}, `}{order.city}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{order.customer_phone}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Package className="w-5 h-5 text-primary" />
                          {t("অর্ডার সামারি", "Order Summary")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("সাবটোটাল", "Subtotal")}</span>
                          <span>৳{Number(order.subtotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t("ডেলিভারি", "Delivery")}</span>
                          <span>৳{Number(order.shipping_cost || 0).toLocaleString()}</span>
                        </div>
                        {Number(order.discount) > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>{t("ডিসকাউন্ট", "Discount")}</span>
                            <span>-৳{Number(order.discount).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                          <span>{t("মোট", "Total")}</span>
                          <span className="text-primary">৳{Number(order.total).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 text-sm">
                          <span className="text-muted-foreground">{t("পেমেন্ট:", "Payment:")} </span>
                          <span className="capitalize">{order.payment_method}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Items */}
                  {orderItems && orderItems.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t("অর্ডার আইটেম", "Order Items")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {orderItems.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                              </div>
                              <p className="font-bold">৳{(Number(item.price) * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Help Section */}
          {!searchedOrderNumber && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-muted/30">
                <CardContent className="py-8">
                  <h3 className="font-semibold text-lg mb-4 text-center">{t("অর্ডার নম্বর কোথায় পাবেন?", "Where to find your order number?")}</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p>{t("অর্ডার সফল হওয়ার পরে আপনার স্ক্রিনে অর্ডার নম্বর দেখানো হয়", "Order number is shown on your screen after successful order")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p>{t("আমরা আপনাকে ফোনে কল করে অর্ডার কনফার্ম করব", "We will call you to confirm your order")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p>{t("ইমেইল দিয়ে অর্ডার করলে ইমেইলেও অর্ডার নম্বর পাঠানো হয়", "If you ordered with email, order number is also sent via email")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;