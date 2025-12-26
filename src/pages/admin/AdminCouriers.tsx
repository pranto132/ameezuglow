import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

const AdminCouriers = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    inside_dhaka_charge: "60",
    outside_dhaka_charge: "120",
    free_delivery_min_order: "",
    is_active: true,
  });

  const { data: couriers, isLoading } = useQuery({
    queryKey: ["admin-couriers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courier_services").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name,
        type: data.type,
        inside_dhaka_charge: parseFloat(data.inside_dhaka_charge),
        outside_dhaka_charge: parseFloat(data.outside_dhaka_charge),
        free_delivery_min_order: data.free_delivery_min_order ? parseFloat(data.free_delivery_min_order) : null,
        is_active: data.is_active,
      };
      if (editingCourier) {
        const { error } = await supabase.from("courier_services").update(payload).eq("id", editingCourier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courier_services").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-couriers"] });
      toast.success(editingCourier ? "কুরিয়ার আপডেট হয়েছে" : "কুরিয়ার যুক্ত হয়েছে");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("কিছু ভুল হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courier_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-couriers"] });
      toast.success("কুরিয়ার ডিলিট হয়েছে");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", type: "", inside_dhaka_charge: "60", outside_dhaka_charge: "120", free_delivery_min_order: "", is_active: true });
    setEditingCourier(null);
  };

  const handleEdit = (courier: any) => {
    setEditingCourier(courier);
    setFormData({
      name: courier.name,
      type: courier.type,
      inside_dhaka_charge: courier.inside_dhaka_charge?.toString() || "60",
      outside_dhaka_charge: courier.outside_dhaka_charge?.toString() || "120",
      free_delivery_min_order: courier.free_delivery_min_order?.toString() || "",
      is_active: courier.is_active,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">কুরিয়ার সার্ভিস</h1>
          <p className="text-muted-foreground">{couriers?.length || 0} টি কুরিয়ার</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-primary"><Plus className="w-4 h-4 mr-2" /> নতুন কুরিয়ার</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCourier ? "কুরিয়ার এডিট" : "নতুন কুরিয়ার"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>নাম</Label><Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required /></div>
                <div><Label>টাইপ</Label><Input value={formData.type} onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))} placeholder="pathao, redx..." required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>ঢাকার ভেতরে চার্জ (৳)</Label><Input type="number" value={formData.inside_dhaka_charge} onChange={(e) => setFormData((p) => ({ ...p, inside_dhaka_charge: e.target.value }))} /></div>
                <div><Label>ঢাকার বাইরে চার্জ (৳)</Label><Input type="number" value={formData.outside_dhaka_charge} onChange={(e) => setFormData((p) => ({ ...p, outside_dhaka_charge: e.target.value }))} /></div>
              </div>
              <div><Label>ফ্রি ডেলিভারি মিনিমাম (৳)</Label><Input type="number" value={formData.free_delivery_min_order} onChange={(e) => setFormData((p) => ({ ...p, free_delivery_min_order: e.target.value }))} placeholder="যেমন: 2000" /></div>
              <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} /><Label>অ্যাক্টিভ</Label></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
                <Button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCourier ? "আপডেট" : "যুক্ত করুন"}
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
                <TableHead>কুরিয়ার</TableHead>
                <TableHead>ঢাকার ভেতরে</TableHead>
                <TableHead>ঢাকার বাইরে</TableHead>
                <TableHead>ফ্রি ডেলিভারি</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couriers?.map((courier) => (
                <TableRow key={courier.id}>
                  <TableCell><div><p className="font-medium">{courier.name}</p><p className="text-sm text-muted-foreground uppercase">{courier.type}</p></div></TableCell>
                  <TableCell>৳{courier.inside_dhaka_charge}</TableCell>
                  <TableCell>৳{courier.outside_dhaka_charge}</TableCell>
                  <TableCell>{courier.free_delivery_min_order ? `৳${courier.free_delivery_min_order}+` : "-"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${courier.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {courier.is_active ? "অ্যাক্টিভ" : "ইনঅ্যাক্টিভ"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(courier)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(courier.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
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

export default AdminCouriers;
