/**
 * SEO Constants
 * Centralized configuration for SEO-related URLs and metadata
 */

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gestmais.pt'

export const SITE_NAME = 'GestMais'

export const DEFAULT_METADATA = {
    title: 'GestMais - gestão de condominios inteligente',
    description: 'O sistema de gestão de condomínios de alta densidade desenhado para transparência e velocidade. 3€ por fração/mês.',
} as const

export const SOCIAL_METADATA = {
    openGraph: {
        type: 'website' as const,
        locale: 'pt_PT' as const,
        siteName: SITE_NAME,
    },
} as const

export const OG_IMAGE = {
    width: 1200,
    height: 630,
    alt: 'GestMais - Sistema de Gestão de Condomínios',
} as const
