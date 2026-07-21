import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ivoridigitals.com').replace(/\/$/, '')
const ogImage = '/opengraph-image'

export const siteConfig = {
  name: 'Ivori Digitals',
  legalName: 'Ivori Digitals',
  tagline: 'Premium ecommerce growth studio · Egypt & MENA',
  description:
    'Ivori Digitals is a premium ecommerce growth studio in Cairo for Shopify CRO, Meta Ads, performance creative, and conversion optimization across Egypt and MENA.',
  longDescription:
    'Ivori Digitals (ivoridigitals.com) is a Cairo-based premium ecommerce growth studio - not Ivori Wear, Ivory, or a generic marketing agency. We build Shopify CRO, ecommerce conversion optimization, Meta Ads ecommerce systems, performance creative, and growth operations for modern commerce brands across Egypt and MENA.',
  locale: 'en_EG',
  localeAr: 'ar_EG',
  url: siteUrl,
  email: 'hello@ivoridigitals.com',
  region: 'Cairo, Egypt',
  foundingLocation: 'Cairo',
  sameAs: [
    'https://www.instagram.com/ivoridigitals/',
    'https://www.linkedin.com/company/ivori-digitals/',
    siteUrl,
  ],
} as const

const homeAlternates = {
  'en-EG': siteConfig.url,
  'ar-EG': `${siteConfig.url}/ar`,
  'x-default': siteConfig.url,
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function defaultMetadata(overrides?: Metadata): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} | ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
      'Ivori Digitals',
      'Ivori Digitals Egypt',
      'Ivori Digitals MENA',
      'Ivori Digitals ecommerce studio',
      'Ivori Digitals Shopify CRO',
      'Ivori Digitals Cairo',
      'premium ecommerce studio Egypt',
      'ecommerce CRO studio MENA',
      'Shopify CRO agency Egypt',
      'Shopify CRO Egypt',
      'Shopify agency Egypt',
      'ecommerce growth studio Egypt',
      'Meta Ads ecommerce Egypt',
      'ecommerce CRO MENA',
      'premium ecommerce agency Egypt',
      'performance creative MENA',
      'ecommerce conversion optimization Egypt',
      'perception engineering ecommerce',
      'fashion ecommerce studio Cairo',
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/icon/32', type: 'image/png', sizes: '32x32' },
        { url: '/icon/192', type: 'image/png', sizes: '192x192' },
        { url: '/icon/512', type: 'image/png', sizes: '512x512' },
        { url: '/ivori-icon.svg', type: 'image/svg+xml' },
      ],
      apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      alternateLocale: [siteConfig.localeAr],
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: `${siteConfig.name} | Premium Ecommerce & CRO Studio · Egypt`,
      description: siteConfig.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Ivori Digitals premium ecommerce studio in Cairo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteConfig.name} | Premium Ecommerce & CRO Studio · Egypt`,
      description: siteConfig.description,
      images: [ogImage],
    },
    alternates: {
      canonical: siteConfig.url,
      languages: homeAlternates,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    category: 'business',
    generator: siteConfig.name,
    applicationName: siteConfig.name,
    ...overrides,
  }
}

export function pageMetadata(title: string, description: string, path = ''): Metadata {
  const url = `${siteConfig.url}${path}`
  const isHome = path === '' || path === '/'
  const displayTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: isHome ? homeAlternates : { 'en-EG': url, 'x-default': url },
    },
    openGraph: {
      title: displayTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - premium ecommerce studio`,
        },
      ],
    },
    twitter: { card: 'summary_large_image', title: displayTitle, description, images: [ogImage] },
  }
}

export function organizationJsonLd() {
  const logo = `${siteConfig.url}/icon/512`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        alternateName: [
          'Ivori Digitals Egypt',
          'Ivori Digitals MENA',
          'Ivori Digitals ecommerce studio',
          'Ivori Digitals Shopify CRO',
        ],
        identifier: {
          '@type': 'PropertyValue',
          name: 'domain',
          value: 'ivoridigitals.com',
        },
        slogan: siteConfig.tagline,
        url: siteConfig.url,
        logo,
        image: `${siteConfig.url}${ogImage}`,
        email: siteConfig.email,
        description: siteConfig.longDescription,
        sameAs: siteConfig.sameAs,
        brand: {
          '@type': 'Brand',
          '@id': `${siteConfig.url}/#brand`,
          name: siteConfig.name,
          alternateName: [
            'Ivori Digitals ecommerce studio',
            'Ivori Digitals CRO studio',
            'Ivori Digitals Shopify systems',
          ],
        },
        founder: {
          '@type': 'Organization',
          '@id': `${siteConfig.url}/#studio`,
          name: 'Ivori Digitals Studio',
        },
        subjectOf: {
          '@type': 'WebPage',
          '@id': `${siteConfig.url}/#webpage`,
          url: siteConfig.url,
          name: 'Ivori Digitals premium ecommerce studio',
        },
        foundingLocation: {
          '@type': 'Place',
          name: siteConfig.foundingLocation,
          address: { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
        },
        areaServed: [
          { '@type': 'Country', name: 'Egypt' },
          { '@type': 'AdministrativeArea', name: 'MENA' },
          { '@type': 'Country', name: 'Saudi Arabia' },
          { '@type': 'Country', name: 'United Arab Emirates' },
        ],
        knowsAbout: [
          'Premium ecommerce growth',
          'Perception engineering',
          'Shopify systems',
          'Conversion rate optimization',
          'Fashion ecommerce',
          'AI creative production',
          'Media buying for ecommerce',
          'MENA buyer psychology',
        ],
      },
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': `${siteConfig.url}/#localbusiness`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo,
        image: `${siteConfig.url}${ogImage}`,
        description: siteConfig.description,
        email: siteConfig.email,
        sameAs: siteConfig.sameAs,
        priceRange: '$$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Cairo',
          addressRegion: 'Cairo',
          addressCountry: 'EG',
        },
        areaServed: ['Egypt', 'MENA'],
        parentOrganization: { '@id': `${siteConfig.url}/#organization` },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        inLanguage: ['en-EG', 'ar-EG'],
        publisher: { '@id': `${siteConfig.url}/#organization` },
        description: siteConfig.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteConfig.url}/work?query={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Service',
        '@id': `${siteConfig.url}/#service-catalog`,
        name: 'Premium ecommerce growth and perception engineering',
        provider: { '@id': `${siteConfig.url}/#organization` },
        areaServed: ['Egypt', 'MENA'],
        audience: {
          '@type': 'BusinessAudience',
          audienceType: 'Modern ecommerce, fashion, lifestyle, and Shopify brands',
        },
        serviceType: [
          'Ecommerce growth strategy',
          'Conversion rate optimization',
          'Shopify systems',
          'AI creative production',
          'Performance creative',
          'Media buying',
          'Brand perception engineering',
        ],
      },
    ],
  }
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function serviceJsonLd(service: {
  name: string
  description: string
  path: string
  serviceType: string | string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteConfig.url}${service.path}#service`,
    name: service.name,
    description: service.description,
    url: `${siteConfig.url}${service.path}`,
    serviceType: service.serviceType,
    provider: { '@id': `${siteConfig.url}/#organization`, name: siteConfig.name },
    areaServed: ['Egypt', 'MENA'],
  }
}

export function articleJsonLd(note: {
  title: string
  excerpt: string
  slug: string
  date: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: note.title,
    description: note.excerpt,
    url: `${siteConfig.url}/notes/${note.slug}`,
    datePublished: `${note.date}-01-01`,
    dateModified: `${note.date}-01-01`,
    author: { '@id': `${siteConfig.url}/#organization`, name: siteConfig.name },
    publisher: { '@id': `${siteConfig.url}/#organization`, name: siteConfig.name },
    mainEntityOfPage: `${siteConfig.url}/notes/${note.slug}`,
    inLanguage: 'en-EG',
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  }
}

export function webPageJsonLd(page: {
  name: string
  description: string
  path: string
  inLanguage?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteConfig.url}${page.path}#webpage`,
    name: page.name,
    description: page.description,
    url: `${siteConfig.url}${page.path}`,
    inLanguage: page.inLanguage ?? 'en-EG',
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    publisher: { '@id': `${siteConfig.url}/#organization` },
  }
}

export function caseStudyJsonLd(work: {
  slug: string
  title: string
  thesis: string
  vertical: string
  year: string
  coverImage: string
  focus: string[]
  outcome: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${siteConfig.url}/work/${work.slug}#case-study`,
    name: work.title,
    headline: `${work.title} ecommerce case study`,
    description: work.thesis,
    url: `${siteConfig.url}/work/${work.slug}`,
    image: `${siteConfig.url}${work.coverImage}`,
    creator: { '@id': `${siteConfig.url}/#organization`, name: siteConfig.name },
    publisher: { '@id': `${siteConfig.url}/#organization`, name: siteConfig.name },
    about: [work.vertical, ...work.focus],
    dateCreated: work.year,
    text: work.outcome,
    inLanguage: 'en-EG',
    genre: 'Ecommerce case study',
  }
}
