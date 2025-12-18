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
      threshold: 0.5, // 默认值
      //rootMargin: "5px", // 默认值
      ...options, // 用户传入的覆盖默认
    };
  }, [options?.threshold, options?.rootMargin, options?.root]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setEntry(entry);
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(element);
      }
    }, memoizedOptions);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [memoizedOptions]);

  return [ref, isInView, entry];
};
