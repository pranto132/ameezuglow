import { Link } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto container-padding py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-blush">Ameezuglow</h3>
            <p className="text-background/70 text-sm leading-relaxed">
              আপনার প্রাকৃতিক গ্লোকে দিন নতুন আলো। প্রিমিয়াম কসমেটিকস ও স্কিনকেয়ার প্রোডাক্ট।
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-background/10 rounded-full hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/shop" className="hover:text-blush transition-colors">সব প্রোডাক্ট</Link></li>
              <li><Link to="/categories" className="hover:text-blush transition-colors">ক্যাটাগরি</Link></li>
              <li><Link to="/about" className="hover:text-blush transition-colors">আমাদের সম্পর্কে</Link></li>
              <li><Link to="/contact" className="hover:text-blush transition-colors">যোগাযোগ</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">নীতিমালা</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/privacy" className="hover:text-blush transition-colors">গোপনীয়তা নীতি</Link></li>
              <li><Link to="/returns" className="hover:text-blush transition-colors">রিটার্ন নীতি</Link></li>
              <li><Link to="/terms" className="hover:text-blush transition-colors">শর্তাবলী</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blush" />
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blush" />
                <span>hello@ameezuglow.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blush mt-0.5" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} Ameezuglow. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
};
