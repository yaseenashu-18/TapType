import type { KeyboardThemeName } from "@/components/ui/keyboard";

export const THEME_OPTIONS: {
  id: KeyboardThemeName;
  label: string;
  colors: [string, string, string]; // [light, dark, accent]
}[] = [
  {
    id: "classic",
    label: "Classic",
    colors: ["#F5F5F5", "#737373", "#F57644"],
  },
  { id: "mint", label: "Mint", colors: ["#EEEEEE", "#447B82", "#86C8AC"] },
  { id: "royal", label: "Royal", colors: ["#324974", "#3A3B35", "#E4D440"] },
  { id: "dolch", label: "Dolch", colors: ["#4F5E78", "#3E3B4C", "#D73E42"] },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    colors: ["#00F0FF", "#2A0845", "#FF007F"],
  },
  {
    id: "dracula",
    label: "Dracula",
    colors: ["#F8F8F2", "#44475A", "#BD93F9"],
  },
];
