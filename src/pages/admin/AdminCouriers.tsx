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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Key, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";

const AdminCouriers = () => {
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const tr = adminTranslations;

  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    inside_dhaka_charge: "60",
    outside_dhaka_charge: "120",
    free_delivery_min_order: "",
    api_key: "",
    api_secret: "",
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
        api_key: data.api_key || null,
        api_secret: data.api_secret || null,
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
      toast.success(editingCourier ? t(tr.couriers.courierUpdated) : t(tr.couriers.courierAdded));
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error(t(tr.couriers.error)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courier_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-couriers"] });
      toast.success(t(tr.couriers.courierDeleted));
    },
  });

  const resetForm = () => {
    setFormData({ 
      name: "", 
      type: "", 
      inside_dhaka_charge: "60", 
      outside_dhaka_charge: "120", 
      free_delivery_min_order: "", 
      api_key: "",
      api_secret: "",
      is_active: true 
    });
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
      api_key: courier.api_key || "",
      api_secret: courier.api_secret || "",
      is_active: courier.is_active,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t(tr.couriers.title)}</h1>
          <p className="text-muted-foreground">{couriers?.length || 0}{t(tr.couriers.couriersCount)}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-primary"><Plus className="w-4 h-4 mr-2" /> {t(tr.couriers.addCourier)}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCourier ? t(tr.couriers.editCourier) : t(tr.couriers.addCourier)}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4 mt-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">{t(tr.couriers.basicInfo)}</TabsTrigger>
                  <TabsTrigger value="api">{t(tr.couriers.apiSettings)}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t(tr.couriers.name)}</Label>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} 
                        placeholder="Pathao Courier"
                        required 
                      />
                    </div>
                    <div>
                      <Label>{t(tr.couriers.type)}</Label>
                      <Input 
                        value={formData.type} 
                        onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))} 
                        placeholder={t(tr.couriers.typePlaceholder)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t(tr.couriers.insideDhakaCharge)}</Label>
                      <Input 
                        type="number" 
                        value={formData.inside_dhaka_charge} 
                        onChange={(e) => setFormData((p) => ({ ...p, inside_dhaka_charge: e.target.value }))} 
                      />
                    </div>
                    <div>
                      <Label>{t(tr.couriers.outsideDhakaCharge)}</Label>
                      <Input 
                        type="number" 
                        value={formData.outside_dhaka_charge} 
                        onChange={(e) => setFormData((p) => ({ ...p, outside_dhaka_charge: e.target.value }))} 
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t(tr.couriers.freeDeliveryMin)}</Label>
                    <Input 
                      type="number" 
                      value={formData.free_delivery_min_order} 
                      onChange={(e) => setFormData((p) => ({ ...p, free_delivery_min_order: e.target.value }))} 
                      placeholder={t(tr.couriers.freeDeliveryExample)} 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={formData.is_active} 
                      onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} 
                    />
                    <Label>{t(tr.couriers.active)}</Label>
                  </div>
                </TabsContent>

                <TabsContent value="api" className="space-y-4 mt-4">
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-primary" />
                      <span className="font-medium">{t(tr.couriers.apiCredentials)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(tr.couriers.apiDescription)}
                    </p>
                  </div>
                  <div>
                    <Label>{t(tr.couriers.apiKey)}</Label>
                    <Input 
                      value={formData.api_key} 
                      onChange={(e) => setFormData((p) => ({ ...p, api_key: e.target.value }))} 
                      placeholder={t(tr.couriers.apiKeyPlaceholder)}
                      type="password"
                    />
                  </div>
                  <div>
                    <Label>{t(tr.couriers.apiSecret)}</Label>
                    <Input 
                      value={formData.api_secret} 
                      onChange={(e) => setFormData((p) => ({ ...p, api_secret: e.target.value }))} 
                      placeholder={t(tr.couriers.apiSecretPlaceholder)}
                      type="password"
                    />
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>{language === "bn" ? "নোট:" : "Note:"}</strong> {t(tr.couriers.apiNote)}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t(tr.couriers.cancel)}</Button>
                <Button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCourier ? t(tr.couriers.update) : t(tr.couriers.add)}
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
                <TableHead>{t(tr.couriers.courier)}</TableHead>
                <TableHead>{t(tr.couriers.insideDhaka)}</TableHead>
                <TableHead>{t(tr.couriers.outsideDhaka)}</TableHead>
                <TableHead>{t(tr.couriers.freeDelivery)}</TableHead>
                <TableHead>API</TableHead>
                <TableHead>{t(tr.couriers.status)}</TableHead>
                <TableHead className="text-right">{t(tr.common.actions)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couriers?.map((courier) => (
                <TableRow key={courier.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{courier.name}</p>
                      <p className="text-sm text-muted-foreground uppercase">{courier.type}</p>
                    </div>
                  </TableCell>
                  <TableCell>৳{courier.inside_dhaka_charge}</TableCell>
                  <TableCell>৳{courier.outside_dhaka_charge}</TableCell>
                  <TableCell>{courier.free_delivery_min_order ? `৳${courier.free_delivery_min_order}+` : "-"}</TableCell>
                  <TableCell>
                    {courier.api_key ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                        <Check className="w-3 h-3" /> {t(tr.couriers.apiConnected)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <X className="w-3 h-3" /> {t(tr.couriers.apiNotSet)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${courier.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {courier.is_active ? t(tr.couriers.active) : t(tr.couriers.inactive)}
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
