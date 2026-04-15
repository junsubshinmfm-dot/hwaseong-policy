'use client';

import type { WeatherType } from '@/hooks/useWeather';

interface WeatherEffectsProps {
  type: WeatherType;
}

export default function WeatherEffects({ type }: WeatherEffectsProps) {
  if (type === 'clear') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden rounded-2xl">
      {(type === 'rain' || type === 'drizzle' || type === 'thunderstorm') && (
        <div className="absolute inset-0 animate-rain-fall"
          style={{
            background: `repeating-linear-gradient(
              transparent, transparent 4px,
              rgba(174,194,224,0.15) 4px, rgba(174,194,224,0.15) 5px
            )`,
            backgroundSize: '100% 20px',
          }}
        />
      )}

      {type === 'snow' && (
        <div className="absolute inset-0 animate-snow-fall"
          style={{
            backgroundImage: `
              radial-gradient(3px 3px at 20% 30%, rgba(255,255,255,0.8), transparent),
              radial-gradient(2px 2px at 40% 60%, rgba(255,255,255,0.7), transparent),
              radial-gradient(3px 3px at 60% 20%, rgba(255,255,255,0.8), transparent),
              radial-gradient(2px 2px at 80% 50%, rgba(255,255,255,0.6), transparent),
              radial-gradient(2px 2px at 10% 80%, rgba(255,255,255,0.7), transparent),
              radial-gradient(3px 3px at 50% 90%, rgba(255,255,255,0.8), transparent)
            `,
            backgroundSize: '200px 200px',
          }}
        />
      )}

      {type === 'fog' && (
        <div className="absolute inset-0 animate-pulse"
          style={{
            background: `linear-gradient(to bottom,
              rgba(200,210,230,0.4) 0%, rgba(200,210,230,0.2) 40%,
              rgba(200,210,230,0.35) 70%, rgba(200,210,230,0.5) 100%
            )`,
          }}
        />
      )}

      {type === 'clouds' && (
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120px 40px at 25% 15%, rgba(180,195,220,0.4), transparent),
              radial-gradient(ellipse 150px 50px at 65% 20%, rgba(180,195,220,0.35), transparent),
              radial-gradient(ellipse 100px 35px at 85% 10%, rgba(180,195,220,0.3), transparent)
            `,
          }}
        />
      )}

      {type === 'thunderstorm' && (
        <div className="absolute inset-0 animate-pulse opacity-0"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        />
      )}
    </div>
  );
}
