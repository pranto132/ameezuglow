import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User, ChevronDown, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { getSetting } = useSiteSettings();
  const itemCount = useCartStore((state) => state.getItemCount());
  
  const siteName = t(getSetting("site_name_bn", "আমিজুগ্লো"), getSetting("site_name", "Ameezuglow"));
  const logoUrl = getSetting("logo_url", "");

  const handleSignOut = async () => {
    try {
      setIsMenuOpen(false); // Close menu first
      await signOut();
      toast.success(t("লগআউট সফল!", "Logged out successfully!"));
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error(t("লগআউট করতে সমস্যা হয়েছে", "Failed to log out"));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: t("হোম", "Home") },
    { href: "/shop", label: t("শপ", "Shop") },
    { href: "/track-order", label: t("ট্র্যাক অর্ডার", "Track Order") },
  ];

  const categoryLinks = [
    { href: "/shop?category=skincare", label: t("স্কিনকেয়ার", "Skincare") },
    { href: "/shop?category=makeup", label: t("মেকআপ", "Makeup") },
    { href: "/shop?category=lip-care", label: t("লিপ কেয়ার", "Lip Care") },
    { href: "/shop?category=hair-care", label: t("হেয়ার কেয়ার", "Hair Care") },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-xl shadow-soft border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto container-padding">
          {/* Top Bar */}
          <div className="hidden lg:flex items-center justify-between py-2 text-xs text-muted-foreground border-b border-border/30">
            <span>🎁 {t("৳২০০০+ অর্ডারে ফ্রি ডেলিভারি", "Free delivery on orders ৳2000+")}</span>
            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-primary transition-colors">{t("আমাদের সম্পর্কে", "About Us")}</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">{t("যোগাযোগ", "Contact")}</Link>
              <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
            </div>
          </div>

          {/* Main Nav */}
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={siteName} className="h-8 md:h-10 w-auto object-contain" />
                ) : (
                  <span className="font-display text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-deep-rose to-rose-gold bg-clip-text text-transparent">
                    {siteName}
                  </span>
                )}
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === link.href
                      ? "text-primary bg-primary/5"
                      : "text-foreground/80 hover:text-primary hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-foreground/80 hover:text-primary hover:bg-muted/50 transition-all duration-200">
                    {t("ক্যাটাগরি", "Categories")}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {categoryLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link to={link.href} className="cursor-pointer">
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to="/shop?offers=true"
                className="px-4 py-2 rounded-lg font-medium text-primary hover:bg-primary/5 transition-all duration-200"
              >
                🔥 {t("অফার", "Offers")}
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* Search Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 hover:bg-muted rounded-xl transition-colors"
              >
                <Search className="w-5 h-5 text-foreground/70" />
              </motion.button>

              {/* Cart */}
              <Link
                to="/cart"
                className="p-2.5 hover:bg-muted rounded-xl transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5 text-foreground/70" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>

              {/* User Account - Desktop Only */}
              <div className="hidden lg:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2.5 hover:bg-muted rounded-xl transition-colors relative">
                        <User className="w-5 h-5 text-primary" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-card">
                      <DropdownMenuItem className="text-muted-foreground text-sm" disabled>
                        {user.email}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/orders" className="cursor-pointer">
                          {t("আমার অর্ডার", "My Orders")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        {t("লগআউট", "Logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    to="/auth"
                    className="p-2.5 hover:bg-muted rounded-xl transition-colors"
                  >
                    <User className="w-5 h-5 text-foreground/70" />
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2.5 hover:bg-muted rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/50 bg-background"
            >
              <div className="container mx-auto container-padding py-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={t("আপনার পছন্দের প্রোডাক্ট খুঁজুন...", "Search for your favorite products...")}
                    className="pl-12 h-12 text-base rounded-xl border-border/50 focus:border-primary"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary"
                  >
                    {t("খুঁজুন", "Search")}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border/50 bg-background"
            >
              <nav className="container mx-auto container-padding py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`block py-3 px-4 rounded-xl font-medium transition-colors ${
                      location.pathname === link.href
                        ? "text-primary bg-primary/5"
                        : "text-foreground/80 hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="py-2 px-4">
                  <p className="text-sm text-muted-foreground mb-2">{t("ক্যাটাগরি", "Categories")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="py-2 px-3 text-sm rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to="/shop?offers=true"
                  className="block py-3 px-4 rounded-xl font-medium text-primary bg-primary/5"
                >
                  🔥 {t("অফার দেখুন", "View Offers")}
                </Link>

                {/* User Auth in Mobile Menu */}
                <div className="pt-4 mt-4 border-t border-border/50">
                  {user ? (
                    <div className="space-y-2">
                      <p className="px-4 text-sm text-muted-foreground truncate">{user.email}</p>
                      <div className="flex gap-2">
                        <Link
                          to="/orders"
                          className="flex-1 py-2 text-center text-sm bg-muted rounded-lg hover:bg-muted/80"
                        >
                          {t("আমার অর্ডার", "My Orders")}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex-1 py-2 text-center text-sm text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20"
                        >
                          {t("লগআউট", "Logout")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link
                        to="/auth"
                        className="flex-1 py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-lg"
                      >
                        {t("লগইন / সাইন আপ", "Login / Sign Up")}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-border/50 flex gap-2">
                  <Link
                    to="/about"
                    className="flex-1 py-2 text-center text-sm text-muted-foreground hover:text-primary"
                  >
                    {t("আমাদের সম্পর্কে", "About Us")}
                  </Link>
                  <Link
                    to="/contact"
                    className="flex-1 py-2 text-center text-sm text-muted-foreground hover:text-primary"
                  >
                    {t("যোগাযোগ", "Contact")}
                  </Link>
                  <Link
                    to="/admin"
                    className="flex-1 py-2 text-center text-sm text-muted-foreground hover:text-primary"
                  >
                    Admin
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
