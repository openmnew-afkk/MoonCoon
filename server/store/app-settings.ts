export type PremiumPaymentMethod = "stars" | "card" | "both";

export interface AppSettings {
  premiumPriceRub: number;
  premiumPriceStars: number;
  premiumPaymentMethods: PremiumPaymentMethod;
  cardPaymentEnabled: boolean;
  starsPaymentEnabled: boolean;
}

let settings: AppSettings = {
  premiumPriceRub: 250,
  premiumPriceStars: 2500,
  premiumPaymentMethods: "both",
  cardPaymentEnabled: true,
  starsPaymentEnabled: true,
};

export function getAppSettings(): AppSettings {
  return { ...settings };
}

export function updateAppSettings(patch: Partial<AppSettings>): AppSettings {
  settings = { ...settings, ...patch };
  if (patch.premiumPaymentMethods) {
    settings.cardPaymentEnabled =
      patch.premiumPaymentMethods === "card" ||
      patch.premiumPaymentMethods === "both";
    settings.starsPaymentEnabled =
      patch.premiumPaymentMethods === "stars" ||
      patch.premiumPaymentMethods === "both";
  }
  return getAppSettings();
}
