import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles } from "lucide-react";

export const FeaturedProducts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="container mx-auto container-padding relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              বেস্ট সেলার
            </motion.span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              জনপ্রিয় <span className="text-primary">প্রোডাক্ট</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg">
              আমাদের সবচেয়ে বেশি বিক্রিত ও গ্রাহকদের পছন্দের প্রোডাক্টসমূহ
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit group h-12 px-6">
            <Link to="/shop">
              সব প্রোডাক্ট দেখুন
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl h-80 animate-pulse border border-border/50"
              />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-card rounded-3xl border border-border"
          >
            <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              শীঘ্রই আসছে
            </h3>
            <p className="text-muted-foreground mb-6">
              আমাদের নতুন কালেকশন শীঘ্রই আসছে
            </p>
            <Button asChild className="btn-primary">
              <Link to="/shop">সব প্রোডাক্ট দেখুন</Link>
            </Button>
          </motion.div>
        )}

        {/* Promotional Banner */}
        {products && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-accent/10 to-rose-gold/10 p-8 md:p-12 border border-primary/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  নতুন গ্রাহকদের জন্য বিশেষ অফার!
                </h3>
                <p className="text-muted-foreground">
                  প্রথম অর্ডারে পান ১৫% ছাড়। কোড: <span className="font-bold text-primary">WELCOME15</span>
                </p>
              </div>
              <Button asChild className="btn-primary whitespace-nowrap">
                <Link to="/shop">
                  অফার নিন
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
