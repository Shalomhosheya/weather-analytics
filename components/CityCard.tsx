import React from 'react';
import styles from '../styles/card.module.css';
import ComfortMeter from './ComfortMeter';
import RankBadge from './RankBadge';

export interface CityResult {
  rank: number;
  cityId: number;
  cityName: string;
  country: string;
  description: string;
  icon: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  clouds:number;
  comfortScore: number;
}

interface CityCardProps {
  city: CityResult;
}

export default function CityCard({ city }: CityCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cityName}>{city.cityName}</h2>
          <span className={styles.country}>{city.country}</span>
        </div>
        <RankBadge rank={city.rank} />
      </div>

      <div className={styles.mainWeather}>
        <img
          src={`https://openweathermap.org/img/wn/${city.icon}@2x.png`}
          alt={city.description}
          width="64"
          height="64"
        />
        <div>
          <div className={styles.temp}>{Math.round(city.temp)}°C</div>
          <div className={styles.desc}>{city.description}</div>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <span>💧</span> {city.humidity}% Humidity
        </div>
        <div className={styles.detailItem}>
          <span>💨</span> {city.windSpeed} m/s Wind
        </div>
        <div className={styles.detailItem}>
          <span>👁️</span> {city.visibility / 1000} km Vis
        </div>
        <div className={styles.detailItem}>
          <span>🌡️</span> {city.pressure} hPa
        </div>
        <div className={styles.detailItem}>
          <span>☁️</span> {city.clouds} Cloudiness
        </div>

      </div>

      <div className={styles.comfortSection}>
        <div className={styles.comfortHeader}>
          <span className={styles.comfortLabel}>Comfort Index</span>
          <span className={styles.comfortScore}>{city.comfortScore.toFixed(1)}</span>
        </div>
        <ComfortMeter score={city.comfortScore} />
      </div>
    </div>
  );
}
