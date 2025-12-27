import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X, Grid3X3, LayoutGrid } from "lucide-react";

const Shop = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showOnlyDiscounted, setShowOnlyDiscounted] = useState(
    searchParams.get("offers") === "true"
  );
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, name_bn, slug)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !product.name.toLowerCase().includes(query) &&
          !product.name_bn.includes(query) &&
          !(product.description_bn || "").includes(query)
        ) {
          return false;
        }
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const productCategory = product.categories as { slug: string } | null;
        if (!productCategory || !selectedCategories.includes(productCategory.slug)) {
          return false;
        }
      }

      // Price filter
      const price = product.sale_price || product.price;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      // Discount filter
      if (showOnlyDiscounted && !product.sale_price) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategories, priceRange, showOnlyDiscounted]);

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange([0, 5000]);
    setShowOnlyDiscounted(false);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || showOnlyDiscounted || priceRange[0] > 0 || priceRange[1] < 5000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">{t("ক্যাটাগরি", "Categories")}</h3>
        <div className="space-y-2">
          {categories?.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => handleCategoryToggle(category.slug)}
              />
              <span className="text-sm text-foreground/80">{t(category.name_bn, category.name)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">{t("মূল্য পরিসীমা", "Price Range")}</h3>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          min={0}
          max={5000}
          step={100}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>৳{priceRange[0]}</span>
          <span>৳{priceRange[1]}</span>
        </div>
      </div>

      {/* Discount Filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={showOnlyDiscounted}
            onCheckedChange={(checked) => setShowOnlyDiscounted(checked as boolean)}
          />
          <span className="text-sm text-foreground/80">{t("শুধুমাত্র ছাড়কৃত পণ্য", "Discounted Only")}</span>
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          {t("ফিল্টার মুছুন", "Clear Filters")}
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <section className="section-padding bg-gradient-hero min-h-screen">
        <div className="container mx-auto container-padding">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t("আমাদের প্রোডাক্টসমূহ", "Our Products")}
            </h1>
            <p className="text-muted-foreground">
              {t("সেরা মানের কসমেটিকস ও স্কিনকেয়ার প্রোডাক্ট", "Best quality cosmetics & skincare products")}
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t("প্রোডাক্ট খুঁজুন...", "Search products...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {t("ফিল্টার", "Filter")}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>{t("ফিল্টার অপশন", "Filter Options")}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Grid Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-card rounded-lg p-1 border border-border">
              <button
                onClick={() => setGridCols(2)}
                className={`p-2 rounded ${gridCols === 2 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 rounded ${gridCols === 3 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="sticky top-24 bg-card rounded-2xl border border-border p-6">
                <h2 className="font-semibold text-lg text-foreground mb-4">{t("ফিল্টার", "Filter")}</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {t(`${filteredProducts.length} টি প্রোডাক্ট পাওয়া গেছে`, `${filteredProducts.length} products found`)}
                </p>
              </div>

              {isLoading ? (
                <div className={`grid grid-cols-2 md:grid-cols-${gridCols} gap-4 md:gap-6`}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl h-80 animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="text-6xl mb-4">😔</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t("কোন প্রোডাক্ট পাওয়া যায়নি", "No Products Found")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t("অনুগ্রহ করে আপনার ফিল্টার পরিবর্তন করুন", "Please try changing your filters")}
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline">
                      {t("ফিল্টার মুছুন", "Clear Filters")}
                    </Button>
                  )}
                </motion.div>
              ) : (
                <div
                  className={`grid grid-cols-2 ${
                    gridCols === 2 ? "md:grid-cols-2" : gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"
                  } gap-4 md:gap-6`}
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;