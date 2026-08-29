const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export interface WeatherResponse {
  id: number;
  name: string;
  sys: { country: string };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    clouds:{all:number}
  };
  visibility: number;
  wind: { speed: number; deg: number };

}

export async function fetchWeatherById(cityId: number): Promise<WeatherResponse> {
  const apiKey = process.env.OWM_API_KEY;
  if (!apiKey) {
    throw new Error('OWM_API_KEY environment variable is missing.');
  }

  const url = `${BASE_URL}?id=${cityId}&appid=${apiKey}&units=metric`;

  // Using node-fetch / global fetch
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    throw new Error(`OWM API error: ${res.status}`);
  }

  return res.json();
}
