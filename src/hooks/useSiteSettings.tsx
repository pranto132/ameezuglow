import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteSetting {
  key: string;
  value: string | null;
}

export const useSiteSettings = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");
      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      data?.forEach((s: SiteSetting) => {
        settingsMap[s.key] = s.value || "";
      });
      return settingsMap;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const getSetting = (key: string, defaultValue: string = "") => {
    return settings?.[key] || defaultValue;
  };

  return { settings, isLoading, getSetting };
};
