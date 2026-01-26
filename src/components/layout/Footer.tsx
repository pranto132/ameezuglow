import { Link } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Footer = () => {
  const { t } = useLanguage();
  const { getSetting } = useSiteSettings();
  
  const siteName = t(getSetting("site_name_bn", "আমিজুগ্লো"), getSetting("site_name", "Ameezuglow"));
  const logoUrl = getSetting("logo_url", "");
  const copyrightText = getSetting("copyright_text", "");
  const footerText = getSetting("footer_text", "");
  const footerTextBn = getSetting("footer_text_bn", "আপনার প্রাকৃতিক গ্লোকে দিন নতুন আলো। প্রিমিয়াম কসমেটিকস ও স্কিনকেয়ার প্রোডাক্ট।");
  const contactPhone = getSetting("contact_phone", "+880 1XXX-XXXXXX");
  const contactEmail = getSetting("contact_email", "hello@ameezuglow.com");
  const addressBn = getSetting("address_bn", "ঢাকা, বাংলাদেশ");
  const address = getSetting("address", "Dhaka, Bangladesh");
  const facebookUrl = getSetting("facebook_url", "https://facebook.com");
  const instagramUrl = getSetting("instagram_url", "https://instagram.com");

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
              {t("আমাদের সাথে যুক্ত থাকুন", "Stay Connected")}
            </h3>
            <p className="text-background/70 mb-6">
              {t("নতুন প্রোডাক্ট, অফার ও বিউটি টিপস পেতে সাবস্ক্রাইব করুন", "Subscribe for new products, offers & beauty tips")}
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("আপনার ইমেইল ঠিকানা", "Your email address")}
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-blush"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6">
                <Send className="w-4 h-4 mr-2" />
                {t("সাবস্ক্রাইব", "Subscribe")}
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
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
              ) : (
                <span className="font-display text-3xl font-bold bg-gradient-to-r from-blush via-rose-gold to-accent bg-clip-text text-transparent">
                  {siteName}
                </span>
              )}
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              {t(footerTextBn || "আপনার প্রাকৃতিক গ্লোকে দিন নতুন আলো। প্রিমিয়াম কসমেটিকস ও স্কিনকেয়ার প্রোডাক্ট।", footerText || "Bring new light to your natural glow. Premium cosmetics & skincare products.")}
            </p>
            <div className="flex gap-3">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-background/10 rounded-xl hover:bg-primary hover:scale-110 transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={instagramUrl}
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
              {t("দ্রুত লিংক", "Quick Links")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/shop"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {t("সব প্রোডাক্ট", "All Products")}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?offers=true"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {t("অফার", "Offers")}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=skincare"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {t("স্কিনকেয়ার", "Skincare")}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=makeup"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {t("মেকআপ", "Makeup")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded-full" />
              {t("সহায়তা", "Support")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/track-order"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {t("অর্ডার ট্র্যাক করুন", "Track Order")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {t("গোপনীয়তা নীতি", "Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {t("রিটার্ন ও রিফান্ড", "Returns & Refunds")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {t("শর্তাবলী", "Terms & Conditions")}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-background/70 hover:text-blush hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  {t("সাধারণ প্রশ্ন", "FAQ")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded-full" />
              {t("যোগাযোগ", "Contact")}
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3 text-background/70 hover:text-blush transition-colors"
                >
                  <div className="p-2 bg-background/10 rounded-lg">
                    <Phone className="w-4 h-4 text-blush" />
                  </div>
                  <span>{contactPhone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 text-background/70 hover:text-blush transition-colors"
                >
                  <div className="p-2 bg-background/10 rounded-lg">
                    <Mail className="w-4 h-4 text-blush" />
                  </div>
                  <span>{contactEmail}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-background/70">
                <div className="p-2 bg-background/10 rounded-lg mt-0.5">
                  <MapPin className="w-4 h-4 text-blush" />
                </div>
                <span>{t(addressBn, address)}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-background/50">{t("পেমেন্ট মেথড:", "Payment Methods:")}</span>
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
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-background/10 py-6">
        <div className="container mx-auto container-padding text-center text-sm text-background/50">
          <p>
            {copyrightText || `© ${new Date().getFullYear()} ${siteName}. ${t("সর্বস্বত্ব সংরক্ষিত।", "All rights reserved.")}`}
          </p>
        </div>
      </div>
    </footer>
  );
};
