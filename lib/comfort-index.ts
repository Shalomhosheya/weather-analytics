import { WeatherResponse } from './weather';

/**
 * Hey there! This file is the brain behind our Comfort Index. 
 * It takes various weather conditions like temperature, humidity, and wind, 
 * and calculates a friendly score from 0 to 100 to let you know how nice it feels outside.
 */

export function tempScore(temp: number): number {
  const ideal = 22;
  const deviation = Math.abs(temp - ideal);
  return Math.max(0, 100 - deviation * 3.5);
}

export function humidityScore(h: number): number {
  if (h >= 40 && h <= 60) return 100;
  const dist = h < 40 ? 40 - h : h - 60;
  return Math.max(0, 100 - dist * 2);
}

export function windScore(ws: number): number {
  if (ws <= 5) return 100 - ws * 4;
  return Math.max(0, 100 - (ws - 5) * 8);
}

export function visibilityScore(v: number): number {
  return Math.min(100, (v / 10000) * 100);
}

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

export function computeComfortIndex(data: WeatherResponse): number {
  const score =
    0.30 * tempScore(data.main.temp) +
    0.22 * humidityScore(data.main.humidity) +
    0.18 * windScore(data.wind.speed) +
    0.10 * visibilityScore(data.visibility) +
    0.10 * pressureScore(data.main.pressure)+
    0.10 * cloudinessScore(data.clouds.all);
  return Math.round(score * 10) / 10;
}
