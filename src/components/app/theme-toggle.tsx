"use client";

import * as React from "react";
import { Moon, Sun, Leaf, Waves, Crown } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const PRESETS = [
  {
    id: "moss",
    name: "Forest Moss",
    description: "Уютный мох и хвоя",
    icon: Leaf,
    colors: {
      light: { bg: "#B3C9BE", accent: "#205132", border: "#8AAB9B" },
      dark: { bg: "#0F1714", accent: "#5A9F72", border: "#24352F" }
    }
  },
  {
    id: "pond",
    name: "Emerald Pond",
    description: "Прохладный тил и пруд",
    icon: Waves,
    colors: {
      light: { bg: "#A7C4C0", accent: "#144C3F", border: "#7FA29B" },
      dark: { bg: "#0B1313", accent: "#489E8A", border: "#203434" }
    }
  },
  {
    id: "kingdom",
    name: "Frog Kingdom",
    description: "Олива и золото",
    icon: Crown,
    colors: {
      light: { bg: "#C9C9B4", accent: "#3E512A", border: "#A4A489" },
      dark: { bg: "#13140F", accent: "#8FA374", border: "#2F3227" }
    }
  }
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 rounded-2xl border border-border/50 bg-card p-5 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded-md" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="h-10 w-48 bg-muted rounded-xl" />
      </div>
    );
  }

  // Parse active preset and mode
  const getPresetAndMode = (themeStr: string | undefined) => {
    if (!themeStr) return { preset: "moss", mode: "dark" };
    const parts = themeStr.split("-");
    if (parts.length === 2) {
      return { preset: parts[0], mode: parts[1] };
    }
    if (themeStr === "dark") return { preset: "moss", mode: "dark" };
    return { preset: "moss", mode: "light" };
  };

  const { preset: currentPreset, mode: currentMode } = getPresetAndMode(theme);

  const handleThemeChange = (newPreset: string, newMode: string) => {
    setTheme(`${newPreset}-${newMode}`);
  };

  return (
    <div className="w-full space-y-5 rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Цветовая схема</h3>
        <p className="text-xs text-muted-foreground">Выберите природную палитру для интерфейса</p>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = currentPreset === preset.id;
          const modeColors = currentMode === "dark" ? preset.colors.dark : preset.colors.light;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleThemeChange(preset.id, currentMode)}
              className={cn(
                "flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-98",
                isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card hover:bg-muted/40 hover:border-border/80"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Color preview capsule */}
                <div
                  style={{
                    backgroundColor: modeColors.bg,
                    borderColor: modeColors.border
                  }}
                  className="flex items-center gap-1.5 rounded-full border px-2 py-1 shadow-sm"
                >
                  <span style={{ backgroundColor: modeColors.accent }} className="h-3 w-3 rounded-full" />
                  <span style={{ backgroundColor: modeColors.border }} className="h-3 w-3 rounded-full" />
                </div>
              </div>

              <div>
                <p className="font-bold text-sm text-foreground">{preset.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{preset.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">Режим оформления</p>
          <p className="text-xs text-muted-foreground">Переключение между светлой и темной темами</p>
        </div>

        {/* Sliding Segment Control */}
        <div className="relative flex bg-muted/60 p-1 rounded-2xl w-full sm:w-60 h-11">
          {/* Sliding pill */}
          <div
            className={cn(
              "absolute top-1 bottom-1 left-1 rounded-xl bg-card shadow-sm transition-all duration-300 ease-out",
              currentMode === "dark"
                ? "w-[calc(50%-4px)] translate-x-[calc(100%+4px)]"
                : "w-[calc(50%-4px)] translate-x-0"
            )}
          />

          {/* Light button */}
          <button
            type="button"
            onClick={() => handleThemeChange(currentPreset, "light")}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 rounded-xl",
              currentMode === "light" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun className="h-4 w-4" />
            <span>Светлая</span>
          </button>

          {/* Dark button */}
          <button
            type="button"
            onClick={() => handleThemeChange(currentPreset, "dark")}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 rounded-xl",
              currentMode === "dark" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon className="h-4 w-4" />
            <span>Темная</span>
          </button>
        </div>
      </div>
    </div>
  );
}
