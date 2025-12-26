import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
  description_bn: string | null;
}

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    slug: "",
    price: "",
    sale_price: "",
    stock: "0",
    is_active: true,
    is_featured: false,
    category_id: "",
    description_bn: "",
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name_bn)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name,
        name_bn: data.name_bn,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
        price: parseFloat(data.price),
        sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
        stock: parseInt(data.stock),
        is_active: data.is_active,
        is_featured: data.is_featured,
        category_id: data.category_id || null,
        description_bn: data.description_bn || null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editingProduct ? "প্রোডাক্ট আপডেট হয়েছে" : "প্রোডাক্ট যুক্ত হয়েছে");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("কিছু ভুল হয়েছে");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("প্রোডাক্ট ডিলিট হয়েছে");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      name_bn: "",
      slug: "",
      price: "",
      sale_price: "",
      stock: "0",
      is_active: true,
      is_featured: false,
      category_id: "",
      description_bn: "",
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_bn: product.name_bn,
      slug: product.slug,
      price: product.price.toString(),
      sale_price: product.sale_price?.toString() || "",
      stock: product.stock.toString(),
      is_active: product.is_active,
      is_featured: product.is_featured,
      category_id: product.category_id || "",
      description_bn: product.description_bn || "",
    });
    setIsDialogOpen(true);
  };

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.name_bn.includes(search)
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">{products?.length || 0} টি প্রোডাক্ট</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> নতুন প্রোডাক্ট
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "প্রোডাক্ট এডিট করুন" : "নতুন প্রোডাক্ট যুক্ত করুন"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(formData);
              }}
              className="space-y-4 mt-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>নাম (English)</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>নাম (বাংলা)</Label>
                  <Input
                    value={formData.name_bn}
                    onChange={(e) => setFormData((p) => ({ ...p, name_bn: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>স্লাগ</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="auto-generated if empty"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>মূল্য (৳)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>সেল মূল্য (৳)</Label>
                  <Input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData((p) => ({ ...p, sale_price: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>স্টক</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData((p) => ({ ...p, stock: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>ক্যাটাগরি</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData((p) => ({ ...p, category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name_bn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>বিবরণ (বাংলা)</Label>
                <Textarea
                  value={formData.description_bn}
                  onChange={(e) => setFormData((p) => ({ ...p, description_bn: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))}
                  />
                  <Label>অ্যাক্টিভ</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(v) => setFormData((p) => ({ ...p, is_featured: v }))}
                  />
                  <Label>ফিচার্ড</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingProduct ? "আপডেট করুন" : "যুক্ত করুন"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="প্রোডাক্ট খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
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
                <TableHead>প্রোডাক্ট</TableHead>
                <TableHead>মূল্য</TableHead>
                <TableHead>স্টক</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{product.name_bn}</p>
                      <p className="text-sm text-muted-foreground">{product.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.sale_price ? (
                      <div>
                        <span className="font-medium text-primary">৳{product.sale_price}</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ৳{product.price}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">৳{product.price}</span>
                    )}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.is_active ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(product.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
