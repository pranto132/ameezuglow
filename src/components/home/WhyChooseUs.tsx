import { motion } from "framer-motion";
import { Check, Truck, Shield, Heart, Sparkles } from "lucide-react";

const features = [
  { icon: Shield, title: "প্রিমিয়াম ও নির্বাচিত কসমেটিকস" },
  { icon: Heart, title: "স্কিন-ফ্রেন্ডলি ও নিরাপদ উপাদান" },
  { icon: Check, title: "সাশ্রয়ী মূল্যে বিশ্বস্ত প্রোডাক্ট" },
  { icon: Sparkles, title: "বাংলাদেশি নারীদের জন্য উপযোগী" },
  { icon: Truck, title: "দ্রুত ডেলিভারি ও সহজ রিটার্ন" },
];

export const WhyChooseUs = () => {
  return (
    <section className="section-padding bg-gradient-hero">
      <div className="container mx-auto container-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            কেন Ameezuglow?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            আমরা আপনার সৌন্দর্যের যত্ন নিতে প্রতিশ্রুতিবদ্ধ
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card p-6 rounded-2xl text-center shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">{feature.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
