import { useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/components/admin/Invoice";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

const InvoicePrint = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderNumber = searchParams.get("order");
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Fetch site settings
  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings-print"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");
      if (error) throw error;
      const settingsMap: Record<string, string> = {};
      data?.forEach((s) => {
        settingsMap[s.key] = s.value || "";
      });
      return settingsMap;
    },
  });

  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["invoice-order", orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderNumber,
  });

  // Fetch order items
  const { data: orderItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["invoice-items", order?.id],
    queryFn: async () => {
      if (!order?.id) return [];
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);
      if (error) throw error;
      return data;
    },
    enabled: !!order?.id,
  });

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${orderNumber}`,
  });

  if (!orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No order number provided</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (orderLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      {/* Print Controls - Hidden when printing */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4 print:hidden">
        <div className="container mx-auto flex items-center justify-between">
          <Button onClick={() => navigate(-1)} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Order: <strong>{orderNumber}</strong>
            </span>
            <Button onClick={() => handlePrint()}>
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="container mx-auto py-8 print:py-0">
        <div className="max-w-[850px] mx-auto shadow-lg print:shadow-none">
          <Invoice
            ref={invoiceRef}
            order={order}
            orderItems={orderItems}
            siteName={siteSettings?.site_name || "Ameezuglow"}
            siteLogo={siteSettings?.site_logo}
            sitePhone={siteSettings?.contact_phone}
            siteEmail={siteSettings?.contact_email}
            siteAddress={siteSettings?.contact_address}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
