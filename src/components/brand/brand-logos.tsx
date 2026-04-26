'use client';

import type { FxBrandRename } from '@/types/fx';

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

/** Main AmpSim platform logo */
export function PlatformLogo({ className, width = 200, height = 60 }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 60"
      fill="none"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Amp Simulation Platform logo"
    >
      <rect x="2" y="2" width="56" height="56" rx="12" fill="#1a1a2e" stroke="#e94560" strokeWidth="2" />
      <path d="M18 42V22l12-6 12 6v20" stroke="#e94560" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="32" r="4" fill="#e94560" />
      <line x1="30" y1="28" x2="30" y2="18" stroke="#e94560" strokeWidth="2" strokeLinecap="round" />
      <text x="68" y="28" fontFamily="sans-serif" fontWeight="700" fontSize="20" fill="#e94560">Amp</text>
      <text x="68" y="48" fontFamily="sans-serif" fontWeight="400" fontSize="14" fill="#a0a0b8">Sim Platform</text>
    </svg>
  );
}

/** Platform icon mark only (no text) */
export function PlatformIcon({ className, width = 32, height = 32 }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="AmpSim icon"
    >
      <rect width="32" height="32" rx="6" fill="#1a1a2e" />
      <path d="M8 24V12l8-4 8 4v12" stroke="#e94560" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="18" r="3" fill="#e94560" />
      <line x1="16" y1="15" x2="16" y2="9" stroke="#e94560" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}


/** MAC brand logo (MXR rename) — gold/orange */
export function MacLogo({ className, width = 120, height = 48 }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 48"
      fill="none"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="MAC brand logo"
    >
      <rect x="1" y="1" width="46" height="46" rx="10" fill="#1a1a2e" stroke="#f5a623" strokeWidth="2" />
      <text x="24" y="30" fontFamily="sans-serif" fontWeight="800" fontSize="18" fill="#f5a623" textAnchor="middle">M</text>
      <text x="56" y="22" fontFamily="sans-serif" fontWeight="700" fontSize="16" fill="#f5a623">MAC</text>
      <text x="56" y="38" fontFamily="sans-serif" fontWeight="400" fontSize="10" fill="#a0a0b8">Effects</text>
    </svg>
  );
}

/** KING brand logo (BOSS rename) — blue */
export function KingLogo({ className, width = 120, height = 48 }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 48"
      fill="none"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="KING brand logo"
    >
      <rect x="1" y="1" width="46" height="46" rx="10" fill="#1a1a2e" stroke="#2563eb" strokeWidth="2" />
      <text x="24" y="30" fontFamily="sans-serif" fontWeight="800" fontSize="18" fill="#2563eb" textAnchor="middle">K</text>
      <text x="56" y="22" fontFamily="sans-serif" fontWeight="700" fontSize="16" fill="#2563eb">KING</text>
      <text x="56" y="38" fontFamily="sans-serif" fontWeight="400" fontSize="10" fill="#a0a0b8">Effects</text>
    </svg>
  );
}

/** Manhattan brand logo (Electro-Harmonix rename) — purple */
export function ManhattanLogo({ className, width = 160, height = 48 }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 48"
      fill="none"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Manhattan brand logo"
    >
      <rect x="1" y="1" width="46" height="46" rx="10" fill="#1a1a2e" stroke="#7c3aed" strokeWidth="2" />
      <text x="24" y="30" fontFamily="sans-serif" fontWeight="800" fontSize="16" fill="#7c3aed" textAnchor="middle">Mh</text>
      <text x="56" y="22" fontFamily="sans-serif" fontWeight="700" fontSize="14" fill="#7c3aed">Manhattan</text>
      <text x="56" y="38" fontFamily="sans-serif" fontWeight="400" fontSize="10" fill="#a0a0b8">Effects</text>
    </svg>
  );
}

/** TOKYO brand logo (Ibanez rename) — green */
export function TokyoLogo({ className, width = 140, height = 48 }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 48"
      fill="none"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="TOKYO brand logo"
    >
      <rect x="1" y="1" width="46" height="46" rx="10" fill="#1a1a2e" stroke="#059669" strokeWidth="2" />
      <text x="24" y="30" fontFamily="sans-serif" fontWeight="800" fontSize="16" fill="#059669" textAnchor="middle">T</text>
      <text x="56" y="22" fontFamily="sans-serif" fontWeight="700" fontSize="16" fill="#059669">TOKYO</text>
      <text x="56" y="38" fontFamily="sans-serif" fontWeight="400" fontSize="10" fill="#a0a0b8">Effects</text>
    </svg>
  );
}

/** Brand color map for programmatic use */
export const BRAND_COLORS: Record<FxBrandRename, string> = {
  MAC: '#f5a623',
  KING: '#2563eb',
  Manhattan: '#7c3aed',
  TOKYO: '#059669',
} as const;

/** Platform accent color */
export const PLATFORM_ACCENT = '#e94560';

/** Lookup component by brand name */
const BRAND_LOGO_MAP: Record<FxBrandRename, React.FC<BrandLogoProps>> = {
  MAC: MacLogo,
  KING: KingLogo,
  Manhattan: ManhattanLogo,
  TOKYO: TokyoLogo,
};

/** Render the correct brand logo by FxBrandRename key */
export function BrandLogo({ brand, ...props }: BrandLogoProps & { brand: FxBrandRename }) {
  const Logo = BRAND_LOGO_MAP[brand];
  return <Logo {...props} />;
}
