import NodeCache from 'node-cache';

// Singleton pattern — survives hot reloads in dev via globalThis
const globalCache = global as typeof globalThis & { _cache?: NodeCache };

if (!globalCache._cache) {
  globalCache._cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default
}

export const cache = globalCache._cache;

// Keys
export const KEYS = {
  rawWeather: (id: number) => `raw_weather_${id}`,
  processed: () => 'processed_result',
};
