import type { CSSProperties } from "react";

export const formatMoney = (amount: number | null, currencyCode: string) => {
  if (amount == null) return null;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getRadiusAttr = (radius: string | null | undefined) => {
  switch (radius) {
    case "none": return "0px";
    case "sm": return "4px";
    case "md": return "8px";
    case "lg": return "12px";
    case "xl": return "20px";
    case "full": return "999px";
    default: return "12px";
  }
};

export const getEnterMotionStyle = (
  index: number,
  reducedMotion: boolean,
  startDelay = 120,
): CSSProperties => {
  if (reducedMotion) {
    return {
      opacity: 1,
      transform: "none",
    };
  }

  return {
    opacity: 0,
    transform: "translate3d(0, 18px, 0)",
    animation: "catalog-enter 620ms var(--catalog-ease-out-expo) forwards",
    animationDelay: `${startDelay + index * 90}ms`,
    willChange: "transform, opacity",
  };
};
