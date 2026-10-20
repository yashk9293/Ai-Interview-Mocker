import Link from "next/link";

// The product's mark: the original speech-bubble robot in the brand purple.
export function LogoMark({ className = "h-7 w-auto" }) {
  return (
    <svg className={className} viewBox="8 11 56 34" fill="none" aria-hidden="true">
      <path
        d="M8.87 28.22C8.87 19.03 16.26 11.58 25.38 11.58H47.05C56.17 11.58 63.56 19.03 63.56 28.22V44.87H25.38C16.26 44.87 8.87 37.42 8.87 28.22Z"
        fill="#4845D2"
      />
      <path
        d="M46.83 15.92H24.12C18.14 15.92 13.3 21.43 13.3 28.22C13.3 35.02 18.14 40.53 24.12 40.53H46.83C52.8 40.53 57.64 35.02 57.64 28.22C57.64 21.43 52.8 15.92 46.83 15.92Z"
        fill="#A5B4FC"
      />
      <ellipse cx="25.62" cy="28.59" rx="7.88" ry="6.88" fill="#000" />
      <ellipse cx="44.83" cy="28.59" rx="7.88" ry="6.88" fill="#000" />
      <ellipse cx="25.62" cy="29.22" rx="1.97" ry="1.72" fill="#fff" />
      <ellipse cx="44.83" cy="29.22" rx="1.97" ry="1.72" fill="#fff" />
    </svg>
  );
}

export default function Logo({ href = "/", className = "", compact = false }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 text-brand ${className}`}>
      <LogoMark className={compact ? "h-6 w-auto" : "h-7 w-auto"} />
      <span className={`whitespace-nowrap font-bold tracking-[-0.01em] ${compact ? "text-[15px]" : "text-[17px]"}`}>AI Interview Mocker</span>
    </Link>
  );
}
