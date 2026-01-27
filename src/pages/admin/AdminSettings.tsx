import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, Globe, Phone, MapPin, Share2, Loader2, Image, Facebook, BarChart3, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";

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
  
  // Facebook Pixel
  facebook_pixel_id: "",
  facebook_pixel_access_token: "",
  facebook_pixel_test_code: "",
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
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
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
        <TabsList className="flex w-full overflow-x-auto whitespace-nowrap h-auto p-1 gap-1">
          <TabsTrigger value="general" className="flex-shrink-0 px-3 py-2">সাধারণ</TabsTrigger>
          <TabsTrigger value="contact" className="flex-shrink-0 px-3 py-2">যোগাযোগ</TabsTrigger>
          <TabsTrigger value="social" className="flex-shrink-0 px-3 py-2">সোশ্যাল</TabsTrigger>
          <TabsTrigger value="facebook-pixel" className="flex-shrink-0 px-3 py-2">Pixel</TabsTrigger>
          <TabsTrigger value="seo" className="flex-shrink-0 px-3 py-2">SEO</TabsTrigger>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    লোগো ও ফেভিকন
                  </CardTitle>
                  <CardDescription>ওয়েবসাইটের লোগো এবং ফেভিকন আপলোড করুন</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <ImageUpload
                      value={settings.logo_url}
                      onChange={(url) => updateSetting("logo_url", url)}
                      label="সাইট লোগো"
                      folder="branding"
                      aspectRatio="3/1"
                    />
                    <ImageUpload
                      value={settings.favicon_url}
                      onChange={(url) => updateSetting("favicon_url", url)}
                      label="ফেভিকন"
                      folder="branding"
                      aspectRatio="1/1"
                    />
                  </div>
                  {(settings.logo_url || settings.favicon_url) && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">প্রিভিউ:</p>
                      <div className="flex items-center gap-4">
                        {settings.favicon_url && (
                          <div className="flex items-center gap-2">
                            <img src={settings.favicon_url} alt="Favicon" className="w-6 h-6 object-contain" />
                            <span className="text-sm text-muted-foreground">ফেভিকন</span>
                          </div>
                        )}
                        {settings.logo_url && (
                          <div className="flex items-center gap-2">
                            <img src={settings.logo_url} alt="Logo" className="h-8 object-contain" />
                            <span className="text-sm text-muted-foreground">লোগো</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

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

        <TabsContent value="facebook-pixel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="w-5 h-5" />
                Facebook Pixel সেটআপ
              </CardTitle>
              <CardDescription>
                Facebook Pixel দিয়ে আপনার বিজ্ঞাপন ট্র্যাক করুন এবং কাস্টম অডিয়েন্স তৈরি করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.facebook_pixel_id ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Facebook Pixel সক্রিয় আছে। Pixel ID: <span className="font-mono font-medium">{settings.facebook_pixel_id}</span>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Facebook Pixel এখনো সেটআপ করা হয়নি। নিচে Pixel ID দিন।
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Pixel ID *</Label>
                  <Input
                    value={settings.facebook_pixel_id}
                    onChange={(e) => updateSetting("facebook_pixel_id", e.target.value)}
                    placeholder="1234567890123456"
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    Facebook Events Manager থেকে Pixel ID কপি করুন। এটি সাধারণত ১৫-১৬ ডিজিটের নম্বর।
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Conversions API Access Token (ঐচ্ছিক)</Label>
                  <Textarea
                    value={settings.facebook_pixel_access_token}
                    onChange={(e) => updateSetting("facebook_pixel_access_token", e.target.value)}
                    placeholder="EAAxxxxxxxx..."
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    সার্ভার সাইড ট্র্যাকিংয়ের জন্য Conversions API Access Token দিন। এটি আরও সঠিক ডেটা সংগ্রহে সাহায্য করে।
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Test Event Code (ঐচ্ছিক)</Label>
                  <Input
                    value={settings.facebook_pixel_test_code}
                    onChange={(e) => updateSetting("facebook_pixel_test_code", e.target.value)}
                    placeholder="TEST12345"
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    টেস্ট মোডে ইভেন্ট দেখতে Events Manager থেকে Test Event Code ব্যবহার করুন।
                  </p>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    স্বয়ংক্রিয় ইভেন্ট ট্র্যাকিং
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    Pixel সেটআপ করলে নিম্নলিখিত ইভেন্টগুলো স্বয়ংক্রিয়ভাবে ট্র্যাক হবে:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span>PageView - প্রতিটি পেজ ভিজিট</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span>ViewContent - পণ্য দেখা</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span>AddToCart - কার্টে যোগ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span>InitiateCheckout - চেকআউট শুরু</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span>Purchase - অর্ডার সম্পন্ন</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span>Search - পণ্য সার্চ</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">কিভাবে Pixel ID পাবেন?</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Facebook Business Suite এ যান</li>
                  <li>Events Manager ওপেন করুন</li>
                  <li>Connect Data Sources ক্লিক করুন</li>
                  <li>Web সিলেক্ট করে Pixel তৈরি করুন</li>
                  <li>Pixel ID কপি করে এখানে পেস্ট করুন</li>
                </ol>
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

              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  value={settings.google_analytics_id}
                  onChange={(e) => updateSetting("google_analytics_id", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
