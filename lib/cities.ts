import citiesData from '../data/cities.json';

export interface City {
  CityCode: number;
  CityName: string;
}

export function extractCityCodes(): City[] {
  return (citiesData as any[])
    .filter((c: any) => c.CityCode)
    .slice(0, 20)
    .map(c => ({
      CityCode: c.CityCode,
      CityName: c.CityName || 'Unknown City'
    }));
}
