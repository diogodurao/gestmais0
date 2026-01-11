import { City } from "@/data/cities"
import { buildHomePageSchemas, buildCityPageSchemas } from "@/seo/utils/schema-builders"

interface JsonLdProps {
    city?: City
}

/**
 * JSON-LD Structured Data Component
 * Renders type-safe Schema.org markup for SEO
 *
 * Features:
 * - SoftwareApplication schema (all pages)
 * - FAQPage schema (all pages)
 * - LocalBusiness schema (city pages only)
 * - BreadcrumbList schema (city pages only)
 */
export function JsonLd({ city }: JsonLdProps) {
    // Use type-safe schema builders
    const schema = city ? buildCityPageSchemas(city) : buildHomePageSchemas()

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
