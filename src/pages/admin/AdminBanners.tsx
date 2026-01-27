import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Image, GripVertical, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";

interface Banner {
  id: string;
  title: string | null;
  title_bn: string | null;
  subtitle: string | null;
  subtitle_bn: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

const AdminBanners = () => {
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const tr = adminTranslations;

  const [isOpen, setIsOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    title_bn: "",
    subtitle: "",
    subtitle_bn: "",
    image_url: "",
    link_url: "",
    sort_order: "0",
    is_active: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Banner[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("banners").insert({
        title: data.title || null,
        title_bn: data.title_bn || null,
        subtitle: data.subtitle || null,
        subtitle_bn: data.subtitle_bn || null,
        image_url: data.image_url || null,
        link_url: data.link_url || null,
        sort_order: parseInt(data.sort_order) || 0,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast({ title: t(tr.banners.bannerCreated) });
      resetForm();
    },
    onError: () => {
      toast({ title: t(tr.banners.createFailed), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("banners")
        .update({
          title: data.title || null,
          title_bn: data.title_bn || null,
          subtitle: data.subtitle || null,
          subtitle_bn: data.subtitle_bn || null,
          image_url: data.image_url || null,
          link_url: data.link_url || null,
          sort_order: parseInt(data.sort_order) || 0,
          is_active: data.is_active,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast({ title: t(tr.banners.bannerUpdated) });
      resetForm();
    },
    onError: () => {
      toast({ title: t(tr.banners.updateFailed), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast({ title: t(tr.banners.bannerDeleted) });
    },
    onError: () => {
      toast({ title: t(tr.banners.deleteFailed), variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      title_bn: "",
      subtitle: "",
      subtitle_bn: "",
      image_url: "",
      link_url: "",
      sort_order: "0",
      is_active: true,
    });
    setEditingBanner(null);
    setIsOpen(false);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      title_bn: banner.title_bn || "",
      subtitle: banner.subtitle || "",
      subtitle_bn: banner.subtitle_bn || "",
      image_url: banner.image_url || "",
      link_url: banner.link_url || "",
      sort_order: banner.sort_order?.toString() || "0",
      is_active: banner.is_active ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
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
          <h2 className="text-2xl font-display font-bold text-foreground">{t(tr.banners.title)}</h2>
          <p className="text-muted-foreground">{t(tr.banners.subtitle)}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t(tr.banners.addBanner)}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBanner ? t(tr.banners.editBanner) : t(tr.banners.createBanner)}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(tr.banners.titleEn)}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summer Sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t(tr.banners.titleBn)}</Label>
                  <Input
                    value={formData.title_bn}
                    onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                    placeholder="গ্রীষ্মকালীন সেল"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(tr.banners.subtitleEn)}</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Up to 50% off"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t(tr.banners.subtitleBn)}</Label>
                  <Input
                    value={formData.subtitle_bn}
                    onChange={(e) => setFormData({ ...formData, subtitle_bn: e.target.value })}
                    placeholder="৫০% পর্যন্ত ছাড়"
                  />
                </div>
              </div>

              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label={t(tr.banners.bannerImage)}
                folder="banners"
                aspectRatio="16/9"
              />

              <div className="space-y-2">
                <Label>{t(tr.banners.linkUrl)}</Label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/shop?category=skincare"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(tr.banners.sortOrder)}</Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>{t(tr.banners.active)}</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingBanner ? t(tr.banners.update) : t(tr.banners.create)}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            {t(tr.banners.bannerList)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">{t(tr.banners.order)}</TableHead>
                <TableHead>{t(tr.banners.preview)}</TableHead>
                <TableHead>{t(tr.banners.title_col)}</TableHead>
                <TableHead>{t(tr.banners.subtitle_col)}</TableHead>
                <TableHead>{t(tr.banners.status)}</TableHead>
                <TableHead className="text-right">{t(tr.common.actions)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners?.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      {banner.sort_order}
                    </div>
                  </TableCell>
                  <TableCell>
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title || "Banner"}
                        className="w-20 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                        <Image className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{banner.title || "-"}</p>
                      <p className="text-sm text-muted-foreground">{banner.title_bn || ""}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{banner.subtitle || "-"}</p>
                      <p className="text-sm text-muted-foreground">{banner.subtitle_bn || ""}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        banner.is_active
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {banner.is_active ? t(tr.banners.active) : t(tr.banners.inactive)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(banner.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!banners || banners.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t(tr.banners.noBanners)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBanners;
