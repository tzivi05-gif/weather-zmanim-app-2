import { useEffect, useState } from "react";
import type { Theme } from "../themes";

type CookieBannerProps = {
  theme: Theme;
};

const COOKIE_NAME = "cookie_consent";

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : "";
};

const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
};

function CookieBanner({ theme }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const existing = getCookieValue(COOKIE_NAME);
    if (existing === "accepted" || existing === "declined") {
      setIsVisible(false);
    }
  }, []);

  const handleChoice = (value: "accepted" | "declined") => {
    setCookie(COOKIE_NAME, value, 60 * 60 * 24 * 365);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="cookie-banner"
      style={{
        backgroundColor: theme.cardBackground,
        color: theme.text,
        borderTop: `1px solid ${theme.cardBorder}`
      }}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
    >
      <div className="cookie-banner__content">
        <strong>🍪 Cookies</strong>
        <span>
          We use essential cookies to remember your preferences and keep the app
          running smoothly.
        </span>
      </div>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="cookie-button"
          onClick={() => handleChoice("declined")}
          style={{
            backgroundColor: "transparent",
            color: theme.text,
            border: `1px solid ${theme.cardBorder}`
          }}
        >
          Decline
        </button>
        <button
          type="button"
          className="cookie-button cookie-button--primary"
          onClick={() => handleChoice("accepted")}
          style={{
            backgroundColor: theme.weatherCardBorder,
            color: "#fff",
            border: "none"
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
