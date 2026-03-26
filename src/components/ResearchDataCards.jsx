/**
 * Research Data Cards Component
 * Displays 7 environmental research modules with loading states
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, TreePine, Thermometer, Satellite, Zap, 
  CloudRain, Leaf, AlertCircle, TrendingUp, TrendingDown,
  Sun, FlaskConical,
  MapPin, Calendar, Database
} from 'lucide-react';
import { geolocationService } from '../services/geolocationService.js';
import { environmentalResearchService } from '../services/environmentalResearchService.js';

const LoadingShimmer = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-[#00FF41]/10 rounded w-3/4"></div>
    <div className="h-3 bg-white/8 rounded w-1/2"></div>
    <div className="h-3 bg-white/8 rounded w-2/3"></div>
  </div>
);

const DataUnavailable = ({ message = 'Research Data Pending' }) => (
  <div className="flex items-center gap-2 text-[#ffb84d] text-sm">
    <AlertCircle size={16} />
    <span>{message}</span>
  </div>
);

const formatMetric = (value, precision = 1) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(precision) : '—';
};

const ResearchCard = ({ icon: Icon, title, subtitle, children, loading }) => (
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
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#00FF41] mb-1">
          {title}
        </h3>
        <p className="text-xs text-[var(--cream)]/50">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-2">
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

      // Get user location
      const userLocation = await geolocationService.getUserLocation();
      setLocation(userLocation);

      // Get location name
      const locName = await geolocationService.getLocationName(
        userLocation.latitude,
        userLocation.longitude
      );
      setLocationName(locName);

      // Fetch all research data in parallel
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

  return (
    <div className="space-y-6 font-mono">
      {/* Location Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-[#00FF41]/10">
        <MapPin size={16} className="text-[#00FF41]" />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00FF41]/65">
            SYS.GEO//RESEARCH_LOCATION
          </p>
          <p className="text-sm text-[var(--cream)]">
            {loading ? 'Detecting location...' : locationName?.displayName || 'Unknown Location'}
          </p>
        </div>
      </div>

      {/* Research Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Air Quality */}
        <ResearchCard
          icon={Wind}
          title="SYS.AIR//ATMOSPHERIC_IMPACT"
          subtitle="Real-time air quality telemetry"
          loading={loading}
        >
          {researchData?.airQuality?.available ? (
            <div className="space-y-2">
              {researchData.airQuality.pm25 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--cream)]/60">PM2.5</span>
                  <span className="text-sm font-bold text-[var(--cream)]">
                    {researchData.airQuality.pm25.value.toFixed(1)} {researchData.airQuality.pm25.unit}
                  </span>
                </div>
              )}
              {researchData.airQuality.no2 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--cream)]/60">NO₂</span>
                  <span className="text-sm font-bold text-[var(--cream)]">
                    {researchData.airQuality.no2.value.toFixed(1)} {researchData.airQuality.no2.unit}
                  </span>
                </div>
              )}
              {researchData.airQuality.o3 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--cream)]/60">O₃</span>
                  <span className="text-sm font-bold text-[var(--cream)]">
                    {researchData.airQuality.o3.value.toFixed(1)} {researchData.airQuality.o3.unit}
                  </span>
                </div>
              )}
              <p className="text-xs text-[var(--cream)]/40 mt-2">
                Source: {researchData.airQuality.location || 'OpenAQ'}
              </p>
            </div>
          ) : (
            <DataUnavailable message={researchData?.airQuality?.message || 'Air quality data pending'} />
          )}
        </ResearchCard>

        {/* 2. Deforestation */}
        <ResearchCard
          icon={TreePine}
          title="SYS.FOREST//DEFORESTATION_CONTEXT"
          subtitle="Regional forest cover trends"
          loading={loading}
        >
          {researchData?.deforestation?.available ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Tree Cover Loss</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.deforestation.totalLoss.toFixed(0)} ha
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Period</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.deforestation.period}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  researchData.deforestation.severity === 'high' 
                    ? 'bg-rose-500/20 text-rose-300'
                    : researchData.deforestation.severity === 'moderate'
                    ? 'bg-orange-500/20 text-orange-300'
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {researchData.deforestation.severity.toUpperCase()} Impact
                </span>
              </div>
              <p className="text-xs text-[var(--cream)]/40 mt-2">Source: Global Forest Watch</p>
            </div>
          ) : (
            <DataUnavailable />
          )}
        </ResearchCard>

        {/* 3. Climate Resilience */}
        <ResearchCard
          icon={Thermometer}
          title="SYS.CLIMATE//RESILIENCE_MODEL"
          subtitle="Long-term climate trends"
          loading={loading}
        >
          {researchData?.climate?.available ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Current Temp</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {formatMetric(researchData.climate.currentTemperatureC, 1)}°C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Recent Avg</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {formatMetric(researchData.climate.averageTemperatureC, 1)}°C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Daily Rain Avg</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {formatMetric(researchData.climate.averageDailyPrecipitationMm, 2)} mm
                </span>
              </div>
              {Number.isFinite(Number(researchData.climate.deviationFromRecentAverageC)) && (
                <p className="text-xs text-[var(--cream)]/50 mt-2">
                  Temp deviation: {researchData.climate.deviationFromRecentAverageC > 0 ? '+' : ''}
                  {formatMetric(researchData.climate.deviationFromRecentAverageC, 1)}°C vs recent satellite average
                </p>
              )}
              <p className="text-xs text-[var(--cream)]/40 mt-2">Source: {researchData.climate.source}</p>
            </div>
          ) : (
            <DataUnavailable message={researchData?.climate?.message || 'Climate summary pending'} />
          )}
        </ResearchCard>

        {/* 4. Satellite Insights */}
        <ResearchCard
          icon={Satellite}
          title="SYS.SAT//REMOTE_SENSING"
          subtitle="Remote sensing data"
          loading={loading}
        >
          {researchData?.satellite?.available ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Rainfall Avg</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {formatMetric(researchData.satellite.averageDailyPrecipitationMm, 2)} mm/day
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Temp Avg</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {formatMetric(researchData.satellite.averageTemperatureC, 1)}°C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Solar Flux</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {formatMetric(researchData.satellite.solarRadiationKwhm2Day, 2)} kWh/m²/day
                </span>
              </div>
              <p className="text-xs text-[var(--cream)]/40 mt-2">Source: {researchData.satellite.dataSource} · {researchData.satellite.period}</p>
            </div>
          ) : (
            <DataUnavailable message={researchData?.satellite?.message || 'Satellite telemetry pending'} />
          )}
        </ResearchCard>

        {/* 5. Carbon Intensity */}
        <ResearchCard
          icon={Zap}
          title="SYS.CARBON//ECO_AWARENESS"
          subtitle="Regional carbon intensity"
          loading={loading}
        >
          {researchData?.carbon?.available ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Carbon Intensity</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.carbon.intensity} {researchData.carbon.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Index</span>
                <span className={`text-sm font-bold ${
                  researchData.carbon.index === 'low' ? 'text-green-300' :
                  researchData.carbon.index === 'moderate' ? 'text-orange-300' :
                  'text-rose-300'
                }`}>
                  {researchData.carbon.index?.toUpperCase() || 'MODERATE'}
                </span>
              </div>
              <p className="text-xs text-[var(--cream)]/40 mt-2">
                {researchData.carbon.note || `Region: ${researchData.carbon.region}`}
              </p>
            </div>
          ) : (
            <DataUnavailable />
          )}
        </ResearchCard>

        {/* 6. Weather History */}
        <ResearchCard
          icon={CloudRain}
          title="SYS.WEATHER//HISTORY_BUFFER"
          subtitle="Historical vs. current patterns"
          loading={loading}
        >
          {researchData?.weather?.available ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Current Temp</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.weather.current.temperature}°C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">30-Day Avg</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.weather.historical30Days.temperature?.toFixed(1)}°C
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {researchData.weather.trend.temperature === 'warming' ? (
                  <TrendingUp size={14} className="text-rose-300" />
                ) : (
                  <TrendingDown size={14} className="text-blue-300" />
                )}
                <span className="text-xs text-[var(--cream)]/60">
                  {researchData.weather.trend.temperature === 'warming' ? 'Warming trend' : 'Cooling trend'}
                </span>
              </div>
              <p className="text-xs text-[var(--cream)]/40 mt-2">Source: Open Meteo</p>
            </div>
          ) : (
            <DataUnavailable />
          )}
        </ResearchCard>

        {/* 7. Biodiversity */}
        <ResearchCard
          icon={Leaf}
          title="SYS.BIO//DIVERSITY_METRICS"
          subtitle="Local species richness"
          loading={loading}
        >
          {researchData?.biodiversity?.available ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Species Records</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.biodiversity.speciesCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Richness</span>
                <span className={`text-sm font-bold ${
                  researchData.biodiversity.richness === 'high' ? 'text-green-300' :
                  researchData.biodiversity.richness === 'moderate' ? 'text-orange-300' :
                  'text-rose-300'
                }`}>
                  {researchData.biodiversity.richness.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Search Radius</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.biodiversity.radius}
                </span>
              </div>
              <p className="text-xs text-[var(--cream)]/40 mt-2">Source: GBIF</p>
            </div>
          ) : (
            <DataUnavailable />
          )}
        </ResearchCard>

        <ResearchCard
          icon={FlaskConical}
          title="SYS.SOIL//SOILGRIDS_PROFILE"
          subtitle="Surface soil chemistry and texture"
          loading={loading}
        >
          {researchData?.soil?.available ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">pH (H₂O)</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {formatMetric(researchData.soil.ph, 1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Texture</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.soil.dominantTexture || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Organic Carbon</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {formatMetric(researchData.soil.organicCarbon, 1)} {researchData.soil.carbonUnit || ''}
                </span>
              </div>
              <p className="text-xs text-[var(--cream)]/45 mt-2">
                Clay/Sand/Silt: {formatMetric(researchData.soil.clay, 0)} / {formatMetric(researchData.soil.sand, 0)} / {formatMetric(researchData.soil.silt, 0)} {researchData.soil.clayUnit || ''}
              </p>
              <p className="text-xs text-[var(--cream)]/40 mt-2">Source: {researchData.soil.source} · Depth: {researchData.soil.sampleDepth}</p>
            </div>
          ) : (
            <DataUnavailable message={researchData?.soil?.message || 'Soil profile pending'} />
          )}
        </ResearchCard>

        <ResearchCard
          icon={Sun}
          title="SYS.SOLAR//DAYLIGHT_WINDOW"
          subtitle="Sunrise, sunset, and twilight timing"
          loading={loading}
        >
          {researchData?.solar?.available ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Sunrise</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.solar.sunriseLocal || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Sunset</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.solar.sunsetLocal || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Solar Noon</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.solar.solarNoonLocal || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Day Length</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.solar.dayLength || '—'}
                </span>
              </div>
              <p className="text-xs text-[var(--cream)]/40 mt-2">Source: {researchData.solar.source}</p>
            </div>
          ) : (
            <DataUnavailable message={researchData?.solar?.message || 'Solar window pending'} />
          )}
        </ResearchCard>
      </div>

      {/* Research Footer */}
      <div className="bg-white/5 rounded-xl p-4 border border-[#00FF41]/10">
        <div className="flex items-start gap-3">
          <Database size={16} className="text-[#00FF41] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00FF41]/65 mb-1">
              SYS.DB//RESEARCH_DATA_SOURCES
            </p>
            <p className="text-xs text-[var(--cream)]/50 leading-relaxed">
              Environmental data aggregated from OpenAQ, Global Forest Watch, NASA POWER, 
              Carbon Intensity API, Open Meteo, GBIF, SoilGrids, Sunrise-Sunset, and Nominatim. 
              Data is cached for 24 hours and updated automatically. Location-based queries use your device's 
              geolocation with fallback to regional estimates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
