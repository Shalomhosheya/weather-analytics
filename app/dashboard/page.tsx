'use client';
import React, { useEffect, useState } from 'react';
import styles from '../../styles/dashboard.module.css';
import CityCard, { CityResult } from '../../components/CityCard';
import ThemeToggle from '../../components/ThemeToggle';
import FilterBar from '../../components/FilterBar';
import WeatherChart from '../../components/WeatherChart';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useUser();
  const [data, setData] = useState<{ cities: CityResult[]; generatedAt: string; cacheStatus: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [sortBy, setSortBy] = useState('score_desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/weather')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch weather data');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (authLoading || loading) {
    return (
      <div className={styles.dashboard}>
        <h1 className={styles.header}>Loading dashboard...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <h1 className={styles.header}>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  const filteredCities = data?.cities
    .filter(c => c.cityName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score_desc') return b.comfortScore - a.comfortScore;
      if (sortBy === 'score_asc') return a.comfortScore - b.comfortScore;
      if (sortBy === 'temp_desc') return b.temp - a.temp;
      if (sortBy === 'temp_asc') return a.temp - b.temp;
      if (sortBy === 'name_asc') return a.cityName.localeCompare(b.cityName);
      return 0;
    }) || [];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1>🌤 Weather Analytics</h1>
          {user && <p style={{ color: 'var(--text-secondary)' }}>Logged in as {user.email}</p>}
        </div>
        <div className={styles.controls}>
          <ThemeToggle />
          <a href="/api/auth/logout" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ef4444', color: '#fff', fontWeight: 'bold' }}>Logout</a>
        </div>
      </header>

      <FilterBar 
        sortBy={sortBy} setSortBy={setSortBy}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
      />

      <div className={styles.grid}>
        {filteredCities.map((city) => (
          <CityCard key={city.cityId} city={city} />
        ))}
      </div>
      
      {filteredCities.length > 0 && (
        <div className={styles.chartContainer}>
          <WeatherChart cities={filteredCities} />
        </div>
      )}

      {data && (
        <div className={styles.cacheStatus}>
          Data generated at: {new Date(data.generatedAt).toLocaleTimeString()} | Cache Status: <strong>{data.cacheStatus}</strong>
        </div>
      )}
    </div>
  );
}
