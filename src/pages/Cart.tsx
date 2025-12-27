import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { useLanguage } from "@/contexts/LanguageContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

const Cart = () => {
  const { t } = useLanguage();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <Layout>
        <section className="section-padding">
          <div className="container mx-auto container-padding text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="text-8xl mb-6">🛒</div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-4">
                {t("আপনার কার্ট খালি", "Your Cart is Empty")}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t("আমাদের সুন্দর প্রোডাক্ট দেখুন এবং আপনার পছন্দের জিনিস কার্টে যুক্ত করুন।", "Browse our beautiful products and add your favorites to the cart.")}
              </p>
              <Button asChild className="btn-primary">
                <Link to="/shop">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {t("শপিং করুন", "Start Shopping")}
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground mb-8"
          >
            {t(`আপনার কার্ট (${items.length}টি আইটেম)`, `Your Cart (${items.length} items)`)}
          </motion.h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-4 flex gap-4"
                >
                  {/* Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-blush/30 to-nude/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-3xl">💄</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {t(item.name_bn, item.name)}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {item.sale_price ? (
                        <>
                          <span className="font-bold text-primary">৳{item.sale_price}</span>
                          <span className="text-sm text-muted-foreground line-through">৳{item.price}</span>
                        </>
                      ) : (
                        <span className="font-bold text-foreground">৳{item.price}</span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <span className="font-bold text-foreground">
                      ৳{((item.sale_price || item.price) * item.quantity).toFixed(0)}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart */}
              <Button variant="outline" onClick={clearCart} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                {t("কার্ট খালি করুন", "Clear Cart")}
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl border border-border p-6 sticky top-24"
              >
                <h2 className="font-display text-xl font-bold text-foreground mb-6">
                  {t("অর্ডার সারসংক্ষেপ", "Order Summary")}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-foreground/80">
                    <span>{t("সাবটোটাল", "Subtotal")}</span>
                    <span>৳{getTotal().toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/80">
                    <span>{t("ডেলিভারি চার্জ", "Delivery Charge")}</span>
                    <span className="text-muted-foreground">{t("চেকআউটে নির্ধারণ হবে", "Calculated at checkout")}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>{t("মোট", "Total")}</span>
                    <span>৳{getTotal().toFixed(0)}</span>
                  </div>
                </div>

                <Button asChild className="btn-primary w-full" size="lg">
                  <Link to="/checkout">
                    {t("চেকআউট করুন", "Proceed to Checkout")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                <Link
                  to="/shop"
                  className="block text-center text-sm text-primary hover:underline mt-4"
                >
                  {t("শপিং চালিয়ে যান", "Continue Shopping")}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;