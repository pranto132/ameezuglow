import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Phone, Mail, MapPin, ShoppingBag, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string;
  city: string;
  area: string | null;
  total: number;
  order_status: string | null;
  payment_status: string | null;
  created_at: string | null;
}

interface Customer {
  phone: string;
  name: string;
  email: string | null;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  orders: Order[];
}

const AdminCustomers = () => {
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const tr = adminTranslations;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  // Group orders by customer phone number
  const customers: Customer[] = orders
    ? Object.values(
        orders.reduce((acc: Record<string, Customer>, order) => {
          const phone = order.customer_phone;
          if (!acc[phone]) {
            acc[phone] = {
              phone,
              name: order.customer_name,
              email: order.customer_email,
              address: order.shipping_address,
              city: order.city,
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: null,
              orders: [],
            };
          }
          acc[phone].totalOrders += 1;
          acc[phone].totalSpent += Number(order.total);
          acc[phone].orders.push(order);
          // Update last order date
          if (!acc[phone].lastOrderDate || (order.created_at && order.created_at > acc[phone].lastOrderDate)) {
            acc[phone].lastOrderDate = order.created_at;
            // Update to latest info
            acc[phone].name = order.customer_name;
            acc[phone].email = order.customer_email;
            acc[phone].address = order.shipping_address;
            acc[phone].city = order.city;
          }
          return acc;
        }, {})
      )
    : [];

  // Filter customers
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort by total spent (descending)
  filteredCustomers.sort((a, b) => b.totalSpent - a.totalSpent);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: t(tr.orderStatus.pending), className: "bg-yellow-500/10 text-yellow-500" },
      confirmed: { label: t(tr.orderStatus.confirmed), className: "bg-blue-500/10 text-blue-500" },
      processing: { label: t(tr.orderStatus.processing), className: "bg-purple-500/10 text-purple-500" },
      shipped: { label: t(tr.orderStatus.shipped), className: "bg-indigo-500/10 text-indigo-500" },
      delivered: { label: t(tr.orderStatus.delivered), className: "bg-green-500/10 text-green-500" },
      cancelled: { label: t(tr.orderStatus.cancelled), className: "bg-red-500/10 text-red-500" },
    };
    const config = statusConfig[status || "pending"] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">{t(tr.customers.title)}</h2>
          <p className="text-muted-foreground">{t(tr.customers.subtitle)}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(tr.customers.totalCustomers)}</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <ShoppingBag className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(tr.customers.totalOrders)}</p>
                <p className="text-2xl font-bold">{orders?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Users className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(tr.customers.repeatCustomers)}</p>
                <p className="text-2xl font-bold">
                  {customers.filter((c) => c.totalOrders > 1).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t(tr.customers.searchPlaceholder)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t(tr.customers.customerList)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(tr.customers.name)}</TableHead>
                <TableHead>{t(tr.customers.phone)}</TableHead>
                <TableHead>{t(tr.customers.email)}</TableHead>
                <TableHead>{t(tr.customers.city)}</TableHead>
                <TableHead className="text-center">{t(tr.customers.orders)}</TableHead>
                <TableHead className="text-right">{t(tr.customers.totalSpent)}</TableHead>
                <TableHead>{t(tr.customers.lastOrder)}</TableHead>
                <TableHead className="text-right">{t(tr.common.actions)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.phone}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {customer.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.email ? (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="max-w-[150px] truncate">{customer.email}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {customer.city}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{customer.totalOrders}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ৳{customer.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {customer.lastOrderDate
                      ? format(new Date(customer.lastOrderDate), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(customer)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t(tr.customers.noCustomers)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t(tr.customers.customerDetails)}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t(tr.customers.name)}</p>
                      <p className="font-medium">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t(tr.customers.phone)}</p>
                      <p className="font-medium">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t(tr.customers.email)}</p>
                      <p className="font-medium">{selectedCustomer.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t(tr.customers.city)}</p>
                      <p className="font-medium">{selectedCustomer.city}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">{t(tr.customers.address)}</p>
                      <p className="font-medium">{selectedCustomer.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {selectedCustomer.totalOrders}
                    </p>
                    <p className="text-sm text-muted-foreground">{t(tr.customers.totalOrders)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-green-500">
                      ৳{selectedCustomer.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{t(tr.customers.totalSpent)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-amber-500">
                      ৳{Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{t(tr.customers.averageOrder)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t(tr.customers.orderHistory)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t(tr.customers.orderNumber)}</TableHead>
                        <TableHead>{t(tr.customers.date)}</TableHead>
                        <TableHead>{t(tr.customers.status)}</TableHead>
                        <TableHead>{t(tr.customers.payment)}</TableHead>
                        <TableHead className="text-right">{t(tr.customers.total)}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">{order.order_number}</TableCell>
                          <TableCell>
                            {order.created_at
                              ? format(new Date(order.created_at), "dd/MM/yyyy HH:mm")
                              : "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                order.payment_status === "paid"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }
                            >
                              {order.payment_status === "paid" ? t(tr.customers.paid) : t(tr.customers.pending)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ৳{Number(order.total).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
