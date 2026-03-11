import { useEffect } from "react";

/**
 * SEOHead — injects page-specific SEO tags into <head>.
 * Usage: <SEOHead title="..." description="..." canonical="..." />
 */
export default function SEOHead({
  title,
  description,
  canonical,
  ogImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg",
  ogType = "website",
  structuredData = null,
}) {
  useEffect(() => {
    // Title
    document.title = title;

    const setMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Standard meta
    setMeta("description", description);
    setMeta("robots", "index, follow");

    // Open Graph
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:site_name", "PayADA", "property");
    if (canonical) setMeta("og:url", canonical, "property");

    // Twitter Card — use "summary" (no large image preview on X/Twitter)
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    // Favicon
    setLink("icon", "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg");
    setLink("apple-touch-icon", "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg");

    // Canonical
    if (canonical) setLink("canonical", canonical);

    // Structured Data (JSON-LD)
    let ldScript = document.querySelector("#ld-json");
    if (structuredData) {
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.id = "ld-json";
        ldScript.type = "application/ld+json";
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(structuredData);
    } else if (ldScript) {
      ldScript.remove();
    }

    return () => {
      // Cleanup on unmount so stale tags don't persist
      const ogToRemove = ["og:title", "og:description", "og:type", "og:image", "og:url", "og:site_name"];
      ogToRemove.forEach((p) => {
        const el = document.querySelector(`meta[property="${p}"]`);
        if (el) el.remove();
      });
      const nameToRemove = ["description", "robots", "twitter:card", "twitter:title", "twitter:description"];
      nameToRemove.forEach((n) => {
        const el = document.querySelector(`meta[name="${n}"]`);
        if (el) el.remove();
      });
    };
  }, [title, description, canonical, ogImage, ogType, structuredData]);

  return null;
}