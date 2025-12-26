import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Menu, X, Search, User, ChevronDown, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const itemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const handleSignOut = async () => {
    await signOut();
    toast.success("লগআউট সফল!");
    navigate("/");
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
    { href: "/", label: "হোম" },
    { href: "/shop", label: "শপ" },
  ];

  const categoryLinks = [
    { href: "/shop?category=skincare", label: "স্কিনকেয়ার" },
    { href: "/shop?category=makeup", label: "মেকআপ" },
    { href: "/shop?category=lip-care", label: "লিপ কেয়ার" },
    { href: "/shop?category=hair-care", label: "হেয়ার কেয়ার" },
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
            <span>🎁 ৳২০০০+ অর্ডারে ফ্রি ডেলিভারি</span>
            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-primary transition-colors">আমাদের সম্পর্কে</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">যোগাযোগ</Link>
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
                <span className="font-display text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-deep-rose to-rose-gold bg-clip-text text-transparent">
                  Ameezuglow
                </span>
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
                    ক্যাটাগরি
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
                🔥 অফার
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 hover:bg-muted rounded-xl transition-colors"
              >
                <Search className="w-5 h-5 text-foreground/70" />
              </motion.button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2.5 hover:bg-muted rounded-xl transition-colors relative"
              >
                <Heart className="w-5 h-5 text-foreground/70" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

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

              {/* User Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2.5 hover:bg-muted rounded-xl transition-colors relative">
                      <User className="w-5 h-5 text-primary" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="text-muted-foreground text-sm" disabled>
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">
                        আমার অর্ডার
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      লগআউট
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
                    placeholder="আপনার পছন্দের প্রোডাক্ট খুঁজুন..."
                    className="pl-12 h-12 text-base rounded-xl border-border/50 focus:border-primary"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary"
                  >
                    খুঁজুন
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
                  <p className="text-sm text-muted-foreground mb-2">ক্যাটাগরি</p>
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
                  🔥 অফার দেখুন
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
                          আমার অর্ডার
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex-1 py-2 text-center text-sm text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20"
                        >
                          লগআউট
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link
                        to="/auth"
                        className="flex-1 py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-lg"
                      >
                        লগইন / সাইন আপ
                      </Link>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-border/50 flex gap-2">
                  <Link
                    to="/about"
                    className="flex-1 py-2 text-center text-sm text-muted-foreground hover:text-primary"
                  >
                    আমাদের সম্পর্কে
                  </Link>
                  <Link
                    to="/contact"
                    className="flex-1 py-2 text-center text-sm text-muted-foreground hover:text-primary"
                  >
                    যোগাযোগ
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
