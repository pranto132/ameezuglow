import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewTab, openMultipleInvoicesInNewTab } from "@/utils/printInvoice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Search, Eye, Loader2, FileText, Truck, Trash2, CheckSquare, ExternalLink, Printer, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const tr = adminTranslations;
  
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
  const [fraudCheckPhone, setFraudCheckPhone] = useState<string | null>(null);
  const [fraudData, setFraudData] = useState<any>(null);
  const [fraudLoading, setFraudLoading] = useState(false);
  const [fraudError, setFraudError] = useState<string | null>(null);

  const statusOptions = [
    { value: "pending", label: t(tr.orderStatus.pending), color: "bg-orange-100 text-orange-700" },
    { value: "confirmed", label: t(tr.orderStatus.confirmed), color: "bg-blue-100 text-blue-700" },
    { value: "processing", label: t(tr.orderStatus.processing), color: "bg-purple-100 text-purple-700" },
    { value: "shipped", label: t(tr.orderStatus.shipped), color: "bg-indigo-100 text-indigo-700" },
    { value: "delivered", label: t(tr.orderStatus.delivered), color: "bg-green-100 text-green-700" },
    { value: "cancelled", label: t(tr.orderStatus.cancelled), color: "bg-red-100 text-red-700" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: t(tr.paymentStatus.pending), color: "bg-yellow-100 text-yellow-700" },
    { value: "awaiting_verification", label: t(tr.paymentStatus.awaiting_verification), color: "bg-orange-100 text-orange-700" },
    { value: "verified", label: t(tr.paymentStatus.verified), color: "bg-green-100 text-green-700" },
    { value: "rejected", label: t(tr.paymentStatus.rejected), color: "bg-red-100 text-red-700" },
  ];

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
      toast.success(t(tr.toasts.orderUpdated));
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
        toast.success(t(tr.toasts.paymentVerified));
      } else {
        toast.success(t(tr.toasts.paymentUpdated));
      }
    },
    onError: () => {
      toast.error(t(tr.toasts.somethingWrong));
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
      toast.success(t(tr.toasts.courierAssigned));
      setCourierDialogOrder(null);
      setCourierFormData({ courier_name: "", tracking_number: "" });
    },
    onError: () => {
      toast.error(t(tr.toasts.somethingWrong));
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
      toast.success(t(tr.toasts.orderDeleted));
    },
    onError: () => {
      toast.error(t(tr.toasts.somethingWrong));
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
      toast.success(t(tr.toasts.orderDeleted));
    },
    onError: () => {
      toast.error(t(tr.toasts.somethingWrong));
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
      toast.success(t(tr.toasts.orderUpdated));
    },
    onError: () => {
      toast.error(t(tr.toasts.somethingWrong));
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

  const handleFraudCheck = async (phone: string) => {
    setFraudCheckPhone(phone);
    setFraudData(null);
    setFraudError(null);
    setFraudLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const token = currentSession?.access_token;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fraud-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ phone_number: phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFraudError(data?.error || "Failed to check");
      } else {
        setFraudData(data);
      }
    } catch (err: any) {
      setFraudError(err.message || "Network error");
    } finally {
      setFraudLoading(false);
    }
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
        <h1 className="text-2xl font-display font-bold text-foreground">{t(tr.orders.title)}</h1>
        <p className="text-muted-foreground">{orders?.length || 0}{t(tr.orders.ordersCount)}</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t(tr.orders.searchPlaceholder)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t(tr.orders.statusFilter)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t(tr.orders.allOrders)}</SelectItem>
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
            <span className="font-medium">{selectedOrders.length}{t(tr.orders.ordersSelected)}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* Bulk Status Update */}
            <Dialog open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
              <Button variant="outline" size="sm" onClick={() => setBulkActionOpen(true)}>
                {t(tr.orders.changeStatus)}
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t(tr.orders.bulkStatusUpdate)}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedOrders.length}{t(tr.orders.ordersSelected)}
                  </p>
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder={t(tr.orders.selectNewStatus)} />
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
                      {t(tr.orders.cancel)}
                    </Button>
                    <Button
                      onClick={handleBulkStatusUpdate}
                      disabled={!bulkStatus || bulkStatusMutation.isPending}
                    >
                      {bulkStatusMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {t(tr.orders.update)}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Print Invoice */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => openMultipleInvoicesInNewTab(selectedOrders)}
            >
              <Printer className="w-4 h-4 mr-1" />
              {t(tr.orders.printInvoice)}
            </Button>

            {/* Bulk Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t(tr.orders.delete)}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t(tr.orders.deleteOrder)}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t(tr.orders.deleteConfirm)} {t(tr.orders.cannotUndo)}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t(tr.orders.cancel)}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => bulkDeleteMutation.mutate(selectedOrders)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {bulkDeleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t(tr.orders.delete)}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="ghost" size="sm" onClick={() => setSelectedOrders([])}>
              {t(tr.orders.cancel)}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {ordersError ? (
          <div className="p-8 text-center space-y-2">
            <p className="font-medium text-foreground">{t(tr.orders.noOrdersFound)}</p>
            <p className="text-sm text-muted-foreground">
              {t(tr.accessDenied.message)}
            </p>
            <Button variant="outline" onClick={() => window.location.assign("/admin/login")}>
              {t(tr.accessDenied.loginAgain)}
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
                <TableHead>{t(tr.orders.orderNumber)}</TableHead>
                <TableHead>{t(tr.orders.customer)}</TableHead>
                <TableHead>{t(tr.orders.total)}</TableHead>
                <TableHead>{t(tr.orders.payment)}</TableHead>
                <TableHead>{t(tr.paymentStatus.pending).replace("পেন্ডিং", t(tr.orders.payment))} {t(tr.orders.status)}</TableHead>
                <TableHead>{t(tr.orders.status)}</TableHead>
                <TableHead>{t(tr.customers.date)}</TableHead>
                <TableHead className="text-right">{t(tr.orders.actions)}</TableHead>
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
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleFraudCheck(order.customer_phone)}
                          title={language === "bn" ? "ফ্রড চেক" : "Fraud Check"}
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        </Button>
                      </div>
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
                        {t(tr.orders.assign)}
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
                    {new Date(order.created_at).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)} title={t(tr.common.view)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenInvoice(order)} title={t(tr.orders.printInvoice)}>
                        <FileText className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title={t(tr.orders.delete)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t(tr.orders.deleteOrder)}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t(tr.orders.deleteConfirm)} {t(tr.orders.cannotUndo)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t(tr.orders.cancel)}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOrderMutation.mutate(order.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t(tr.orders.delete)}
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
            <DialogTitle>{t(tr.orders.orderDetails)} - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{t(tr.orders.customer)}</h3>
                  <p className="text-sm"><strong>{t(tr.customers.name)}:</strong> {selectedOrder.customer_name}</p>
                  <p className="text-sm"><strong>{t(tr.customers.phone)}:</strong> {selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && (
                    <p className="text-sm"><strong>{t(tr.customers.email)}:</strong> {selectedOrder.customer_email}</p>
                  )}
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{t(tr.orders.shippingAddress)}</h3>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                  <p className="text-sm">{selectedOrder.area}, {selectedOrder.city}</p>
                </div>
              </div>

              {/* Courier Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4" /> {t(tr.orders.courier)}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCourierDialog(selectedOrder)}
                  >
                    {selectedOrder.courier_name ? t(tr.common.edit) : t(tr.orders.assign)}
                  </Button>
                </div>
                {selectedOrder.courier_name ? (
                  <div className="space-y-1">
                    <p className="text-sm"><strong>{t(tr.orders.courier)}:</strong> {selectedOrder.courier_name}</p>
                    {selectedOrder.tracking_number && (
                      <p className="text-sm"><strong>{t(tr.orders.trackingNumber)}:</strong> {selectedOrder.tracking_number}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t(tr.orders.selectCourier)}</p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">{t(tr.orders.orderedItems)}</h3>
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
                  <span>{t(tr.orders.subtotal)}</span>
                  <span>৳{Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t(tr.orders.shipping)}</span>
                  <span>৳{Number(selectedOrder.shipping_cost).toLocaleString()}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t(tr.orders.discount)}</span>
                    <span>-৳{Number(selectedOrder.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>{t(tr.orders.grandTotal)}</span>
                  <span className="text-primary">৳{Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">{t(tr.orders.paymentMethod)}</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                  {selectedOrder.transaction_id && (
                    <p className="text-sm mt-1">
                      <strong>{t(tr.orders.transactionId)}:</strong> {selectedOrder.transaction_id}
                    </p>
                  )}
                  {selectedOrder.sender_number && (
                    <p className="text-sm mt-1">
                      <strong>{t(tr.orders.senderNumber)}:</strong> {selectedOrder.sender_number}
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">{t(tr.orders.payment)} {t(tr.orders.status)}</p>
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
                  <p className="text-sm text-muted-foreground">{t(tr.orders.status)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.order_status)}`}>
                    {getStatusLabel(selectedOrder.order_status)}
                  </span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-1">{t(tr.orders.notes)}</h3>
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
                  {t(tr.orders.printInvoice)}
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
              {t(tr.orders.assignCourier)}
            </DialogTitle>
          </DialogHeader>
          {courierDialogOrder && (
            <form onSubmit={handleAssignCourier} className="space-y-4 mt-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p><strong>{t(tr.orders.orderNumber)}:</strong> {courierDialogOrder.order_number}</p>
                <p><strong>{t(tr.orders.customer)}:</strong> {courierDialogOrder.customer_name}</p>
                <p><strong>{t(tr.orders.shippingAddress)}:</strong> {courierDialogOrder.shipping_address}, {courierDialogOrder.city}</p>
              </div>

              <div>
                <Label>{t(tr.orders.selectCourier)}</Label>
                <Select
                  value={courierFormData.courier_name}
                  onValueChange={(value) => setCourierFormData((p) => ({ ...p, courier_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t(tr.orders.selectCourier)} />
                  </SelectTrigger>
                  <SelectContent>
                    {courierServices?.map((courier) => (
                      <SelectItem key={courier.id} value={courier.name}>
                        <div className="flex items-center gap-2">
                          <span>{courier.name}</span>
                          {courier.api_key && (
                            <span className="text-xs text-green-600">({t(tr.couriers.apiConnected)})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t(tr.orders.trackingNumber)}</Label>
                <Input
                  value={courierFormData.tracking_number}
                  onChange={(e) => setCourierFormData((p) => ({ ...p, tracking_number: e.target.value }))}
                  placeholder={t(tr.orders.trackingNumber)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCourierDialogOrder(null)}>
                  {t(tr.orders.cancel)}
                </Button>
                <Button 
                  type="submit" 
                  disabled={!courierFormData.courier_name || assignCourierMutation.isPending}
                  className="btn-primary"
                >
                  {assignCourierMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t(tr.orders.assign)}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* Fraud Check Dialog */}
      <Dialog open={!!fraudCheckPhone} onOpenChange={(open) => { if (!open) { setFraudCheckPhone(null); setFraudData(null); setFraudError(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              {language === "bn" ? "ফ্রড চেক" : "Fraud Check"} - {fraudCheckPhone}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {fraudLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">{language === "bn" ? "চেক করা হচ্ছে..." : "Checking..."}</span>
              </div>
            )}
            {fraudError && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
                {fraudError}
              </div>
            )}
            {fraudData && !fraudLoading && (
              <div className="space-y-4">
                {/* If FraudBD returns courier-wise data */}
                {fraudData.data && typeof fraudData.data === "object" ? (
                  Object.entries(fraudData.data).map(([courier, stats]: [string, any]) => (
                    <div key={courier} className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold capitalize mb-3">{courier}</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-background rounded-md">
                          <p className="text-lg font-bold">{stats?.total_order ?? stats?.total ?? "-"}</p>
                          <p className="text-xs text-muted-foreground">{language === "bn" ? "মোট অর্ডার" : "Total"}</p>
                        </div>
                        <div className="text-center p-2 bg-background rounded-md">
                          <p className="text-lg font-bold text-green-600">{stats?.success ?? stats?.delivered ?? "-"}</p>
                          <p className="text-xs text-muted-foreground">{language === "bn" ? "সফল" : "Success"}</p>
                        </div>
                        <div className="text-center p-2 bg-background rounded-md">
                          <p className="text-lg font-bold text-destructive">{stats?.cancel ?? stats?.cancelled ?? "-"}</p>
                          <p className="text-xs text-muted-foreground">{language === "bn" ? "বাতিল" : "Cancel"}</p>
                        </div>
                      </div>
                      {(stats?.success_ratio || stats?.success_rate) && (
                        <div className="mt-2 text-center">
                          <Badge variant={Number(stats?.success_ratio || stats?.success_rate) > 50 ? "default" : "destructive"}>
                            {language === "bn" ? "সফলতার হার" : "Success Rate"}: {stats?.success_ratio || stats?.success_rate}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <pre className="text-xs text-left whitespace-pre-wrap">{JSON.stringify(fraudData, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminOrders;