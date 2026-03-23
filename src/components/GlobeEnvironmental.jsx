/**
 * GlobeEnvironmental.jsx — Phase 5
 * Rotating canvas globe with 7 environmental metric chips.
 * Zero new dependencies — pure React + Canvas + Framer Motion.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wind, TreePine, Thermometer, Zap, Leaf, CloudRain, Satellite } from 'lucide-react';
import { geolocationService } from '../services/geolocationService.js';
import { environmentalResearchService } from '../services/environmentalResearchService.js';

const GLOBE_SIZE = 220;
const GLOBE_R = 97;

function drawGlobe(ctx, rotAngle, lat, lon) {
  const cx = GLOBE_SIZE / 2;
  const cy = GLOBE_SIZE / 2;
  const r = GLOBE_R;

  ctx.clearRect(0, 0, GLOBE_SIZE, GLOBE_SIZE);

  // Outer atmosphere glow
  const atmGrad = ctx.createRadialGradient(cx, cy, r * 0.88, cx, cy, r * 1.22);
  atmGrad.addColorStop(0, 'rgba(20,80,20,0)');
  atmGrad.addColorStop(0.5, 'rgba(30,100,30,0.14)');
  atmGrad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
  ctx.fillStyle = atmGrad;
  ctx.fill();

  // Sphere fill
  const grad = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.3, r * 0.06, cx, cy, r);
  grad.addColorStop(0, '#1e5229');
  grad.addColorStop(0.38, '#0c1e0f');
  grad.addColorStop(1, '#010503');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Clip to sphere for grid
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
  ctx.clip();

  // Latitude lines
  [-60, -30, 0, 30, 60].forEach((latDeg) => {
    const latRad = (latDeg * Math.PI) / 180;
    const yPos = cy + r * Math.sin(latRad);
    const xr = Math.abs(r * Math.cos(latRad));
    ctx.beginPath();
    ctx.ellipse(cx, yPos, xr, xr * 0.12, 0, 0, Math.PI * 2);
    ctx.strokeStyle = latDeg === 0 ? 'rgba(204,255,0,0.22)' : 'rgba(204,255,0,0.1)';
    ctx.lineWidth = latDeg === 0 ? 0.9 : 0.55;
    ctx.stroke();
  });

  // Longitude lines (rotating)
  for (let i = 0; i < 12; i++) {
    const angleDeg = (i * 30 + rotAngle) % 360;
    const angleRad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const xScale = Math.abs(cosA);
    if (xScale > 0.05) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * xScale, r, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(204,255,0,${0.04 + xScale * 0.1})`;
      ctx.lineWidth = 0.55;
      ctx.stroke();
    }
  }

  ctx.restore();

  // User location pin
  if (lat !== null && lon !== null) {
    const lonAdjusted = ((lon + rotAngle) % 360);
    const lonRad = (lonAdjusted * Math.PI) / 180;
    const latRad = (lat * Math.PI) / 180;
    const depth = Math.cos(lonRad);

    if (depth > 0.1) {
      const px = cx + r * Math.cos(latRad) * Math.sin(lonRad);
      const py = cy - r * Math.sin(latRad);
      const alpha = Math.min(1, depth);

      const glowR = 15 * alpha;
      const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      glowGrad.addColorStop(0, `rgba(204,255,0,${alpha * 0.9})`);
      glowGrad.addColorStop(0.4, `rgba(204,255,0,${alpha * 0.3})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, 3.2 * alpha, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(204,255,0,${alpha})`;
      ctx.fill();
    }
  }

  // Specular highlight
  const specGrad = ctx.createRadialGradient(cx - r * 0.36, cy - r * 0.36, 0, cx - r * 0.36, cy - r * 0.36, r * 0.5);
  specGrad.addColorStop(0, 'rgba(255,255,255,0.045)');
  specGrad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = specGrad;
  ctx.fill();

  // Edge shadow
  const edgeGrad = ctx.createRadialGradient(cx, cy, r * 0.72, cx, cy, r);
  edgeGrad.addColorStop(0, 'transparent');
  edgeGrad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = edgeGrad;
  ctx.fill();
}

const MetricChip = ({ icon: Icon, label, value, status, loading }) => {
  const statusColor =
    status === 'good' || status === 'low' || status === 'high'
      ? '#86efac'
      : status === 'moderate'
      ? '#fcd34d'
      : status === 'warming'
      ? '#fca5a5'
      : status === 'cooling'
      ? '#93c5fd'
      : 'rgba(245,245,220,0.55)';

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/8 bg-white/4 hover:bg-white/6 transition-colors">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgba(204,255,0,0.15)]" style={{ background: 'rgba(204,255,0,0.07)' }}>
        <Icon size={13} className="text-[#CCFF00]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[var(--cream)]/30 leading-none mb-0.5">{label}</p>
        {loading ? (
          <div className="h-2.5 w-14 bg-white/10 rounded animate-pulse mt-0.5" />
        ) : (
          <p className="text-[10px] font-bold truncate leading-tight" style={{ color: statusColor }}>
            {value || '—'}
          </p>
        )}
      </div>
    </div>
  );
};

export const GlobeEnvironmental = () => {
  const canvasRef = useRef(null);
  const rotRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animate = (time) => {
      if (time - lastTimeRef.current > 50) {
        rotRef.current = (rotRef.current + 0.28) % 360;
        drawGlobe(
          ctx,
          rotRef.current,
          location?.latitude ?? null,
          location?.longitude ?? null
        );
        lastTimeRef.current = time;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [location]);

  useEffect(() => {
    const load = async () => {
      try {
        const loc = await geolocationService.getUserLocation();
        setLocation(loc);
        const name = await geolocationService.getLocationName(loc.latitude, loc.longitude);
        setLocationName(name);
        const data = await environmentalResearchService.getAllResearchData(
          loc.latitude,
          loc.longitude
        );
        setResearchData(data);
      } catch (e) {
        console.error('GlobeEnvironmental data error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metrics = [
    {
      icon: Wind,
      label: 'Air Quality',
      value: researchData?.airQuality?.available
        ? `PM2.5 · ${researchData.airQuality.pm25?.value?.toFixed(0) ?? '—'} μg/m³`
        : 'Unavailable',
      status:
        (researchData?.airQuality?.pm25?.value ?? 999) < 35
          ? 'good'
          : 'moderate',
    },
    {
      icon: TreePine,
      label: 'Forest Cover',
      value: researchData?.deforestation?.available
        ? `${researchData.deforestation.severity?.toUpperCase()} Impact`
        : 'Unavailable',
      status: researchData?.deforestation?.severity ?? 'moderate',
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: researchData?.weather?.available
        ? `${researchData.weather.current.temperature}°C Current`
        : 'Unavailable',
      status: researchData?.weather?.trend?.temperature ?? 'moderate',
    },
    {
      icon: Zap,
      label: 'Carbon',
      value: researchData?.carbon?.available
        ? `${researchData.carbon.intensity} gCO₂/kWh`
        : 'Unavailable',
      status: researchData?.carbon?.index ?? 'moderate',
    },
    {
      icon: Leaf,
      label: 'Biodiversity',
      value: researchData?.biodiversity?.available
        ? `${researchData.biodiversity.speciesCount?.toLocaleString()} spp`
        : 'Unavailable',
      status: researchData?.biodiversity?.richness ?? 'moderate',
    },
    {
      icon: CloudRain,
      label: 'Precipitation',
      value: researchData?.satellite?.available
        ? researchData.satellite.precipitation
        : 'Unavailable',
      status: 'moderate',
    },
    {
      icon: Satellite,
      label: 'Satellite',
      value: researchData?.satellite?.available ? 'NASA POWER · Live' : 'Unavailable',
      status: 'good',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="research-metrics-panel p-5 md:p-6 relative overflow-hidden"
    >
      {/* CRT scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(204,255,0,0.007) 3px, rgba(204,255,0,0.007) 4px)',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#CCFF00]/40">
            ENV_INTELLIGENCE · LIVE
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <MapPin size={10} className="text-[#CCFF00]/50" />
            <span className="text-[9px] font-bold text-[var(--cream)]/40 truncate max-w-[180px]">
              {loading ? 'Detecting location...' : locationName?.displayName || 'Unknown Location'}
            </span>
          </div>
        </div>

        {/* Globe + Metrics */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Globe canvas */}
          <div className="relative flex-shrink-0 flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={GLOBE_SIZE}
              height={GLOBE_SIZE}
              style={{ borderRadius: '50%' }}
            />
            <p className="mt-2 text-[7px] font-black uppercase tracking-[0.3em] text-[var(--cream)]/18">
              EARTH · LIVE SYNC
            </p>
          </div>

          {/* Metric chips */}
          <div className="flex-1 grid grid-cols-1 gap-2 w-full">
            {metrics.map((m) => (
              <MetricChip key={m.label} {...m} loading={loading} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--cream)]/18">
            7 Research APIs · 24h Cache · OpenAQ · GFW · NASA · GBIF
          </span>
          <span className="text-[8px] text-[var(--cream)]/12 tracking-widest uppercase">
            SAVE_SOIL · ENV v1.0
          </span>
        </div>
      </div>
    </motion.div>
  );
};
