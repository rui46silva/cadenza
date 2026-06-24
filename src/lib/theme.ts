export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "cadenza-theme";

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle(
    "dark",
    resolveTheme(theme) === "dark"
  );
}

/** Script inline (sem flash) injetado no <head>, antes da hidratação. */
export const NO_FLASH_THEME_SCRIPT = `(function() {
  try {
    var stored = window.localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'system';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();`;
