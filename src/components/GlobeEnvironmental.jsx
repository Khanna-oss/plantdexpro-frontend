/**
 * GlobeEnvironmental.jsx — Phase 5
 * Rotating 3D globe with 7 environmental metric chips.
 * Zero new dependencies — pure React + Three.js + Framer Motion.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wind, TreePine, Thermometer, Zap, Leaf, CloudRain, Satellite, FlaskConical, Sun } from 'lucide-react';
import * as THREE from 'three';
import { geolocationService } from '../services/geolocationService.js';
import { environmentalResearchService } from '../services/environmentalResearchService.js';

const GLOBE_SIZE = 220;
const Globe = React.lazy(() => import('react-globe.gl'));
const EARTH_TEXTURE_URL = 'https://unpkg.com/three-globe/example/img/earth-night.jpg';
const EARTH_BUMP_URL = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

const clampLatitude = (value) => Math.max(-85, Math.min(85, value));
const normalizeLongitude = (value) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return ((value + 180) % 360 + 360) % 360 - 180;
};

const summarizeRegions = (regions = []) => {
  const validRegions = regions.filter(Boolean);
  if (validRegions.length === 0) {
    return null;
  }

  return validRegions.slice(0, 3).join(', ');
};

const buildPlantGeoContext = (plant) => {
  const nativeRegions = Array.isArray(plant?.trefleEnrichment?.distribution?.native)
    ? plant.trefleEnrichment.distribution.native.filter(Boolean)
    : [];
  const introducedRegions = Array.isArray(plant?.trefleEnrichment?.distribution?.introduced)
    ? plant.trefleEnrichment.distribution.introduced.filter(Boolean)
    : [];
  const habitat = plant?.habitat || plant?.botanicalData?.habitat || null;
  const speciesLabel = plant?.commonName || plant?.scientificName || 'Identified species';
  const nativeSummary = summarizeRegions(nativeRegions);

  return {
    speciesLabel,
    habitat,
    nativeRegions,
    introducedRegions,
    geographicContext: nativeSummary
      ? `Native range signals: ${nativeSummary}`
      : habitat
      ? `Habitat signal: ${habitat}`
      : 'Geographic context is anchored to the observation location.',
  };
};

const getMetricMessage = (node, fallback = 'Unavailable') => node?.message || fallback;

const formatMetricValue = (value, suffix = '', precision = 0) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return `${numericValue.toFixed(precision)}${suffix}`;
};

const MetricChip = ({ icon: Icon, label, value, status, loading }) => {
  const statusColor =
    status === 'good'
      ? '#86efac'
      : status === 'alert'
      ? '#fca5a5'
      : status === 'moderate'
      ? '#fcd34d'
      : status === 'warming'
      ? '#fca5a5'
      : status === 'cooling'
      ? '#93c5fd'
      : 'rgba(245,245,220,0.55)';

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/8 bg-white/4 hover:bg-white/6 transition-colors">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgba(0,255,65,0.15)]" style={{ background: 'rgba(0,255,65,0.07)' }}>
        <Icon size={13} className="text-[#00FF41]" />
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

export const GlobeEnvironmental = ({ plant = null }) => {
  const globeRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const plantContext = useMemo(() => buildPlantGeoContext(plant), [plant]);
  const focusPoint = useMemo(() => ({
    latitude: clampLatitude(Number(location?.latitude) || 28.6139),
    longitude: normalizeLongitude(Number(location?.longitude) || 77.2090),
  }), [location]);
  const pointData = useMemo(() => ([{
    lat: focusPoint.latitude,
    lng: focusPoint.longitude,
    color: '#00FF41',
    altitude: 0.16,
    radius: 0.68,
  }]), [focusPoint.latitude, focusPoint.longitude]);
  const labelData = useMemo(() => ([{
    lat: focusPoint.latitude,
    lng: focusPoint.longitude,
    text: locationName?.city
      ? `${locationName.city} · ${plantContext.speciesLabel}`
      : `${plantContext.speciesLabel} · Observation zone`,
    color: '#00FF41',
  }]), [focusPoint.latitude, focusPoint.longitude, locationName, plantContext.speciesLabel]);

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

  useEffect(() => {
    if (!globeRef.current) {
      return;
    }

    const controls = globeRef.current.controls?.();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.45;
      controls.enablePan = false;
      controls.minDistance = 220;
      controls.maxDistance = 320;
    }

    const material = globeRef.current.globeMaterial?.();
    if (material) {
      material.color = new THREE.Color('#08120d');
      material.emissive = new THREE.Color('#123b21');
      material.emissiveIntensity = 0.55;
      material.shininess = 18;
    }
  }, []);

  useEffect(() => {
    if (!globeRef.current) {
      return;
    }

    globeRef.current.pointOfView(
      {
        lat: focusPoint.latitude,
        lng: focusPoint.longitude,
        altitude: 1.8,
      },
      1200
    );
  }, [focusPoint.latitude, focusPoint.longitude]);

  const metrics = [
    {
      icon: MapPin,
      label: 'Plant Context',
      value: plantContext.geographicContext,
      status: plantContext.nativeRegions.length > 0 ? 'good' : 'moderate',
    },
    {
      icon: Wind,
      label: 'Air Quality',
      value: researchData?.airQuality?.available
        ? `PM2.5 · ${formatMetricValue(researchData.airQuality.pm25?.value, ' μg/m³', 0) || 'Reading limited'}`
        : getMetricMessage(researchData?.airQuality, 'No nearby station'),
      status: !researchData?.airQuality?.available
        ? 'neutral'
        : (researchData?.airQuality?.pm25?.value ?? 999) < 15
        ? 'good'
        : (researchData?.airQuality?.pm25?.value ?? 999) < 35
        ? 'moderate'
        : 'alert',
    },
    {
      icon: TreePine,
      label: 'Forest Cover',
      value: researchData?.deforestation?.available
        ? `${researchData.deforestation.severity?.toUpperCase()} Impact`
        : getMetricMessage(researchData?.deforestation, 'Forest data unavailable'),
      status: researchData?.deforestation?.severity === 'high'
        ? 'alert'
        : researchData?.deforestation?.severity === 'moderate'
        ? 'moderate'
        : researchData?.deforestation?.severity === 'low'
        ? 'good'
        : 'neutral',
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: researchData?.climate?.available
        ? `${formatMetricValue(researchData.climate.currentTemperatureC, '°C', 1) || 'Live reading limited'} current`
        : getMetricMessage(researchData?.climate, 'Climate baseline unavailable'),
      status: !researchData?.climate?.available
        ? 'neutral'
        : Number(researchData?.climate?.deviationFromRecentAverageC) > 1
        ? 'alert'
        : Number(researchData?.climate?.deviationFromRecentAverageC) > 0
        ? 'warming'
        : Number(researchData?.climate?.deviationFromRecentAverageC) < -1
        ? 'cooling'
        : 'good',
    },
    {
      icon: Zap,
      label: 'Carbon',
      value: researchData?.carbon?.available
        ? `${formatMetricValue(researchData.carbon.intensity, ' gCO₂/kWh', 0) || 'Regional estimate'}${researchData?.carbon?.estimated ? ' est.' : ''}`
        : getMetricMessage(researchData?.carbon, 'Carbon context unavailable'),
      status: !researchData?.carbon?.available
        ? 'neutral'
        : researchData?.carbon?.estimated
        ? 'moderate'
        : researchData?.carbon?.index === 'low'
        ? 'good'
        : researchData?.carbon?.index === 'high'
        ? 'alert'
        : 'moderate',
    },
    {
      icon: Leaf,
      label: 'Biodiversity',
      value: researchData?.biodiversity?.available
        ? `${researchData.biodiversity.speciesCount?.toLocaleString()} spp`
        : getMetricMessage(researchData?.biodiversity, 'Biodiversity context unavailable'),
      status: researchData?.biodiversity?.richness === 'high'
        ? 'good'
        : researchData?.biodiversity?.richness === 'moderate'
        ? 'moderate'
        : researchData?.biodiversity?.richness === 'low'
        ? 'alert'
        : 'neutral',
    },
    {
      icon: CloudRain,
      label: 'Precipitation',
      value: researchData?.satellite?.available
        ? `${formatMetricValue(researchData.satellite.averageDailyPrecipitationMm, ' mm/day', 2) || 'Seasonal average limited'}`
        : getMetricMessage(researchData?.satellite, 'Satellite rain context unavailable'),
      status: researchData?.satellite?.available ? 'moderate' : 'neutral',
    },
    {
      icon: Satellite,
      label: 'Solar Flux',
      value: researchData?.satellite?.available
        ? `${formatMetricValue(researchData.satellite.solarRadiationKwhm2Day, ' kWh/m²', 2) || 'Flux limited'}`
        : getMetricMessage(researchData?.satellite, 'Solar flux unavailable'),
      status: researchData?.satellite?.available ? 'good' : 'neutral',
    },
    {
      icon: FlaskConical,
      label: 'Soil pH',
      value: researchData?.soil?.available
        ? `${formatMetricValue(researchData.soil.ph, '', 1) ? `pH ${formatMetricValue(researchData.soil.ph, '', 1)}` : 'pH limited'} · ${researchData.soil.dominantTexture || 'Texture mixed'}`
        : getMetricMessage(researchData?.soil, 'Soil profile unavailable'),
      status: !researchData?.soil?.available
        ? 'neutral'
        : Number(researchData?.soil?.ph) >= 6 && Number(researchData?.soil?.ph) <= 7.5
        ? 'good'
        : 'moderate',
    },
    {
      icon: Sun,
      label: 'Daylight',
      value: researchData?.solar?.available
        ? researchData.solar.dayLength || 'Available'
        : getMetricMessage(researchData?.solar, 'Daylight timing unavailable'),
      status: researchData?.solar?.available ? 'good' : 'neutral',
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
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,65,0.007) 3px, rgba(0,255,65,0.007) 4px)',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#00FF41]/40">
            ENV_INTELLIGENCE · LIVE
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <MapPin size={10} className="text-[#00FF41]/50" />
            <span className="text-[9px] font-bold text-[var(--cream)]/40 truncate max-w-[180px]">
              {loading ? 'Detecting location...' : locationName?.displayName || 'Unknown Location'}
            </span>
          </div>
        </div>

        {/* Globe + Metrics */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Globe canvas */}
          <div className="relative flex-shrink-0 flex flex-col items-center w-full sm:w-auto">
            <div className="command-center-globe-shell">
              <React.Suspense
                fallback={(
                  <div className="command-center-globe-fallback animate-pulse-soft">
                    <div className="command-center-globe-fallback-orbit" />
                  </div>
                )}
              >
                <Globe
                  ref={globeRef}
                  width={GLOBE_SIZE + 36}
                  height={GLOBE_SIZE + 36}
                  backgroundColor="rgba(0,0,0,0)"
                  globeImageUrl={EARTH_TEXTURE_URL}
                  bumpImageUrl={EARTH_BUMP_URL}
                  showAtmosphere
                  atmosphereColor="#00FF41"
                  atmosphereAltitude={0.17}
                  pointsData={pointData}
                  pointLat="lat"
                  pointLng="lng"
                  pointColor="color"
                  pointAltitude="altitude"
                  pointRadius="radius"
                  labelsData={labelData}
                  labelLat="lat"
                  labelLng="lng"
                  labelText="text"
                  labelColor="color"
                  labelSize={() => 1.1}
                  labelDotRadius={() => 0.32}
                  labelAltitude={() => 0.08}
                />
              </React.Suspense>
            </div>
            <p className="mt-2 text-[7px] font-black uppercase tracking-[0.3em] text-[var(--cream)]/18">
              EARTH · LIVE SYNC
            </p>
            <div className="mt-3 w-full max-w-[280px] rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-left">
              <p className="text-[7px] font-black uppercase tracking-[0.24em] text-[#00FF41]/60 mb-1">
                SPECIES GEO CONTEXT
              </p>
              <p className="text-[10px] font-semibold leading-relaxed text-[var(--cream)]/75">
                {plantContext.geographicContext}
              </p>
            </div>
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
            9 Research APIs · 24h Cache · OpenAQ · NASA · GBIF · SoilGrids
          </span>
          <span className="text-[8px] text-[var(--cream)]/12 tracking-widest uppercase">
            SAVE_SOIL · ENV v1.0
          </span>
        </div>
      </div>
    </motion.div>
  );
};
