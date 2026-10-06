// Original, simple flat-icon-style SVG illustrations for each organ type.
// Drawn as basic geometric shapes (no traced/copied artwork), kept small and
// colorful so they read clearly at list-row size (28-40px) as well as larger
// hero sizes on the landing page.

function IconBase({ size = 32, viewBox = '0 0 64 64', children, bg }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
      {bg && <circle cx="32" cy="32" r="32" fill={bg} />}
      {children}
    </svg>
  );
}

export function KidneyIcon({ size = 32, withBg = true }) {
  return (
    <IconBase size={size} bg={withBg ? '#FBE7E5' : undefined}>
      <path
        d="M38 16c-7 0-12 6-12 14 0 5 2 8 2 12 0 5-4 6-4 10 0 3 3 6 8 6 9 0 14-8 14-18v-6c0-10-3-18-8-18z"
        fill="#B23A32"
      />
      <ellipse cx="33" cy="32" rx="4.5" ry="7" fill="#FBE7E5" />
    </IconBase>
  );
}

export function HeartOrganIcon({ size = 32, withBg = true }) {
  return (
    <IconBase size={size} bg={withBg ? '#FBE7E5' : undefined}>
      <path
        d="M32 46s-16-9.5-16-21.5C16 17.6 20.9 13 26.5 13c2.9 0 5.5 1.5 5.5 1.5S34.6 13 37.5 13C43.1 13 48 17.6 48 24.5 48 36.5 32 46 32 46z"
        fill="#C1443D"
      />
      <path d="M25 22c1.5-2 4-2.5 6-1" stroke="#FBE7E5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </IconBase>
  );
}

export function LiverIcon({ size = 32, withBg = true }) {
  return (
    <IconBase size={size} bg={withBg ? '#F3E4DE' : undefined}>
      <path
        d="M18 28c0-6 6-10 13-10 6 0 9 3 13 3 4 0 6 3 6 7 0 8-4 15-16 15-9 0-16-6-16-15z"
        fill="#8B3A2F"
      />
      <path d="M24 24c3-1.5 6-1.5 9 0" stroke="#F3E4DE" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </IconBase>
  );
}

export function LungIcon({ size = 32, withBg = true }) {
  return (
    <IconBase size={size} bg={withBg ? '#E9EEFB' : undefined}>
      <path d="M32 14v10" stroke="#7C8FE0" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M30 24c-2-3-6-4-9-2-5 3-6 12-4 18 1.5 4 5 5 7 3 2-2 2-6 2-10s2-7 4-9z"
        fill="#8FA0EA"
      />
      <path
        d="M34 24c2-3 6-4 9-2 5 3 6 12 4 18-1.5 4-5 5-7 3-2-2-2-6-2-10s-2-7-4-9z"
        fill="#8FA0EA"
      />
    </IconBase>
  );
}

export function PancreasIcon({ size = 32, withBg = true }) {
  return (
    <IconBase size={size} bg={withBg ? '#FBF1DD' : undefined}>
      <path
        d="M16 30c0-3 3-5 7-5 8 0 8-4 15-4 6 0 9 3 9 7s-4 6-9 6c-5 0-9-2-13-2-6 0-9 1-9-2z"
        fill="#C98A2E"
      />
      <circle cx="21" cy="29" r="2" fill="#FBF1DD" />
    </IconBase>
  );
}

export const ORGAN_ICONS = {
  Kidney: KidneyIcon,
  Heart: HeartOrganIcon,
  Liver: LiverIcon,
  Lung: LungIcon,
  Pancreas: PancreasIcon,
};

export function OrganIcon({ organ, size = 32, withBg = true }) {
  const Icon = ORGAN_ICONS[organ];
  if (!Icon) return null;
  return <Icon size={size} withBg={withBg} />;
}

/* ---------- Supporting icons used on the landing page ---------- */

export function HospitalIcon({ size = 40 }) {
  return (
    <IconBase size={size} bg="#E4EAFB">
      <rect x="18" y="20" width="28" height="26" rx="2" fill="#33489E" />
      <rect x="28" y="12" width="8" height="16" rx="1" fill="#33489E" />
      <path d="M32 30v8M28 34h8" stroke="#E4EAFB" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="23" y="34" width="5" height="8" fill="#E4EAFB" />
      <rect x="36" y="34" width="5" height="8" fill="#E4EAFB" />
    </IconBase>
  );
}

export function AmbulanceIcon({ size = 40 }) {
  return (
    <IconBase size={size} bg="#E4F3E9">
      <rect x="12" y="26" width="30" height="14" rx="2" fill="#1F6F54" />
      <path d="M42 30h6l4 5v5h-10z" fill="#1F6F54" />
      <circle cx="20" cy="42" r="3.5" fill="#16513E" />
      <circle cx="42" cy="42" r="3.5" fill="#16513E" />
      <path d="M24 30v8M20 34h8" stroke="#E4F3E9" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

export function ShieldIcon({ size = 40 }) {
  return (
    <IconBase size={size} bg="#F3E9E0">
      <path d="M32 14l12 5v9c0 9-5.5 15-12 18-6.5-3-12-9-12-18v-9z" fill="#8A4B2E" />
      <path d="M27 32l4 4 7-8" stroke="#F3E9E0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </IconBase>
  );
}

export function PulseIcon({ size = 40, color = '#1F6F54' }) {
  return (
    <svg width={size} height={size * 0.4} viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 24h20l8-16 10 32 8-24 6 8h68"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
