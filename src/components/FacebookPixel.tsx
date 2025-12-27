import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const FacebookPixel = () => {
  const { getSetting } = useSiteSettings();
  const pixelId = getSetting("facebook_pixel_id");
  const testEventCode = getSetting("facebook_pixel_test_code");

  useEffect(() => {
    if (!pixelId) return;

    // Initialize Facebook Pixel
    const initPixel = () => {
      if (window.fbq) return;

      const fbq = function (...args: any[]) {
        if ((fbq as any).callMethod) {
          (fbq as any).callMethod.apply(fbq, args);
        } else {
          (fbq as any).queue.push(args);
        }
      };

      if (!window._fbq) window._fbq = fbq;
      window.fbq = fbq;
      (fbq as any).push = fbq;
      (fbq as any).loaded = true;
      (fbq as any).version = "2.0";
      (fbq as any).queue = [];

      // Load the Facebook Pixel script
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);

      // Initialize the pixel
      if (testEventCode) {
        window.fbq("init", pixelId, {}, { eventID: testEventCode });
      } else {
        window.fbq("init", pixelId);
      }
      window.fbq("track", "PageView");
    };

    initPixel();

    // Track page views on route changes
    const handleRouteChange = () => {
      if (window.fbq) {
        window.fbq("track", "PageView");
      }
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [pixelId, testEventCode]);

  // Add noscript fallback
  if (!pixelId) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
};

// Helper functions to track events
export const trackFBEvent = (eventName: string, params?: Record<string, any>) => {
  if (window.fbq) {
    window.fbq("track", eventName, params);
  }
};

export const trackFBCustomEvent = (eventName: string, params?: Record<string, any>) => {
  if (window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }
};

// Common e-commerce events
export const trackAddToCart = (productId: string, productName: string, price: number, currency: string = "BDT") => {
  trackFBEvent("AddToCart", {
    content_ids: [productId],
    content_name: productName,
    content_type: "product",
    value: price,
    currency,
  });
};

export const trackPurchase = (orderId: string, total: number, products: { id: string; name: string; quantity: number; price: number }[], currency: string = "BDT") => {
  trackFBEvent("Purchase", {
    content_ids: products.map(p => p.id),
    contents: products.map(p => ({ id: p.id, quantity: p.quantity })),
    content_type: "product",
    value: total,
    currency,
    order_id: orderId,
  });
};

export const trackViewContent = (productId: string, productName: string, price: number, currency: string = "BDT") => {
  trackFBEvent("ViewContent", {
    content_ids: [productId],
    content_name: productName,
    content_type: "product",
    value: price,
    currency,
  });
};

export const trackInitiateCheckout = (products: { id: string; quantity: number; price: number }[], total: number, currency: string = "BDT") => {
  trackFBEvent("InitiateCheckout", {
    content_ids: products.map(p => p.id),
    contents: products.map(p => ({ id: p.id, quantity: p.quantity })),
    value: total,
    currency,
    num_items: products.length,
  });
};

export const trackSearch = (searchQuery: string) => {
  trackFBEvent("Search", {
    search_string: searchQuery,
  });
};

export default FacebookPixel;
