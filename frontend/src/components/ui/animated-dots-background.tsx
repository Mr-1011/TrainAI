export function AnimatedDotsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
