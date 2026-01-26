import { useEffect, useState, useCallback } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Menu, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const AdminLayout = () => {
  const { user, isLoading, signOut } = useAuth();
  const { getSetting } = useSiteSettings();
  const siteName = getSetting("site_name", "Ameezuglow");
  const location = useLocation();

  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const forceSignOutAndRedirect = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Ignore errors
    }
    setIsVerifiedAdmin(false);
    setAccessDenied(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      // Reset states on every check
      setIsVerifying(true);
      setIsVerifiedAdmin(false);
      setAccessDenied(false);

      if (!user) {
        setIsVerifying(false);
        return;
      }

      try {
        // Fresh session check to ensure token is valid
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session || sessionData.session.user.id !== user.id) {
          if (!cancelled) await forceSignOutAndRedirect();
          return;
        }

        // Always verify admin access from the backend (deny-by-default)
        const { data: isAdmin, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (cancelled) return;

        if (error || isAdmin !== true) {
          await forceSignOutAndRedirect();
          return;
        }

        setIsVerifiedAdmin(true);
      } catch {
        if (!cancelled) await forceSignOutAndRedirect();
      } finally {
        if (!cancelled) setIsVerifying(false);
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [user?.id, forceSignOutAndRedirect]);

  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Show access denied screen instead of just redirecting
  if (accessDenied || !isVerifiedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">অ্যাক্সেস নেই</h1>
          <p className="text-muted-foreground">আপনার অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই।</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              হোমে ফিরুন
            </Button>
            <Button onClick={() => window.location.href = "/admin/login"}>
              আবার লগইন করুন
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-card flex items-center px-4 sticky top-0 z-40">
            <SidebarTrigger className="mr-4">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="font-display text-xl font-bold text-primary">{siteName} Admin</h1>
              <Badge variant="secondary" className="truncate max-w-[45vw]">
                {user.email}
              </Badge>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

