import { WeatherResponse } from './weather';

// Temperature: ideal ~22°C, penalties for extremes
export function tempScore(temp: number): number {
  const ideal = 22;
  const deviation = Math.abs(temp - ideal);
  return Math.max(0, 100 - deviation * 3.5);
}

// Humidity: ideal 40–60%, penalty outside that range
export function humidityScore(h: number): number {
  if (h >= 40 && h <= 60) return 100;
  const dist = h < 40 ? 40 - h : h - 60;
  return Math.max(0, 100 - dist * 2);
}

// Wind: 0–5 m/s is comfortable, >15 m/s is penalised heavily
export function windScore(ws: number): number {
  if (ws <= 5) return 100 - ws * 4;
  return Math.max(0, 100 - (ws - 5) * 8);
}

// Visibility: 10,000m = perfect, fog = 0
export function visibilityScore(v: number): number {
  return Math.min(100, (v / 10000) * 100);
}

// Pressure: ideal 1013 hPa (sea level), ±30 hPa band
export function pressureScore(p: number): number {
  const ideal = 1013;
  const deviation = Math.abs(p - ideal);
  return Math.max(0, 100 - deviation * 1.5);
}

export function cloudinessScore(c: number):number{
if(c >= 20 && c<=40) return 100;
const dist = c<20?20-c :c-40;
return Math.max(0,100-dist*1.5);
}



// Final weighted composite
export function computeComfortIndex(data: WeatherResponse): number {
  const score =
    0.30 * tempScore(data.main.temp) +
    0.22 * humidityScore(data.main.humidity) +
    0.18 * windScore(data.wind.speed) +
    0.10 * visibilityScore(data.visibility) +
    0.10 * pressureScore(data.main.pressure)+
    0.10 * cloudinessScore(data.clouds.all);
  return Math.round(score * 10) / 10; // one decimal
}
