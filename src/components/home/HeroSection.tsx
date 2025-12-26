import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-cosmetics.jpg";
import { Shield, Truck, CreditCard, Star } from "lucide-react";

export const HeroSection = () => {
  const trustBadges = [
    { icon: Shield, text: "১০০% অরিজিনাল প্রোডাক্ট" },
    { icon: CreditCard, text: "ক্যাশ অন ডেলিভারি" },
    { icon: Truck, text: "সারা দেশে ডেলিভারি" },
    { icon: Star, text: "নিরাপদ অনলাইন শপিং" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto container-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left space-y-6"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              আপনার প্রাকৃতিক গ্লোকে দিন{" "}
              <span className="text-primary">নতুন আলো</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Ameezuglow নিয়ে এসেছে প্রিমিয়াম কসমেটিকস ও স্কিনকেয়ার প্রোডাক্ট, যা
              আপনার সৌন্দর্যকে করবে আরও উজ্জ্বল ও আত্মবিশ্বাসী।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="btn-primary text-lg">
                <Link to="/shop">এখনই কিনুন</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="btn-secondary text-lg">
                <Link to="/shop?offers=true">আজকের অফার দেখুন</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <badge.icon className="w-5 h-5 text-primary" />
                  <span>{badge.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={heroImage}
                alt="Ameezuglow Premium Cosmetics"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-card"
            >
              <p className="text-sm font-medium text-primary">🎉 বিশেষ ছাড়</p>
              <p className="text-2xl font-bold text-foreground">৩০% পর্যন্ত</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
