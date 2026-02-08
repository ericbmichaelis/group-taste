import { useEffect, useState } from "react";

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  /** 1 = full time, 0 = expired */
  progress: number;
  /** "green" >30min, "yellow" 10-30min, "red" <10min */
  urgency: "green" | "yellow" | "red";
  formatted: string;
}

export function useCountdown(expiresAt: number, totalDuration = 3600000): CountdownState {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, expiresAt - now);
  const isExpired = diff <= 0;
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const progress = Math.min(1, diff / totalDuration);

  let urgency: "green" | "yellow" | "red" = "green";
  if (diff < 600000) urgency = "red"; // <10min
  else if (diff < 1800000) urgency = "yellow"; // <30min

  let formatted: string;
  if (isExpired) {
    formatted = "Expired";
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  } else {
    formatted = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }

  return { hours, minutes, seconds, totalSeconds, isExpired, progress, urgency, formatted };
}
