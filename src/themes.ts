import type { ThemesMap } from "./types";
export type { Theme } from "./types";

export const themes: ThemesMap = {
  light: {
    background: "#ffffff",
    text: "#000000",
    cardBackground: "#f9f9f9",
    cardBorder: "#ddd",
    headerBackground: "#282c34",
    headerText: "#ffffff",
    weatherCardBorder: "#2196F3",
    weatherCardBackground: "#e3f2fd",
    zmanimCardBorder: "#9C27B0",
    zmanimCardBackground: "#f3e5f5"
  },
  dark: {
    background: "#1a1a1a",
    text: "#ffffff",
    cardBackground: "#2d2d2d",
    cardBorder: "#444",
    headerBackground: "#0d0d0d",
    headerText: "#ffffff",
    weatherCardBorder: "#64B5F6",
    weatherCardBackground: "#1e3a5f",
    zmanimCardBorder: "#BA68C8",
    zmanimCardBackground: "#3d2645"
  }
};
