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
import ImageUpload from "@/components/admin/ImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_bn: "",
    slug: "",
    sort_order: "0",
    is_active: true,
    image_url: "",
  });

  const { data: categories, isLoading } = useQuery({
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
        sort_order: parseInt(data.sort_order),
        is_active: data.is_active,
        image_url: data.image_url || null,
      };
      if (editingCategory) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(t(adminTranslations.toasts.categorySaved));
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error(t(adminTranslations.toasts.somethingWrong)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(t(adminTranslations.toasts.categoryDeleted));
    },
  });

  const resetForm = () => {
    setFormData({ name: "", name_bn: "", slug: "", sort_order: "0", is_active: true, image_url: "" });
    setEditingCategory(null);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      name_bn: category.name_bn,
      slug: category.slug,
      sort_order: category.sort_order?.toString() || "0",
      is_active: category.is_active,
      image_url: category.image_url || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t(adminTranslations.categories.title)}</h1>
          <p className="text-muted-foreground">{categories?.length || 0}{t(adminTranslations.categories.categoriesCount)}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-primary"><Plus className="w-4 h-4 mr-2" /> {t(adminTranslations.categories.addCategory)}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? t(adminTranslations.categories.editCategory) : t(adminTranslations.categories.addCategory)}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>{t(adminTranslations.categories.nameEn)}</Label><Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required /></div>
                <div><Label>{t(adminTranslations.categories.nameBn)}</Label><Input value={formData.name_bn} onChange={(e) => setFormData((p) => ({ ...p, name_bn: e.target.value }))} required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>{t(adminTranslations.categories.slug)}</Label><Input value={formData.slug} onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))} /></div>
                <div><Label>{t(adminTranslations.categories.sortOrder)}</Label><Input type="number" value={formData.sort_order} onChange={(e) => setFormData((p) => ({ ...p, sort_order: e.target.value }))} /></div>
              </div>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData((p) => ({ ...p, image_url: url }))}
                label={t(adminTranslations.categories.image)}
                folder="categories"
                aspectRatio="1/1"
              />
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData((p) => ({ ...p, is_active: v }))} />
                <Label>{t(adminTranslations.categories.active)}</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t(adminTranslations.common.cancel)}</Button>
                <Button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t(adminTranslations.categories.save)}
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
                <TableHead>{t(adminTranslations.categories.name)}</TableHead>
                <TableHead>{t(adminTranslations.categories.slug)}</TableHead>
                <TableHead>{t(adminTranslations.categories.sortOrder)}</TableHead>
                <TableHead>{t(adminTranslations.orders.status)}</TableHead>
                <TableHead className="text-right">{t(adminTranslations.common.actions)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell><div><p className="font-medium">{language === "bn" ? category.name_bn : category.name}</p><p className="text-sm text-muted-foreground">{language === "bn" ? category.name : category.name_bn}</p></div></TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${category.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {category.is_active ? t(adminTranslations.common.active) : t(adminTranslations.common.inactive)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(category.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
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

export default AdminCategories;
