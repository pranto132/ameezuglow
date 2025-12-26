import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Clock, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export const OfferBanner = () => {
  // Countdown timer (example: 3 days from now)
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto container-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-deep-rose to-rose-gold" />
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            />
          </div>

          {/* Floating Sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="absolute"
              style={{
                top: `${20 + (i % 3) * 30}%`,
                left: `${10 + i * 10}%`,
              }}
            >
              <Sparkles className="w-4 h-4 text-white/40" />
            </motion.div>
          ))}

          {/* Content */}
          <div className="relative z-10 p-8 md:p-12 lg:p-16 text-primary-foreground">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6"
                >
                  <Gift className="w-5 h-5" />
                  <span className="font-medium">সীমিত সময়ের অফার</span>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                >
                  স্পেশাল বিউটি অফার!
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-white/90 text-lg mb-6 max-w-md mx-auto lg:mx-0"
                >
                  আজই অর্ডার করুন এবং পান বিশেষ ছাড় ও আকর্ষণীয় গিফট। ৩০% পর্যন্ত ছাড়!
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-semibold h-14 px-8 group"
                  >
                    <Link to="/shop?offers=true">
                      <Sparkles className="w-5 h-5 mr-2" />
                      অফার সংগ্রহ করুন
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Countdown Timer */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">অফার শেষ হতে বাকি</span>
                </div>
                <div className="flex gap-3 md:gap-4">
                  {[
                    { value: timeLeft.days, label: "দিন" },
                    { value: timeLeft.hours, label: "ঘণ্টা" },
                    { value: timeLeft.minutes, label: "মিনিট" },
                    { value: timeLeft.seconds, label: "সেকেন্ড" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-5 min-w-[70px] md:min-w-[80px]"
                    >
                      <span className="block text-2xl md:text-3xl font-bold">
                        {String(item.value).padStart(2, "0")}
                      </span>
                      <span className="text-xs md:text-sm text-white/80">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
