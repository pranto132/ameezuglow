import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Eye, ShoppingBag, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const Orders = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();

  const statusLabels: Record<string, string> = {
    pending: t("অপেক্ষমাণ", "Pending"),
    processing: t("প্রসেসিং", "Processing"),
    shipped: t("শিপ করা হয়েছে", "Shipped"),
    delivered: t("ডেলিভারি সম্পন্ন", "Delivered"),
    cancelled: t("বাতিল", "Cancelled"),
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-orders", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold text-foreground">
              {t("আমার অর্ডার সমূহ", "My Orders")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("আপনার সব অর্ডারের তালিকা এখানে দেখুন", "View all your orders here")}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-soft transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">
                            {t("অর্ডার", "Order")} #{order.order_number}
                          </h3>
                          <Badge
                            variant="outline"
                            className={statusColors[order.order_status || "pending"]}
                          >
                            {statusLabels[order.order_status || "pending"]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(order.created_at!), "dd MMM yyyy, hh:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.order_items?.length || 0} {t("টি প্রোডাক্ট", "products")}
                        </p>
                      </div>
                    </div>

                    {/* Order Total & Actions */}
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t("মোট", "Total")}</p>
                        <p className="text-xl font-bold text-primary">
                          ৳{Number(order.total).toFixed(0)}
                        </p>
                      </div>
                      <Link to={`/order-success?order=${order.order_number}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          {t("বিস্তারিত", "Details")}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        {order.order_items.slice(0, 3).map((item: any) => (
                          <span
                            key={item.id}
                            className="text-sm px-3 py-1 bg-muted rounded-full text-muted-foreground"
                          >
                            {item.product_name} × {item.quantity}
                          </span>
                        ))}
                        {order.order_items.length > 3 && (
                          <span className="text-sm px-3 py-1 bg-muted rounded-full text-muted-foreground">
                            +{order.order_items.length - 3} {t("আরও", "more")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tracking Info */}
                  {order.tracking_number && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {t("ট্র্যাকিং নম্বর:", "Tracking Number:")}{" "}
                        <span className="font-medium text-foreground">
                          {order.tracking_number}
                        </span>
                        {order.courier_name && (
                          <span className="ml-2">({order.courier_name})</span>
                        )}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-card rounded-2xl border border-border"
            >
              <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t("কোন অর্ডার নেই", "No Orders Yet")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("আপনি এখনও কোন অর্ডার করেননি। এখনই শপিং শুরু করুন!", "You haven't placed any orders yet. Start shopping now!")}
              </p>
              <Link to="/shop">
                <Button className="btn-primary gap-2">
                  {t("শপিং করুন", "Start Shopping")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Note about email matching */}
          {orders && orders.length === 0 && user?.email && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t(`টিপ: অর্ডার দেখতে হলে চেকআউটে একই ইমেইল (${user.email}) ব্যবহার করুন`, `Tip: Use the same email (${user.email}) during checkout to see your orders here`)}
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Orders;