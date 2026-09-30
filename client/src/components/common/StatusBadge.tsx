/** StatusBadge — Colored pill badge for status labels */

type StatusVariant =
  | 'completed' | 'active' | 'pending' | 'failed'
  | 'easy' | 'medium' | 'hard'
  | 'beginner' | 'intermediate' | 'advanced'
  | 'admin' | 'user'
  | string;

interface StatusBadgeProps {
  status: StatusVariant;
  /** Override default label */
  label?: string;
}

const VARIANT_MAP: Record<string, string> = {
  // Interview / roadmap status
  completed:    'badge-success',
  active:       'badge-primary',
  'in-progress':'badge-primary',
  pending:      'badge-muted',
  failed:       'badge-danger',

  // Difficulty
  easy:         'badge-success',
  medium:       'badge-warning',
  hard:         'badge-coral',

  // Experience
  beginner:     'badge-cyan',
  intermediate: 'badge-primary',
  advanced:     'badge-coral',

  // Role
  admin:        'badge-warning',
  user:         'badge-muted',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const cls = VARIANT_MAP[status.toLowerCase()] ?? 'badge-muted';
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');

  return (
    <span className={`badge ${cls}`}>
      {displayLabel}
    </span>
  );
}
