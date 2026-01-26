import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/components/admin/Invoice";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

const InvoicePrint = () => {
  const [searchParams] = useSearchParams();
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
  const { data: order, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ["invoice-order", orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .maybeSingle();
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

  // Loading state
  if (orderLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (!orderNumber || !order || orderError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {!orderNumber ? "No order number provided" : "Order not found"}
          </p>
          <Button onClick={() => window.close()} variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Print Bar - Hidden when printing */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white p-3 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-sm">
            Invoice: <strong>{orderNumber}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handlePrint()} 
              size="sm"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button 
              onClick={() => handlePrint()} 
              size="sm"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Save as PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content - Add top padding for fixed bar */}
      <div className="pt-16 print:pt-0">
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
  );
};

export default InvoicePrint;
