import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, Home, Sparkles, Gift, MessageSquare, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { adminTranslations, useAdminTranslation } from "@/lib/adminTranslations";

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
}

const defaultSettings = {
  // Hero Section
  hero_badge_bn: "প্রিমিয়াম বিউটি কালেকশন",
  hero_badge_en: "Premium Beauty Collection",
  hero_title_bn: "আপনার প্রাকৃতিক গ্লোকে দিন নতুন আলো",
  hero_title_en: "Bring New Light to Your Natural Glow",
  hero_highlight_bn: "গ্লোকে",
  hero_highlight_en: "Glow",
  hero_description_bn: "Ameezuglow নিয়ে এসেছে প্রিমিয়াম কসমেটিকস ও স্কিনকেয়ার প্রোডাক্ট, যা আপনার সৌন্দর্যকে করবে আরও উজ্জ্বল ও আত্মবিশ্বাসী।",
  hero_description_en: "Ameezuglow brings premium cosmetics & skincare products that will make your beauty more radiant and confident.",
  hero_btn1_bn: "এখনই শপ করুন",
  hero_btn1_en: "Shop Now",
  hero_btn2_bn: "আজকের অফার",
  hero_btn2_en: "Today's Offers",
  hero_image: "",
  hero_discount_text: "৩০%",
  hero_discount_label_bn: "পর্যন্ত ছাড়",
  hero_discount_label_en: "up to off",
  hero_review_count: "৫,০০০+",
  hero_review_label_bn: "সন্তুষ্ট গ্রাহক",
  hero_review_label_en: "Happy Customers",
  
  // Trust Badges
  trust_badge1_bn: "১০০% অরিজিনাল",
  trust_badge1_en: "100% Original",
  trust_badge2_bn: "ক্যাশ অন ডেলিভারি",
  trust_badge2_en: "Cash on Delivery",
  trust_badge3_bn: "সারা দেশে ডেলিভারি",
  trust_badge3_en: "Nationwide Delivery",
  trust_badge4_bn: "৫০০০+ সন্তুষ্ট গ্রাহক",
  trust_badge4_en: "5000+ Happy Customers",
  
  // Categories Section
  categories_badge_bn: "ক্যাটাগরি",
  categories_badge_en: "Categories",
  categories_title_bn: "আমাদের কালেকশন",
  categories_title_en: "Our Collection",
  categories_description_bn: "আপনার প্রয়োজন অনুযায়ী সঠিক প্রোডাক্ট খুঁজে নিন",
  categories_description_en: "Find the right products for your needs",
  
  // Offer Banner
  offer_badge_bn: "সীমিত সময়ের অফার",
  offer_badge_en: "Limited Time Offer",
  offer_title_bn: "স্পেশাল বিউটি অফার!",
  offer_title_en: "Special Beauty Offer!",
  offer_description_bn: "আজই অর্ডার করুন এবং পান বিশেষ ছাড় ও আকর্ষণীয় গিফট। ৩০% পর্যন্ত ছাড়!",
  offer_description_en: "Order today and get special discounts & attractive gifts. Up to 30% off!",
  offer_btn_bn: "অফার সংগ্রহ করুন",
  offer_btn_en: "Grab Offer",
  offer_countdown_days: "3",
  offer_countdown_hours: "12",
  offer_countdown_minutes: "45",
  
  // Why Choose Us
  why_badge_bn: "আমাদের বিশেষত্ব",
  why_badge_en: "Our Specialty",
  why_title_bn: "কেন Ameezuglow?",
  why_title_en: "Why Ameezuglow?",
  why_description_bn: "আমরা আপনার সৌন্দর্যের যত্ন নিতে প্রতিশ্রুতিবদ্ধ। বিশ্বাসযোগ্যতা ও মানের প্রতি আমাদের অঙ্গীকার অটুট।",
  why_description_en: "We are committed to caring for your beauty. Our commitment to trustworthiness and quality is unwavering.",
  
  // Stats
  stat1_value: "৫০০০+",
  stat1_label_bn: "সন্তুষ্ট গ্রাহক",
  stat1_label_en: "Happy Customers",
  stat2_value: "২০০+",
  stat2_label_bn: "প্রোডাক্ট",
  stat2_label_en: "Products",
  stat3_value: "৯৯%",
  stat3_label_bn: "পজিটিভ রিভিউ",
  stat3_label_en: "Positive Reviews",
  stat4_value: "২৪/৭",
  stat4_label_bn: "সাপোর্ট",
  stat4_label_en: "Support",
  
  // Testimonials
  testimonials_badge_bn: "গ্রাহকদের রিভিউ",
  testimonials_badge_en: "Customer Reviews",
  testimonials_title_bn: "আমাদের সন্তুষ্ট গ্রাহক",
  testimonials_title_en: "Our Satisfied Customers",
  testimonials_description_bn: "হাজার হাজার গ্রাহক আমাদের উপর আস্থা রাখেন",
  testimonials_description_en: "Thousands of customers trust us",
};

const AdminHomepage = () => {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const { t } = useAdminTranslation(language);
  const tr = adminTranslations;

  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ["admin-homepage-settings"],
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
        if (s.key in defaultSettings) {
          settingsMap[s.key] = s.value || "";
        }
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
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: t(tr.homepage.settingsSaved) });
    },
    onError: () => {
      toast({ title: t(tr.homepage.settingsError), variant: "destructive" });
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
          <h2 className="text-2xl font-display font-bold text-foreground">{t(tr.homepage.title)}</h2>
          <p className="text-muted-foreground">{t(tr.homepage.subtitle)}</p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t(tr.homepage.save)}
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero" className="flex items-center gap-1">
            <Home className="w-4 h-4" />
            {t(tr.homepage.heroTab)}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            {t(tr.homepage.categoriesTab)}
          </TabsTrigger>
          <TabsTrigger value="offer" className="flex items-center gap-1">
            <Gift className="w-4 h-4" />
            {t(tr.homepage.offerTab)}
          </TabsTrigger>
          <TabsTrigger value="why" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {t(tr.homepage.whyTab)}
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {t(tr.homepage.testimonialsTab)}
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t(tr.homepage.heroSection)}</CardTitle>
              <CardDescription>{t(tr.homepage.heroSectionDesc)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value={settings.hero_image}
                onChange={(url) => updateSetting("hero_image", url)}
                label="হিরো ইমেজ"
                folder="homepage"
                aspectRatio="4/5"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ব্যাজ টেক্সট (বাংলা)</Label>
                  <Input
                    value={settings.hero_badge_bn}
                    onChange={(e) => updateSetting("hero_badge_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge Text (English)</Label>
                  <Input
                    value={settings.hero_badge_en}
                    onChange={(e) => updateSetting("hero_badge_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>টাইটেল (বাংলা)</Label>
                  <Textarea
                    value={settings.hero_title_bn}
                    onChange={(e) => updateSetting("hero_title_bn", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Textarea
                    value={settings.hero_title_en}
                    onChange={(e) => updateSetting("hero_title_en", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>হাইলাইট শব্দ (বাংলা)</Label>
                  <Input
                    value={settings.hero_highlight_bn}
                    onChange={(e) => updateSetting("hero_highlight_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Highlight Word (English)</Label>
                  <Input
                    value={settings.hero_highlight_en}
                    onChange={(e) => updateSetting("hero_highlight_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>বর্ণনা (বাংলা)</Label>
                  <Textarea
                    value={settings.hero_description_bn}
                    onChange={(e) => updateSetting("hero_description_bn", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={settings.hero_description_en}
                    onChange={(e) => updateSetting("hero_description_en", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>বাটন ১ (বাংলা)</Label>
                  <Input
                    value={settings.hero_btn1_bn}
                    onChange={(e) => updateSetting("hero_btn1_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button 1 (English)</Label>
                  <Input
                    value={settings.hero_btn1_en}
                    onChange={(e) => updateSetting("hero_btn1_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>বাটন ২ (বাংলা)</Label>
                  <Input
                    value={settings.hero_btn2_bn}
                    onChange={(e) => updateSetting("hero_btn2_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button 2 (English)</Label>
                  <Input
                    value={settings.hero_btn2_en}
                    onChange={(e) => updateSetting("hero_btn2_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ডিসকাউন্ট টেক্সট</Label>
                  <Input
                    value={settings.hero_discount_text}
                    onChange={(e) => updateSetting("hero_discount_text", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ডিসকাউন্ট লেবেল (বাংলা)</Label>
                  <Input
                    value={settings.hero_discount_label_bn}
                    onChange={(e) => updateSetting("hero_discount_label_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Label (English)</Label>
                  <Input
                    value={settings.hero_discount_label_en}
                    onChange={(e) => updateSetting("hero_discount_label_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>রিভিউ কাউন্ট</Label>
                  <Input
                    value={settings.hero_review_count}
                    onChange={(e) => updateSetting("hero_review_count", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>রিভিউ লেবেল (বাংলা)</Label>
                  <Input
                    value={settings.hero_review_label_bn}
                    onChange={(e) => updateSetting("hero_review_label_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Review Label (English)</Label>
                  <Input
                    value={settings.hero_review_label_en}
                    onChange={(e) => updateSetting("hero_review_label_en", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ট্রাস্ট ব্যাজ</CardTitle>
              <CardDescription>হিরো সেকশনের ট্রাস্ট ব্যাজগুলো এডিট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ব্যাজ {i} (বাংলা)</Label>
                    <Input
                      value={settings[`trust_badge${i}_bn`]}
                      onChange={(e) => updateSetting(`trust_badge${i}_bn`, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Badge {i} (English)</Label>
                    <Input
                      value={settings[`trust_badge${i}_en`]}
                      onChange={(e) => updateSetting(`trust_badge${i}_en`, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Section */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ক্যাটাগরি সেকশন</CardTitle>
              <CardDescription>ক্যাটাগরি সেকশনের টেক্সট এডিট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ব্যাজ টেক্সট (বাংলা)</Label>
                  <Input
                    value={settings.categories_badge_bn}
                    onChange={(e) => updateSetting("categories_badge_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge Text (English)</Label>
                  <Input
                    value={settings.categories_badge_en}
                    onChange={(e) => updateSetting("categories_badge_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>টাইটেল (বাংলা)</Label>
                  <Input
                    value={settings.categories_title_bn}
                    onChange={(e) => updateSetting("categories_title_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={settings.categories_title_en}
                    onChange={(e) => updateSetting("categories_title_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>বর্ণনা (বাংলা)</Label>
                  <Textarea
                    value={settings.categories_description_bn}
                    onChange={(e) => updateSetting("categories_description_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={settings.categories_description_en}
                    onChange={(e) => updateSetting("categories_description_en", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offer Section */}
        <TabsContent value="offer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>অফার ব্যানার</CardTitle>
              <CardDescription>অফার সেকশনের কন্টেন্ট এডিট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ব্যাজ টেক্সট (বাংলা)</Label>
                  <Input
                    value={settings.offer_badge_bn}
                    onChange={(e) => updateSetting("offer_badge_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge Text (English)</Label>
                  <Input
                    value={settings.offer_badge_en}
                    onChange={(e) => updateSetting("offer_badge_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>টাইটেল (বাংলা)</Label>
                  <Input
                    value={settings.offer_title_bn}
                    onChange={(e) => updateSetting("offer_title_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={settings.offer_title_en}
                    onChange={(e) => updateSetting("offer_title_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>বর্ণনা (বাংলা)</Label>
                  <Textarea
                    value={settings.offer_description_bn}
                    onChange={(e) => updateSetting("offer_description_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={settings.offer_description_en}
                    onChange={(e) => updateSetting("offer_description_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>বাটন টেক্সট (বাংলা)</Label>
                  <Input
                    value={settings.offer_btn_bn}
                    onChange={(e) => updateSetting("offer_btn_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text (English)</Label>
                  <Input
                    value={settings.offer_btn_en}
                    onChange={(e) => updateSetting("offer_btn_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>কাউন্টডাউন দিন</Label>
                  <Input
                    type="number"
                    value={settings.offer_countdown_days}
                    onChange={(e) => updateSetting("offer_countdown_days", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>কাউন্টডাউন ঘন্টা</Label>
                  <Input
                    type="number"
                    value={settings.offer_countdown_hours}
                    onChange={(e) => updateSetting("offer_countdown_hours", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>কাউন্টডাউন মিনিট</Label>
                  <Input
                    type="number"
                    value={settings.offer_countdown_minutes}
                    onChange={(e) => updateSetting("offer_countdown_minutes", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Why Choose Us */}
        <TabsContent value="why" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>কেন আমরা সেকশন</CardTitle>
              <CardDescription>এই সেকশনের টেক্সট এডিট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ব্যাজ টেক্সট (বাংলা)</Label>
                  <Input
                    value={settings.why_badge_bn}
                    onChange={(e) => updateSetting("why_badge_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge Text (English)</Label>
                  <Input
                    value={settings.why_badge_en}
                    onChange={(e) => updateSetting("why_badge_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>টাইটেল (বাংলা)</Label>
                  <Input
                    value={settings.why_title_bn}
                    onChange={(e) => updateSetting("why_title_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={settings.why_title_en}
                    onChange={(e) => updateSetting("why_title_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>বর্ণনা (বাংলা)</Label>
                  <Textarea
                    value={settings.why_description_bn}
                    onChange={(e) => updateSetting("why_description_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={settings.why_description_en}
                    onChange={(e) => updateSetting("why_description_en", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>স্ট্যাটস</CardTitle>
              <CardDescription>স্ট্যাটিসটিক্স এডিট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>স্ট্যাট {i} ভ্যালু</Label>
                    <Input
                      value={settings[`stat${i}_value`]}
                      onChange={(e) => updateSetting(`stat${i}_value`, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>লেবেল (বাংলা)</Label>
                    <Input
                      value={settings[`stat${i}_label_bn`]}
                      onChange={(e) => updateSetting(`stat${i}_label_bn`, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (English)</Label>
                    <Input
                      value={settings[`stat${i}_label_en`]}
                      onChange={(e) => updateSetting(`stat${i}_label_en`, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials */}
        <TabsContent value="testimonials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>টেস্টিমোনিয়াল সেকশন</CardTitle>
              <CardDescription>রিভিউ সেকশনের টেক্সট এডিট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ব্যাজ টেক্সট (বাংলা)</Label>
                  <Input
                    value={settings.testimonials_badge_bn}
                    onChange={(e) => updateSetting("testimonials_badge_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge Text (English)</Label>
                  <Input
                    value={settings.testimonials_badge_en}
                    onChange={(e) => updateSetting("testimonials_badge_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>টাইটেল (বাংলা)</Label>
                  <Input
                    value={settings.testimonials_title_bn}
                    onChange={(e) => updateSetting("testimonials_title_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={settings.testimonials_title_en}
                    onChange={(e) => updateSetting("testimonials_title_en", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>বর্ণনা (বাংলা)</Label>
                  <Textarea
                    value={settings.testimonials_description_bn}
                    onChange={(e) => updateSetting("testimonials_description_bn", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={settings.testimonials_description_en}
                    onChange={(e) => updateSetting("testimonials_description_en", e.target.value)}
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

export default AdminHomepage;
