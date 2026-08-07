export type TypingFont =
  | "geist-mono"
  | "jetbrains-mono"
  | "fira-code"
  | "ibm-plex-mono"
  | "source-code-pro"
  | "inter-tight"
  | "space-grotesk"
  | "nunito"
  | "atkinson-hyperlegible";

export interface FontOption {
  cssFamily: string;
  googleFamily: string | null;
  id: TypingFont;
  label: string;
  tag?: "mono" | "sans";
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "geist-mono",
    label: "Geist Mono",
    googleFamily: null,
    cssFamily: "var(--font-mono)",
    tag: "mono",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    googleFamily: "JetBrains+Mono",
    cssFamily: "'JetBrains Mono', monospace",
    tag: "mono",
  },
  {
    id: "fira-code",
    label: "Fira Code",
    googleFamily: "Fira+Code",
    cssFamily: "'Fira Code', monospace",
    tag: "mono",
  },
  {
    id: "ibm-plex-mono",
    label: "IBM Plex Mono",
    googleFamily: "IBM+Plex+Mono",
    cssFamily: "'IBM Plex Mono', monospace",
    tag: "mono",
  },
  {
    id: "source-code-pro",
    label: "Source Code Pro",
    googleFamily: "Source+Code+Pro",
    cssFamily: "'Source Code Pro', monospace",
    tag: "mono",
  },
  {
    id: "inter-tight",
    label: "Inter Tight",
    googleFamily: "Inter+Tight",
    cssFamily: "'Inter Tight', sans-serif",
    tag: "sans",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    googleFamily: "Space+Grotesk",
    cssFamily: "'Space Grotesk', sans-serif",
    tag: "sans",
  },
  {
    id: "nunito",
    label: "Nunito",
    googleFamily: "Nunito",
    cssFamily: "'Nunito', sans-serif",
    tag: "sans",
  },
  {
    id: "atkinson-hyperlegible",
    label: "Atkinson Hyperlegible",
    googleFamily: "Atkinson+Hyperlegible",
    cssFamily: "'Atkinson Hyperlegible', sans-serif",
    tag: "sans",
  },
];
