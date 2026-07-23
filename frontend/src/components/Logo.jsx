export default function Logo({ className = '', size = 'md', useImage = false, imageSrc = '' }) {
  const sizes = { sm: 'h-9', md: 'h-12', lg: 'h-16' };

  // If using image logo
  if (useImage && imageSrc) {
    return (
      <img
        src={imageSrc}
        alt="SAMBX Forge"
        className={`${sizes[size]} object-contain ${className}`}
      />
    );
  }

  // Default SVG logo
  return (
    <svg
      className={`${sizes[size]} ${className}`}
      viewBox="0 0 240 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Forge anvil/hex symbol */}
      <path
        d="M30 8L52 20V44L30 56L8 44V20L30 8Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M30 8L52 20L30 32L8 20L30 8Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M30 32V56"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M8 20V44L30 56V32L8 20Z"
        fill="currentColor"
        opacity="0.08"
      />
      {/* Inner hex */}
      <path
        d="M30 18L42 24.5V37.5L30 44L18 37.5V24.5L30 18Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      {/* Center dot */}
      <circle cx="30" cy="32" r="3" fill="currentColor" opacity="0.5" />

      {/* SAMBX text */}
      <text
        x="64"
        y="30"
        fontFamily="Space Grotesk, Inter, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="3"
      >
        SAMBX
      </text>
      {/* Forge text */}
      <text
        x="64"
        y="48"
        fontFamily="Space Grotesk, Inter, sans-serif"
        fontSize="14"
        fontWeight="400"
        fill="currentColor"
        opacity="0.6"
        letterSpacing="5"
      >
        FORGE
      </text>
    </svg>
  );
}
