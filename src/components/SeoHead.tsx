import React, { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  path?: string;
  jsonLd?: Record<string, any>;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ title, description, path = '/', jsonLd }) => {
  useEffect(() => {
    const fullTitle = title.includes('LIBYA APPS')
      ? title
      : `${title} | LIBYA APPS — منصة التطبيقات الليبية`;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', `https://libyaapps.ly${path}`);

    let scriptEl = document.getElementById('dynamic-json-ld') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'dynamic-json-ld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, path, jsonLd]);

  return null;
};
