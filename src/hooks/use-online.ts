import { useEffect, useState } from "react";

export function useOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}

export function useSlowConnection() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const conn = (navigator as unknown as {
      connection?: { effectiveType?: string; saveData?: boolean; addEventListener?: (e: string, f: () => void) => void; removeEventListener?: (e: string, f: () => void) => void };
    }).connection;
    if (!conn) return;
    const check = () => {
      const et = conn.effectiveType;
      setSlow(conn.saveData === true || et === "slow-2g" || et === "2g" || et === "3g");
    };
    check();
    conn.addEventListener?.("change", check);
    return () => conn.removeEventListener?.("change", check);
  }, []);
  return slow;
}
