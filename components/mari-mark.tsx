/**
 * Mari's emblem: a calm profile silhouette with a soft low bun,
 * set in a fjord-blue medallion with a warm sand halo.
 */
export function MariMark({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Mari"
      className={className}
    >
      <defs>
        <clipPath id="mari-clip">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <linearGradient id="mari-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a7f9d" />
          <stop offset="1" stopColor="#2f5c76" />
        </linearGradient>
      </defs>
      <g clipPath="url(#mari-clip)">
        <rect width="64" height="64" fill="url(#mari-bg)" />
        <circle cx="34" cy="25" r="17" fill="#e3b955" opacity="0.22" />
        {/* low bun */}
        <circle cx="18.6" cy="27.5" r="5.6" fill="#f6f8f7" />
        {/* head, profile, neck and shoulders */}
        <path
          fill="#f6f8f7"
          d="M23.5 45.5 C21.6 40.6 19.4 35.4 20.2 28.2 C21.2 18.6 27.6 12.6 35 12.9 C40.4 13.2 43 17.4 42.2 21.6 L44.6 26.2 C45 27.1 44.1 27.6 42.6 27.8 C43.2 28.8 43 29.5 42.2 30 C42.8 30.8 42.6 31.8 41.6 32.3 C41.6 34.3 40.6 35.8 38.2 36.1 C36.4 36.3 35.6 37.6 35.8 40.4 C36 43.6 38.4 46.4 43 48 C50.4 50.6 55 56 56 64 L8 64 C9 55.6 15 49 23.5 45.5 Z"
        />
        {/* sage collar accent */}
        <path fill="#9fbfb0" d="M24 49.2 C28.6 52.6 35.6 53.2 41.4 50 L43.6 51 C37.8 56 28.4 56 21.6 50.6 Z" />
        {/* hair line */}
        <path
          fill="none"
          stroke="#c9d9e2"
          strokeWidth="1.1"
          strokeLinecap="round"
          d="M24.6 20.6 C27.8 16.4 33.4 15.4 38.2 17.2"
        />
      </g>
    </svg>
  );
}
