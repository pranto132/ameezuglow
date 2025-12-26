import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Eye, Loader2, FileText, Printer } from "lucide-react";
import { Invoice } from "@/components/admin/Invoice";
import { useReactToPrint } from "react-to-print";

const statusOptions = [
  { value: "pending", label: "পেন্ডিং", color: "bg-orange-100 text-orange-700" },
  { value: "confirmed", label: "কনফার্মড", color: "bg-blue-100 text-blue-700" },
  { value: "processing", label: "প্রসেসিং", color: "bg-purple-100 text-purple-700" },
  { value: "shipped", label: "শিপড", color: "bg-indigo-100 text-indigo-700" },
  { value: "delivered", label: "ডেলিভার্ড", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "ক্যান্সেলড", color: "bg-red-100 text-red-700" },
];

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["order-items", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", selectedOrder.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrder,
  });

  const { data: invoiceItems } = useQuery({
    queryKey: ["invoice-items", invoiceOrder?.id],
    queryFn: async () => {
      if (!invoiceOrder) return [];
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", invoiceOrder.id);
      if (error) throw error;
      return data;
    },
    enabled: !!invoiceOrder,
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings-invoice"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      if (error) throw error;
      const settings: Record<string, string> = {};
      data.forEach((s: any) => {
        settings[s.key] = s.value;
      });
      return settings;
    },
  });

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${invoiceOrder?.order_number || ""}`,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("অর্ডার স্ট্যাটাস আপডেট হয়েছে");
    },
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_phone.includes(search);
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.label || status;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">অর্ডার ম্যানেজমেন্ট</h1>
        <p className="text-muted-foreground">{orders?.length || 0} টি অর্ডার</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="অর্ডার নম্বর, নাম বা ফোন দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব অর্ডার</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>অর্ডার নম্বর</TableHead>
                <TableHead>গ্রাহক</TableHead>
                <TableHead>মোট</TableHead>
                <TableHead>পেমেন্ট</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">৳{Number(order.total).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{order.payment_method}</span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.order_status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ id: order.id, status: value })
                      }
                    >
                      <SelectTrigger className={`w-32 h-8 text-xs ${getStatusColor(order.order_status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("bn-BD")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)} title="বিস্তারিত">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setInvoiceOrder(order)} title="ইনভয়েস">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>অর্ডার বিবরণ - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">গ্রাহক তথ্য</h3>
                  <p className="text-sm"><strong>নাম:</strong> {selectedOrder.customer_name}</p>
                  <p className="text-sm"><strong>ফোন:</strong> {selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && (
                    <p className="text-sm"><strong>ইমেইল:</strong> {selectedOrder.customer_email}</p>
                  )}
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">ডেলিভারি ঠিকানা</h3>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                  <p className="text-sm">{selectedOrder.area}, {selectedOrder.city}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">অর্ডার আইটেম</h3>
                <div className="space-y-2">
                  {orderItems?.map((item: any) => (
                    <div key={item.id} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                      </div>
                      <p className="font-bold">৳{(Number(item.price) * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>সাবটোটাল</span>
                  <span>৳{Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ডেলিভারি</span>
                  <span>৳{Number(selectedOrder.shipping_cost).toLocaleString()}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>ডিসকাউন্ট</span>
                    <span>-৳{Number(selectedOrder.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>মোট</span>
                  <span className="text-primary">৳{Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">পেমেন্ট মেথড</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                  {selectedOrder.transaction_id && (
                    <p className="text-sm">TrxID: {selectedOrder.transaction_id}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">অর্ডার স্ট্যাটাস</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.order_status)}`}>
                    {getStatusLabel(selectedOrder.order_status)}
                  </span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-1">গ্রাহকের নোট</h3>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Print Invoice Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => {
                  setSelectedOrder(null);
                  setInvoiceOrder(selectedOrder);
                }}>
                  <FileText className="w-4 h-4 mr-2" />
                  ইনভয়েস দেখুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={!!invoiceOrder} onOpenChange={(open) => !open && setInvoiceOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>ইনভয়েস - {invoiceOrder?.order_number}</span>
              <Button onClick={() => handlePrint()} className="mr-8">
                <Printer className="w-4 h-4 mr-2" />
                প্রিন্ট করুন
              </Button>
            </DialogTitle>
          </DialogHeader>
          {invoiceOrder && invoiceItems && (
            <div className="p-6 pt-4">
              <Invoice
                ref={invoiceRef}
                order={invoiceOrder}
                orderItems={invoiceItems}
                siteName={siteSettings?.site_name || "Ameezuglow"}
                sitePhone={siteSettings?.contact_phone}
                siteEmail={siteSettings?.contact_email}
                siteAddress={siteSettings?.address}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
