const iconPaths = {
  alert: (
    <>
      <path d="M10.4 3.3 2.4 17a1.2 1.2 0 0 0 1 1.8h13.2a1.2 1.2 0 0 0 1-1.8l-8-13.7a1.2 1.2 0 0 0-2.2 0Z" />
      <path d="M8 8.5h.01M8 11.4v3.2" />
    </>
  ),
  arrowLeft: <path d="m14.5 4.8-7.2 7.2 7.2 7.2M7.8 12h11" />,
  arrowRight: <path d="m9.5 4.8 7.2 7.2-7.2 7.2M16.2 12h-11" />,
  camera: (
    <>
      <path d="M3.5 7.2h3l1.3-2h4.4l1.3 2h3a1.8 1.8 0 0 1 1.8 1.8v7.5a1.8 1.8 0 0 1-1.8 1.8h-13a1.8 1.8 0 0 1-1.8-1.8V9a1.8 1.8 0 0 1 1.8-1.8Z" />
      <circle cx="10" cy="12.5" r="3.1" />
    </>
  ),
  check: <path d="m4.5 10.4 3.4 3.4 7.6-7.5" />,
  chevronDown: <path d="m5.5 8 4.5 4.5L14.5 8" />,
  chevronRight: <path d="m8 5.5 4.5 4.5L8 14.5" />,
  clock: <><circle cx="10" cy="10" r="7.5" /><path d="M10 6v4.5l3 1.7" /></>,
  close: <path d="m6 6 8 8M14 6l-8 8" />,
  compass: <><circle cx="10" cy="10" r="7.5" /><path d="m13 7-1.4 4.6L7 13l1.4-4.6L13 7Z" /></>,
  folder: <><path d="M2.8 6.2a1.7 1.7 0 0 1 1.7-1.7h3l1.7 1.8h6.3a1.7 1.7 0 0 1 1.7 1.7v6.9a1.7 1.7 0 0 1-1.7 1.7H4.5a1.7 1.7 0 0 1-1.7-1.7V6.2Z" /><path d="M3.1 8.2h13.5" /></>,
  download: <><path d="M10 3v9.2M6.5 8.7 10 12.2l3.5-3.5M4 13.5v1.8A1.7 1.7 0 0 0 5.7 17h8.6a1.7 1.7 0 0 0 1.7-1.7v-1.8" /></>,
  grid: <><rect x="3" y="3" width="5" height="5" rx="1" /><rect x="12" y="3" width="5" height="5" rx="1" /><rect x="3" y="12" width="5" height="5" rx="1" /><rect x="12" y="12" width="5" height="5" rx="1" /></>,
  home: <><path d="m3 9.2 7-6.1 7 6.1v7.1a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.3V9.2Z" /><path d="M7.5 17.8v-5.5h5v5.5" /></>,
  image: <><rect x="2.5" y="3" width="15" height="14" rx="2" /><circle cx="7" cy="7.3" r="1.2" /><path d="m4.5 14 3.3-3.2 2.4 2.2 2-1.8 3.3 2.8" /></>,
  location: <><path d="M16.4 8.2c0 4.2-6.4 8.7-6.4 8.7S3.6 12.4 3.6 8.2a6.4 6.4 0 1 1 12.8 0Z" /><circle cx="10" cy="8" r="2.2" /></>,
  menu: <path d="M4 6h12M4 10h12M4 14h12" />,
  mic: <><path d="M10 3.2a2.5 2.5 0 0 0-2.5 2.5v4.1a2.5 2.5 0 0 0 5 0V5.7A2.5 2.5 0 0 0 10 3.2Z" /><path d="M4.8 9.5a5.2 5.2 0 0 0 10.4 0M10 14.7v2.1M7.5 16.8h5" /></>,
  notes: <><path d="M5 3.5h8l2 2v11H5a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 5 3.5Z" /><path d="M8 8h4M8 11h4M8 14h2" /></>,
  phone: <><path d="M6.2 3.7 8 6.8l-1.2 1.7a11.2 11.2 0 0 0 4.1 4.1l1.7-1.2 3.1 1.8-.4 2.8a1.6 1.6 0 0 1-1.8 1.3A13.7 13.7 0 0 1 3.9 5.9a1.6 1.6 0 0 1 1.3-1.8l1-.4Z" /></>,
  pill: <><path d="M13.7 3.2a4.7 4.7 0 0 1 0 6.6l-4 4a4.7 4.7 0 1 1-6.6-6.6l4-4a4.7 4.7 0 0 1 6.6 0Z" /><path d="m5.2 8.2 4.6 4.6M11 5.4l3.6 3.6" /></>,
  plus: <path d="M10 4.5v11M4.5 10h11" />,
  search: <><circle cx="8.6" cy="8.6" r="5.2" /><path d="m12.5 12.5 4.2 4.2" /></>,
  shield: <><path d="M10 2.8 16 5v4.3c0 4.2-2.3 6.9-6 8-3.7-1.1-6-3.8-6-8V5l6-2.2Z" /><path d="m7.2 10 1.8 1.8 3.8-4" /></>,
  sparkle: <><path d="m10 2 1.3 5.3L16.5 9l-5.2 1.7L10 16l-1.3-5.3L3.5 9l5.2-1.7L10 2ZM16 13.5l.6 2.4 2.4.6-2.4.6-.6 2.4-.6-2.4-2.4-.6 2.4-.6.6-2.4Z" /></>,
  upload: <><path d="M10 13V3.8M6.5 7.3 10 3.8l3.5 3.5M4 11.5v3.3A1.7 1.7 0 0 0 5.7 16.5h8.6a1.7 1.7 0 0 0 1.7-1.7v-3.3" /></>,
}

export default function Icon({ name, size = 20, strokeWidth = 1.8, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`}
      fill="none"
      height={size}
      viewBox="0 0 20 20"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        {iconPaths[name] ?? iconPaths.sparkle}
      </g>
    </svg>
  )
}
