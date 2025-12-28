import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      const scrollable = document.querySelector(
        'main[data-slot="sidebar-inset"]',
      );
      if (scrollable) {
        scrollable.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
