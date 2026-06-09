import { useLocation } from '@modern-js/runtime/router';
import { useEffect } from 'react';

interface SEOData {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    siteName?: string;
    locale?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    canonical?: string;
    noindex?: boolean;
    nofollow?: boolean;
}

interface StructuredData {
    '@context': string;
    '@type': string;
    [key: string]: any;
}

const DEFAULT_SEO: Required<
    Omit<SEOData, 'publishedTime' | 'modifiedTime' | 'author' | 'canonical' | 'noindex' | 'nofollow'>
> = {
    title: 'CoppelFramework - WebClient React',
    description: 'Estándar de desarrollo frontend para aplicaciones React modernas, robustas y escalables.',
    keywords: 'React, TypeScript, Modern.js, Frontend, Coppel, Framework',
    image: '/images/og-default.jpg',
    url: '',
    type: 'website',
    siteName: 'CoppelFramework',
    locale: 'es_MX'
};

// ── Funciones auxiliares extraídas para reducir Cognitive Complexity (S3776) ──

/** Actualiza o crea un meta tag en el head del documento */
const updateMetaTag = (name: string, content: string, property = false) => {
    const attribute = property ? 'property' : 'name';
    // S4325 fix: se eliminó casteo innecesario con `as HTMLMetaElement`
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);

    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
    }

    meta.setAttribute('content', content);
};

/** Actualiza las meta tags básicas y de Open Graph */
const updateBasicAndOGTags = (
    finalSEOData: Required<
        Omit<SEOData, 'publishedTime' | 'modifiedTime' | 'author' | 'canonical' | 'noindex' | 'nofollow'>
    >
) => {
    // Basic meta tags
    updateMetaTag('description', finalSEOData.description);
    updateMetaTag('keywords', finalSEOData.keywords);

    // Open Graph tags
    updateMetaTag('og:title', finalSEOData.title, true);
    updateMetaTag('og:description', finalSEOData.description, true);
    updateMetaTag('og:image', finalSEOData.image, true);
    updateMetaTag('og:url', finalSEOData.url, true);
    updateMetaTag('og:type', finalSEOData.type, true);
    updateMetaTag('og:site_name', finalSEOData.siteName, true);
    updateMetaTag('og:locale', finalSEOData.locale, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalSEOData.title);
    updateMetaTag('twitter:description', finalSEOData.description);
    updateMetaTag('twitter:image', finalSEOData.image);
};

/** Actualiza las meta tags de robots */
const updateRobotsTags = (seoData: SEOData) => {
    if (seoData.noindex || seoData.nofollow) {
        const robotsContent = [seoData.noindex ? 'noindex' : 'index', seoData.nofollow ? 'nofollow' : 'follow'].join(
            ', '
        );
        updateMetaTag('robots', robotsContent);
    }
};

/** Actualiza las meta tags específicas de artículos */
const updateArticleTags = (seoData: SEOData) => {
    if (seoData.author) {
        updateMetaTag('article:author', seoData.author, true);
    }
    if (seoData.publishedTime) {
        updateMetaTag('article:published_time', seoData.publishedTime, true);
    }
    if (seoData.modifiedTime) {
        updateMetaTag('article:modified_time', seoData.modifiedTime, true);
    }
};

/** Actualiza el link canonical */
const updateCanonicalUrl = (canonicalUrl: string) => {
    // S4325 fix: se eliminó casteo innecesario con `as HTMLLinkElement`
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        (canonical as HTMLLinkElement).rel = 'canonical';
        document.head.appendChild(canonical);
    }
    (canonical as HTMLLinkElement).href = canonicalUrl;
};

/** Actualiza los datos estructurados JSON-LD */
const updateStructuredData = (structuredData: StructuredData) => {
    // S4325 fix: se eliminó casteo innecesario con `as HTMLScriptElement`
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        (jsonLdScript as HTMLScriptElement).type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(structuredData);
};

// ── Hook principal ──

export const useSEO = (seoData: SEOData = {}, structuredData?: StructuredData) => {
    const location = useLocation();

    useEffect(() => {
        const currentUrl = `${window.location.origin}${location.pathname}`;
        const finalSEOData = { ...DEFAULT_SEO, url: currentUrl, ...seoData };

        // Update document title
        document.title = finalSEOData.title;

        // Update all meta tags
        updateBasicAndOGTags(finalSEOData);
        updateRobotsTags(seoData);

        // Article specific tags
        if (finalSEOData.type === 'article') {
            updateArticleTags(seoData);
        }

        // Canonical URL
        updateCanonicalUrl(seoData.canonical || finalSEOData.url);

        // Structured Data (JSON-LD)
        if (structuredData) {
            updateStructuredData(structuredData);
        }

        // Cleanup function
        return () => {
            // Note: In a real app, you might want to restore previous meta tags
            // instead of removing them completely
        };
    }, [seoData, structuredData, location.pathname]);
};

// Helper function to generate structured data for different content types
export const generateStructuredData = {
    website: (data: { name: string; url: string; description: string }): StructuredData => ({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.name,
        url: data.url,
        description: data.description
    }),

    article: (data: {
        headline: string;
        description: string;
        author: string;
        datePublished: string;
        dateModified?: string;
        image: string;
        url: string;
    }): StructuredData => ({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.headline,
        description: data.description,
        author: {
            '@type': 'Person',
            name: data.author
        },
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        image: data.image,
        url: data.url
    }),

    breadcrumb: (items: Array<{ name: string; url: string }>): StructuredData => ({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    })
};

export default useSEO;
