'use client';
import React, { useEffect, useState } from 'react';

interface ComfortMeterProps {
  score: number; // 0 to 100
}

export default function ComfortMeter({ score }: ComfortMeterProps) {
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    // Trigger animation after mount
    const timeout = setTimeout(() => setFilled(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  // Determine color based on score
  let color = '#ef4444'; // Red for < 40 (Least comfortable)
  if (score >= 70) color = '#10b981'; // Green for >= 70 (Most comfortable)
  else if (score >= 40) color = '#f59e0b'; // Amber for 40-69 (Moderate)

  return (
    <div style={{ width: '100%', height: '8px', background: 'var(--border-color, #e5e7eb)', borderRadius: '4px', overflow: 'hidden' }}>
      <div
        style={{
          width: `${filled}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
