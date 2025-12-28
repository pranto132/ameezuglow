import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { ShoppingBag, Minus, Plus, Star, Truck, Shield, RotateCcw, ChevronLeft, Zap } from "lucide-react";
import { useState } from "react";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, name_bn, slug)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", product?.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!product?.id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto container-padding section-padding">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
              <div className="h-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto container-padding section-padding text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("প্রোডাক্ট পাওয়া যায়নি", "Product Not Found")}</h1>
          <Button asChild>
            <Link to="/shop">{t("শপে ফিরে যান", "Back to Shop")}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        name_bn: product.name_bn,
        price: product.price,
        sale_price: product.sale_price || undefined,
        image: product.images?.[0],
      });
    }
    toast.success(t(`${quantity}টি প্রোডাক্ট কার্টে যুক্ত হয়েছে!`, `${quantity} item(s) added to cart!`));
  };

  const handleBuyNow = () => {
    // Add items to cart first
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        name_bn: product.name_bn,
        price: product.price,
        sale_price: product.sale_price || undefined,
        image: product.images?.[0],
      });
    }
    // Navigate directly to checkout
    navigate("/checkout");
  };

  const category = product.categories as { name: string; name_bn: string; slug: string } | null;

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">{t("হোম", "Home")}</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary">{t("শপ", "Shop")}</Link>
            {category && (
              <>
                <span>/</span>
                <Link to={`/shop?category=${category.slug}`} className="hover:text-primary">
                  {t(category.name_bn, category.name)}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{t(product.name_bn, product.name)}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-square bg-gradient-to-br from-blush/30 to-nude/30 rounded-2xl overflow-hidden flex items-center justify-center">
                <span className="text-8xl">💄</span>
                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-primary text-primary-foreground font-medium px-3 py-1.5 rounded-full">
                    -{discountPercent}% {t("ছাড়", "OFF")}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {category && (
                <Link
                  to={`/shop?category=${category.slug}`}
                  className="inline-block text-sm text-primary font-medium"
                >
                  {t(category.name_bn, category.name)}
                </Link>
              )}

              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {t(product.name_bn, product.name)}
              </h1>

              {/* Reviews Summary */}
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length)
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({reviews.length} {t("টি রিভিউ", "reviews")})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3">
                {product.sale_price ? (
                  <>
                    <span className="text-3xl font-bold text-primary">৳{product.sale_price}</span>
                    <span className="text-xl text-muted-foreground line-through">৳{product.price}</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-foreground">৳{product.price}</span>
                )}
              </div>

              {/* Stock Status */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {product.stock > 0 ? t(`স্টকে আছে (${product.stock}টি)`, `In Stock (${product.stock})`) : t("স্টকে নেই", "Out of Stock")}
              </div>

              {/* Description */}
              {(product.description_bn || product.description) && (
                <p className="text-foreground/80 leading-relaxed">{t(product.description_bn || "", product.description || "")}</p>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary flex-1"
                  size="lg"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t("কার্টে যুক্ত করুন", "Add to Cart")}
                </Button>
              </div>

              {/* Buy Now Button */}
              <Button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                {t("এখনই কিনুন", "Buy Now")}
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{t("দ্রুত ডেলিভারি", "Fast Delivery")}</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{t("১০০% অরিজিনাল", "100% Original")}</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{t("সহজ রিটার্ন", "Easy Returns")}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16 space-y-8">
            {/* Ingredients */}
            {(product.ingredients_bn || product.ingredients) && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">{t("উপাদানসমূহ", "Ingredients")}</h2>
                <p className="text-foreground/80">{t(product.ingredients_bn || "", product.ingredients || "")}</p>
              </div>
            )}

            {/* How to Use */}
            {(product.how_to_use_bn || product.how_to_use) && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">{t("ব্যবহার পদ্ধতি", "How to Use")}</h2>
                <p className="text-foreground/80">{t(product.how_to_use_bn || "", product.how_to_use || "")}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                {t("গ্রাহকদের রিভিউ", "Customer Reviews")} ({reviews?.length || 0})
              </h2>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (review.rating || 0) ? "fill-primary text-primary" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-sm">{review.customer_name}</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-foreground/80">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">{t("এই প্রোডাক্টে এখনও কোন রিভিউ নেই।", "No reviews yet for this product.")}</p>
              )}
            </div>
          </div>

          {/* Back to Shop */}
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/shop">
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t("শপে ফিরে যান", "Back to Shop")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;