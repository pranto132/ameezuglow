import { Link } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      {/* Newsletter Section */}
      <div className="relative border-b border-background/10">
        <div className="container mx-auto container-padding py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
              আমাদের সাথে যুক্ত থাকুন
            </h3>
            <p className="text-background/70 mb-6">
              নতুন প্রোডাক্ট, অফার ও বিউটি টিপস পেতে সাবস্ক্রাইব করুন
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="আপনার ইমেইল ঠিকানা"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-blush"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6">
                <Send className="w-4 h-4 mr-2" />
                সাবস্ক্রাইব
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto container-padding py-12 md:py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-3xl font-bold bg-gradient-to-r from-blush via-rose-gold to-accent bg-clip-text text-transparent">
                Ameezuglow
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              আপনার প্রাকৃতিক গ্লোকে দিন নতুন আলো। প্রিমিয়াম কসমেটিকস ও স্কিনকেয়ার প্রোডাক্ট।
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-background/10 rounded-xl hover:bg-primary hover:scale-110 transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-background/10 rounded-xl hover:bg-primary hover:scale-110 transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded-full" />
              দ্রুত লিংক
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/shop"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  সব প্রোডাক্ট
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?offers=true"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  অফার
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=skincare"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  স্কিনকেয়ার
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=makeup"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  মেকআপ
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded-full" />
              সহায়তা
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/track-order"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  অর্ডার ট্র্যাক করুন
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  গোপনীয়তা নীতি
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  রিটার্ন ও রিফান্ড
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  শর্তাবলী
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  সাধারণ প্রশ্ন
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded-full" />
              যোগাযোগ
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href="tel:+8801XXXXXXXXX"
                  className="flex items-center gap-3 text-background/70 hover:text-blush transition-colors"
                >
                  <div className="p-2 bg-background/10 rounded-lg">
                    <Phone className="w-4 h-4 text-blush" />
                  </div>
                  <span>+880 1XXX-XXXXXX</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@ameezuglow.com"
                  className="flex items-center gap-3 text-background/70 hover:text-blush transition-colors"
                >
                  <div className="p-2 bg-background/10 rounded-lg">
                    <Mail className="w-4 h-4 text-blush" />
                  </div>
                  <span>hello@ameezuglow.com</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-background/70">
                <div className="p-2 bg-background/10 rounded-lg mt-0.5">
                  <MapPin className="w-4 h-4 text-blush" />
                </div>
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-background/50">পেমেন্ট মেথড:</span>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-background/10 rounded text-xs font-medium">
                  bKash
                </div>
                <div className="px-3 py-1.5 bg-background/10 rounded text-xs font-medium">
                  Nagad
                </div>
                <div className="px-3 py-1.5 bg-background/10 rounded text-xs font-medium">
                  COD
                </div>
              </div>
            </div>
            <p className="text-sm text-background/50 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-primary fill-primary" /> in Bangladesh
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-background/10 py-6">
        <div className="container mx-auto container-padding text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} Ameezuglow. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
};
