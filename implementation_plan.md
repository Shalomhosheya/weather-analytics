# Fidenz Full Stack Assignment — Advanced Implementation Plan

## Overview

A full-stack **Weather Analytics Application** with Auth0-secured access, a custom Comfort Index engine, server-side caching, and a responsive premium UI.

---

## Tech Stack Decision

| Layer | Choice | Reason |
|---|---|---|
| Frontend | **Next.js 14 (App Router)** | SSR, API Routes, file-based routing, best Auth0 DX |
| Backend | **Next.js API Routes** | Collocated with frontend, no separate server needed |
| Language | **TypeScript** | Type safety across full stack |
| Styling | **Vanilla CSS + CSS Modules** | No Tailwind, full control, premium animations |
| Auth | **Auth0 (next-auth / @auth0/nextjs-auth0)** | Official SDK, handles MFA and RBAC |
| Caching | **Node-Cache (in-memory)** | Simple, fast, per-process TTL control |
| Charts | **Chart.js + react-chartjs-2** | Lightweight, animated graphs |
| Testing | **Jest + ts-jest** | Unit tests for Comfort Index |
| Hosting | **Vercel** | Zero-config Next.js deployment |

---

## Project Structure

```
/weather-analytics
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing / login page
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard
│   └── api/
│       ├── auth/[auth0]/         # Auth0 catch-all route
│       ├── weather/
│       │   └── route.ts          # Main weather endpoint
│       ├── cache-status/
│       │   └── route.ts          # Debug cache HIT/MISS endpoint
│       └── health/
│           └── route.ts          # Health check
├── lib/
│   ├── cache.ts                  # Node-Cache singleton
│   ├── comfort-index.ts          # Comfort Index algorithm + unit tests
│   ├── weather.ts                # OpenWeatherMap API client
│   └── cities.ts                 # cities.json parser
├── components/
│   ├── CityCard.tsx              # Weather card per city
│   ├── RankBadge.tsx             # Rank #1/#2/#3 medal badge
│   ├── ComfortMeter.tsx          # Animated 0-100 score meter
│   ├── WeatherChart.tsx          # Chart.js temperature graph
│   ├── FilterBar.tsx             # Sort/filter controls
│   ├── ThemeToggle.tsx           # Dark/Light mode toggle
│   └── AuthButton.tsx            # Login/Logout button
├── data/
│   └── cities.json               # City codes (provided)
├── styles/
│   ├── globals.css               # CSS variables, reset, typography
│   ├── dashboard.module.css      # Dashboard layout
│   └── card.module.css           # City card styles
├── types/
│   └── weather.ts                # TypeScript interfaces
├── __tests__/
│   └── comfort-index.test.ts     # Jest unit tests
├── .env.local                    # Secrets (not committed)
├── README.md
└── next.config.ts
```

---

## Part 1 — Weather Analytics

### Step 1: City Code Extraction

**File**: `lib/cities.ts`

```typescript
import citiesData from '@/data/cities.json';

export interface City {
  CityCode: number;
  CityName: string;
}

export function extractCityCodes(): City[] {
  return citiesData
    .filter((c: any) => c.CityCode)
    .slice(0, 20); // Process at least 10, cap at 20
}
```

- Parse `cities.json` at server startup
- Extract `CityCode` + `CityName` into typed array
- Minimum 10, target 15-20 cities

---

### Step 2: Weather API Client

**File**: `lib/weather.ts`

```typescript
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeatherById(cityId: number): Promise<WeatherResponse> {
  const url = `${BASE_URL}?id=${cityId}&appid=${process.env.OWM_API_KEY}&units=metric`;
  const res = await fetch(url, { next: { revalidate: 0 } }); // manual cache control
  if (!res.ok) throw new Error(`OWM API error: ${res.status}`);
  return res.json();
}
```

- Uses `units=metric` to get Celsius directly
- Error handling per city (skip failed, continue others)
- Parallel fetching with `Promise.allSettled` to avoid one failure blocking all

---

### Step 3: Comfort Index Algorithm

**File**: `lib/comfort-index.ts`

#### Formula Design

The Comfort Index models **human thermal comfort** using physiological and meteorological parameters:

```
CI = w₁·T_score + w₂·H_score + w₃·W_score + w₄·V_score + w₅·P_score
```

| Parameter | Symbol | Weight | Reasoning |
|---|---|---|---|
| Temperature (°C) | T | **35%** | Strongest direct human comfort impact |
| Humidity (%) | H | **25%** | Amplifies heat discomfort (muggy/dry) |
| Wind Speed (m/s) | W | **20%** | Cooling effect, but extreme wind is bad |
| Visibility (m) | V | **10%** | Fog/smog impacts liveability |
| Pressure (hPa) | P | **10%** | Barometric pressure affects mood/health |

**Individual scoring sub-functions (all return 0–100):**

```typescript
// Temperature: ideal ~22°C, penalties for extremes
function tempScore(temp: number): number {
  const ideal = 22;
  const deviation = Math.abs(temp - ideal);
  return Math.max(0, 100 - deviation * 3.5);
}

// Humidity: ideal 40–60%, penalty outside that range
function humidityScore(h: number): number {
  if (h >= 40 && h <= 60) return 100;
  const dist = h < 40 ? 40 - h : h - 60;
  return Math.max(0, 100 - dist * 2);
}

// Wind: 0–5 m/s is comfortable, >15 m/s is penalised heavily
function windScore(ws: number): number {
  if (ws <= 5) return 100 - ws * 4;
  return Math.max(0, 100 - (ws - 5) * 8);
}

// Visibility: 10,000m = perfect, fog = 0
function visibilityScore(v: number): number {
  return Math.min(100, (v / 10000) * 100);
}

// Pressure: ideal 1013 hPa (sea level), ±30 hPa band
function pressureScore(p: number): number {
  const ideal = 1013;
  const deviation = Math.abs(p - ideal);
  return Math.max(0, 100 - deviation * 1.5);
}

// Final weighted composite
export function computeComfortIndex(data: WeatherData): number {
  const score =
    0.35 * tempScore(data.temp) +
    0.25 * humidityScore(data.humidity) +
    0.20 * windScore(data.windSpeed) +
    0.10 * visibilityScore(data.visibility) +
    0.10 * pressureScore(data.pressure);
  return Math.round(score * 10) / 10; // one decimal
}
```

**Design trade-offs noted in README:**
- Temperature weighted highest because it has the most direct human comfort impact
- Wind benefits from gentle breeze (up to 5 m/s), but strong wind is penalised more steeply
- Pressure is included as a secondary signal (affects mood/headaches at extremes)
- Dew point not directly available, so humidity is used as its proxy

---

### Step 4: Main API Route

**File**: `app/api/weather/route.ts`

```
GET /api/weather
```

**Logic flow:**

```
1. Check processed cache → HIT: return immediately
2. Fetch each city from OWM (parallel with allSettled)
   - Per city: check raw cache → HIT: use cached; MISS: fetch + store raw
3. Compute ComfortIndex per city
4. Sort cities by score DESC (Most Comfortable → Least)
5. Assign rank (1 = best)
6. Store processed result in cache (5 min TTL)
7. Return JSON with cacheStatus metadata
```

**Response shape:**

```typescript
interface ApiResponse {
  cities: CityResult[];
  generatedAt: string;
  cacheStatus: 'HIT' | 'MISS';
}

interface CityResult {
  rank: number;
  cityId: number;
  cityName: string;
  country: string;
  description: string;
  icon: string;
  temp: number;          // °C
  feelsLike: number;
  humidity: number;      // %
  windSpeed: number;     // m/s
  visibility: number;    // m
  pressure: number;      // hPa
  clouds: number;        // %
  comfortScore: number;  // 0–100
}
```

---

### Step 5: Caching Layer

**File**: `lib/cache.ts`

```typescript
import NodeCache from 'node-cache';

// Singleton pattern — survives hot reloads in dev via globalThis
const globalCache = global as typeof globalThis & { _cache?: NodeCache };

if (!globalCache._cache) {
  globalCache._cache = new NodeCache({ stdTTL: 300 }); // 5 minutes
}

export const cache = globalCache._cache;

// Keys
export const KEYS = {
  rawWeather: (id: number) => `raw_weather_${id}`,
  processed: () => 'processed_result',
};
```

**Cache debug endpoint**: `GET /api/cache-status`

```json
{
  "processedCacheAge": "2m 14s",
  "processedCacheStatus": "HIT",
  "rawCityCacheStatuses": [
    { "cityId": 2172797, "status": "HIT", "ttlRemaining": "3m 46s" },
    { "cityId": 1172451, "status": "MISS" }
  ]
}
```

**Cache strategy summary:**

| Cache Key | TTL | Purpose |
|---|---|---|
| `raw_weather_{id}` | 5 min | Per-city raw OWM response |
| `processed_result` | 5 min | Full sorted ranked result |

Using two separate caches allows partial invalidation and the ability to recompute scores without re-fetching raw data.

---

### Step 6: UI Implementation

#### Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  🌤 Weather Analytics           [Dark Mode] │
│  [Logged in as: user@email.com]  [Logout]   │
├─────────────────────────────────────────────┤
│  Filter: [All ▼]  Sort: [Score ▼]  Search  │
├─────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │ 🥇 #1  │  │ 🥈 #2  │  │ 🥉 #3  │  ...    │
│  │ City   │  │ City   │  │ City   │         │
│  │ Score  │  │ Score  │  │ Score  │         │
│  └────────┘  └────────┘  └────────┘         │
├─────────────────────────────────────────────┤
│  📊 Temperature Trend Across Cities (Chart) │
└─────────────────────────────────────────────┘
```

#### City Card design elements:
- Animated comfort score meter (CSS `@keyframes` fill bar)
- Weather icon from OWM icon CDN
- Color-coded badge: green (>70), amber (40-70), red (<40)
- Rank medal (🥇🥈🥉 for top 3, number otherwise)
- Hover: card lifts with box-shadow + scale(1.03) transition
- Glassmorphism card background (backdrop-filter: blur)

#### Responsive breakpoints:
- Mobile (<640px): 1 column, stacked layout
- Tablet (640–1024px): 2 columns
- Desktop (>1024px): 3–4 columns grid

---

## Part 2 — Authentication & Authorization

### Auth0 Setup

**SDK**: `@auth0/nextjs-auth0` v3

**Configuration** (`.env.local`):
```
AUTH0_SECRET=...
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR_TENANT.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
```

**Catch-all route**: `app/api/auth/[auth0]/route.ts`
```typescript
import { handleAuth } from '@auth0/nextjs-auth0';
export const GET = handleAuth();
```

**Middleware** (`middleware.ts`):
```typescript
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
export default withMiddlewareAuthRequired();
export const config = { matcher: ['/dashboard/:path*', '/api/weather'] };
```

### MFA via Email

In Auth0 Dashboard:
- **Security → Multi-factor Auth → Enable Email**
- Set policy: **Always** (require MFA on every login)
- This sends a one-time code to the user's email before granting access

### Restrict Signups (Whitelist)

In Auth0 Dashboard:
- **Authentication → Database → Disable Sign Ups** toggle → OFF
- Create **Auth0 Action** (Login trigger):

```javascript
// actions/whitelist.js
const WHITELIST = ['careers@fidenz.com'];

exports.onExecutePostLogin = async (event, api) => {
  if (!WHITELIST.includes(event.user.email)) {
    api.access.deny('Access restricted to authorized users only.');
  }
};
```

- Attach action to **Login Flow**

**Test User:**
- Email: `careers@fidenz.com`
- Password: `Pass#fidenz`
- MFA: email OTP enabled

---

## Part 3 — Bonus Features

| Feature | Implementation |
|---|---|
| **Dark Mode** | CSS custom properties (`--bg`, `--text`), toggled via `data-theme` attribute on `<html>`, persisted in `localStorage` |
| **Unit Tests** | Jest tests for all 5 sub-score functions + composite score, edge cases (extreme temps, zero visibility) |
| **Sorting/Filtering** | Frontend `FilterBar` with sort by: Score / Temperature / Humidity / Alphabetical; filter by country |
| **Graphs** | Horizontal bar chart (Chart.js) showing all city temperatures, second chart showing comfort scores |

---

## Environment Variables

```env
# OpenWeatherMap
OWM_API_KEY=your_key_here

# Auth0
AUTH0_SECRET=32-char-random-string
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://tenant.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
```

---

## Development Phases & Time Estimates

| Phase | Tasks | Est. Time |
|---|---|---|
| **Phase 0** | Project scaffold (Next.js + TS), env setup | 30 min |
| **Phase 1** | City parser + OWM client + Comfort Index | 1 hr |
| **Phase 2** | Caching layer + API routes + debug endpoint | 1 hr |
| **Phase 3** | UI components + dashboard page | 2 hr |
| **Phase 4** | Auth0 integration + MFA + whitelist | 1.5 hr |
| **Phase 5** | Dark mode + Charts + Filter/Sort | 1 hr |
| **Phase 6** | Unit tests + README + final polish | 1 hr |
| **Phase 7** | Deploy to Vercel + GitHub push | 30 min |
| **Total** | | **~8.5 hrs** |

---

## README Outline (to write)

```markdown
# Weather Analytics App

## Setup Instructions
## Comfort Index Formula
## Weight Reasoning
## Cache Design
## Trade-offs Considered
## Known Limitations
## Auth0 Configuration
```

---

## Key Trade-offs to Document

1. **In-memory cache vs Redis**: Node-Cache is simpler and zero-infra, but resets on server restart. Redis would survive restarts — acceptable trade-off for this scale.
2. **Next.js API Routes vs Express**: Colocation wins for DX; Express would be needed if scaling to microservices.
3. **Temperature ideal point (22°C)**: Subjective; could be user-configurable in v2.
4. **Weight distribution**: Temperature > Humidity based on ASHRAE Standard 55 (thermal comfort standard) — not arbitrary.
5. **`Promise.allSettled` over `Promise.all`**: One failing OWM city doesn't kill the entire response.

---

## Known Limitations

- In-memory cache resets on server restart / cold start
- OWM free tier rate limits (60 calls/min) — fine for 15-20 cities
- MFA requires user to have email access
- Comfort Index is subjective; ideal parameters may vary by demographic/region
- `cities.json` format assumed — needs validation guard

---

## Verification Checklist

- [ ] 10+ cities processed and ranked
- [ ] Score is 0–100 numerical value
- [ ] Ranking sorted Most → Least comfortable
- [ ] Cache returns HIT on second request within 5 min
- [ ] `/api/cache-status` shows HIT/MISS per city
- [ ] Dashboard inaccessible without login (401 redirect)
- [ ] MFA prompts on login
- [ ] Non-whitelisted email rejected
- [ ] `careers@fidenz.com` / `Pass#fidenz` login works end-to-end
- [ ] Mobile layout renders correctly
- [ ] Dark mode toggles and persists
- [ ] Unit tests pass (`npm test`)
- [ ] README complete
- [ ] Deployed and GitHub pushed with reviewer access
