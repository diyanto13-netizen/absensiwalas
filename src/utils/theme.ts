/**
 * @license
 * Sistem Presensi Digital - SMKS PGRI 1 Kota Sukabumi
 * Modul Manajemen Tema (Mode Gelap & Mode Terang)
 */

export type ThemeMode = 'dark' | 'sunrise' | 'neon' | 'light';

const THEME_KEY = 'smk_pgri1_presensi_theme';

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'sunrise' || saved === 'neon') return saved;
    return 'dark'; // Default premium dark theme
  } catch (e) {
    return 'dark';
  }
}

export function applyTheme(theme: ThemeMode): void {
  try {
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    
    // Reset all theme classes
    root.classList.remove('light', 'dark', 'theme-dark', 'theme-sunrise', 'theme-neon');

    if (theme === 'light') {
      root.classList.add('light');
      if (metaTheme) metaTheme.setAttribute('content', '#f8fafc');
    } else {
      root.classList.add('dark');
      if (theme === 'sunrise') {
        root.classList.add('theme-sunrise');
        if (metaTheme) metaTheme.setAttribute('content', '#06131f');
      } else if (theme === 'neon') {
        root.classList.add('theme-neon');
        if (metaTheme) metaTheme.setAttribute('content', '#070719');
      } else {
        root.classList.add('theme-dark');
        if (metaTheme) metaTheme.setAttribute('content', '#090d16');
      }
    }

    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.warn('Gagal menyimpan tema:', e);
  }
}
