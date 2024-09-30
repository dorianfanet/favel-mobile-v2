// create a hook that returns the theme either light or dark from useColorScheme

import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface UseThemeReturn {
  theme: Theme;
  invertedTheme: Theme;
}

export default function useTheme(): UseThemeReturn {
  const theme = useColorScheme();

  return {
    invertedTheme: theme === "light" ? "dark" : "light",
    theme: theme || "light",
  };
}
