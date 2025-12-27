import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
      className="gap-2 text-foreground/70 hover:text-foreground"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === "bn" ? "EN" : "বাং"}
      </span>
    </Button>
  );
};
