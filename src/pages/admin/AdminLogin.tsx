import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, isLoading: authLoading } = useAuth();
  const { getSetting } = useSiteSettings();
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const siteName = getSetting("site_name", "Ameezuglow");
  const logoUrl = getSetting("logo_url", "");

  const loginSchema = z.object({
    email: z.string().email(language === "bn" ? "সঠিক ইমেইল দিন" : "Enter a valid email"),
    password: z.string().min(6, language === "bn" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validated = loginSchema.parse(formData);

      // CRITICAL: Clear ALL previous sessions first to prevent stale admin access
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // Ignore signout errors
      }

      // Fresh login
      const { error } = await signIn(validated.email, validated.password);
      if (error) {
        toast.error(t(adminTranslations.login.invalidCredentials));
        return;
      }

      // Get fresh user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        await supabase.auth.signOut({ scope: "local" });
        toast.error(language === "bn" ? "লগইন যাচাই করা যায়নি, আবার চেষ্টা করুন" : "Login verification failed, please try again");
        return;
      }

      // Server-side role check - MUST return exactly true
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });

      if (roleError || isAdmin !== true) {
        // Not admin - sign out completely and show error
        await supabase.auth.signOut({ scope: "local" });
        toast.error(language === "bn" ? "আপনার অ্যাডমিন অ্যাক্সেস নেই" : "You don't have admin access");
        return;
      }

      toast.success(language === "bn" ? "অ্যাডমিন লগইন সফল!" : "Admin login successful!");
      navigate("/admin", { replace: true });
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
        // Sign out on any unexpected error
        await supabase.auth.signOut({ scope: "local" });
        toast.error(language === "bn" ? "একটি সমস্যা হয়েছে, আবার চেষ্টা করুন" : "An error occurred, please try again");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl border border-border shadow-elevated p-8">
          <div className="text-center mb-8">
            {logoUrl && (
              <img src={logoUrl} alt={siteName} className="h-12 w-auto mx-auto mb-2 object-contain" />
            )}
            <h1 className="font-display text-3xl font-bold text-primary mb-2">
              {siteName}
            </h1>
            <p className="text-muted-foreground">
              {t(adminTranslations.login.title)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t(adminTranslations.login.email)}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="admin@example.com"
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password">{t(adminTranslations.login.password)}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full btn-primary" size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "bn" ? "অপেক্ষা করুন..." : "Please wait..."}
                </>
              ) : (
                t(adminTranslations.login.loginButton)
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <a href="/" className="hover:text-primary">{t(adminTranslations.login.backToSite)}</a>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
