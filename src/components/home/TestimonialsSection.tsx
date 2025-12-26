import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const reviews = [
  {
    id: 1,
    name: "সাবরিনা আক্তার",
    location: "ঢাকা",
    text: "Ameezuglow থেকে স্কিনকেয়ার প্রোডাক্ট নিয়েছি। প্রোডাক্টের কোয়ালিটি অসাধারণ, স্কিনে দারুণ কাজ করেছে। রিয়েলি লাভড ইট!",
    rating: 5,
    avatar: "SA",
  },
  {
    id: 2,
    name: "তানজিলা রহমান",
    location: "চট্টগ্রাম",
    text: "দ্রুত ডেলিভারি ও অরিজিনাল প্রোডাক্ট। প্যাকেজিংও অনেক সুন্দর ছিল। Ameezuglow আমার ফেভারিট বিউটি শপ।",
    rating: 5,
    avatar: "TR",
  },
  {
    id: 3,
    name: "ফারজানা ইসলাম",
    location: "সিলেট",
    text: "অনেক দিন ধরে অর্ডার করছি। প্রতিবারই সন্তুষ্ট হয়েছি। কাস্টমার সার্ভিসও চমৎকার। হাইলি রিকমেন্ডেড!",
    rating: 5,
    avatar: "FI",
  },
  {
    id: 4,
    name: "নুসরাত জাহান",
    location: "রাজশাহী",
    text: "প্রথমবার অর্ডার করলাম এবং অভিজ্ঞতা দারুণ ছিল। প্রোডাক্ট একদম অরিজিনাল এবং দাম ও রিজনেবল।",
    rating: 5,
    avatar: "NJ",
  },
  {
    id: 5,
    name: "মাহিয়া রহমান",
    location: "খুলনা",
    text: "মেকআপ কালেকশন অসাধারণ! সব প্রোডাক্ট জেনুইন এবং প্যাকেজিং খুবই সুন্দর। আবারও অর্ডার করব।",
    rating: 5,
    avatar: "MR",
  },
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            <Star className="w-4 h-4 fill-current" />
            গ্রাহকদের রিভিউ
          </motion.span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            আমাদের <span className="text-primary">সন্তুষ্ট গ্রাহক</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            হাজার হাজার গ্রাহক আমাদের উপর আস্থা রাখেন
          </p>
        </motion.div>

        {/* Desktop View - Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                className="h-full bg-background p-6 md:p-8 rounded-2xl border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300"
              >
                {/* Quote Icon */}
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Quote className="w-6 h-6 text-primary" />
                </div>

                {/* Review Text */}
                <p className="text-foreground/90 leading-relaxed mb-6 text-lg">
                  "{review.text}"
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-deep-rose flex items-center justify-center text-white font-semibold">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{review.name}</p>
                    <p className="text-sm text-muted-foreground">{review.location}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View - Carousel */}
        <div className="md:hidden relative">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-background p-6 rounded-2xl border border-border"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Quote className="w-5 h-5 text-primary" />
            </div>
            <p className="text-foreground/90 mb-4">{reviews[currentIndex].text}</p>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-deep-rose flex items-center justify-center text-white font-semibold text-sm">
                {reviews[currentIndex].avatar}
              </div>
              <div>
                <p className="font-semibold text-foreground">{reviews[currentIndex].name}</p>
                <p className="text-xs text-muted-foreground">{reviews[currentIndex].location}</p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary w-6" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            আপনিও আমাদের পরিবারের সদস্য হোন
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex -space-x-2">
              {reviews.slice(0, 4).map((review, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-deep-rose flex items-center justify-center text-white text-xs font-semibold border-2 border-background"
                >
                  {review.avatar}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold border-2 border-background">
                +৫k
              </div>
            </div>
            <p className="text-sm text-foreground font-medium">
              ৫,০০০+ সন্তুষ্ট গ্রাহক
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
