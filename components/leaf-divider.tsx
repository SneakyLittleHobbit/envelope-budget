export function LeafDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-2 ${className}`}>
      <svg
        width="120"
        height="16"
        viewBox="0 0 120 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-budget-green/20"
        aria-hidden="true"
      >
        {/* Left branch */}
        <path
          d="M10 8 Q20 4 30 8 Q35 6 40 8"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Left leaf */}
        <path
          d="M18 6 Q22 2 26 6 Q22 5 18 6Z"
          fill="currentColor"
          opacity="0.6"
        />
        {/* Center line */}
        <line
          x1="40"
          y1="8"
          x2="80"
          y2="8"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 3"
        />
        {/* Center diamond */}
        <path
          d="M58 5 L60 3 L62 5 L60 7Z"
          fill="currentColor"
          opacity="0.5"
        />
        {/* Right branch */}
        <path
          d="M80 8 Q85 6 90 8 Q100 4 110 8"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Right leaf */}
        <path
          d="M94 6 Q98 2 102 6 Q98 5 94 6Z"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}
