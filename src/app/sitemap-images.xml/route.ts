import { cities } from '@/data/cities'
import { BASE_URL } from '@/seo/utils/constants'

/**
 * Image Sitemap for better image SEO
 * Helps Google discover and index OG images
 */
export async function GET() {
    const images = [
        // Homepage OG image
        {
            loc: BASE_URL,
            image: `${BASE_URL}/opengraph-image`,
            title: 'GestMais - Sistema de Gestão de Condomínios',
            caption: 'Sistema de gestão de condomínios de alta densidade desenhado para transparência e velocidade'
        },
        // City page OG images
        ...cities.map((city) => ({
            loc: `${BASE_URL}/solucoes/${city.slug}`,
            image: `${BASE_URL}/opengraph-image`,
            title: `GestMais - Software de Condomínio em ${city.name}`,
            caption: `Solução de gestão de condomínios para prédios em ${city.name}`
        }))
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${images.map(({ loc, image, title, caption }) => `  <url>
    <loc>${loc}</loc>
    <image:image>
      <image:loc>${image}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${caption}</image:caption>
    </image:image>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
    })
}
