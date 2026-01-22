import Head from 'next/head';

export default function SEO({ 
  title = 'Care Foundation - Crowdfunding Platform for India',
  description = 'Care Foundation is India\'s most trusted crowdfunding platform. Raise funds for medical, education, disaster relief, and more. Start your fundraiser today!',
  keywords = 'crowdfunding, fundraising, donation, charity, medical fundraising, education funding, disaster relief, NGO, India',
  ogImage = '/logo.webp',
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonical,
  noindex = false
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullUrl = ogUrl || `${siteUrl}`;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const canonicalUrl = canonical || fullUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Care Foundation" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {!noindex && <meta name="robots" content="index,follow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Care Foundation" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@carefoundationm" />
      <meta name="twitter:creator" content="@carefoundationm" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#10b981" />
      <meta name="msapplication-TileColor" content="#10b981" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Care Foundation" />
      
      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/jpeg" href="/fevicon.jpg" />
      <link rel="apple-touch-icon" sizes="180x180" href="/fevicon.jpg" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Structured Data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Care Foundation",
            "url": siteUrl,
            "logo": `${siteUrl}/logo.webp`,
            "description": "India's most trusted crowdfunding and fundraising platform",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "email": "carefoundationtrustorg@gmail.com"
            },
            "sameAs": [
              "https://www.facebook.com/carefoundationtrustorg",
              "https://x.com/carefoundationm",
              "https://www.linkedin.com/in/care-foundation-trust-org",
              "https://www.youtube.com/@CareFoundationTrust",
              "https://instagram.com/carefoundation"
            ]
          })
        }}
      />
    </Head>
  );
}

// Specialized SEO components for different page types
export function CampaignSEO({ campaign }) {
  if (!campaign) return null;

  const title = `${campaign.title} - Care Foundation`;
  const description = campaign.shortDescription || campaign.description?.substring(0, 160);
  const imageUrl = campaign.images?.[0]?.url || '/logo.webp';
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/campaigns/${campaign._id}`;
  const progressPercentage = Math.round((campaign.currentAmount / campaign.goalAmount) * 100);

  return (
    <>
      <SEO
        title={title}
        description={description}
        ogImage={imageUrl}
        ogUrl={url}
        ogType="article"
        keywords={`${campaign.category}, crowdfunding, fundraising, ${campaign.title}, donate, support`}
        canonical={url}
      />
      <Head>
        {/* Campaign-specific structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DonateAction",
              "name": campaign.title,
              "description": description,
              "image": imageUrl,
              "url": url,
              "recipient": {
                "@type": "Organization",
                "name": "Care Foundation"
              },
              "potentialAction": {
                "@type": "DonateAction",
                "target": url
              }
            })
          }}
        />
        
        {/* Article structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": campaign.title,
              "description": description,
              "image": imageUrl,
              "author": {
                "@type": "Person",
                "name": campaign.fundraiser?.name || "Anonymous"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Care Foundation",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${process.env.NEXT_PUBLIC_APP_URL}/logo.webp`
                }
              },
              "datePublished": campaign.createdAt,
              "dateModified": campaign.updatedAt
            })
          }}
        />
      </Head>
    </>
  );
}

export function BlogSEO({ post }) {
  if (!post) return null;

  return (
    <>
      <SEO
        title={`${post.title} - Care Foundation Blog`}
        description={post.excerpt}
        ogImage={post.featuredImage}
        ogType="article"
        ogUrl={`${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`}
      />
      <Head>
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        {post.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Head>
    </>
  );
}




