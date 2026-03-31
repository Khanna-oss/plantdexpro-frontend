/**
 * Environmental Research Service
 * Integrates 7 research modules for global environmental impact analysis
 */

import { geolocationService } from './geolocationService.js';

const CACHE_PREFIX = 'plantdex_research_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generic cache helper
 */
const getCached = (key) => {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }
  return null;
};

const setCache = (key, data) => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Cache write error:', e);
  }
};

const getAverage = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const numericValues = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (numericValues.length === 0) {
    return null;
  }

  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
};

const roundTo = (value, precision = 1) => {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(precision));
};

const extractSeries = (series) => {
  if (!series || typeof series !== 'object') {
    return [];
  }

  return Object.values(series)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
};

const buildClimateSummary = (satellite, weather) => {
  const hasSatellite = satellite?.available === true;
  const hasWeather = weather?.available === true;
  const averageTemperatureC = satellite?.averageTemperatureC ?? weather?.historical30Days?.temperature ?? null;
  const averageDailyPrecipitationMm = satellite?.averageDailyPrecipitationMm ?? weather?.historical30Days?.precipitation ?? null;
  const currentTemperatureC = weather?.current?.temperature ?? null;
  const deviationFromRecentAverageC =
    Number.isFinite(currentTemperatureC) && Number.isFinite(averageTemperatureC)
      ? roundTo(currentTemperatureC - averageTemperatureC, 1)
      : null;

  if (!Number.isFinite(averageTemperatureC) && !Number.isFinite(averageDailyPrecipitationMm) && !Number.isFinite(currentTemperatureC)) {
    return buildUnavailable('NASA POWER + Open-Meteo', 'Regional climate summary is currently unavailable.');
  }

  return {
    averageTemperatureC,
    averageDailyPrecipitationMm,
    currentTemperatureC,
    deviationFromRecentAverageC,
    solarRadiationKwhm2Day: satellite?.solarRadiationKwhm2Day ?? null,
    dataWindow: satellite?.period || 'Recent observation window',
    source: 'NASA POWER + Open-Meteo',
    note: hasSatellite && hasWeather
      ? 'Combined from NASA POWER seasonal baselines and Open-Meteo live weather.'
      : hasSatellite
      ? 'Using NASA POWER seasonal baselines because live weather comparison is unavailable.'
      : 'Using Open-Meteo weather history because satellite climatology is unavailable.',
    available: true
  };
};

const extractSoilDepthValue = (layer, preferredDepthLabel = '0-5cm') => {
  const depths = Array.isArray(layer?.depths) ? layer.depths : [];

  if (depths.length === 0) {
    return { value: null, depth: null };
  }

  const preferredDepth =
    depths.find((depth) => depth?.label === preferredDepthLabel)
    || depths.find((depth) => `${depth?.range?.top_depth}-${depth?.range?.bottom_depth}${depth?.range?.unit_depth || ''}` === preferredDepthLabel)
    || depths[0];

  const depthLabel =
    preferredDepth?.label
    || (preferredDepth?.range
      ? `${preferredDepth.range.top_depth}-${preferredDepth.range.bottom_depth}${preferredDepth.range.unit_depth || ''}`
      : null);

  const rawValue =
    preferredDepth?.values?.mean
    ?? preferredDepth?.values?.Q0_5
    ?? preferredDepth?.values?.['Q0.5']
    ?? preferredDepth?.mean
    ?? null;

  const numericValue = Number(rawValue);

  return {
    value: Number.isFinite(numericValue) ? numericValue : null,
    depth: depthLabel
  };
};

const findSoilLayer = (layers, name) => layers.find((layer) => layer?.name === name || layer?.property === name);

const formatSolarClock = (isoString) => {
  if (!isoString) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(isoString));
  } catch (error) {
    return isoString;
  }
};

const buildUnavailable = (source, message, extra = {}) => ({
  available: false,
  source,
  message,
  ...extra,
});

const buildAirMeasurement = (results, sensorLookup, parameterName) => {
  const reading = results.find((entry) => sensorLookup.get(entry?.sensorsId)?.name === parameterName);
  if (!reading) {
    return null;
  }

  const sensor = sensorLookup.get(reading.sensorsId) || {};
  const numericValue = Number(reading.value);

  return {
    value: Number.isFinite(numericValue) ? numericValue : null,
    unit: sensor.units || null,
    displayName: sensor.displayName || parameterName,
    lastUpdated: reading?.datetime?.utc || reading?.datetime?.local || null,
  };
};

/**
 * 1. OpenAQ API - Air Quality Data
 * Free API, no key required
 */
export const getAirQualityData = async (latitude, longitude) => {
  const cacheKey = `openaq_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const locationResponse = await fetch(
      `https://api.openaq.org/v3/locations?coordinates=${latitude},${longitude}&radius=25000&limit=1`
    );

    if (!locationResponse.ok) {
      throw new Error('OpenAQ locations lookup failed');
    }

    const locationData = await locationResponse.json();
    const location = Array.isArray(locationData?.results) ? locationData.results[0] : null;

    if (!location?.id) {
      return buildUnavailable('OpenAQ v3', 'No air quality monitoring station was found near this observation area.');
    }

    const latestResponse = await fetch(`https://api.openaq.org/v3/locations/${location.id}/latest?limit=100`);

    if (!latestResponse.ok) {
      throw new Error('OpenAQ latest measurements lookup failed');
    }

    const latestData = await latestResponse.json();
    const latestResults = Array.isArray(latestData?.results) ? latestData.results : [];
    const sensorLookup = new Map(
      (Array.isArray(location?.sensors) ? location.sensors : []).map((sensor) => [
        sensor.id,
        {
          name: sensor?.parameter?.name || null,
          units: sensor?.parameter?.units || null,
          displayName: sensor?.parameter?.displayName || null,
        },
      ])
    );

    const result = {
      location: location.name || location.locality || 'Nearest monitoring station',
      city: location.locality || location.name || null,
      country: location.country?.name || null,
      provider: location.provider?.name || 'OpenAQ',
      pm25: buildAirMeasurement(latestResults, sensorLookup, 'pm25'),
      co2: buildAirMeasurement(latestResults, sensorLookup, 'co2'),
      o3: buildAirMeasurement(latestResults, sensorLookup, 'o3'),
      no2: buildAirMeasurement(latestResults, sensorLookup, 'no2'),
      coordinates: location.coordinates || latestResults[0]?.coordinates || null,
      source: 'OpenAQ v3',
      available: false,
    };

    result.available = Boolean(result.pm25 || result.co2 || result.o3 || result.no2);

    if (!result.available) {
      return buildUnavailable('OpenAQ v3', 'No recent air quality readings are available near this observation area.', {
        location: result.location,
      });
    }

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('OpenAQ error:', error);
    return buildUnavailable('OpenAQ v3', 'Air quality data is currently unavailable for this region.');
  }
};

/**
 * 2. Global Forest Watch - Deforestation Data
 * Uses GFW API (free, no key required)
 */
export const getDeforestationData = async (latitude, longitude) => {
  const cacheKey = `gfw_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // GFW GLAD alerts API - tree cover loss
    const response = await fetch(
      `https://data-api.globalforestwatch.org/dataset/umd_tree_cover_loss/latest/query?sql=SELECT SUM(area__ha) as total_loss FROM data WHERE latitude >= ${latitude - 0.5} AND latitude <= ${latitude + 0.5} AND longitude >= ${longitude - 0.5} AND longitude <= ${longitude + 0.5} AND umd_tree_cover_loss__year >= 2015`
    );

    if (!response.ok) throw new Error('GFW API error');

    const data = await response.json();

    const result = {
      totalLoss: data.data?.[0]?.total_loss || 0,
      unit: 'hectares',
      period: '2015-2023',
      available: true,
      severity: data.data?.[0]?.total_loss > 1000 ? 'high' : data.data?.[0]?.total_loss > 100 ? 'moderate' : 'low'
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('GFW error:', error);
    return buildUnavailable('Global Forest Watch', 'Forest-cover change data is currently unavailable for this region.');
  }
};

/**
 * 3. World Bank Climate API - Climate Resilience Data
 * Free API, no key required
 */
export const getClimateData = async (latitude, longitude) => {
  const cacheKey = `climate_${latitude.toFixed(1)}_${longitude.toFixed(1)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const [satellite, weather] = await Promise.all([
      getSatelliteData(latitude, longitude),
      getWeatherHistoryData(latitude, longitude)
    ]);

    const result = buildClimateSummary(satellite, weather);

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Climate summary error:', error);
    return buildUnavailable('NASA POWER + Open-Meteo', 'Regional climate summary is currently unavailable.');
  }
};

/**
 * 4. NASA Earth Observatory - Satellite Vegetation Index
 * Uses NASA POWER API (free, no key required)
 */
export const getSatelliteData = async (latitude, longitude) => {
  const cacheKey = `nasa_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // NASA POWER API - vegetation and climate data
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    const endDate = new Date();

    const start = startDate.toISOString().split('T')[0].replace(/-/g, '');
    const end = endDate.toISOString().split('T')[0].replace(/-/g, '');

    const response = await fetch(
      `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M,ALLSKY_SFC_SW_DWN&community=AG&longitude=${longitude}&latitude=${latitude}&start=${start}&end=${end}&format=JSON`
    );

    if (!response.ok) throw new Error('NASA POWER API error');

    const data = await response.json();
    const precipitationSeries = extractSeries(data.properties?.parameter?.PRECTOTCORR);
    const temperatureSeries = extractSeries(data.properties?.parameter?.T2M);
    const solarSeries = extractSeries(data.properties?.parameter?.ALLSKY_SFC_SW_DWN);

    const result = {
      averageDailyPrecipitationMm: roundTo(getAverage(precipitationSeries), 2),
      averageTemperatureC: roundTo(getAverage(temperatureSeries), 1),
      solarRadiationKwhm2Day: roundTo(getAverage(solarSeries), 2),
      dataPoints: Math.max(precipitationSeries.length, temperatureSeries.length, solarSeries.length),
      dataSource: 'NASA POWER',
      resolution: '0.5° x 0.5°',
      period: `${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]}`,
      available: precipitationSeries.length > 0 || temperatureSeries.length > 0 || solarSeries.length > 0,
      note: '90-day satellite-derived climate parameters for agricultural monitoring'
    };

    if (!result.available) {
      return buildUnavailable('NASA POWER', 'Satellite climate values are currently unavailable for this region.');
    }

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('NASA POWER error:', error);
    return buildUnavailable('NASA POWER', 'Satellite climate data is currently unavailable for this region.');
  }
};

/**
 * 5. Carbon Intensity API - Electricity Carbon Footprint
 * Free API for UK, extensible to other regions
 */
export const getCarbonIntensityData = async (latitude, longitude) => {
  const cacheKey = `carbon_${latitude.toFixed(1)}_${longitude.toFixed(1)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // For UK coordinates, use Carbon Intensity API
    // For other regions, provide estimated data
    const locationData = await geolocationService.getLocationName(latitude, longitude);

    if (locationData.country === 'United Kingdom') {
      const response = await fetch('https://api.carbonintensity.org.uk/intensity');

      if (response.ok) {
        const data = await response.json();
        const current = data.data?.[0];

        const result = {
          intensity: current?.intensity?.actual || current?.intensity?.forecast,
          unit: 'gCO2/kWh',
          index: current?.intensity?.index,
          region: 'UK',
          source: 'Carbon Intensity API',
          available: true
        };

        setCache(cacheKey, result);
        return result;
      }
    }

    // Fallback: estimated global average
    const result = {
      intensity: 475,
      unit: 'gCO2/kWh',
      index: 'moderate',
      region: locationData.country,
      available: true,
      estimated: true,
      source: 'Carbon Intensity API',
      note: 'Global average carbon intensity estimate'
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Carbon Intensity error:', error);
    return buildUnavailable('Carbon Intensity API', 'Carbon intensity context is currently unavailable for this region.');
  }
};

/**
 * 6. Open Meteo - Weather History & Trends
 * Free API, no key required
 */
export const getWeatherHistoryData = async (latitude, longitude) => {
  const cacheKey = `meteo_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // Get current weather
    const currentResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,wind_speed_10m&timezone=auto`
    );

    // Get historical data (30 days ago)
    const historicalDate = new Date();
    historicalDate.setDate(historicalDate.getDate() - 30);
    const histStart = historicalDate.toISOString().split('T')[0];
    const histEnd = histStart;

    const historicalResponse = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${histStart}&end_date=${histEnd}&daily=temperature_2m_mean,precipitation_sum&timezone=auto`
    );

    if (!currentResponse.ok || !historicalResponse.ok) {
      throw new Error('Open Meteo API error');
    }

    const currentData = await currentResponse.json();
    const historicalData = await historicalResponse.json();

    const currentTemperature = Number(currentData.current?.temperature_2m);
    const currentPrecipitation = Number(currentData.current?.precipitation);
    const currentWindSpeed = Number(currentData.current?.wind_speed_10m);
    const historicalTemperature = Number(historicalData.daily?.temperature_2m_mean?.[0]);
    const historicalPrecipitation = Number(historicalData.daily?.precipitation_sum?.[0]);
    const hasCurrentData = [currentTemperature, currentPrecipitation, currentWindSpeed].some((value) => Number.isFinite(value));
    const hasHistoricalData = [historicalTemperature, historicalPrecipitation].some((value) => Number.isFinite(value));

    const result = {
      current: {
        temperature: Number.isFinite(currentTemperature) ? currentTemperature : null,
        precipitation: Number.isFinite(currentPrecipitation) ? currentPrecipitation : null,
        windSpeed: Number.isFinite(currentWindSpeed) ? currentWindSpeed : null,
        unit: currentData.current_units
      },
      historical30Days: {
        temperature: Number.isFinite(historicalTemperature) ? historicalTemperature : null,
        precipitation: Number.isFinite(historicalPrecipitation) ? historicalPrecipitation : null
      },
      trend: {
        temperature: Number.isFinite(currentTemperature) && Number.isFinite(historicalTemperature)
          ? currentTemperature > historicalTemperature ? 'warming' : 'cooling'
          : null,
        precipitation: Number.isFinite(currentPrecipitation) && Number.isFinite(historicalPrecipitation)
          ? currentPrecipitation > historicalPrecipitation ? 'increasing' : 'decreasing'
          : null
      },
      source: 'Open-Meteo',
      available: hasCurrentData || hasHistoricalData
    };

    if (!result.available) {
      return buildUnavailable('Open-Meteo', 'Weather history is currently unavailable for this region.');
    }

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Open Meteo error:', error);
    return buildUnavailable('Open-Meteo', 'Weather history is currently unavailable for this region.');
  }
};

/**
 * 7. UN Biodiversity Lab - Biodiversity Metrics
 * Using GBIF API as proxy (free, no key required)
 */
export const getBiodiversityData = async (latitude, longitude) => {
  const cacheKey = `biodiversity_${latitude.toFixed(1)}_${longitude.toFixed(1)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    // GBIF API - species occurrence data
    const response = await fetch(
      `https://api.gbif.org/v1/occurrence/search?decimalLatitude=${latitude}&decimalLongitude=${longitude}&limit=0&hasCoordinate=true&hasGeospatialIssue=false`
    );

    if (!response.ok) throw new Error('GBIF API error');

    const data = await response.json();

    const result = {
      speciesCount: data.count || 0,
      dataSource: 'GBIF (Global Biodiversity Information Facility)',
      radius: '50km',
      available: true,
      richness: data.count > 1000 ? 'high' : data.count > 100 ? 'moderate' : 'low',
      note: 'Species occurrence records from global biodiversity databases'
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('GBIF error:', error);
    return buildUnavailable('GBIF', 'Biodiversity context is currently unavailable for this region.');
  }
};

export const getSoilData = async (latitude, longitude) => {
  const cacheKey = `soil_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams();
    params.set('lon', String(longitude));
    params.set('lat', String(latitude));
    ['clay', 'sand', 'silt', 'phh2o', 'soc'].forEach((property) => params.append('property', property));
    ['0-5cm', '5-15cm'].forEach((depth) => params.append('depth', depth));
    params.append('value', 'mean');

    const response = await fetch(`https://rest.isric.org/soilgrids/v2.0/properties/query?${params.toString()}`);

    if (!response.ok) throw new Error('SoilGrids API error');

    const data = await response.json();
    const feature = Array.isArray(data?.features) ? data.features[0] : data;
    const layers = feature?.properties?.layers || data?.properties?.layers || data?.layers || [];

    if (!Array.isArray(layers) || layers.length === 0) {
      return buildUnavailable('SoilGrids', 'Soil profile data is currently unavailable for this region.');
    }

    const clayLayer = findSoilLayer(layers, 'clay');
    const sandLayer = findSoilLayer(layers, 'sand');
    const siltLayer = findSoilLayer(layers, 'silt');
    const phLayer = findSoilLayer(layers, 'phh2o');
    const carbonLayer = findSoilLayer(layers, 'soc');

    const clay = extractSoilDepthValue(clayLayer);
    const sand = extractSoilDepthValue(sandLayer);
    const silt = extractSoilDepthValue(siltLayer);
    const ph = extractSoilDepthValue(phLayer);
    const organicCarbon = extractSoilDepthValue(carbonLayer);

    const dominantTexture = Object.entries({ clay: clay.value ?? -1, sand: sand.value ?? -1, silt: silt.value ?? -1 })
      .filter(([, value]) => value >= 0)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const result = {
      clay: clay.value,
      sand: sand.value,
      silt: silt.value,
      ph: ph.value,
      organicCarbon: organicCarbon.value,
      clayUnit: clayLayer?.unit_measure?.mapped_units || clayLayer?.unit_measure?.target_units || null,
      sandUnit: sandLayer?.unit_measure?.mapped_units || sandLayer?.unit_measure?.target_units || null,
      siltUnit: siltLayer?.unit_measure?.mapped_units || siltLayer?.unit_measure?.target_units || null,
      phUnit: phLayer?.unit_measure?.mapped_units || phLayer?.unit_measure?.target_units || null,
      carbonUnit: carbonLayer?.unit_measure?.mapped_units || carbonLayer?.unit_measure?.target_units || null,
      sampleDepth: clay.depth || sand.depth || silt.depth || ph.depth || organicCarbon.depth || '0-5cm',
      dominantTexture: dominantTexture ? dominantTexture.toUpperCase() : null,
      source: 'SoilGrids',
      available: [clay.value, sand.value, silt.value, ph.value, organicCarbon.value].some((value) => Number.isFinite(value))
    };

    if (!result.available) {
      return buildUnavailable('SoilGrids', 'Soil profile values are currently unavailable for this region.');
    }

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('SoilGrids error:', error);
    return buildUnavailable('SoilGrids', 'Soil profile data is currently unavailable for this region.');
  }
};

export const getSolarData = async (latitude, longitude) => {
  const cacheKey = `solar_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=today&formatted=0`
    );

    if (!response.ok) throw new Error('Sunrise-Sunset API error');

    const data = await response.json();

    if (data?.status !== 'OK' || !data?.results) {
      return buildUnavailable('Sunrise-Sunset.org', 'Daylight timing is currently unavailable for this region.');
    }

    const result = {
      sunrise: data.results.sunrise,
      sunset: data.results.sunset,
      solarNoon: data.results.solar_noon,
      dayLength: data.results.day_length,
      civilDawn: data.results.civil_twilight_begin,
      civilDusk: data.results.civil_twilight_end,
      sunriseLocal: formatSolarClock(data.results.sunrise),
      sunsetLocal: formatSolarClock(data.results.sunset),
      solarNoonLocal: formatSolarClock(data.results.solar_noon),
      source: 'Sunrise-Sunset.org',
      available: true
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Sunrise-Sunset error:', error);
    return buildUnavailable('Sunrise-Sunset.org', 'Daylight timing is currently unavailable for this region.');
  }
};

/**
 * Fetch all research data in parallel
 */
export const getAllResearchData = async (latitude, longitude) => {
  try {
    const [
      airQuality,
      deforestation,
      satellite,
      carbon,
      weather,
      biodiversity,
      soil,
      solar
    ] = await Promise.allSettled([
      getAirQualityData(latitude, longitude),
      getDeforestationData(latitude, longitude),
      getSatelliteData(latitude, longitude),
      getCarbonIntensityData(latitude, longitude),
      getWeatherHistoryData(latitude, longitude),
      getBiodiversityData(latitude, longitude),
      getSoilData(latitude, longitude),
      getSolarData(latitude, longitude)
    ]);

    const satelliteValue = satellite.status === 'fulfilled'
      ? satellite.value
      : buildUnavailable('NASA POWER', 'Satellite climate data is currently unavailable for this region.');
    const weatherValue = weather.status === 'fulfilled'
      ? weather.value
      : buildUnavailable('Open-Meteo', 'Weather history is currently unavailable for this region.');

    return {
      airQuality: airQuality.status === 'fulfilled' ? airQuality.value : buildUnavailable('OpenAQ v3', 'Air quality data is currently unavailable for this region.'),
      deforestation: deforestation.status === 'fulfilled' ? deforestation.value : buildUnavailable('Global Forest Watch', 'Forest-cover change data is currently unavailable for this region.'),
      climate: buildClimateSummary(satelliteValue, weatherValue),
      satellite: satelliteValue,
      carbon: carbon.status === 'fulfilled' ? carbon.value : buildUnavailable('Carbon Intensity API', 'Carbon intensity context is currently unavailable for this region.'),
      weather: weatherValue,
      biodiversity: biodiversity.status === 'fulfilled' ? biodiversity.value : buildUnavailable('GBIF', 'Biodiversity context is currently unavailable for this region.'),
      soil: soil.status === 'fulfilled' ? soil.value : buildUnavailable('SoilGrids', 'Soil profile data is currently unavailable for this region.'),
      solar: solar.status === 'fulfilled' ? solar.value : buildUnavailable('Sunrise-Sunset.org', 'Daylight timing is currently unavailable for this region.')
    };
  } catch (error) {
    console.error('Research data fetch error:', error);
    return null;
  }
};

export const environmentalResearchService = {
  getAirQualityData,
  getDeforestationData,
  getClimateData,
  getSatelliteData,
  getCarbonIntensityData,
  getWeatherHistoryData,
  getBiodiversityData,
  getSoilData,
  getSolarData,
  getAllResearchData
};
