import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(90deg, #0070f3, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Weather Analytics
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2.5rem' }}>
        Secure, highly-performant weather dashboard with a custom Comfort Index scoring algorithm.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/api/auth/login?returnTo=/dashboard" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0070f3', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '1.125rem', boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)', transition: 'background-color 0.2s' }}>
          Login to Dashboard
        </a>
        <a href="https://github.com/fidenz/weather-analytics" target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 600, fontSize: '1.125rem' }}>
          View Source
        </a>
      </div>
    </main>
  );
}
