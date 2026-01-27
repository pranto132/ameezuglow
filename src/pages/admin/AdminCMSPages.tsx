import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, FileText, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";

interface CMSPage {
  id: string;
  slug: string;
  title: string;
  title_bn: string | null;
  content: string | null;
  content_bn: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean | null;
  updated_at: string | null;
}

const AdminCMSPages = () => {
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const tr = adminTranslations;

  const [isOpen, setIsOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    title_bn: "",
    content: "",
    content_bn: "",
    meta_title: "",
    meta_description: "",
    is_active: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-cms-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .order("title", { ascending: true });
      if (error) throw error;
      return data as CMSPage[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("cms_pages").insert({
        slug: data.slug,
        title: data.title,
        title_bn: data.title_bn || null,
        content: data.content || null,
        content_bn: data.content_bn || null,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cms-pages"] });
      toast({ title: t(tr.cmsPages.pageCreated) });
      resetForm();
    },
    onError: () => {
      toast({ title: t(tr.cmsPages.createFailed), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("cms_pages")
        .update({
          slug: data.slug,
          title: data.title,
          title_bn: data.title_bn || null,
          content: data.content || null,
          content_bn: data.content_bn || null,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          is_active: data.is_active,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cms-pages"] });
      toast({ title: t(tr.cmsPages.pageUpdated) });
      resetForm();
    },
    onError: () => {
      toast({ title: t(tr.cmsPages.updateFailed), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cms_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cms-pages"] });
      toast({ title: t(tr.cmsPages.pageDeleted) });
    },
    onError: () => {
      toast({ title: t(tr.cmsPages.deleteFailed), variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      slug: "",
      title: "",
      title_bn: "",
      content: "",
      content_bn: "",
      meta_title: "",
      meta_description: "",
      is_active: true,
    });
    setEditingPage(null);
    setIsOpen(false);
  };

  const handleEdit = (page: CMSPage) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      title_bn: page.title_bn || "",
      content: page.content || "",
      content_bn: page.content_bn || "",
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
      is_active: page.is_active ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data: formData });
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
          <h2 className="text-2xl font-display font-bold text-foreground">{t(tr.cmsPages.title)}</h2>
          <p className="text-muted-foreground">{t(tr.cmsPages.subtitle)}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t(tr.cmsPages.addPage)}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? t(tr.cmsPages.editPage) : t(tr.cmsPages.createPage)}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t(tr.cmsPages.slug)}</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="about-us"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>{t(tr.cmsPages.active)}</Label>
                </div>
              </div>

              <Tabs defaultValue="english" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english">{t(tr.cmsPages.english)}</TabsTrigger>
                  <TabsTrigger value="bangla">{t(tr.cmsPages.bangla)}</TabsTrigger>
                </TabsList>
                <TabsContent value="english" className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t(tr.cmsPages.titleEn)}</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="About Us"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t(tr.cmsPages.contentEn)}</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Page content in English..."
                      rows={10}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="bangla" className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t(tr.cmsPages.titleBn)}</Label>
                    <Input
                      value={formData.title_bn}
                      onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                      placeholder="আমাদের সম্পর্কে"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t(tr.cmsPages.contentBn)}</Label>
                    <Textarea
                      value={formData.content_bn}
                      onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
                      placeholder="বাংলায় পেজ কন্টেন্ট..."
                      rows={10}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">{t(tr.cmsPages.seoSettings)}</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t(tr.cmsPages.metaTitle)}</Label>
                    <Input
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="Page title for SEO"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t(tr.cmsPages.metaDescription)}</Label>
                    <Textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Short description for search engines..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingPage ? t(tr.cmsPages.update) : t(tr.cmsPages.create)}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t(tr.cmsPages.pageList)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(tr.cmsPages.pageTitle)}</TableHead>
                <TableHead>{t(tr.cmsPages.slug)}</TableHead>
                <TableHead>{t(tr.cmsPages.metaTitle)}</TableHead>
                <TableHead>{t(tr.cmsPages.status)}</TableHead>
                <TableHead className="text-right">{t(tr.common.actions)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages?.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{page.title}</p>
                      {page.title_bn && (
                        <p className="text-sm text-muted-foreground">{page.title_bn}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">/{page.slug}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {page.meta_title || "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        page.is_active
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {page.is_active ? t(tr.cmsPages.active) : t(tr.cmsPages.inactive)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(page.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!pages || pages.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t(tr.cmsPages.noPages)}
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

export default AdminCMSPages;