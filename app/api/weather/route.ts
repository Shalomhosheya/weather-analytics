import { NextResponse } from 'next/server';
import { cache, KEYS } from '@/lib/cache';
import { extractCityCodes } from '@/lib/cities';
import { fetchWeatherById } from '@/lib/weather';
import { computeComfortIndex } from '@/lib/comfort-index';

/**
 * Welcome to the main Weather API route!
 * This endpoint orchestrates the entire process: it checks our cache, fetches live data for our cities 
 * if needed, computes how comfortable they are, and then ranks them from best to worst.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const processedKey = KEYS.processed();
  const cachedProcessed = cache.get(processedKey);

  if (cachedProcessed) {
    return NextResponse.json({
      ...cachedProcessed,
      cacheStatus: 'HIT',
    });
  }

  const cities = extractCityCodes();
  const rawCacheStatuses: any[] = [];

  const weatherPromises = cities.map(async (city) => {
    const rawKey = KEYS.rawWeather(city.CityCode);
    const cachedRaw = cache.get<any>(rawKey);

    if (cachedRaw) {
      rawCacheStatuses.push({ cityId: city.CityCode, status: 'HIT', ttlRemaining: cache.getTtl(rawKey) });
      return { city, weatherData: cachedRaw };
    }

    try {
      const data = await fetchWeatherById(city.CityCode);
      cache.set(rawKey, data);
      rawCacheStatuses.push({ cityId: city.CityCode, status: 'MISS' });
      return { city, weatherData: data };
    } catch (e) {
      console.error(`Failed to fetch for ${city.CityName}:`, e);
      return { city, weatherData: null };
    }
  });

  const results = await Promise.allSettled(weatherPromises);

  const processedCities = results
    .filter((res) => res.status === 'fulfilled' && res.value.weatherData)
    .map((res: any) => {
      const { city, weatherData } = res.value;
      const score = computeComfortIndex(weatherData);

      return {
        cityId: city.CityCode,
        cityName: city.CityName,
        country: weatherData.sys.country,
        description: weatherData.weather[0]?.description || 'Unknown',
        icon: weatherData.weather[0]?.icon || '01d',
        temp: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        visibility: weatherData.visibility,
        pressure: weatherData.main.pressure,
        comfortScore: score,
        clouds: weatherData.clouds.all,
      };
    });

  processedCities.sort((a, b) => b.comfortScore - a.comfortScore);

  const rankedCities = processedCities.map((city, index) => ({
    rank: index + 1,
    ...city,
  }));

  const responseBody = {
    cities: rankedCities,
    generatedAt: new Date().toISOString(),
    rawCacheStatuses,
  };

  cache.set(processedKey, responseBody);

  return NextResponse.json({
    ...responseBody,
    cacheStatus: 'MISS',
  });
}
