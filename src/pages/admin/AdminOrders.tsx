import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewTab } from "@/utils/printInvoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Search, Eye, Loader2, FileText, Truck, Trash2, CheckSquare, ExternalLink } from "lucide-react";

const statusOptions = [
  { value: "pending", label: "পেন্ডিং", color: "bg-orange-100 text-orange-700" },
  { value: "confirmed", label: "কনফার্মড", color: "bg-blue-100 text-blue-700" },
  { value: "processing", label: "প্রসেসিং", color: "bg-purple-100 text-purple-700" },
  { value: "shipped", label: "শিপড", color: "bg-indigo-100 text-indigo-700" },
  { value: "delivered", label: "ডেলিভার্ড", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "ক্যান্সেলড", color: "bg-red-100 text-red-700" },
];

const paymentStatusOptions = [
  { value: "pending", label: "পেন্ডিং", color: "bg-yellow-100 text-yellow-700" },
  { value: "awaiting_verification", label: "ভেরিফাই অপেক্ষায়", color: "bg-orange-100 text-orange-700" },
  { value: "verified", label: "ভেরিফাইড", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "প্রত্যাখ্যাত", color: "bg-red-100 text-red-700" },
];

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [courierDialogOrder, setCourierDialogOrder] = useState<any>(null);
  const [courierFormData, setCourierFormData] = useState({
    courier_name: "",
    tracking_number: "",
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: orders, isLoading, error: ordersError } = useQuery({
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

  const { data: courierServices } = useQuery({
    queryKey: ["courier-services-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courier_services")
        .select("*")
        .eq("is_active", true)
        .order("name");
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

  const handleOpenInvoice = (order: any) => {
    openInvoiceInNewTab(order.order_number);
  };

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

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, payment_status }: { id: string; payment_status: string }) => {
      // If payment is verified, also set order status to confirmed
      const updateData: { payment_status: string; order_status?: string } = { payment_status };
      if (payment_status === "verified") {
        updateData.order_status = "confirmed";
      }
      
      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      if (variables.payment_status === "verified") {
        toast.success("পেমেন্ট ভেরিফাইড এবং অর্ডার কনফার্মড হয়েছে");
      } else {
        toast.success("পেমেন্ট স্ট্যাটাস আপডেট হয়েছে");
      }
    },
    onError: () => {
      toast.error("পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
    },
  });

  const assignCourierMutation = useMutation({
    mutationFn: async ({ id, courier_name, tracking_number }: { id: string; courier_name: string; tracking_number: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ 
          courier_name, 
          tracking_number,
          order_status: "shipped" 
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("কুরিয়ার অ্যাসাইন করা হয়েছে");
      setCourierDialogOrder(null);
      setCourierFormData({ courier_name: "", tracking_number: "" });
    },
    onError: () => {
      toast.error("কুরিয়ার অ্যাসাইন করতে সমস্যা হয়েছে");
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // First delete order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);
      if (itemsError) throw itemsError;
      
      // Then delete the order
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("অর্ডার ডিলিট করা হয়েছে");
    },
    onError: () => {
      toast.error("অর্ডার ডিলিট করতে সমস্যা হয়েছে");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (orderIds: string[]) => {
      // Delete order items first
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .in("order_id", orderIds);
      if (itemsError) throw itemsError;
      
      // Then delete orders
      const { error } = await supabase
        .from("orders")
        .delete()
        .in("id", orderIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrders([]);
      toast.success(`${selectedOrders.length}টি অর্ডার ডিলিট করা হয়েছে`);
    },
    onError: () => {
      toast.error("অর্ডার ডিলিট করতে সমস্যা হয়েছে");
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ orderIds, status }: { orderIds: string[]; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: status })
        .in("id", orderIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrders([]);
      setBulkActionOpen(false);
      setBulkStatus("");
      toast.success(`${selectedOrders.length}টি অর্ডারের স্ট্যাটাস আপডেট হয়েছে`);
    },
    onError: () => {
      toast.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
    },
  });

  const handleOpenCourierDialog = (order: any) => {
    setCourierDialogOrder(order);
    setCourierFormData({
      courier_name: order.courier_name || "",
      tracking_number: order.tracking_number || "",
    });
  };

  const handleAssignCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierDialogOrder) return;
    assignCourierMutation.mutate({
      id: courierDialogOrder.id,
      courier_name: courierFormData.courier_name,
      tracking_number: courierFormData.tracking_number,
    });
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (filteredOrders && selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders?.map((o) => o.id) || []);
    }
  };

  const handleBulkStatusUpdate = () => {
    if (!bulkStatus || selectedOrders.length === 0) return;
    bulkStatusMutation.mutate({ orderIds: selectedOrders, status: bulkStatus });
  };

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

  const getPaymentStatusColor = (status: string) => {
    return paymentStatusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700";
  };

  const getPaymentStatusLabel = (status: string) => {
    return paymentStatusOptions.find((s) => s.value === status)?.label || status;
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

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20"
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span className="font-medium">{selectedOrders.length}টি অর্ডার সিলেক্টেড</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* Bulk Status Update */}
            <Dialog open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
              <Button variant="outline" size="sm" onClick={() => setBulkActionOpen(true)}>
                স্ট্যাটাস পরিবর্তন
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>বাল্ক স্ট্যাটাস আপডেট</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedOrders.length}টি অর্ডারের স্ট্যাটাস পরিবর্তন হবে
                  </p>
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="নতুন স্ট্যাটাস সিলেক্ট করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setBulkActionOpen(false)}>
                      বাতিল
                    </Button>
                    <Button
                      onClick={handleBulkStatusUpdate}
                      disabled={!bulkStatus || bulkStatusMutation.isPending}
                    >
                      {bulkStatusMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      আপডেট করুন
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  ডিলিট
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>অর্ডার ডিলিট করুন?</AlertDialogTitle>
                  <AlertDialogDescription>
                    আপনি কি নিশ্চিত যে আপনি {selectedOrders.length}টি অর্ডার ডিলিট করতে চান?
                    এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => bulkDeleteMutation.mutate(selectedOrders)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {bulkDeleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    ডিলিট করুন
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="ghost" size="sm" onClick={() => setSelectedOrders([])}>
              বাতিল করুন
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {ordersError ? (
          <div className="p-8 text-center space-y-2">
            <p className="font-medium text-foreground">অর্ডার দেখা যাচ্ছে না</p>
            <p className="text-sm text-muted-foreground">
              আপনার অ্যাকাউন্টে অ্যাডমিন পারমিশন নেই অথবা লগইন সেশন ঠিক নেই।
            </p>
            <Button variant="outline" onClick={() => window.location.assign("/admin/login")}>
              আবার লগইন করুন
            </Button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={filteredOrders && filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>অর্ডার নম্বর</TableHead>
                <TableHead>গ্রাহক</TableHead>
                <TableHead>মোট</TableHead>
                <TableHead>পেমেন্ট</TableHead>
                <TableHead>পেমেন্ট স্ট্যাটাস</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((order) => (
                <TableRow key={order.id} className={selectedOrders.includes(order.id) ? "bg-primary/5" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => toggleSelectOrder(order.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">৳{Number(order.total).toLocaleString()}</TableCell>
                  <TableCell>
                    <div>
                      <span className="text-sm capitalize font-medium">{order.payment_method}</span>
                      {order.transaction_id && (
                        <p className="text-xs text-muted-foreground">TrxID: {order.transaction_id}</p>
                      )}
                      {order.sender_number && (
                        <p className="text-xs text-primary">সেন্ডার: {order.sender_number}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.payment_status || "pending"}
                      onValueChange={(value) =>
                        updatePaymentStatusMutation.mutate({ id: order.id, payment_status: value })
                      }
                    >
                      <SelectTrigger className={`w-36 h-8 text-xs ${getPaymentStatusColor(order.payment_status || "pending")}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {order.courier_name ? (
                      <div>
                        <p className="text-sm font-medium">{order.courier_name}</p>
                        {order.tracking_number && (
                          <p className="text-xs text-muted-foreground">{order.tracking_number}</p>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCourierDialog(order)}
                        className="h-7 text-xs"
                      >
                        <Truck className="w-3 h-3 mr-1" />
                        অ্যাসাইন করুন
                      </Button>
                    )}
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
                      <Button variant="ghost" size="icon" onClick={() => handleOpenInvoice(order)} title="ইনভয়েস">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="ডিলিট">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>অর্ডার ডিলিট করুন?</AlertDialogTitle>
                            <AlertDialogDescription>
                              আপনি কি নিশ্চিত যে আপনি অর্ডার #{order.order_number} ডিলিট করতে চান?
                              এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>বাতিল</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOrderMutation.mutate(order.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              ডিলিট করুন
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

              {/* Courier Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4" /> কুরিয়ার তথ্য
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCourierDialog(selectedOrder)}
                  >
                    {selectedOrder.courier_name ? "এডিট" : "অ্যাসাইন করুন"}
                  </Button>
                </div>
                {selectedOrder.courier_name ? (
                  <div className="space-y-1">
                    <p className="text-sm"><strong>কুরিয়ার:</strong> {selectedOrder.courier_name}</p>
                    {selectedOrder.tracking_number && (
                      <p className="text-sm"><strong>ট্র্যাকিং নম্বর:</strong> {selectedOrder.tracking_number}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">কুরিয়ার অ্যাসাইন করা হয়নি</p>
                )}
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
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">পেমেন্ট তথ্য</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                  {selectedOrder.transaction_id && (
                    <p className="text-sm mt-1">
                      <strong>Transaction ID:</strong> {selectedOrder.transaction_id}
                    </p>
                  )}
                  {selectedOrder.sender_number && (
                    <p className="text-sm mt-1">
                      <strong>সেন্ডার নম্বর:</strong> {selectedOrder.sender_number}
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">পেমেন্ট স্ট্যাটাস</p>
                    <Select
                      value={selectedOrder.payment_status || "pending"}
                      onValueChange={(value) =>
                        updatePaymentStatusMutation.mutate({ id: selectedOrder.id, payment_status: value })
                      }
                    >
                      <SelectTrigger className={`w-full ${getPaymentStatusColor(selectedOrder.payment_status || "pending")}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  handleOpenInvoice(selectedOrder);
                }}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  ইনভয়েস দেখুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Courier Assignment Dialog */}
      <Dialog open={!!courierDialogOrder} onOpenChange={(open) => !open && setCourierDialogOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              কুরিয়ার অ্যাসাইন করুন
            </DialogTitle>
          </DialogHeader>
          {courierDialogOrder && (
            <form onSubmit={handleAssignCourier} className="space-y-4 mt-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p><strong>অর্ডার:</strong> {courierDialogOrder.order_number}</p>
                <p><strong>গ্রাহক:</strong> {courierDialogOrder.customer_name}</p>
                <p><strong>ঠিকানা:</strong> {courierDialogOrder.shipping_address}, {courierDialogOrder.city}</p>
              </div>

              <div>
                <Label>কুরিয়ার সার্ভিস</Label>
                <Select
                  value={courierFormData.courier_name}
                  onValueChange={(value) => setCourierFormData((p) => ({ ...p, courier_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="কুরিয়ার সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {courierServices?.map((courier) => (
                      <SelectItem key={courier.id} value={courier.name}>
                        <div className="flex items-center gap-2">
                          <span>{courier.name}</span>
                          {courier.api_key && (
                            <span className="text-xs text-green-600">(API কানেক্টেড)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>ট্র্যাকিং নম্বর (ঐচ্ছিক)</Label>
                <Input
                  value={courierFormData.tracking_number}
                  onChange={(e) => setCourierFormData((p) => ({ ...p, tracking_number: e.target.value }))}
                  placeholder="কুরিয়ার থেকে পাওয়া ট্র্যাকিং নম্বর"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCourierDialogOrder(null)}>
                  বাতিল
                </Button>
                <Button 
                  type="submit" 
                  disabled={!courierFormData.courier_name || assignCourierMutation.isPending}
                  className="btn-primary"
                >
                  {assignCourierMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  অ্যাসাইন করুন
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminOrders;