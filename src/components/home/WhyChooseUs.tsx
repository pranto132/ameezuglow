import { motion } from "framer-motion";
import { Check, Truck, Shield, Heart, Sparkles, Award, Clock, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const WhyChooseUs = () => {
  const { t } = useLanguage();
  const { getSetting } = useSiteSettings();

  const features = [
    {
      icon: Shield,
      title: t("১০০% অরিজিনাল", "100% Original"),
      description: t("সব প্রোডাক্ট সরাসরি ব্র্যান্ড থেকে সংগ্রহ করা", "All products sourced directly from brands"),
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Heart,
      title: t("স্কিন-ফ্রেন্ডলি", "Skin-Friendly"),
      description: t("বাংলাদেশি ত্বকের জন্য উপযোগী ফর্মুলা", "Formulas suitable for Bangladeshi skin"),
      color: "from-pink-500/20 to-rose-500/20",
    },
    {
      icon: Award,
      title: t("প্রিমিয়াম কোয়ালিটি", "Premium Quality"),
      description: t("বিশ্বমানের কসমেটিকস ও স্কিনকেয়ার", "World-class cosmetics & skincare"),
      color: "from-amber-500/20 to-yellow-500/20",
    },
    {
      icon: Truck,
      title: t("দ্রুত ডেলিভারি", "Fast Delivery"),
      description: t("ঢাকায় ২৪ ঘণ্টা, সারাদেশে ৩-৫ দিন", "24 hours in Dhaka, 3-5 days nationwide"),
      color: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: Clock,
      title: t("সহজ রিটার্ন", "Easy Returns"),
      description: t("৭ দিনের মধ্যে রিটার্ন গ্যারান্টি", "7-day return guarantee"),
      color: "from-purple-500/20 to-violet-500/20",
    },
    {
      icon: Headphones,
      title: t("২৪/৭ সাপোর্ট", "24/7 Support"),
      description: t("যেকোনো সময় গ্রাহক সেবা", "Customer service anytime"),
      color: "from-indigo-500/20 to-blue-500/20",
    },
  ];

  const badgeText = t(getSetting("why_badge_bn", "আমাদের বিশেষত্ব"), getSetting("why_badge_en", "Our Specialty"));
  const titleText = t(getSetting("why_title_bn", "কেন Ameezuglow?"), getSetting("why_title_en", "Why Ameezuglow?"));
  const descriptionText = t(getSetting("why_description_bn", "আমরা আপনার সৌন্দর্যের যত্ন নিতে প্রতিশ্রুতিবদ্ধ। বিশ্বাসযোগ্যতা ও মানের প্রতি আমাদের অঙ্গীকার অটুট।"), getSetting("why_description_en", "We are committed to caring for your beauty. Our commitment to trustworthiness and quality is unwavering."));

  const stats = [
    { value: getSetting("stat1_value", "৫০০০+"), label: t(getSetting("stat1_label_bn", "সন্তুষ্ট গ্রাহক"), getSetting("stat1_label_en", "Happy Customers")) },
    { value: getSetting("stat2_value", "২০০+"), label: t(getSetting("stat2_label_bn", "প্রোডাক্ট"), getSetting("stat2_label_en", "Products")) },
    { value: getSetting("stat3_value", "৯৯%"), label: t(getSetting("stat3_label_bn", "পজিটিভ রিভিউ"), getSetting("stat3_label_en", "Positive Reviews")) },
    { value: getSetting("stat4_value", "২৪/৭"), label: t(getSetting("stat4_label_bn", "সাপোর্ট"), getSetting("stat4_label_en", "Support")) },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto container-padding relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            {badgeText}
          </motion.span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {titleText}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {descriptionText}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`relative h-full p-6 md:p-8 rounded-2xl bg-gradient-to-br ${feature.color} border border-border/50 hover:border-primary/30 backdrop-blur-sm transition-all duration-300`}
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-14 h-14 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 shadow-soft"
                >
                  <feature.icon className="w-7 h-7 text-primary" />
                </motion.div>

                {/* Content */}
                <h3 className="font-semibold text-xl text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Check Mark */}
                <div className="absolute top-6 right-6 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-card border border-border/50"
            >
              <p className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
