import { useEffect, useState } from "react";
import { DEFAULT_WIDTH, SIDEBAR_WIDTH_KEY } from "../constants";

export function usePersistentSidebarWidth() {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_WIDTH;
    }

    const savedWidth = window.localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const parsedWidth = savedWidth ? Number.parseInt(savedWidth, 10) : DEFAULT_WIDTH;

    return Number.isFinite(parsedWidth) ? parsedWidth : DEFAULT_WIDTH;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  return [sidebarWidth, setSidebarWidth] as const;
}