import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Percent,
  CreditCard,
  Truck,
  Settings,
  FileText,
  LogOut,
  Users,
  Image,
  Shield,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard },
  { title: "প্রোডাক্ট", url: "/admin/products", icon: Package },
  { title: "অর্ডার", url: "/admin/orders", icon: ShoppingCart },
  { title: "ক্যাটাগরি", url: "/admin/categories", icon: Tag },
  { title: "কুপন", url: "/admin/coupons", icon: Percent },
  { title: "কাস্টমার", url: "/admin/customers", icon: Users },
  { title: "ইউজার ম্যানেজমেন্ট", url: "/admin/users", icon: Shield },
];

const settingsItems = [
  { title: "হোমপেজ", url: "/admin/homepage", icon: Home },
  { title: "পেমেন্ট মেথড", url: "/admin/payments", icon: CreditCard },
  { title: "কুরিয়ার সার্ভিস", url: "/admin/couriers", icon: Truck },
  { title: "ব্যানার", url: "/admin/banners", icon: Image },
  { title: "CMS পেজ", url: "/admin/pages", icon: FileText },
  { title: "সাইট সেটিংস", url: "/admin/settings", icon: Settings },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { getSetting } = useSiteSettings();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const siteName = getSetting("site_name", "Ameezuglow");
  const logoUrl = getSetting("logo_url", "");

  const isActive = (url: string) => {
    if (url === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="w-8 h-8 object-contain rounded-lg" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{siteName.charAt(0)}</span>
              </div>
            )}
            {!collapsed && (
              <span className="font-display text-lg font-bold text-foreground">Admin</span>
            )}
          </Link>
        </div>

        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>মেইন মেনু</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>সেটিংস</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border p-4">
        {!collapsed && user && (
          <p className="text-xs text-muted-foreground mb-2 truncate">{user.email}</p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!collapsed && "লগআউট"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
