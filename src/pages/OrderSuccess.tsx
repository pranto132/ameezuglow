import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { openInvoiceInNewTab } from "@/utils/printInvoice";
import { CheckCircle, Home, ShoppingBag, Phone, Printer } from "lucide-react";

const OrderSuccess = () => {
  const { t } = useLanguage();
  const { getSetting } = useSiteSettings();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const contactPhone = getSetting("contact_phone", "+880 1XXX-XXXXXX");

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              {t("অর্ডার সফল হয়েছে!", "Order Placed Successfully!")}
            </h1>

            <p className="text-muted-foreground mb-6">
              {t("আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।", "Your order has been successfully received. We will contact you soon.")}
            </p>

            {orderNumber && (
              <div className="bg-card rounded-2xl border border-border p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-1">{t("অর্ডার নম্বর", "Order Number")}</p>
                <p className="text-2xl font-bold text-primary">{orderNumber}</p>
              </div>
            )}

            <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-foreground mb-3">{t("পরবর্তী ধাপ:", "Next Steps:")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">{t("১.", "1.")}</span>
                  {t("আমাদের টিম আপনার অর্ডার যাচাই করবে", "Our team will verify your order")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">{t("২.", "2.")}</span>
                  {t("কনফার্মেশনের জন্য ফোন করা হবে", "You will receive a confirmation call")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">{t("৩.", "3.")}</span>
                  {t("প্রোডাক্ট প্যাকেজিং ও ডেলিভারি শুরু হবে", "Product packaging and delivery will begin")}
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {orderNumber && (
                <Button onClick={() => openInvoiceInNewTab(orderNumber)} className="btn-primary">
                  <Printer className="w-4 h-4 mr-2" />
                  {t("ইনভয়েস প্রিন্ট করুন", "Print Invoice")}
                </Button>
              )}
              <Button asChild variant="outline">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  {t("হোমে ফিরে যান", "Back to Home")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/shop">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {t("আরও শপিং করুন", "Continue Shopping")}
                </Link>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {t("কোন প্রশ্ন থাকলে যোগাযোগ করুন:", "For any questions, contact us:")}
              </p>
              <a
                href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 text-primary font-medium mt-2 hover:underline"
              >
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderSuccess;