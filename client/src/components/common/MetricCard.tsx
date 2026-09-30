/** MetricCard — Pastel stat card with icon, metric value, label, and trend */

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  /** Sub-label below the value */
  sublabel?: string;
  icon: ReactNode;
  /** Color variant for the icon tile */
  color?: 'primary' | 'coral' | 'cyan' | 'success' | 'warning';
  /** Trend direction and magnitude */
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string };
  /** Optional progress bar 0–100 */
  progress?: number;
}

const COLOR_MAP = {
  primary: { bg: 'var(--primary-soft)',  icon: 'var(--primary-text)' },
  coral:   { bg: 'var(--coral-soft)',    icon: 'var(--coral-text)' },
  cyan:    { bg: 'var(--cyan-soft)',     icon: 'var(--cyan-text)' },
  success: { bg: 'var(--success-soft)',  icon: 'var(--success-text)' },
  warning: { bg: 'var(--warning-soft)',  icon: 'var(--warning-text)' },
};

export function MetricCard({
  label,
  value,
  sublabel,
  icon,
  color = 'primary',
  trend,
  progress,
}: MetricCardProps) {
  const colors = COLOR_MAP[color];

  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
      ? TrendingDown
      : Minus;

  const trendColor =
    trend?.direction === 'up'
      ? 'var(--success-text)'
      : trend?.direction === 'down'
      ? 'var(--danger-text)'
      : 'var(--text-muted)';

  return (
    <div className="metric-card">
      {/* Icon tile */}
      <div
        className="metric-card-icon"
        style={{ background: colors.bg, color: colors.icon }}
      >
        {icon}
      </div>

      {/* Value */}
      <p className="metric-value">{value}</p>
      <p className="metric-label">{label}</p>

      {sublabel && (
        <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
          {sublabel}
        </p>
      )}

      {/* Trend */}
      {trend && (
        <div
          className="metric-trend"
          style={{ color: trendColor, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <TrendIcon size={13} />
          <span>{trend.label}</span>
        </div>
      )}

      {/* Optional progress bar */}
      {typeof progress === 'number' && (
        <div style={{ marginTop: 12 }}>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, progress)}%`,
                background: colors.icon,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
