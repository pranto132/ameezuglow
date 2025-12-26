import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Palette, Heart, Scissors, Gift, ArrowRight } from "lucide-react";

const iconMap: Record<string, any> = {
  skincare: Sparkles,
  makeup: Palette,
  "lip-care": Heart,
  "hair-care": Scissors,
  accessories: Gift,
};

const colorMap: Record<string, string> = {
  skincare: "from-pink-400/20 to-rose-400/20",
  makeup: "from-purple-400/20 to-pink-400/20",
  "lip-care": "from-red-400/20 to-rose-400/20",
  "hair-care": "from-amber-400/20 to-orange-400/20",
  accessories: "from-violet-400/20 to-purple-400/20",
};

export const CategoriesSection = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const defaultCategories = [
    { name_bn: "স্কিনকেয়ার", slug: "skincare" },
    { name_bn: "মেকআপ", slug: "makeup" },
    { name_bn: "লিপ কেয়ার", slug: "lip-care" },
    { name_bn: "হেয়ার কেয়ার", slug: "hair-care" },
    { name_bn: "এক্সেসরিজ", slug: "accessories" },
  ];

  const displayCategories = categories?.length ? categories : defaultCategories;

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto container-padding relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            ক্যাটাগরি
          </motion.span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            আমাদের <span className="text-primary">কালেকশন</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            আপনার প্রয়োজন অনুযায়ী সঠিক প্রোডাক্ট খুঁজে নিন
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {displayCategories.map((category: any, index: number) => {
            const Icon = iconMap[category.slug] || Sparkles;
            const gradientColor = colorMap[category.slug] || "from-primary/20 to-accent/20";

            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/shop?category=${category.slug}`}
                  className="group block relative"
                >
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${gradientColor} border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300 overflow-hidden`}
                  >
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="relative z-10 w-14 h-14 md:w-16 md:h-16 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-soft mx-auto md:mx-0"
                    >
                      <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="relative z-10 font-semibold text-foreground text-center md:text-left group-hover:text-primary transition-colors text-lg">
                      {category.name_bn}
                    </h3>

                    {/* Arrow */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="w-5 h-5 text-primary" />
                    </motion.div>

                    {/* Decorative Circle */}
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors" />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            সব ক্যাটাগরি দেখুন
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
