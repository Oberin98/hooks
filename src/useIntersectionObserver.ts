import { useCallback, useEffect, useRef } from "react";

const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  const cachedOptions = useRef(options);
  const observer = useRef<IntersectionObserver>(null);
  const observableCache = useRef<Element[]>([]);

  /*
   * Disconnect previous observer.
   * Create new observer with passed options, and set previous nodes to be observed by the new observer
   */
  const update = useCallback(
    (options: IntersectionObserverInit) => {
      const oldObserver = observer.current;
      const newObserver = new IntersectionObserver(callback, options);
      oldObserver?.disconnect();
      observableCache.current.forEach((node) => newObserver.observe(node));
      observer.current = newObserver;
      cachedOptions.current = options;
    },
    [callback]
  );

  /*
   * If node is not observing yet, add it to cache and start observing
   */
  const observe = useCallback(
    (node: Element) => {
      if (!observer.current)
        observer.current = new IntersectionObserver(
          callback,
          cachedOptions.current
        );
      if (
        !observableCache.current.includes(node) &&
        node instanceof HTMLElement
      ) {
        observer.current?.observe(node);
        observableCache.current.push(node);
      }
    },
    [callback]
  );

  /*
   * Filter node from cache and stop unobserving it
   */
  const unobserve = useCallback(
    (node: Element) => {
      observableCache.current = observableCache.current.filter(
        (n) => n !== node
      );
      if (node instanceof HTMLElement) observer.current?.unobserve(node);
    },
    [observer]
  );

  useEffect(
    () => () => {
      observableCache.current = [];
      cachedOptions.current = null;
      observer.current?.disconnect();
    },
    [observer]
  );

  return { update, observe, unobserve };
};
