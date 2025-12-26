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
      toast({ title: "ব্যানার তৈরি হয়েছে" });
      resetForm();
    },
    onError: () => {
      toast({ title: "ব্যানার তৈরি ব্যর্থ", variant: "destructive" });
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
      toast({ title: "ব্যানার আপডেট হয়েছে" });
      resetForm();
    },
    onError: () => {
      toast({ title: "ব্যানার আপডেট ব্যর্থ", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast({ title: "ব্যানার মুছে ফেলা হয়েছে" });
    },
    onError: () => {
      toast({ title: "ব্যানার মুছে ফেলা ব্যর্থ", variant: "destructive" });
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
          <h2 className="text-2xl font-display font-bold text-foreground">ব্যানার ম্যানেজমেন্ট</h2>
          <p className="text-muted-foreground">হোমপেজ স্লাইডার ব্যানার পরিচালনা করুন</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              নতুন ব্যানার
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBanner ? "ব্যানার এডিট করুন" : "নতুন ব্যানার তৈরি করুন"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>টাইটেল (EN)</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summer Sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label>টাইটেল (বাংলা)</Label>
                  <Input
                    value={formData.title_bn}
                    onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                    placeholder="গ্রীষ্মকালীন সেল"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>সাবটাইটেল (EN)</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Up to 50% off"
                  />
                </div>
                <div className="space-y-2">
                  <Label>সাবটাইটেল (বাংলা)</Label>
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
                label="ব্যানার ইমেজ"
                folder="banners"
                aspectRatio="16/9"
              />

              <div className="space-y-2">
                <Label>লিংক URL</Label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/shop?category=skincare"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>সর্ট অর্ডার</Label>
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
                  <Label>সক্রিয়</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingBanner ? "আপডেট করুন" : "তৈরি করুন"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            ব্যানার তালিকা
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ক্রম</TableHead>
                <TableHead>প্রিভিউ</TableHead>
                <TableHead>টাইটেল</TableHead>
                <TableHead>সাবটাইটেল</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
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
                      {banner.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
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
                    কোন ব্যানার পাওয়া যায়নি
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
