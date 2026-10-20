"use client";
import { useEffect, useMemo, useState } from "react";
import { Link2, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, FAQS } from "./faqs";

function FaqItem({ item, open, onToggle }) {
  const [copied, setCopied] = useState(false);
  const copyLink = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/faq#${item.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <li
      id={item.id}
      className={cn(
        "scroll-mt-28 rounded-2xl border bg-white transition-[border-color,box-shadow] duration-200",
        open ? "border-brand/40 shadow-[0_8px_30px_-12px_rgba(72,69,210,0.35)]" : "border-line hover:border-brand/25",
      )}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${item.id}-answer`}
          className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        >
          <span className="flex-1 text-base font-semibold text-foreground sm:text-lg">{item.q}</span>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-300",
              open ? "rotate-45 bg-brand text-white" : "bg-brand-tint text-brand",
            )}
            aria-hidden="true"
          >
            <Plus className="size-4" />
          </span>
        </button>
      </h3>
      {/* grid-rows 0fr -> 1fr animates the height smoothly */}
      <div
        id={`${item.id}-answer`}
        role="region"
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex items-start gap-4 px-5 pb-5 sm:px-6">
            <p className="flex-1 text-[15px] leading-relaxed text-muted-foreground sm:text-base">{item.a}</p>
            <button
              type="button"
              onClick={copyLink}
              tabIndex={open ? 0 : -1}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-brand-tint hover:text-brand"
            >
              <Link2 className="size-3.5" aria-hidden="true" />
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function FaqExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState(FAQS[0].id);

  // A link like /faq#webcam opens that question, on load and when the hash
  // changes while you're on the page.
  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.slice(1);
      if (!FAQS.some((f) => f.id === id)) return;
      setCategory("all");
      setQuery("");
      setOpenId(id);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }));
    };
    const timer = setTimeout(openFromHash, 0);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, []);

  const search = query.trim().toLowerCase();
  const matches = useMemo(
    () => FAQS.filter((f) => !search || f.q.toLowerCase().includes(search) || f.a.toLowerCase().includes(search)),
    [search],
  );
  const counts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.id, matches.filter((f) => f.category === c.id).length])),
    [matches],
  );
  const shown = category === "all" ? matches : matches.filter((f) => f.category === category);
  const groups = CATEGORIES.map((c) => ({ ...c, items: shown.filter((f) => f.category === c.id) })).filter((g) => g.items.length);

  return (
    <div>
      {/* Search */}
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions, e.g. webcam, rating, price"
          aria-label="Search questions"
          className="h-14 w-full rounded-full border border-line bg-white pl-14 pr-12 text-base text-foreground shadow-[0_10px_40px_-15px_rgba(72,69,210,0.35)] outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-4 focus:ring-brand/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-raised hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mt-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Categories">
        {[{ id: "all", label: "All questions", count: matches.length }, ...CATEGORIES.map((c) => ({ ...c, count: counts[c.id] }))].map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c.id)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                active ? "border-brand bg-brand text-white" : "border-line bg-white text-foreground hover:border-brand/40 hover:text-brand",
              )}
            >
              {c.label}
              <span className={cn("num rounded-full px-1.5 text-xs", active ? "bg-white/20" : "bg-raised text-muted-foreground")}>{c.count}</span>
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="mx-auto mt-12 max-w-3xl">
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-control bg-surface px-6 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">No questions match &ldquo;{query}&rdquo;</p>
            <p className="mt-2 text-muted-foreground">Try another word, or browse all questions.</p>
            <button
              type="button"
              onClick={() => { setQuery(""); setCategory("all"); }}
              className="mt-5 inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Show all questions
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.id} className="mb-10 last:mb-0" aria-labelledby={`cat-${group.id}`}>
              <h2 id={`cat-${group.id}`} className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-brand">
                {group.label}
              </h2>
              <ul className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <FaqItem
                    key={item.id}
                    item={item}
                    open={openId === item.id || (search && shown.length <= 3)}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
