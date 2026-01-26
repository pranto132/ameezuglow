import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FacebookPixel } from "@/components/FacebookPixel";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCouriers from "./pages/admin/AdminCouriers";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminCMSPages from "./pages/admin/AdminCMSPages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <FacebookPixel />
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/track-order" element={<TrackOrder />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="couriers" element={<AdminCouriers />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="banners" element={<AdminBanners />} />
              <Route path="pages" element={<AdminCMSPages />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
