/**
 * Research Data Cards Component
 * Displays 7 environmental research modules with loading states
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, TreePine, Thermometer, Satellite, Zap,
  CloudRain, Leaf, AlertCircle, Sun, FlaskConical,
  MapPin, Database
} from 'lucide-react';
import { geolocationService } from '../services/geolocationService.js';
import { environmentalResearchService } from '../services/environmentalResearchService.js';

const LoadingShimmer = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-[#00FF41]/10 rounded w-3/4"></div>
    <div className="h-3 bg-white/8 rounded w-5/6"></div>
    <div className="h-3 bg-white/8 rounded w-2/3"></div>
  </div>
);

const DataUnavailable = ({ message = 'Context currently unavailable' }) => (
  <div className="flex items-start gap-2 text-[#ffb84d] text-sm leading-relaxed">
    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

const formatMetric = (value, precision = 1) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(precision) : '—';
};

const hasMetric = (value) => Number.isFinite(Number(value));

const formatMetricWithUnit = (value, unit = '', precision = 1, fallback = 'Currently unavailable') => {
  if (!hasMetric(value)) {
    return fallback;
  }

  return `${formatMetric(value, precision)}${unit ? ` ${unit}` : ''}`;
};

const formatCoordinate = (value, axis) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return '—';
  }

  const suffix = axis === 'lat'
    ? numericValue >= 0 ? 'N' : 'S'
    : numericValue >= 0 ? 'E' : 'W';

  return `${Math.abs(numericValue).toFixed(2)}°${suffix}`;
};

const getMessage = (node, fallback) => node?.message || node?.error || fallback;

const valueToneClass = {
  good: 'text-emerald-300',
  moderate: 'text-amber-300',
  alert: 'text-rose-300',
  neutral: 'text-[var(--cream)]'
};

const badgeToneClass = {
  live: 'bg-[#00FF41]/10 text-[#86efac] border border-[#00FF41]/20',
  estimated: 'bg-amber-500/10 text-amber-300 border border-amber-400/20',
  limited: 'bg-rose-500/10 text-rose-300 border border-rose-400/20'
};

const InsightRow = ({ icon: Icon, label, value, detail, tone = 'neutral' }) => (
  <div className="rounded-xl border border-white/8 bg-white/4 px-3 py-3">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 border border-[#00FF41]/15 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-[#00FF41]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--cream)]/42 mb-1">
          {label}
        </p>
        <p className={`text-sm font-bold leading-snug ${valueToneClass[tone] || valueToneClass.neutral}`}>
          {value}
        </p>
        {detail && (
          <p className="text-xs text-[var(--cream)]/48 leading-relaxed mt-1">
            {detail}
          </p>
        )}
      </div>
    </div>
  </div>
);

const ResearchCard = ({ icon: Icon, title, subtitle, summary, badge = 'live', children, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 rounded-2xl p-5 border border-[#00FF41]/10 hover:bg-white/7 hover:border-[#00FF41]/18 transition-all shadow-[0_0_24px_rgba(0,255,65,0.04)]"
  >
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 border border-[#00FF41]/20 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-[#00FF41]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#00FF41]">
            {title}
          </h3>
          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em] ${badgeToneClass[badge] || badgeToneClass.live}`}>
            {badge}
          </span>
        </div>
        <p className="text-xs text-[var(--cream)]/50 leading-relaxed">{subtitle}</p>
      </div>
    </div>
    <p className="text-sm text-[var(--cream)]/70 leading-relaxed mb-4">{summary}</p>
    <div className="space-y-3">
      {loading ? <LoadingShimmer /> : children}
    </div>
  </motion.div>
);

export const ResearchDataCards = () => {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResearchData();
  }, []);

  const loadResearchData = async () => {
    try {
      setLoading(true);

      const userLocation = await geolocationService.getUserLocation();
      setLocation(userLocation);

      const locName = await geolocationService.getLocationName(
        userLocation.latitude,
        userLocation.longitude
      );
      setLocationName(locName);

      const data = await environmentalResearchService.getAllResearchData(
        userLocation.latitude,
        userLocation.longitude
      );
      setResearchData(data);
    } catch (error) {
      console.error('Research data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pm25Value = researchData?.airQuality?.pm25?.value;
  const pm25Tone = Number.isFinite(pm25Value)
    ? pm25Value < 15 ? 'good' : pm25Value < 35 ? 'moderate' : 'alert'
    : 'neutral';
  const biodiversityTone = researchData?.biodiversity?.richness === 'high'
    ? 'good'
    : researchData?.biodiversity?.richness === 'moderate'
    ? 'moderate'
    : researchData?.biodiversity?.richness === 'low'
    ? 'alert'
    : 'neutral';
  const forestTone = researchData?.deforestation?.severity === 'low'
    ? 'good'
    : researchData?.deforestation?.severity === 'moderate'
    ? 'moderate'
    : researchData?.deforestation?.severity === 'high'
    ? 'alert'
    : 'neutral';
  const carbonTone = researchData?.carbon?.index === 'low'
    ? 'good'
    : researchData?.carbon?.index === 'moderate'
    ? 'moderate'
    : researchData?.carbon?.index === 'high'
    ? 'alert'
    : 'neutral';
  const currentClimateLabel = hasMetric(researchData?.climate?.currentTemperatureC)
    ? `${formatMetric(researchData.climate.currentTemperatureC, 1)}°C now`
    : 'Current reading unavailable';
  const averageClimateLabel = hasMetric(researchData?.climate?.averageTemperatureC)
    ? `${formatMetric(researchData.climate.averageTemperatureC, 1)}°C recent average`
    : 'Recent average unavailable';

  const geoAvailable = Boolean(locationName || location || researchData?.climate?.available || researchData?.solar?.available || researchData?.satellite?.available);
  const airAvailable = Boolean(researchData?.airQuality?.available || researchData?.weather?.available || researchData?.climate?.available);
  const ecoAvailable = Boolean(researchData?.biodiversity?.available || researchData?.deforestation?.available || researchData?.carbon?.available || researchData?.satellite?.available);
  const soilAvailable = Boolean(researchData?.soil?.available);

  return (
    <div className="space-y-6 font-mono">
      <div className="flex items-start gap-3 px-4 py-4 bg-white/5 rounded-2xl border border-[#00FF41]/10">
        <MapPin size={16} className="text-[#00FF41] mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00FF41]/65">
            EARTH_INTELLIGENCE//LOCAL_CONTEXT
          </p>
          <p className="text-sm text-[var(--cream)] mt-1 leading-relaxed">
            {loading
              ? 'Preparing readable regional context...'
              : locationName?.displayName || 'Using a fallback observation region for context.'}
          </p>
          <p className="text-xs text-[var(--cream)]/45 mt-1">
            These panels translate live research feeds into plain-language growing conditions around the detected plant location.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ResearchCard
          icon={MapPin}
          title="SYS.GEO"
          subtitle="Where this observation sits in time, place, and daylight context"
          summary="This module anchors the plant result to a real observation zone so the rest of the telemetry stays understandable."
          badge={geoAvailable ? 'live' : 'limited'}
          loading={loading}
        >
          {geoAvailable ? (
            <div className="space-y-3">
              <InsightRow
                icon={MapPin}
                label="Observation zone"
                value={locationName?.displayName || 'Observation zone currently unavailable'}
                detail={location
                  ? `${formatCoordinate(location.latitude, 'lat')} · ${formatCoordinate(location.longitude, 'lng')}`
                  : 'Regional estimates use device location when available.'}
              />
              <InsightRow
                icon={Satellite}
                label="Satellite window"
                value={researchData?.satellite?.available
                  ? researchData.satellite.period
                  : getMessage(researchData?.satellite, 'Satellite history currently unavailable')}
                detail={researchData?.satellite?.available
                  ? `${researchData.satellite.dataSource} · ${researchData.satellite.note}`
                  : 'Recent satellite context helps compare current conditions with the recent season.'}
              />
              <InsightRow
                icon={Sun}
                label="Daylight cycle"
                value={researchData?.solar?.available
                  ? `${researchData.solar.sunriseLocal || '—'} → ${researchData.solar.sunsetLocal || '—'}`
                  : getMessage(researchData?.solar, 'Daylight timing currently unavailable')}
                detail={researchData?.solar?.available
                  ? `Day length ${researchData.solar.dayLength || '—'} · Solar noon ${researchData.solar.solarNoonLocal || '—'}`
                  : 'Sunrise and sunset help explain daily energy available to leaves and flowers.'}
                tone="good"
              />
              <InsightRow
                icon={Thermometer}
                label="Regional climate baseline"
                value={researchData?.climate?.available
                  ? `${currentClimateLabel} · ${averageClimateLabel}`
                  : getMessage(researchData?.climate, 'Regional climate summary currently unavailable')}
                detail={researchData?.climate?.available
                  ? `${researchData.climate.note || 'Climate summaries combine recent weather and satellite baselines.'} · Average daily rain ${formatMetricWithUnit(researchData.climate.averageDailyPrecipitationMm, 'mm', 2, 'unavailable')}`
                  : 'Climate summaries combine recent weather and satellite baselines.'}
                tone={Number(researchData?.climate?.deviationFromRecentAverageC) > 1 ? 'moderate' : 'neutral'}
              />
            </div>
          ) : (
            <DataUnavailable message="Geographic context is currently unavailable for this observation." />
          )}
        </ResearchCard>

        <ResearchCard
          icon={Wind}
          title="SYS.AIR"
          subtitle="Air quality and weather conditions that can influence plant stress"
          summary="This module converts atmospheric feeds into direct signals about air cleanliness, moisture, and temperature pressure."
          badge={airAvailable ? 'live' : 'limited'}
          loading={loading}
        >
          {airAvailable ? (
            <div className="space-y-3">
              <InsightRow
                icon={Wind}
                label="Particle load"
                value={hasMetric(researchData?.airQuality?.pm25?.value)
                  ? `PM2.5 ${formatMetricWithUnit(researchData.airQuality.pm25.value, researchData.airQuality.pm25.unit, 1)}`
                  : getMessage(researchData?.airQuality, 'Particle readings currently unavailable')}
                detail={researchData?.airQuality?.location
                  ? `Nearest station: ${researchData.airQuality.location}`
                  : 'Fine particulate matter can affect leaf surfaces and overall plant vigor.'}
                tone={pm25Tone}
              />
              <InsightRow
                icon={AlertCircle}
                label="Reactive gases"
                value={researchData?.airQuality?.no2 || researchData?.airQuality?.o3
                  ? `NO₂ ${researchData?.airQuality?.no2 ? `${formatMetric(researchData.airQuality.no2.value, 1)} ${researchData.airQuality.no2.unit}` : '—'} · O₃ ${researchData?.airQuality?.o3 ? `${formatMetric(researchData.airQuality.o3.value, 1)} ${researchData.airQuality.o3.unit}` : '—'}`
                  : 'Nitrogen dioxide and ozone readings currently unavailable'}
                detail="These gases help explain pollution stress in urban and roadside environments."
              />
              <InsightRow
                icon={CloudRain}
                label="Moisture and wind"
                value={researchData?.weather?.available
                  ? `${formatMetricWithUnit(researchData.weather.current.precipitation, 'mm', 1, 'Rainfall unavailable')} rain now · ${formatMetricWithUnit(researchData.weather.current.windSpeed, '', 1, 'Wind unavailable')} wind speed`
                  : getMessage(researchData?.weather, 'Current weather conditions currently unavailable')}
                detail={researchData?.weather?.available
                  ? `30-day rainfall comparison ${formatMetricWithUnit(researchData.weather.historical30Days.precipitation, 'mm', 1, 'unavailable')}`
                  : 'Wind and rain influence evapotranspiration and short-term leaf stress.'}
                tone={researchData?.weather?.trend?.precipitation === 'decreasing' ? 'moderate' : 'neutral'}
              />
              <InsightRow
                icon={Thermometer}
                label="Temperature shift"
                value={researchData?.climate?.available && Number.isFinite(Number(researchData.climate.deviationFromRecentAverageC))
                  ? `${researchData.climate.deviationFromRecentAverageC > 0 ? '+' : ''}${formatMetric(researchData.climate.deviationFromRecentAverageC, 1)}°C versus the recent average`
                  : 'Temperature deviation currently unavailable'}
                detail="This compares current conditions with the recent local baseline rather than a global average."
                tone={Number(researchData?.climate?.deviationFromRecentAverageC) > 1 ? 'alert' : Number(researchData?.climate?.deviationFromRecentAverageC) > 0 ? 'moderate' : 'good'}
              />
            </div>
          ) : (
            <DataUnavailable message="Air and weather context is currently unavailable for this location." />
          )}
        </ResearchCard>

        <ResearchCard
          icon={Leaf}
          title="SYS.ECO"
          subtitle="Biodiversity and ecosystem pressure around the observation area"
          summary="This module explains whether the surrounding region looks species-rich, stressed, carbon-heavy, or relatively stable."
          badge={ecoAvailable ? (researchData?.carbon?.estimated ? 'estimated' : 'live') : 'limited'}
          loading={loading}
        >
          {ecoAvailable ? (
            <div className="space-y-3">
              <InsightRow
                icon={Leaf}
                label="Biodiversity density"
                value={researchData?.biodiversity?.available
                  ? `${researchData.biodiversity.speciesCount?.toLocaleString()} species records in range`
                  : getMessage(researchData?.biodiversity, 'Biodiversity context currently unavailable')}
                detail={researchData?.biodiversity?.available
                  ? `Richness ${researchData.biodiversity.richness} · Search radius ${researchData.biodiversity.radius}`
                  : 'GBIF occurrence records provide a proxy for surrounding biological richness.'}
                tone={biodiversityTone}
              />
              <InsightRow
                icon={TreePine}
                label="Forest pressure"
                value={researchData?.deforestation?.available
                  ? `${formatMetric(researchData.deforestation.totalLoss, 0)} ha tree cover loss`
                  : getMessage(researchData?.deforestation, 'Forest pressure currently unavailable')}
                detail={researchData?.deforestation?.available
                  ? `${researchData.deforestation.period} · ${researchData.deforestation.severity} impact`
                  : 'Tree-cover change helps explain habitat pressure around the result location.'}
                tone={forestTone}
              />
              <InsightRow
                icon={Zap}
                label="Carbon intensity"
                value={researchData?.carbon?.available
                  ? `${formatMetricWithUnit(researchData.carbon.intensity, researchData.carbon.unit, 0, 'Regional estimate unavailable')}${researchData?.carbon?.estimated ? ' estimated' : ''}`
                  : getMessage(researchData?.carbon, 'Carbon context currently unavailable')}
                detail={researchData?.carbon?.available
                  ? researchData.carbon.note || `Regional index ${researchData.carbon.index || 'moderate'} · ${researchData.carbon.region}`
                  : 'Electricity carbon intensity is a rough regional sustainability signal.'}
                tone={carbonTone}
              />
              <InsightRow
                icon={Satellite}
                label="Sunlight budget"
                value={researchData?.satellite?.available
                  ? formatMetricWithUnit(researchData.satellite.solarRadiationKwhm2Day, 'kWh/m²/day', 2, 'Solar radiation unavailable')
                  : getMessage(researchData?.satellite, 'Solar radiation context currently unavailable')}
                detail={researchData?.satellite?.available
                  ? `Average temperature ${formatMetricWithUnit(researchData.satellite.averageTemperatureC, '°C', 1, 'unavailable')} · Rain ${formatMetricWithUnit(researchData.satellite.averageDailyPrecipitationMm, 'mm/day', 2, 'unavailable')}`
                  : 'Satellite sunlight estimates help explain photosynthetic opportunity.'}
                tone="good"
              />
            </div>
          ) : (
            <DataUnavailable message="Ecosystem context is currently unavailable for this region." />
          )}
        </ResearchCard>

        <ResearchCard
          icon={FlaskConical}
          title="SYS.SOIL"
          subtitle="Surface soil chemistry and texture likely to influence root conditions"
          summary="This module turns SoilGrids readings into a simple view of acidity, texture, and carbon at shallow depth."
          badge={soilAvailable ? 'live' : 'limited'}
          loading={loading}
        >
          {soilAvailable ? (
            <div className="space-y-3">
              <InsightRow
                icon={FlaskConical}
                label="Soil acidity"
                value={`pH ${formatMetric(researchData.soil.ph, 1)}`}
                detail={`Sample depth ${researchData.soil.sampleDepth || '0-5cm'} · Source ${researchData.soil.source}`}
                tone={Number(researchData?.soil?.ph) >= 6 && Number(researchData?.soil?.ph) <= 7.5 ? 'good' : 'moderate'}
              />
              <InsightRow
                icon={Leaf}
                label="Dominant texture"
                value={researchData.soil.dominantTexture || 'Texture currently unavailable'}
                detail="Texture influences drainage speed, root aeration, and water holding behavior."
              />
              <InsightRow
                icon={Zap}
                label="Organic carbon"
                value={formatMetricWithUnit(researchData.soil.organicCarbon, researchData.soil.carbonUnit, 1, 'Organic carbon currently unavailable')}
                detail="Higher organic carbon often supports nutrient retention and soil structure."
                tone={Number(researchData?.soil?.organicCarbon) > 20 ? 'good' : 'neutral'}
              />
              <InsightRow
                icon={CloudRain}
                label="Particle balance"
                value={`Clay ${formatMetricWithUnit(researchData.soil.clay, '', 0, '—')} · Sand ${formatMetricWithUnit(researchData.soil.sand, '', 0, '—')} · Silt ${formatMetricWithUnit(researchData.soil.silt, '', 0, '—')}`}
                detail={researchData.soil.clayUnit || 'Percent-like mapped units'}
              />
            </div>
          ) : (
            <DataUnavailable message={getMessage(researchData?.soil, 'Soil profile currently unavailable for this location.')} />
          )}
        </ResearchCard>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-[#00FF41]/10">
        <div className="flex items-start gap-3">
          <Database size={16} className="text-[#00FF41] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00FF41]/65 mb-1">
              SYS.DB//RESEARCH_DATA_SOURCES
            </p>
            <p className="text-xs text-[var(--cream)]/50 leading-relaxed">
              Environmental context is aggregated from OpenAQ, Global Forest Watch, NASA POWER, Carbon Intensity, Open-Meteo, GBIF, SoilGrids, Sunrise-Sunset, and Nominatim. Data is cached for 24 hours. When a live source is missing, the interface shows a plain-language fallback instead of raw technical errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
