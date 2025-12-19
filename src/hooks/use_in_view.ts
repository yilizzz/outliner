import { useState, useEffect, useRef, useMemo } from "react";

type UseInViewReturn = [
  React.RefObject<HTMLDivElement>,
  boolean,
  IntersectionObserverEntry | null
];

export const useInView = (
  options?: IntersectionObserverInit
): UseInViewReturn => {
  const [isInView, setIsInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const memoizedOptions = useMemo(() => {
    return {
      threshold: 0.5,
      root: options?.root ?? null,
      rootMargin: options?.rootMargin ?? "0px",
      ...options,
    } as IntersectionObserverInit;
  }, [options]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setEntry(entry);
      if (entry.isIntersecting) {
        setIsInView(true);
        try {
          observer.unobserve(element);
        } catch (e) {
          /* ignore */
        }
      }
    }, memoizedOptions);

    observer.observe(element);

    return () => {
      try {
        observer.disconnect();
      } catch (e) {
        /* ignore */
      }
    };
    // include ref.current so effect re-runs when element is attached
  }, [memoizedOptions, (ref as any).current]);

  return [ref, isInView, entry];
};
