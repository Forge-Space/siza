interface AmbientVideoBackgroundProps {
  src: string;
  className?: string;
  overlayClassName?: string;
}

export function AmbientVideoBackground({
  src,
  className = '',
  overlayClassName = '',
}: AmbientVideoBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <video
        className="siza-video-bg opacity-40"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.18),transparent_50%)] ${overlayClassName}`}
      />
    </div>
  );
}
