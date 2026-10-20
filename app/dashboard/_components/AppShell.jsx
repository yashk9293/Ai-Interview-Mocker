"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  LayoutList,
  LifeBuoy,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import Logo, { LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { ratingTone } from "@/components/app/ui";
import AddNewInterview from "./AddNewInterview";
import AccountMenu from "./AccountMenu";

// App frame: a sidebar (232px, or a 68px icon rail when collapsed) and a 64px
// top bar on one ground, divided by 1px rules.
const NAV = [
  { group: "Practice", items: [
    { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, match: (p) => p.startsWith("/dashboard/overview") },
    { href: "/dashboard", label: "Dashboard", icon: LayoutList, match: (p) => p === "/dashboard" || p.startsWith("/dashboard/interview") },
    { href: "/dashboard/upgrade", label: "Plan", icon: CreditCard, match: (p) => p.startsWith("/dashboard/upgrade") },
  ] },
  { group: "Help", items: [
    { href: "/how-it-works", label: "How it works", icon: CircleHelp, match: () => false },
    { href: "/faq", label: "FAQ", icon: LifeBuoy, match: () => false },
  ] },
];
const COLLAPSE_KEY = "sidebar-collapsed";

function crumbs(path) {
  const trail = [{ href: "/dashboard", label: "Dashboard" }];
  if (path.startsWith("/dashboard/upgrade")) return [{ href: "/dashboard/upgrade", label: "Plan" }];
  if (path.startsWith("/dashboard/overview")) return [{ href: "/dashboard/overview", label: "Overview" }];
  const m = path.match(/^\/dashboard\/interview\/([^/]+)(\/(start|feedback))?/);
  if (m) {
    trail.push({ href: `/dashboard/interview/${m[1]}`, label: "Interview" });
    if (m[3] === "start") trail.push({ label: "In progress" });
    if (m[3] === "feedback") trail.push({ label: "Feedback" });
  }
  return trail;
}

function NavLinks({ path, collapsed = false, onNavigate }) {
  return NAV.map(({ group, items }) => (
    <div key={group} className="mt-6 first:mt-5">
      {collapsed
        ? <div className="mx-auto mb-2 h-px w-6 bg-line" aria-hidden="true" />
        : <p className="px-2 text-[12px] text-faint">{group}</p>}
      <ul className={collapsed ? "flex flex-col items-center gap-1" : "mt-2"}>
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(path);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-label={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center rounded-md text-[14px] transition-colors hover:text-ink",
                  collapsed ? "size-10 justify-center" : "h-[34px] gap-2.5 px-2",
                  active ? "bg-brand-tint font-medium text-brand" : "text-muted-foreground hover:bg-raised",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                {!collapsed && label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  ));
}

// The latest interviews, each one click from where it was left off.
function RecentList({ recent, path, onNavigate }) {
  if (!recent?.length) return null;
  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between px-2">
        <p className="text-[12px] text-faint">Recent</p>
        <Link href="/dashboard" onClick={onNavigate} className="text-[12px] text-muted-foreground hover:text-brand">View all</Link>
      </div>
      <ul className="mt-2 flex flex-col gap-0.5">
        {recent.map((iv) => {
          const inProgress = iv.answered < iv.total;
          const href = inProgress ? `/dashboard/interview/${iv.mockId}/start` : `/dashboard/interview/${iv.mockId}/feedback`;
          const active = path.startsWith(`/dashboard/interview/${iv.mockId}`);
          return (
            <li key={iv.mockId}>
              <Link
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-raised",
                  active && "bg-raised",
                )}
              >
                <span className={cn("size-1.5 shrink-0 rounded-full", inProgress ? "bg-amber-500" : "bg-brand")} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{iv.jobPosition}</span>
                <span className="num shrink-0 text-[12px]">
                  {inProgress
                    ? <span className="text-faint">{iv.answered}/{iv.total}</span>
                    : <span className={ratingTone(iv.averageRating)}>{iv.averageRating ?? "–"}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PlanCard({ collapsed }) {
  if (collapsed) {
    return (
      <Link
        href="/dashboard/upgrade"
        title="Upgrade to Monthly"
        aria-label="Upgrade to Monthly"
        className="mx-auto flex size-10 items-center justify-center rounded-md bg-brand-tint text-brand transition-colors hover:bg-brand hover:text-white"
      >
        <Sparkles className="size-4" aria-hidden="true" />
      </Link>
    );
  }
  return (
    <div className="rounded-xl border border-brand/15 bg-brand-tint p-3.5">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
        <Sparkles className="size-3.5 text-brand" aria-hidden="true" /> Free plan
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
        Practising a lot? Monthly gives you 50 interviews for $5.99.
      </p>
      <Link
        href="/dashboard/upgrade"
        className="mt-2.5 inline-flex h-8 w-full items-center justify-center rounded-full bg-brand text-[13px] font-medium text-white transition-colors hover:bg-brand-hover"
      >
        See plans
      </Link>
    </div>
  );
}

function AccountRow({ collapsed }) {
  return (
    <div className={cn("border-t border-line pt-3", collapsed && "flex justify-center")}>
      <AccountMenu variant={collapsed ? "rail" : "row"} />
    </div>
  );
}

export default function AppShell({ children, recent = [] }) {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const trail = crumbs(path);

  // Remember the sidebar choice; read after mount so server and browser match.
  useEffect(() => {
    const t = setTimeout(() => {
      try { setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1"); } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1"); } catch {}
      return !c;
    });
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div className="flex min-h-[100svh]">
      <aside
        className={cn(
          "sticky top-0 z-40 hidden h-[100svh] shrink-0 flex-col border-r border-line py-4 transition-[width] duration-200 ease-out lg:flex",
          collapsed ? "w-[68px] px-3" : "w-[232px] px-3",
        )}
      >
        {/* Collapse toggle: a round button sitting on the sidebar's right edge. */}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="absolute -right-3.5 top-[22px] flex size-7 items-center justify-center rounded-full border border-line bg-white text-muted-foreground shadow-[0_2px_8px_rgba(17,24,39,0.08)] transition-colors hover:border-brand/40 hover:text-brand"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        <div className={cn("flex h-8 items-center", collapsed ? "justify-center" : "")}>
          {collapsed
            ? <Link href="/" aria-label="AI Interview Mocker home" title="Home"><LogoMark className="h-6 w-auto" /></Link>
            : <Logo href="/" className="px-2" compact />}
        </div>

        <div className="-mx-3 flex-1 overflow-y-auto px-3">
          <nav aria-label="App"><NavLinks path={path} collapsed={collapsed} /></nav>
          {!collapsed && <RecentList recent={recent} path={path} />}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <PlanCard collapsed={collapsed} />
          <AccountRow collapsed={collapsed} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg pl-4 lg:static lg:h-16 lg:pl-[29px]">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="lg:hidden" aria-label="AI Interview Mocker home"><LogoMark className="h-6 w-auto" /></Link>
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-2 truncate text-[14px]">
                {trail.map((c, i) => (
                  <li key={c.label} className={`flex items-center gap-2 ${i < trail.length - 1 ? "max-sm:hidden" : ""}`}>
                    {i > 0 && <span className="text-faint max-sm:hidden" aria-hidden="true">/</span>}
                    {c.href && i < trail.length - 1
                      ? <Link href={c.href} className="text-muted-foreground hover:text-ink">{c.label}</Link>
                      : <span className="text-ink" aria-current="page">{c.label}</span>}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className="flex h-full items-center">
            <div className="hidden pr-4 sm:block lg:pr-[29px]">
              <Suspense fallback={null}><AddNewInterview /></Suspense>
            </div>
            {/* On desktop the account lives at the foot of the sidebar. */}
            <div className="flex h-full items-center border-l border-line px-3 lg:hidden">
              <AccountMenu variant="bar" />
            </div>
            <button
              className="flex h-full w-14 items-center justify-center border-l border-line lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </header>

        {menuOpen && (
          <div className="fixed inset-x-0 bottom-0 top-14 z-20 overflow-y-auto bg-bg px-3 pb-8 lg:hidden">
            <nav aria-label="App"><NavLinks path={path} onNavigate={() => setMenuOpen(false)} /></nav>
            <RecentList recent={recent} path={path} onNavigate={() => setMenuOpen(false)} />
            <div className="mt-8 px-2 sm:hidden">
              <Suspense fallback={null}><AddNewInterview /></Suspense>
            </div>
            <div className="mt-6"><PlanCard collapsed={false} /></div>
          </div>
        )}

        <main className="px-4 pb-16 pt-6 sm:px-[29px] lg:pt-9">{children}</main>
      </div>
    </div>
  );
}
