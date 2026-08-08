function Badge({ children, className = '' }) {
  return <span className={`rounded-full bg-muted px-3 py-1 text-sm font-medium text-text ${className}`}>{children}</span>;
}

export default Badge;
