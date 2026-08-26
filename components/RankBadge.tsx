import React from 'react';

interface RankBadgeProps {
  rank: number;
}

export default function RankBadge({ rank }: RankBadgeProps) {
  let badgeContent = `#${rank}`;
  let bg = 'var(--text-secondary, #6b7280)';
  let color = '#ffffff';

  if (rank === 1) {
    badgeContent = '🥇 #1';
    bg = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    color = '#fff';
  } else if (rank === 2) {
    badgeContent = '🥈 #2';
    bg = 'linear-gradient(135deg, #e5e7eb, #9ca3af)';
    color = '#1f2937';
  } else if (rank === 3) {
    badgeContent = '🥉 #3';
    bg = 'linear-gradient(135deg, #fcd34d, #d97706)'; // Bronze-ish
    color = '#fff';
  }

  return (
    <div
      style={{
        background: bg,
        color,
        padding: '4px 12px',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        boxShadow: rank <= 3 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        display: 'inline-block'
      }}
    >
      {badgeContent}
    </div>
  );
}
