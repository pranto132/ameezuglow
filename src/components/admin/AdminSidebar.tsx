import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";
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

export const AdminSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { getSetting } = useSiteSettings();
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const siteName = getSetting("site_name", "Ameezuglow");
  const logoUrl = getSetting("logo_url", "");

  const menuItems = [
    { title: t(adminTranslations.sidebar.dashboard), url: "/admin", icon: LayoutDashboard },
    { title: t(adminTranslations.sidebar.products), url: "/admin/products", icon: Package },
    { title: t(adminTranslations.sidebar.orders), url: "/admin/orders", icon: ShoppingCart },
    { title: t(adminTranslations.sidebar.categories), url: "/admin/categories", icon: Tag },
    { title: t(adminTranslations.sidebar.coupons), url: "/admin/coupons", icon: Percent },
    { title: t(adminTranslations.sidebar.customers), url: "/admin/customers", icon: Users },
    { title: t(adminTranslations.sidebar.userManagement), url: "/admin/users", icon: Shield },
  ];

  const settingsItems = [
    { title: t(adminTranslations.sidebar.homepage), url: "/admin/homepage", icon: Home },
    { title: t(adminTranslations.sidebar.paymentMethods), url: "/admin/payments", icon: CreditCard },
    { title: t(adminTranslations.sidebar.courierServices), url: "/admin/couriers", icon: Truck },
    { title: t(adminTranslations.sidebar.banners), url: "/admin/banners", icon: Image },
    { title: t(adminTranslations.sidebar.cmsPages), url: "/admin/pages", icon: FileText },
    { title: t(adminTranslations.sidebar.siteSettings), url: "/admin/settings", icon: Settings },
  ];

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
          <SidebarGroupLabel>{t(adminTranslations.sidebar.mainMenu)}</SidebarGroupLabel>
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
          <SidebarGroupLabel>{t(adminTranslations.sidebar.settings)}</SidebarGroupLabel>
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
          {!collapsed && t(adminTranslations.sidebar.logout)}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
