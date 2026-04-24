import { useCallback, useEffect, useState } from "react";

const KEY = "ambssl:favorites:v1";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function write(set: Set<string>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

let listeners: Array<(s: Set<string>) => void> = [];
let current: Set<string> | null = null;

function getCurrent() {
  if (current === null) current = read();
  return current;
}

function update(next: Set<string>) {
  current = next;
  write(next);
  listeners.forEach((l) => l(next));
}

export function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(() =>
    typeof window === "undefined" ? new Set() : getCurrent(),
  );

  useEffect(() => {
    const l = (s: Set<string>) => setFavs(new Set(s));
    listeners.push(l);
    // Hydrate from storage on mount (SSR safety)
    setFavs(new Set(getCurrent()));
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const next = new Set(getCurrent());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update(next);
  }, []);

  const isFav = useCallback((id: string) => favs.has(id), [favs]);

  return { favorites: favs, toggle, isFav };
}
