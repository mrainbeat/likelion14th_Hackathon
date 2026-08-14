export default function GlowCard({
  color,
  blur = 20,
  radius = 12,
  className = "",
  style,
  children,
}) {
  return (
    <div className="relative w-full">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: color,
          filter: `blur(${blur}px)`,
          borderRadius: radius,
        }}
      />
      <div className={`relative ${className}`} style={style}>
        {children}
      </div>
    </div>
  );
}
