import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const AdminLayout = () => {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();

  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!user) {
        setIsVerifiedAdmin(false);
        setIsVerifying(false);
        return;
      }

      setIsVerifying(true);
      setIsVerifiedAdmin(false);

      try {
        // Always verify admin access from the backend (deny-by-default)
        const { data: isAdmin, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (cancelled) return;

        if (error || !isAdmin) {
          await signOut();
          setIsVerifiedAdmin(false);
          setIsVerifying(false);
          return;
        }

        setIsVerifiedAdmin(true);
      } finally {
        if (!cancelled) setIsVerifying(false);
      }
    };

    // Defer to avoid doing async work during render
    setTimeout(() => {
      verify();
    }, 0);

    return () => {
      cancelled = true;
    };
  }, [user?.id, signOut]);

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

  if (!isVerifiedAdmin) {
    return <Navigate to="/admin/login" replace />;
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
              <h1 className="font-display text-xl font-bold text-primary">Ameezuglow Admin</h1>
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

