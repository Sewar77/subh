import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext.jsx";
import { trackPageView } from "../../Services/analyticsService.js";

export default function AnalyticsPageTracker() {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    void trackPageView(pathname, language);
  }, [pathname, language]);

  return null;
}
