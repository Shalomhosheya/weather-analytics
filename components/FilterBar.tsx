'use client';
import React from 'react';

interface FilterBarProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export default function FilterBar({ sortBy, setSortBy, searchQuery, setSearchQuery }: FilterBarProps) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
      <input
        type="text"
        placeholder="Search city..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          background: 'transparent',
          color: 'var(--text-primary)'
        }}
      />
      
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          background: 'transparent',
          color: 'var(--text-primary)'
        }}
      >
        <option value="score_desc">Score (High to Low)</option>
        <option value="score_asc">Score (Low to High)</option>
        <option value="temp_desc">Temperature (High to Low)</option>
        <option value="temp_asc">Temperature (Low to High)</option>
        <option value="name_asc">Name (A-Z)</option>
      </select>
    </div>
  );
}
