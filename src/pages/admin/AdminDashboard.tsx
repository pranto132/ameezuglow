import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("orders").select("*"),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const pendingOrders = orders.filter((o) => o.order_status === "pending").length;
      const completedOrders = orders.filter((o) => o.order_status === "delivered").length;

      return {
        totalProducts: productsRes.count || 0,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        completedOrders,
        recentOrders: orders.slice(0, 5),
      };
    },
  });

  const statCards = [
    {
      title: "মোট প্রোডাক্ট",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
      link: "/admin/products",
    },
    {
      title: "মোট অর্ডার",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-green-600 bg-green-100",
      link: "/admin/orders",
    },
    {
      title: "মোট আয়",
      value: `৳${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-primary bg-primary/10",
      link: "/admin/orders",
    },
    {
      title: "পেন্ডিং অর্ডার",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "text-orange-600 bg-orange-100",
      link: "/admin/orders?status=pending",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">আপনার স্টোরের সারসংক্ষেপ</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card className="hover:shadow-card transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">
              সব দেখুন →
            </Link>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">৳{Number(order.total).toLocaleString()}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.order_status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.order_status === "pending"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.order_status === "pending"
                          ? "পেন্ডিং"
                          : order.order_status === "processing"
                          ? "প্রসেসিং"
                          : order.order_status === "shipped"
                          ? "শিপড"
                          : order.order_status === "delivered"
                          ? "ডেলিভার্ড"
                          : order.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">কোন অর্ডার নেই</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
