import { useEffect } from "react";

export function usePageMeta(title: string, description: string, url?: string) {
  useEffect(() => {
    document.title = title;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setNameMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const truncated = description.length > 160 ? description.slice(0, 157) + "..." : description;

    setMeta("og:title", title);
    setMeta("og:description", truncated);
    setMeta("og:type", "website");
    setMeta("og:site_name", "DataSim Portfolio");
    if (url) setMeta("og:url", url);

    setNameMeta("description", truncated);
    setNameMeta("twitter:card", "summary_large_image");
    setNameMeta("twitter:title", title);
    setNameMeta("twitter:description", truncated);

    return () => {
      document.title = "DataSim Portfolio";
    };
  }, [title, description, url]);
}
