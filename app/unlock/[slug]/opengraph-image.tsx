import { ImageResponse } from 'next/og';
import { sql } from '@/lib/db';

export const runtime = 'edge';

export const alt = 'Xyno Secured Link';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Default State
  let title = 'Secured Link';
  let isLocked = false;
  let requirementText = '';

  try {
    const result = await sql`
        SELECT title, access_policy
        FROM urls
        WHERE short_code = ${slug}
        LIMIT 1
    `;

    if (result.length > 0) {
        const link = result[0];
        title = link.title || 'Secured Content';
        
        if (link.access_policy && Object.keys(link.access_policy).length > 0) {
            isLocked = true;
            const p = link.access_policy;
            requirementText = `Req: ${p.minBalance} ${p.type === 'nft' ? 'NFT' : 'Token'}`;
        }
    }
  } catch (e) {
    // Fallback if DB fails
    console.error(e);
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Background Grid Pattern */}
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)',
                backgroundSize: '40px 40px',
                opacity: 0.3,
            }}
        />

        {/* Border Glow */}
        <div 
            style={{
                position: 'absolute',
                inset: '20px',
                border: isLocked ? '2px solid #ef4444' : '2px solid #22c55e', // Red if locked, Green if open
                borderRadius: '20px',
                opacity: 0.5,
                display: 'flex'
            }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: 80,
            marginBottom: 20,
            color: isLocked ? '#ef4444' : '#22c55e',
          }}
        >
          {isLocked ? '🔒' : '⚡'}
        </div>

        {/* Title */}
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontWeight: 'bold',
            textAlign: 'center',
            maxWidth: '800px',
            marginBottom: 20,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {title}
        </div>

        {/* Requirement Badge */}
        {isLocked && (
            <div
                style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    padding: '10px 30px',
                    borderRadius: '50px',
                    color: '#888',
                    fontSize: 30,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {requirementText}
            </div>
        )}

        {/* Footer Brand */}
        <div
            style={{
                position: 'absolute',
                bottom: 40,
                fontSize: 24,
                color: '#444',
                letterSpacing: '0.2em',
            }}
        >
            XYNO PROTOCOL // BASE
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
