import type React from 'react'
import { Helmet } from 'react-helmet'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  author?: string
  image?: string
  url?: string
  type?: string
  siteName?: string
  locale?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  noIndex?: boolean
  canonical?: string
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'CoppelFramework - WebClient React',
  description = 'Framework moderno para desarrollo de aplicaciones web con React, TypeScript y Modern.js. Optimizado para SEO y accesibilidad.',
  keywords = 'React, TypeScript, Modern.js, Framework, SEO, Accesibilidad, Coppel',
  author = 'Coppel Development Team',
  image = '/images/og-image.jpg',
  url = 'https://coppelframework.com',
  type = 'website',
  siteName = 'CoppelFramework',
  locale = 'es_MX',
  twitterCard = 'summary_large_image',
  noIndex = false,
  canonical,
}) => {
  const fullTitle = title.includes('CoppelFramework') ? title : `${title} | CoppelFramework`
  const currentUrl = canonical || url

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="theme-color" content="#007bff" />
      <meta name="msapplication-TileColor" content="#007bff" />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteName,
          description: description,
          url: currentUrl,
          author: {
            '@type': 'Organization',
            name: author,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${currentUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        })}
      </script>
    </Helmet>
  )
}

export default SEOHead
