'use client';
import React, { useEffect, useState } from 'react';

/**
 * A delightful little animated progress bar component! 
 * It takes the final comfort score and visually displays it, changing colors depending on how comfortable the city is.
 */
interface ComfortMeterProps {
  score: number;
}

export default function ComfortMeter({ score }: ComfortMeterProps) {
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setFilled(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  let color = '#ef4444';
  if (score >= 70) color = '#10b981';
  else if (score >= 40) color = '#f59e0b';

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
