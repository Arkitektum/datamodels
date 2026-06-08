const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Arkitektum-logoen fra public/. (PNG med grå bakgrunn – vises på matchende grått felt.) */
export default function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`${BASE}/arkitektum-logo.png`} alt="Arkitektum" className={className} />
  );
}
