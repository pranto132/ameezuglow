import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { z } from "zod";

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const authSchema = z.object({
    email: z.string().email(t("সঠিক ইমেইল দিন", "Enter a valid email")),
    password: z.string().min(6, t("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে", "Password must be at least 6 characters")),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      authSchema.parse(formData);

      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error(t("এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে", "An account with this email already exists"));
          } else {
            toast.error(error.message || t("সাইন আপ করতে সমস্যা হয়েছে", "Error signing up"));
          }
        } else {
          toast.success(t("অ্যাকাউন্ট তৈরি সফল! আপনি এখন লগ ইন করতে পারবেন।", "Account created successfully! You can now log in."));
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(t("ইমেইল বা পাসওয়ার্ড ভুল", "Incorrect email or password"));
        } else {
          toast.success(t("লগইন সফল!", "Login successful!"));
          navigate("/");
        }
      }
    } catch (error: any) {
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
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("হোম পেজে ফিরে যান", "Back to Home")}
        </Link>

        <div className="bg-card rounded-2xl border border-border shadow-soft p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-primary via-deep-rose to-rose-gold bg-clip-text text-transparent">
              Ameezuglow
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? t("নতুন অ্যাকাউন্ট তৈরি করুন", "Create a new account") : t("আপনার অ্যাকাউন্টে লগইন করুন", "Login to your account")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">{t("নাম", "Name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("আপনার নাম", "Your name")}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">{t("ইমেইল", "Email")} *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">{t("পাসওয়ার্ড", "Password")} *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
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
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSignUp ? t("সাইন আপ করুন", "Sign Up") : t("লগইন করুন", "Login")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isSignUp ? t("আগে থেকেই অ্যাকাউন্ট আছে?", "Already have an account?") : t("অ্যাকাউন্ট নেই?", "Don't have an account?")}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="ml-2 text-primary hover:underline font-medium"
              >
                {isSignUp ? t("লগইন করুন", "Login") : t("সাইন আপ করুন", "Sign Up")}
              </button>
            </p>
          </div>

          {/* Guest Checkout Option */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {t("অ্যাকাউন্ট ছাড়াই অর্ডার করতে চান?", "Want to order without an account?")}
            </p>
            <Link to="/checkout">
              <Button variant="outline" className="w-full">
                {t("গেস্ট হিসেবে অর্ডার করুন", "Order as Guest")}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;