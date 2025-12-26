import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

const AdminPayments = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    type: "",
    account_number: "",
    instructions: "",
    instructions_bn: "",
    sort_order: "0",
    is_active: true,
  });

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ["admin-payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_methods").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = { ...data, sort_order: parseInt(data.sort_order) };
      if (editingMethod) {
        const { error } = await supabase.from("payment_methods").update(payload).eq("id", editingMethod.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("payment_methods").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-methods"] });
      toast.success(editingMethod ? "পেমেন্ট মেথড আপডেট হয়েছে" : "পেমেন্ট মেথড যুক্ত হয়েছে");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("কিছু ভুল হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_methods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-methods"] });
      toast.success("পেমেন্ট মেথড ডিলিট হয়েছে");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", name_bn: "", type: "", account_number: "", instructions: "", instructions_bn: "", sort_order: "0", is_active: true });
    setEditingMethod(null);
  };

  const handleEdit = (method: any) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      name_bn: method.name_bn,
      type: method.type,
      account_number: method.account_number || "",
      instructions: method.instructions || "",
      instructions_bn: method.instructions_bn || "",
      sort_order: method.sort_order?.toString() || "0",
      is_active: method.is_active,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">পেমেন্ট মেথড</h1>
          <p className="text-muted-foreground">{paymentMethods?.length || 0} টি পেমেন্ট মেথড</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-primary"><Plus className="w-4 h-4 mr-2" /> নতুন পেমেন্ট মেথড</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingMethod ? "পেমেন্ট মেথড এডিট" : "নতুন পেমেন্ট মেথড"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>নাম (English)</Label><Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required /></div>
                <div><Label>নাম (বাংলা)</Label><Input value={formData.name_bn} onChange={(e) => setFormData((p) => ({ ...p, name_bn: e.target.value }))} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>টাইপ</Label><Input value={formData.type} onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))} placeholder="cod, bkash, nagad..." required /></div>
                <div><Label>অ্যাকাউন্ট নম্বর</Label><Input value={formData.account_number} onChange={(e) => setFormData((p) => ({ ...p, account_number: e.target.value }))} /></div>
              </div>
              <div><Label>নির্দেশনা (English)</Label><Textarea value={formData.instructions} onChange={(e) => setFormData((p) => ({ ...p, instructions: e.target.value }))} rows={2} /></div>
              <div><Label>নির্দেশনা (বাংলা)</Label><Textarea value={formData.instructions_bn} onChange={(e) => setFormData((p) => ({ ...p, instructions_bn: e.target.value }))} rows={2} /></div>
              <div className="flex items-center gap-4">
                <div><Label>সর্ট অর্ডার</Label><Input type="number" value={formData.sort_order} onChange={(e) => setFormData((p) => ({ ...p, sort_order: e.target.value }))} className="w-24" /></div>
                <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} /><Label>অ্যাক্টিভ</Label></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
                <Button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingMethod ? "আপডেট" : "যুক্ত করুন"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>পেমেন্ট মেথড</TableHead>
                <TableHead>টাইপ</TableHead>
                <TableHead>অ্যাকাউন্ট নম্বর</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods?.map((method) => (
                <TableRow key={method.id}>
                  <TableCell><div><p className="font-medium">{method.name_bn}</p><p className="text-sm text-muted-foreground">{method.name}</p></div></TableCell>
                  <TableCell className="uppercase text-sm">{method.type}</TableCell>
                  <TableCell>{method.account_number || "-"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${method.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {method.is_active ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(method.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
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

export default AdminPayments;
