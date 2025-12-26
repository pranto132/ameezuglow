import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Palette, Heart, Scissors, Gift } from "lucide-react";

const categories = [
  { name: "স্কিনকেয়ার", slug: "skincare", icon: Sparkles, color: "bg-pink-100" },
  { name: "মেকআপ", slug: "makeup", icon: Palette, color: "bg-rose-100" },
  { name: "লিপ কেয়ার", slug: "lip-care", icon: Heart, color: "bg-red-100" },
  { name: "হেয়ার কেয়ার", slug: "hair-care", icon: Scissors, color: "bg-amber-100" },
  { name: "বিউটি এক্সেসরিজ", slug: "accessories", icon: Gift, color: "bg-purple-100" },
];

export const CategoriesSection = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto container-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            আমাদের ক্যাটাগরি
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            আপনার প্রয়োজন অনুযায়ী সঠিক প্রোডাক্ট খুঁজে নিন
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/shop?category=${category.slug}`}
                className="group block p-6 rounded-2xl bg-background border border-border hover:border-primary/50 hover:shadow-card transition-all duration-300"
              >
                <div className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
