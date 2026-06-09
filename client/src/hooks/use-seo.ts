import { useEffect } from "react";

const DEFAULT_TITLE = "TWH OSINT - Free Mobile, Aadhar, Vehicle, Email & IP Lookup Tool";
const DEFAULT_DESC = "TWH OSINT — India's free OSINT platform. Instantly lookup mobile numbers, Aadhar, vehicle registrations & IP addresses. Real-time alerts, no limits.";
const DEFAULT_CANONICAL = "https://twh-osint.vercel.app/";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string;
}

export function useSEO({ title, description, canonical, ogImage, keywords }: SEOProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);

    if (canonical) setMeta('link[rel="canonical"]', "href", canonical);
    if (ogImage) {
      setMeta('meta[property="og:image"]', "content", ogImage);
      setMeta('meta[name="twitter:image"]', "content", ogImage);
    }
    if (keywords) setMeta('meta[name="keywords"]', "content", keywords);

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="description"]', "content", DEFAULT_DESC);
      setMeta('meta[property="og:title"]', "content", DEFAULT_TITLE);
      setMeta('meta[property="og:description"]', "content", DEFAULT_DESC);
      setMeta('meta[name="twitter:title"]', "content", DEFAULT_TITLE);
      setMeta('meta[name="twitter:description"]', "content", DEFAULT_DESC);
      if (canonical) setMeta('link[rel="canonical"]', "href", DEFAULT_CANONICAL);
    };
  }, [title, description, canonical, ogImage, keywords]);
}
