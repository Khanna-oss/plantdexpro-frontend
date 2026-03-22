/**
 * Research Data Cards Component
 * Displays 7 environmental research modules with loading states
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, TreePine, Thermometer, Satellite, Zap, 
  CloudRain, Leaf, AlertCircle, TrendingUp, TrendingDown,
  MapPin, Calendar, Database
} from 'lucide-react';
import { geolocationService } from '../services/geolocationService.js';
import { environmentalResearchService } from '../services/environmentalResearchService.js';

const LoadingShimmer = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-white/10 rounded w-3/4"></div>
    <div className="h-3 bg-white/10 rounded w-1/2"></div>
    <div className="h-3 bg-white/10 rounded w-2/3"></div>
  </div>
);

const DataUnavailable = ({ message = 'Research Data Pending' }) => (
  <div className="flex items-center gap-2 text-[var(--cream)]/40 text-sm">
    <AlertCircle size={16} />
    <span>{message}</span>
  </div>
);

const ResearchCard = ({ icon: Icon, title, subtitle, children, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:bg-white/8 transition-all"
  >
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-[var(--golden-soil)]/20 border border-[var(--golden-soil)]/30 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-[var(--golden-soil)]" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--cream)] mb-1">
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
    <div className="space-y-6">
      {/* Location Header */}
      <div className="flex items-center gap-3 px-4">
        <MapPin size={16} className="text-[var(--golden-soil)]" />
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[var(--cream)]/60">
            Research Location
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
          title="Atmospheric Impact"
          subtitle="Real-time air quality data"
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
          title="Deforestation Context"
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
          title="Climate Resilience"
          subtitle="Long-term climate trends"
          loading={loading}
        >
          {researchData?.climate?.available ? (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-[var(--cream)]/60 mb-1">Temperature Trend</p>
                <p className="text-xs text-[var(--cream)]">{researchData.climate.temperatureTrend.projection}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--cream)]/60 mb-1">Precipitation</p>
                <p className="text-xs text-[var(--cream)]">{researchData.climate.precipitationTrend.projection}</p>
              </div>
              <p className="text-xs text-[var(--cream)]/40 mt-2">Source: World Bank Climate Portal</p>
            </div>
          ) : (
            <DataUnavailable />
          )}
        </ResearchCard>

        {/* 4. Satellite Insights */}
        <ResearchCard
          icon={Satellite}
          title="Satellite Insights"
          subtitle="Remote sensing data"
          loading={loading}
        >
          {researchData?.satellite?.available ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Precipitation Data</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.satellite.precipitation}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Temperature Data</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.satellite.temperature}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--cream)]/60">Resolution</span>
                <span className="text-sm font-bold text-[var(--cream)]">
                  {researchData.satellite.resolution}
                </span>
              </div>
              <p className="text-xs text-[var(--cream)]/40 mt-2">Source: NASA POWER</p>
            </div>
          ) : (
            <DataUnavailable />
          )}
        </ResearchCard>

        {/* 5. Carbon Intensity */}
        <ResearchCard
          icon={Zap}
          title="Eco-Awareness"
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
          title="Weather History"
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
          title="Biodiversity Metrics"
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
      </div>

      {/* Research Footer */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-start gap-3">
          <Database size={16} className="text-[var(--golden-soil)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[var(--cream)]/70 mb-1">
              Research Data Sources
            </p>
            <p className="text-xs text-[var(--cream)]/50 leading-relaxed">
              Environmental data aggregated from OpenAQ, Global Forest Watch, World Bank Climate Portal, 
              NASA POWER, Carbon Intensity API, Open Meteo, and GBIF. Data is cached for 24 hours and 
              updated automatically. Location-based queries use your device's geolocation with fallback 
              to regional estimates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
