export type ThemeName = "light" | "dark";

export type Theme = {
  background: string;
  text: string;
  cardBackground: string;
  cardBorder: string;
  headerBackground: string;
  headerText: string;
  weatherCardBorder: string;
  weatherCardBackground: string;
  zmanimCardBorder: string;
  zmanimCardBackground: string;
};

export type ThemesMap = Record<ThemeName, Theme>;

export type Location = {
  id?: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};
