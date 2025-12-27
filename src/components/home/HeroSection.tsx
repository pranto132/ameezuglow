import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-cosmetics.jpg";
import { Shield, Truck, CreditCard, Star, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const HeroSection = () => {
  const { t } = useLanguage();
  const { getSetting } = useSiteSettings();

  const trustBadges = [
    { icon: Shield, text: t(getSetting("trust_badge1_bn", "১০০% অরিজিনাল"), getSetting("trust_badge1_en", "100% Original")) },
    { icon: CreditCard, text: t(getSetting("trust_badge2_bn", "ক্যাশ অন ডেলিভারি"), getSetting("trust_badge2_en", "Cash on Delivery")) },
    { icon: Truck, text: t(getSetting("trust_badge3_bn", "সারা দেশে ডেলিভারি"), getSetting("trust_badge3_en", "Nationwide Delivery")) },
    { icon: Star, text: t(getSetting("trust_badge4_bn", "৫০০০+ সন্তুষ্ট গ্রাহক"), getSetting("trust_badge4_en", "5000+ Happy Customers")) },
  ];

  const heroImg = getSetting("hero_image", "") || heroImage;
  const badgeText = t(getSetting("hero_badge_bn", "প্রিমিয়াম বিউটি কালেকশন"), getSetting("hero_badge_en", "Premium Beauty Collection"));
  const titleText = t(getSetting("hero_title_bn", "আপনার প্রাকৃতিক গ্লোকে দিন নতুন আলো"), getSetting("hero_title_en", "Bring New Light to Your Natural Glow"));
  const highlightText = t(getSetting("hero_highlight_bn", "গ্লোকে"), getSetting("hero_highlight_en", "Glow"));
  const descriptionText = t(getSetting("hero_description_bn", "Ameezuglow নিয়ে এসেছে প্রিমিয়াম কসমেটিকস ও স্কিনকেয়ার প্রোডাক্ট, যা আপনার সৌন্দর্যকে করবে আরও উজ্জ্বল ও আত্মবিশ্বাসী।"), getSetting("hero_description_en", "Ameezuglow brings premium cosmetics & skincare products that will make your beauty more radiant and confident."));
  const btn1Text = t(getSetting("hero_btn1_bn", "এখনই শপ করুন"), getSetting("hero_btn1_en", "Shop Now"));
  const btn2Text = t(getSetting("hero_btn2_bn", "আজকের অফার"), getSetting("hero_btn2_en", "Today's Offers"));
  const discountText = getSetting("hero_discount_text", "৩০%");
  const discountLabel = t(getSetting("hero_discount_label_bn", "পর্যন্ত ছাড়"), getSetting("hero_discount_label_en", "up to off"));
  const reviewCount = getSetting("hero_review_count", "৫,০০০+");
  const reviewLabel = t(getSetting("hero_review_label_bn", "সন্তুষ্ট গ্রাহক"), getSetting("hero_review_label_en", "Happy Customers"));

  // Split title by highlight word
  const titleParts = titleText.split(highlightText);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/4 w-48 h-48 bg-rose-gold/20 rounded-full blur-2xl"
        />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
          >
            <Sparkles className="w-4 h-4 text-primary/30" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto container-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {badgeText}
              </span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1]">
              {titleParts[0]}
              {titleParts.length > 1 && (
                <>
                  <span className="relative">
                    <span className="relative z-10 bg-gradient-to-r from-primary via-deep-rose to-rose-gold bg-clip-text text-transparent">
                      {highlightText}
                    </span>
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="absolute bottom-2 left-0 right-0 h-3 bg-primary/20 -z-0 origin-left"
                    />
                  </span>
                  {titleParts[1]}
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {descriptionText}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="btn-primary text-lg h-14 px-8 group">
                <Link to="/shop">
                  {btn1Text}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
              >
                <Link to="/shop?offers=true">
                  <span className="mr-2">🔥</span>
                  {btn2Text}
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <badge.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80">
                    {badge.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Image */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-3xl overflow-hidden shadow-elevated"
              >
                <img
                  src={heroImg}
                  alt="Ameezuglow Premium Cosmetics"
                  className="w-full h-auto object-cover aspect-[4/5] lg:aspect-square"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              </motion.div>

              {/* Floating Card - Discount */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-card p-4 md:p-5 rounded-2xl shadow-card border border-border/50"
                >
                  <p className="text-sm font-medium text-primary flex items-center gap-1">
                    <span className="text-lg">🎉</span> {t("বিশেষ ছাড়", "Special Discount")}
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-foreground">
                    {discountText}
                  </p>
                  <p className="text-xs text-muted-foreground">{discountLabel}</p>
                </motion.div>
              </motion.div>

              {/* Floating Card - Reviews */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                className="absolute -top-4 -right-4 md:-top-6 md:-right-6"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  className="bg-card p-4 rounded-2xl shadow-card border border-border/50"
                >
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-foreground">{reviewCount}</p>
                  <p className="text-xs text-muted-foreground">{reviewLabel}</p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
