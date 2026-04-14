import { useEffect } from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export const useDynamicFavicon = () => {
  const { data: settings } = useStoreSettings();

  useEffect(() => {
    const faviconUrl = settings?.site_favicon;
    if (!faviconUrl) return;

    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [settings?.site_favicon]);
};
