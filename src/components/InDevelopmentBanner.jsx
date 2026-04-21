export default function InDevelopmentBanner() {
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '8px 14px',
          borderRadius: 999,
          border: '1px solid rgba(255, 189, 89, 0.85)',
          background: 'rgba(20, 18, 8, 0.92)',
          color: '#ffcf7a',
          letterSpacing: '0.16em',
          fontWeight: 700,
          fontSize: '0.72rem',
          boxShadow: '0 0 14px rgba(255, 189, 89, 0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        IN-DEVELOPMENT
      </div>
    </div>
  );
}
