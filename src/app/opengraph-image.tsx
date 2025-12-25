import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'GestMais - Sistema de Gestão de Condomínios'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    border: '20px solid #e2e8f0', // slate-200
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            background: '#0f172a', // slate-900
                            color: 'white',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: 700,
                        }}
                    >
                        G
                    </div>
                    <span
                        style={{
                            fontSize: '40px',
                            fontWeight: 800,
                            color: '#0f172a', // slate-900
                            letterSpacing: '-0.05em',
                        }}
                    >
                        GestMais
                    </span>
                </div>

                <div
                    style={{
                        fontSize: '60px',
                        fontWeight: 900,
                        textAlign: 'center',
                        color: '#0f172a', // slate-900
                        lineHeight: 1.1,
                        marginBottom: '20px',
                        letterSpacing: '-0.025em',
                    }}
                >
                    Engenharia de Precisão
                    <br />
                    para Condomínios.
                </div>

                <div
                    style={{
                        fontSize: '24px',
                        color: '#64748b', // slate-500
                        textAlign: 'center',
                        maxWidth: '800px',
                    }}
                >
                    O sistema de gestão de condomínios de alta densidade desenhado para transparência e velocidade.
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
