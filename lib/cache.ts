import NodeCache from 'node-cache';

/**
 * Welcome to the caching layer! 
 * We use this to temporarily remember weather data so we don't bombard the API with requests every single time someone loads the dashboard.
 */
const globalCache = global as typeof globalThis & { _cache?: NodeCache };

if (!globalCache._cache) {
  globalCache._cache = new NodeCache({ stdTTL: 300 });
}

export const cache = globalCache._cache;

export const KEYS = {
  rawWeather: (id: number) => `raw_weather_${id}`,
  processed: () => 'processed_result',
};
