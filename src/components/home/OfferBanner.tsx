import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";

export const OfferBanner = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto container-padding">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-deep-rose p-8 md:p-12 text-primary-foreground"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl">
                <Gift className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-1">
                  স্পেশাল বিউটি অফার!
                </h3>
                <p className="text-white/90">
                  আজই অর্ডার করুন এবং পান বিশেষ ছাড় ও আকর্ষণীয় গিফট।
                </p>
              </div>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
            >
              <Link to="/shop?offers=true">
                <Sparkles className="w-4 h-4 mr-2" />
                অফার সংগ্রহ করুন
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
