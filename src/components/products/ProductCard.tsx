import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  name_bn: string;
  price: number;
  sale_price?: number | null;
  images?: string[];
  slug: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      name_bn: product.name_bn,
      price: product.price,
      sale_price: product.sale_price || undefined,
      image: product.images?.[0],
    });
    toast.success("কার্টে যুক্ত হয়েছে!");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info("উইশলিস্ট থেকে সরানো হয়েছে");
    } else {
      addToWishlist(product.id);
      toast.success("উইশলিস্টে যুক্ত হয়েছে!");
    }
  };

  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group block bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-blush/20 to-nude/20 overflow-hidden">
          {/* Placeholder Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">💄</span>
          </div>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
            >
              -{discountPercent}%
            </motion.span>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWishlist}
              className={`p-2.5 rounded-full shadow-md transition-all ${
                inWishlist 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card/90 backdrop-blur-sm hover:bg-card"
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card shadow-md"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Quick Add Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-foreground/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full bg-white text-foreground hover:bg-white/90 font-medium"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              কার্টে যুক্ত করুন
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name_bn}
          </h3>
          
          <div className="flex items-center gap-2">
            {product.sale_price ? (
              <>
                <span className="text-lg font-bold text-primary">৳{product.sale_price}</span>
                <span className="text-sm text-muted-foreground line-through">৳{product.price}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-foreground">৳{product.price}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
