/**
 * TypeScript definitions for Schema.org structured data
 * Provides type safety for JSON-LD schemas
 *
 * Based on Schema.org vocabulary (https://schema.org)
 */

/**
 * Base type for all Schema.org types
 */
interface SchemaOrgBase {
    "@context"?: string | string[]
    "@type": string
    "@id"?: string
}

/**
 * SoftwareApplication Schema
 * https://schema.org/SoftwareApplication
 */
export interface SoftwareApplication extends SchemaOrgBase {
    "@type": "SoftwareApplication"
    name: string
    applicationCategory?: string
    operatingSystem?: string
    offers?: Offer
    description?: string
    aggregateRating?: AggregateRating
    featureList?: string[]
    url?: string
    image?: string | ImageObject
}

/**
 * Offer Schema
 * https://schema.org/Offer
 */
export interface Offer extends SchemaOrgBase {
    "@type": "Offer"
    price?: string
    priceCurrency?: string
    description?: string
    availability?: string
    url?: string
    itemOffered?: Service | Product
}

/**
 * AggregateRating Schema
 * https://schema.org/AggregateRating
 */
export interface AggregateRating extends SchemaOrgBase {
    "@type": "AggregateRating"
    ratingValue: string | number
    ratingCount?: string | number
    reviewCount?: string | number
    bestRating?: string | number
    worstRating?: string | number
}

/**
 * FAQPage Schema
 * https://schema.org/FAQPage
 */
export interface FAQPage extends SchemaOrgBase {
    "@type": "FAQPage"
    mainEntity: Question[]
}

/**
 * Question Schema
 * https://schema.org/Question
 */
export interface Question extends SchemaOrgBase {
    "@type": "Question"
    name: string
    acceptedAnswer: Answer
}

/**
 * Answer Schema
 * https://schema.org/Answer
 */
export interface Answer extends SchemaOrgBase {
    "@type": "Answer"
    text: string
}

/**
 * LocalBusiness Schema
 * https://schema.org/LocalBusiness
 */
export interface LocalBusiness extends SchemaOrgBase {
    "@type": "LocalBusiness"
    name: string
    description?: string
    url?: string
    telephone?: string
    email?: string
    address?: PostalAddress
    geo?: GeoCoordinates
    areaServed?: Place | string
    priceRange?: string
    image?: string | ImageObject
    sameAs?: string[]
    aggregateRating?: AggregateRating
    openingHoursSpecification?: OpeningHoursSpecification[]
    hasOfferCatalog?: OfferCatalog
}

/**
 * PostalAddress Schema
 * https://schema.org/PostalAddress
 */
export interface PostalAddress extends SchemaOrgBase {
    "@type": "PostalAddress"
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
}

/**
 * GeoCoordinates Schema
 * https://schema.org/GeoCoordinates
 */
export interface GeoCoordinates extends SchemaOrgBase {
    "@type": "GeoCoordinates"
    latitude: string | number
    longitude: string | number
}

/**
 * Place Schema (used for areaServed)
 * https://schema.org/Place
 */
export interface Place extends SchemaOrgBase {
    "@type": "Place" | "City" | "Country" | "State"
    name: string
    address?: PostalAddress
    geo?: GeoCoordinates
    addressLocality?: string
    addressRegion?: string
    addressCountry?: string
}

/**
 * OpeningHoursSpecification Schema
 * https://schema.org/OpeningHoursSpecification
 */
export interface OpeningHoursSpecification extends SchemaOrgBase {
    "@type": "OpeningHoursSpecification"
    dayOfWeek: string | string[]
    opens?: string
    closes?: string
}

/**
 * OfferCatalog Schema
 * https://schema.org/OfferCatalog
 */
export interface OfferCatalog extends SchemaOrgBase {
    "@type": "OfferCatalog"
    name: string
    itemListElement?: Offer[]
}

/**
 * Service Schema
 * https://schema.org/Service
 */
export interface Service extends SchemaOrgBase {
    "@type": "Service"
    name: string
    description?: string
    provider?: Organization | Person
    areaServed?: Place | string
    serviceType?: string
}

/**
 * Product Schema
 * https://schema.org/Product
 */
export interface Product extends SchemaOrgBase {
    "@type": "Product"
    name: string
    description?: string
    image?: string | ImageObject
    brand?: Brand | Organization
    offers?: Offer
}

/**
 * Organization Schema
 * https://schema.org/Organization
 */
export interface Organization extends SchemaOrgBase {
    "@type": "Organization"
    name: string
    url?: string
    logo?: ImageObject | string
    sameAs?: string[]
    contactPoint?: ContactPoint
}

/**
 * Person Schema
 * https://schema.org/Person
 */
export interface Person extends SchemaOrgBase {
    "@type": "Person"
    name: string
    email?: string
    telephone?: string
    url?: string
}

/**
 * Brand Schema
 * https://schema.org/Brand
 */
export interface Brand extends SchemaOrgBase {
    "@type": "Brand"
    name: string
    logo?: ImageObject | string
}

/**
 * ImageObject Schema
 * https://schema.org/ImageObject
 */
export interface ImageObject extends SchemaOrgBase {
    "@type": "ImageObject"
    url: string
    width?: string | number
    height?: string | number
    caption?: string
}

/**
 * ContactPoint Schema
 * https://schema.org/ContactPoint
 */
export interface ContactPoint extends SchemaOrgBase {
    "@type": "ContactPoint"
    telephone?: string
    email?: string
    contactType?: string
    availableLanguage?: string | string[]
}

/**
 * BreadcrumbList Schema
 * https://schema.org/BreadcrumbList
 */
export interface BreadcrumbList extends SchemaOrgBase {
    "@type": "BreadcrumbList"
    itemListElement: ListItem[]
}

/**
 * ListItem Schema (for breadcrumbs)
 * https://schema.org/ListItem
 */
export interface ListItem extends SchemaOrgBase {
    "@type": "ListItem"
    position: number
    name: string
    item?: string
}

/**
 * Graph type for multiple schemas
 */
export interface SchemaGraph {
    "@context": string
    "@graph": SchemaOrgBase[]
}

/**
 * Union type of all supported schemas
 */
export type SchemaType =
    | SoftwareApplication
    | FAQPage
    | LocalBusiness
    | BreadcrumbList
    | Organization
    | Product
    | Service
