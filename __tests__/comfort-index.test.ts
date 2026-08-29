import {
  tempScore,
  humidityScore,
  windScore,
  visibilityScore,
  pressureScore,
  computeComfortIndex
} from '../lib/comfort-index';

/**
 * These are the tests that make sure our Comfort Index is calculating everything correctly.
 * We want to be absolutely sure the math holds up so our users get the most accurate comfort ratings!
 */
describe('Comfort Index Algorithm', () => {
  test('tempScore should be 100 at ideal temperature (22°C)', () => {
    expect(tempScore(22)).toBe(100);
  });

  test('tempScore should penalize extreme temperatures', () => {
    expect(tempScore(40)).toBeLessThan(50);
    expect(tempScore(0)).toBeLessThan(50);
  });

  test('humidityScore should be 100 within ideal range (40-60%)', () => {
    expect(humidityScore(50)).toBe(100);
    expect(humidityScore(40)).toBe(100);
    expect(humidityScore(60)).toBe(100);
  });

  test('windScore should be high for gentle breeze', () => {
    expect(windScore(3)).toBe(88);
  });

  test('computeComfortIndex calculates composite score correctly', () => {
    const mockData = {
      main: { temp: 22, humidity: 50, pressure: 1013 },
      wind: { speed: 2 },
      visibility: 10000,
      clouds: { all: 30 },
    } as any;
    
    expect(computeComfortIndex(mockData)).toBe(98.6);
  });
});
