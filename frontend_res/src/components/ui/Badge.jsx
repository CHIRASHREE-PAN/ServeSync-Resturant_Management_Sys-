const badgeTones = {
  neutral: 'bg-muted text-text border-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  accent: 'bg-accent/15 text-text border-accent/30',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-error/10 text-error border-error/20',
  info: 'bg-info/10 text-info border-info/20',
};

function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-tight ${
        badgeTones[tone] ?? badgeTones.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
