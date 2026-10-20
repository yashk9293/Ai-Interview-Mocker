"use client";
import { useEffect, useRef } from "react";

// Marks its children's `.reveal` elements as in view once, the first time the
// block scrolls into the viewport. Without script, nothing is ever hidden.
export default function Reveal({ as: Tag = "div", children, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.matches(".reveal") ? [root] : [...root.querySelectorAll(".reveal")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  );
}
