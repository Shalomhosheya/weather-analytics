import { NextResponse } from 'next/server';
import { cache, KEYS } from '@/lib/cache';
import { extractCityCodes } from '@/lib/cities';

export const dynamic = 'force-dynamic';

export async function GET() {
  const processedKey = KEYS.processed();
  const cachedProcessed = cache.get(processedKey);
  
  const cities = extractCityCodes();
  const rawCityCacheStatuses = cities.map((city) => {
    const rawKey = KEYS.rawWeather(city.CityCode);
    const ttl = cache.getTtl(rawKey);
    return {
      cityId: city.CityCode,
      cityName: city.CityName,
      status: ttl ? 'HIT' : 'MISS',
      ttlRemainingSec: ttl ? Math.max(0, Math.round((ttl - Date.now()) / 1000)) : null,
    };
  });

  const processedTtl = cache.getTtl(processedKey);

  return NextResponse.json({
    processedCacheStatus: cachedProcessed ? 'HIT' : 'MISS',
    processedTtlRemainingSec: processedTtl ? Math.max(0, Math.round((processedTtl - Date.now()) / 1000)) : null,
    rawCityCacheStatuses,
  });
}
