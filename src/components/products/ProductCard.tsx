import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";
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
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group block bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-card transition-all duration-300"
      >
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blush/30 to-nude/30 flex items-center justify-center">
            <span className="text-4xl">💄</span>
          </div>
          {discountPercent > 0 && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
              inWishlist ? "bg-primary text-primary-foreground" : "bg-card/80 hover:bg-card"
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
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
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="w-full btn-primary mt-2"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            কার্টে যুক্ত করুন
          </Button>
        </div>
      </Link>
    </motion.div>
  );
};
