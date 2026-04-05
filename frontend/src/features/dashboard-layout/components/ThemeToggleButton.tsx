import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { MoonStar, SunMedium } from "lucide-react";

interface ThemeToggleButtonProps {
  compact?: boolean;
}

export function ThemeToggleButton({ compact = false }: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "icon" : "default"}
      onClick={toggleTheme}
      className={`theme-toggle-button ${compact ? "theme-toggle-button--compact" : ""}`.trim()}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      {compact ? null : <span>{isDark ? "Tema claro" : "Tema escuro"}</span>}
    </Button>
  );
}
