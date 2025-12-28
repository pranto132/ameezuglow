import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("সঠিক ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, signOut, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validated = loginSchema.parse(formData);

      // Ensure we're not reusing a previous (possibly admin) session
      await signOut();

      const { error } = await signIn(validated.email, validated.password);
      if (error) {
        toast.error("ইমেইল বা পাসওয়ার্ড ভুল");
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        await signOut();
        toast.error("লগইন যাচাই করা যায়নি, আবার চেষ্টা করুন");
        return;
      }

      // Server-side role check (security definer function)
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });

      if (roleError || !isAdmin) {
        await signOut();
        toast.error("আপনার অ্যাডমিন অ্যাক্সেস নেই");
        navigate("/admin/login", { replace: true });
        return;
      }

      toast.success("অ্যাডমিন লগইন সফল!");
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
            <h1 className="font-display text-3xl font-bold text-primary mb-2">
              Ameezuglow
            </h1>
            <p className="text-muted-foreground">
              অ্যাডমিন প্যানেলে লগইন করুন
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">ইমেইল</Label>
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
              <Label htmlFor="password">পাসওয়ার্ড</Label>
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
                  অপেক্ষা করুন...
                </>
              ) : (
                "লগইন করুন"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          &larr; <a href="/" className="hover:text-primary">মূল সাইটে ফিরে যান</a>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
