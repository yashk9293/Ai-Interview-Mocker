"use client";
import { useEffect, useRef, useState } from "react";

// The page's one moving picture: the transcript writes itself word by word,
// the way the product shows an answer as you speak, once it scrolls into view.
// Without script, or with reduced motion, the whole answer is shown at once.
export default function LiveTranscript({ text, interim }) {
  const words = text.split(" ");
  const [count, setCount] = useState(words.length);
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    let timer;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let shown = 0;
      setCount(0);
      timer = setInterval(() => {
        shown += 1;
        setCount(shown);
        if (shown >= words.length) clearInterval(timer);
      }, 140);
    }, { threshold: 0.6 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [words.length]);

  const done = count >= words.length;
  return (
    <p ref={ref} className="mt-1.5 min-h-[7.5em] text-[15px] leading-relaxed text-ink">
      {words.slice(0, count).join(" ")}
      {done && <span className="text-faint">{interim}</span>}
      <span className="caret" aria-hidden="true" />
    </p>
  );
}
