/**
 * @license
 * Sistem Presensi Digital - SMKS PGRI 1 Kota Sukabumi
 * Modul Manajemen Tema (Mode Gelap & Mode Terang)
 */

export type ThemeMode = 'dark' | 'emerald' | 'crimson' | 'sunrise' | 'light';

const THEME_KEY = 'smk_pgri1_presensi_theme';

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'emerald' || saved === 'crimson' || saved === 'sunrise') return saved;
    return 'dark'; // Default: Golden Amber PGRI Dark
  } catch (e) {
    return 'dark';
  }
}

export function applyTheme(theme: ThemeMode): void {
  try {
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    
    // Reset all theme classes
    root.classList.remove('light', 'dark', 'theme-dark', 'theme-emerald', 'theme-crimson', 'theme-sunrise', 'theme-neon');

    if (theme === 'light') {
      root.classList.add('light');
      if (metaTheme) metaTheme.setAttribute('content', '#f8fafc');
    } else {
      root.classList.add('dark');
      if (theme === 'emerald') {
        root.classList.add('theme-emerald');
        if (metaTheme) metaTheme.setAttribute('content', '#041d14');
      } else if (theme === 'crimson') {
        root.classList.add('theme-crimson');
        if (metaTheme) metaTheme.setAttribute('content', '#1c0709');
      } else if (theme === 'sunrise') {
        root.classList.add('theme-sunrise');
        if (metaTheme) metaTheme.setAttribute('content', '#06131f');
      } else {
        root.classList.add('theme-dark');
        if (metaTheme) metaTheme.setAttribute('content', '#0c0d12');
      }
    }

    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.warn('Gagal menyimpan tema:', e);
  }
}
