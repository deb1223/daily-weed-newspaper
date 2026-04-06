import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const unfraktur = await fetch(
    new URL('https://fonts.gstatic.com/s/unifrakturmaguntia/v21/WWXPlh98MazZmIvvS42qFsAjvDYRFqfHHx8k.woff2')
  ).then(res => res.arrayBuffer())

  const playfair = await fetch(
    new URL('https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.woff2')
  ).then(res => res.arrayBuffer())

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        background: '#f4f0e4',
        border: '6px double #1a1008',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Masthead */}
        <div style={{
          padding: '20px 60px 16px',
          borderBottom: '3px double #1a1008',
          textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{ fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: '0.2em', color: '#6b5e45', textTransform: 'uppercase', marginBottom: 8 }}>
            Las Vegas, Nevada · Est. 2026 · Free Daily Edition
          </div>
          <div style={{ fontFamily: 'Unfraktur', fontSize: 88, color: '#1a1008', lineHeight: 1 }}>
            Daily Weed Newspaper
          </div>
          <div style={{ fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: '0.18em', color: '#6b5e45', textTransform: 'uppercase', marginTop: 8, borderTop: '1px solid #c8b99a', paddingTop: 8 }}>
            Cannabis Price Intelligence · 16 Dispensaries · Updated Hourly
          </div>
        </div>
        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 100px', gap: 16 }}>
          <div style={{ fontFamily: 'SpaceMono', fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2d6a4f', borderBottom: '2px solid #2d6a4f', paddingBottom: 5 }}>
            Breaking
          </div>
          <div style={{ fontFamily: 'Playfair', fontSize: 58, fontWeight: 900, color: '#1a1008', lineHeight: 1.1, textAlign: 'center' }}>
            The Only Cannabis Publication That Actually Gives a Damn About Your Wallet.
          </div>
        </div>
        {/* Footer */}
        <div style={{ background: '#1a1008', padding: '14px 60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <span style={{ fontFamily: 'SpaceMono', fontSize: 13, color: '#f4f0e4', letterSpacing: '0.14em', textTransform: 'uppercase' }}>dailyweednewspaper.com</span>
          <span style={{ color: '#2d6a4f', fontSize: 18 }}>✦</span>
          <span style={{ fontFamily: 'SpaceMono', fontSize: 13, color: '#f4f0e4', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Las Vegas, NV</span>
          <span style={{ color: '#2d6a4f', fontSize: 18 }}>✦</span>
          <span style={{ fontFamily: 'SpaceMono', fontSize: 13, color: '#f4f0e4', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Pro — $9/mo</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Unfraktur', data: unfraktur, style: 'normal' },
        { name: 'Playfair', data: playfair, weight: 900, style: 'normal' },
      ],
    }
  )
}
