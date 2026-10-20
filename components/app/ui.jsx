import Link from "next/link";

// App-screen primitives (true-black flat): elevation by lightness alone,
// --bg ground, --surface panels, --raised nested; no borders or shadows on
// panels; the primary control is an inverted pill; brand only on data.
// Type scale: 12 / 14 / 16 / 24 / 32, Jost, tabular figures on numbers.

export function Panel({ as: Tag = "section", className = "", children, ...props }) {
  return (
    <Tag className={`rounded-lg border border-line bg-surface p-5 ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function PanelHeader({ title, meta, action, as: Heading = "h2" }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <Heading className="text-[14px] font-medium text-ink">{title}</Heading>
        {meta != null && <span className="num text-[12px] text-faint">{meta}</span>}
      </div>
      {action}
    </div>
  );
}

const pill =
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[14px] font-medium transition-[transform,background-color,opacity] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60";

export function PrimaryButton({ href, className = "", children, ...props }) {
  const cls = `${pill} bg-brand text-white hover:bg-brand-hover ${className}`;
  return href ? <Link href={href} className={cls} {...props}>{children}</Link> : <button className={cls} {...props}>{children}</button>;
}

export function SecondaryButton({ href, className = "", children, ...props }) {
  const cls = `${pill} bg-raised text-ink hover:bg-[#e4e4ee] ${className}`;
  return href ? <Link href={href} className={cls} {...props}>{children}</Link> : <button className={cls} {...props}>{children}</button>;
}

export function TextAction({ href, className = "", children, ...props }) {
  const cls = `text-[14px] text-ink underline-offset-4 hover:underline ${className}`;
  return href ? <Link href={href} className={cls} {...props}>{children}</Link> : <button className={cls} {...props}>{children}</button>;
}

// Colour says good or poor, never just "a number": 7+ green, 4 or under red.
export function ratingTone(rating) {
  if (rating == null) return "text-faint";
  if (rating >= 7) return "text-positive";
  if (rating <= 4) return "text-negative";
  return "text-ink";
}

export function Rating({ value, size = 16, className = "" }) {
  if (value == null) return <span className={`num text-faint ${className}`}>–</span>;
  return (
    <span className={`num whitespace-nowrap ${className}`} style={{ fontSize: size }}>
      <span className={ratingTone(value)}>{Number.isInteger(value) ? value : value.toFixed(1)}</span>
      <span className="text-[12px] text-faint"> /10</span>
    </span>
  );
}

export function TitleRow({ title, line, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[24px] font-medium leading-tight text-ink">{title}</h1>
        {line && <p className="mt-1 text-[14px] text-muted-foreground sm:text-[16px]">{line}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
