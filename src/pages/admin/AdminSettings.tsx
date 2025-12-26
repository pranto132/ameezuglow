import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, Globe, Phone, MapPin, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string | null;
}

const defaultSettings = {
  // General
  site_name: "Ameezuglow",
  site_name_bn: "আমিজুগ্লো",
  site_tagline: "Your Beauty Destination",
  site_tagline_bn: "আপনার সৌন্দর্যের ঠিকানা",
  site_description: "",
  site_description_bn: "",
  logo_url: "",
  favicon_url: "",
  
  // Contact
  contact_email: "",
  contact_phone: "",
  contact_phone_alt: "",
  whatsapp_number: "",
  address: "",
  address_bn: "",
  
  // Social
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
  tiktok_url: "",
  
  // Footer
  footer_text: "",
  footer_text_bn: "",
  copyright_text: "",
  
  // SEO
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  google_analytics_id: "",
  facebook_pixel_id: "",
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  useEffect(() => {
    if (siteSettings) {
      const settingsMap: Record<string, string> = { ...defaultSettings };
      siteSettings.forEach((s) => {
        settingsMap[s.key] = s.value || "";
      });
      setSettings(settingsMap);
    }
  }, [siteSettings]);

  const saveMutation = useMutation({
    mutationFn: async (settingsToSave: Record<string, string>) => {
      const promises = Object.entries(settingsToSave).map(async ([key, value]) => {
        const { data: existing } = await supabase
          .from("site_settings")
          .select("id")
          .eq("key", key)
          .maybeSingle();

        if (existing) {
          return supabase
            .from("site_settings")
            .update({ value, updated_at: new Date().toISOString() })
            .eq("key", key);
        } else {
          return supabase
            .from("site_settings")
            .insert({ key, value });
        }
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      toast({ title: "সেটিংস সংরক্ষিত হয়েছে" });
    },
    onError: () => {
      toast({ title: "সেটিংস সংরক্ষণ ব্যর্থ", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
          <h2 className="text-2xl font-display font-bold text-foreground">সাইট সেটিংস</h2>
          <p className="text-muted-foreground">ওয়েবসাইটের সাধারণ সেটিংস পরিচালনা করুন</p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          সংরক্ষণ করুন
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">সাধারণ</TabsTrigger>
          <TabsTrigger value="contact">যোগাযোগ</TabsTrigger>
          <TabsTrigger value="social">সোশ্যাল মিডিয়া</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                সাইট তথ্য
              </CardTitle>
              <CardDescription>ওয়েবসাইটের বেসিক তথ্য সেট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>সাইট নাম (EN)</Label>
                  <Input
                    value={settings.site_name}
                    onChange={(e) => updateSetting("site_name", e.target.value)}
                    placeholder="Ameezuglow"
                  />
                </div>
                <div className="space-y-2">
                  <Label>সাইট নাম (বাংলা)</Label>
                  <Input
                    value={settings.site_name_bn}
                    onChange={(e) => updateSetting("site_name_bn", e.target.value)}
                    placeholder="আমিজুগ্লো"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ট্যাগলাইন (EN)</Label>
                  <Input
                    value={settings.site_tagline}
                    onChange={(e) => updateSetting("site_tagline", e.target.value)}
                    placeholder="Your Beauty Destination"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ট্যাগলাইন (বাংলা)</Label>
                  <Input
                    value={settings.site_tagline_bn}
                    onChange={(e) => updateSetting("site_tagline_bn", e.target.value)}
                    placeholder="আপনার সৌন্দর্যের ঠিকানা"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>সাইট বর্ণনা (EN)</Label>
                  <Textarea
                    value={settings.site_description}
                    onChange={(e) => updateSetting("site_description", e.target.value)}
                    placeholder="Brief description of your website..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>সাইট বর্ণনা (বাংলা)</Label>
                  <Textarea
                    value={settings.site_description_bn}
                    onChange={(e) => updateSetting("site_description_bn", e.target.value)}
                    placeholder="ওয়েবসাইটের সংক্ষিপ্ত বর্ণনা..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>লোগো URL</Label>
                  <Input
                    value={settings.logo_url}
                    onChange={(e) => updateSetting("logo_url", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ফেভিকন URL</Label>
                  <Input
                    value={settings.favicon_url}
                    onChange={(e) => updateSetting("favicon_url", e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ফুটার টেক্সট (EN)</Label>
                <Textarea
                  value={settings.footer_text}
                  onChange={(e) => updateSetting("footer_text", e.target.value)}
                  placeholder="Footer text..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>ফুটার টেক্সট (বাংলা)</Label>
                <Textarea
                  value={settings.footer_text_bn}
                  onChange={(e) => updateSetting("footer_text_bn", e.target.value)}
                  placeholder="ফুটার টেক্সট..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>কপিরাইট টেক্সট</Label>
                <Input
                  value={settings.copyright_text}
                  onChange={(e) => updateSetting("copyright_text", e.target.value)}
                  placeholder="© 2024 Ameezuglow. All rights reserved."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                যোগাযোগের তথ্য
              </CardTitle>
              <CardDescription>যোগাযোগের জন্য তথ্য সেট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ইমেইল</Label>
                <Input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => updateSetting("contact_email", e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ফোন নম্বর</Label>
                  <Input
                    value={settings.contact_phone}
                    onChange={(e) => updateSetting("contact_phone", e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ফোন নম্বর (বিকল্প)</Label>
                  <Input
                    value={settings.contact_phone_alt}
                    onChange={(e) => updateSetting("contact_phone_alt", e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>WhatsApp নম্বর</Label>
                <Input
                  value={settings.whatsapp_number}
                  onChange={(e) => updateSetting("whatsapp_number", e.target.value)}
                  placeholder="+8801XXXXXXXXX"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ঠিকানা (EN)</Label>
                  <Textarea
                    value={settings.address}
                    onChange={(e) => updateSetting("address", e.target.value)}
                    placeholder="123 Main Street, Dhaka..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ঠিকানা (বাংলা)</Label>
                  <Textarea
                    value={settings.address_bn}
                    onChange={(e) => updateSetting("address_bn", e.target.value)}
                    placeholder="১২৩ মেইন স্ট্রিট, ঢাকা..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                সোশ্যাল মিডিয়া লিংক
              </CardTitle>
              <CardDescription>সোশ্যাল মিডিয়া প্রোফাইল লিংক সেট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Facebook Page URL</Label>
                <Input
                  value={settings.facebook_url}
                  onChange={(e) => updateSetting("facebook_url", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div className="space-y-2">
                <Label>Instagram Profile URL</Label>
                <Input
                  value={settings.instagram_url}
                  onChange={(e) => updateSetting("instagram_url", e.target.value)}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>

              <div className="space-y-2">
                <Label>YouTube Channel URL</Label>
                <Input
                  value={settings.youtube_url}
                  onChange={(e) => updateSetting("youtube_url", e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>

              <div className="space-y-2">
                <Label>TikTok Profile URL</Label>
                <Input
                  value={settings.tiktok_url}
                  onChange={(e) => updateSetting("tiktok_url", e.target.value)}
                  placeholder="https://tiktok.com/@yourprofile"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                SEO সেটিংস
              </CardTitle>
              <CardDescription>সার্চ ইঞ্জিন অপ্টিমাইজেশন সেটিংস</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>মেটা টাইটেল</Label>
                <Input
                  value={settings.meta_title}
                  onChange={(e) => updateSetting("meta_title", e.target.value)}
                  placeholder="Ameezuglow - Premium Cosmetics & Beauty Products"
                />
              </div>

              <div className="space-y-2">
                <Label>মেটা ডেসক্রিপশন</Label>
                <Textarea
                  value={settings.meta_description}
                  onChange={(e) => updateSetting("meta_description", e.target.value)}
                  placeholder="Shop premium cosmetics and beauty products at Ameezuglow..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>মেটা কীওয়ার্ডস</Label>
                <Input
                  value={settings.meta_keywords}
                  onChange={(e) => updateSetting("meta_keywords", e.target.value)}
                  placeholder="cosmetics, beauty, skincare, makeup"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input
                    value={settings.google_analytics_id}
                    onChange={(e) => updateSetting("google_analytics_id", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook Pixel ID</Label>
                  <Input
                    value={settings.facebook_pixel_id}
                    onChange={(e) => updateSetting("facebook_pixel_id", e.target.value)}
                    placeholder="XXXXXXXXXXXXXXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
