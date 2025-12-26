import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "সাবরিনা আক্তার",
    text: "প্রোডাক্টের কোয়ালিটি খুব ভালো, স্কিনে দারুণ কাজ করেছে।",
    rating: 5,
  },
  {
    name: "তানজিলা রহমান",
    text: "দ্রুত ডেলিভারি ও অরিজিনাল প্রোডাক্ট। Ameezuglow আমার ফেভারিট।",
    rating: 5,
  },
  {
    name: "ফারজানা ইসলাম",
    text: "অনেক দিন ধরে অর্ডার করছি। প্রতিবারই সন্তুষ্ট হয়েছি।",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
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
            গ্রাহকদের মতামত
          </h2>
          <p className="text-muted-foreground">আমাদের সন্তুষ্ট গ্রাহকদের কথা</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background p-6 rounded-2xl border border-border"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-4">{review.text}</p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="font-medium text-foreground">{review.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
