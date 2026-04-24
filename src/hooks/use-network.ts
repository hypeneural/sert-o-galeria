import { useEffect, useState } from "react";

type NetInfo = {
  saveData: boolean;
  effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  downlink: number;
};

type NavConn = {
  saveData?: boolean;
  effectiveType?: NetInfo["effectiveType"];
  downlink?: number;
  addEventListener?: (type: "change", cb: () => void) => void;
  removeEventListener?: (type: "change", cb: () => void) => void;
};

function read(): NetInfo {
  if (typeof navigator === "undefined") {
    return { saveData: false, effectiveType: "unknown", downlink: 10 };
  }
  const c =
    (navigator as unknown as { connection?: NavConn }).connection ?? ({} as NavConn);
  return {
    saveData: !!c.saveData,
    effectiveType: c.effectiveType ?? "unknown",
    downlink: c.downlink ?? 10,
  };
}

export function useNetwork(): NetInfo & { isSlow: boolean } {
  const [info, setInfo] = useState<NetInfo>(() => read());

  useEffect(() => {
    const c =
      (navigator as unknown as { connection?: NavConn }).connection ?? null;
    if (!c?.addEventListener) return;
    const update = () => setInfo(read());
    c.addEventListener("change", update);
    return () => c.removeEventListener?.("change", update);
  }, []);

  const isSlow =
    info.saveData ||
    info.effectiveType === "slow-2g" ||
    info.effectiveType === "2g" ||
    info.downlink < 1;

  return { ...info, isSlow };
}
