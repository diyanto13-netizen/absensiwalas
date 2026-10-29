/**
 * @license
 * Sistem Presensi Digital - SMKS PGRI 1 Kota Sukabumi
 * Modul Manajemen Tema (Mode Gelap & Mode Terang)
 */

export type ThemeMode = 'dark' | 'light';

const THEME_KEY = 'smk_pgri1_presensi_theme';

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default premium dark theme
  } catch (e) {
    return 'dark';
  }
}

export function applyTheme(theme: ThemeMode): void {
  try {
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      if (metaTheme) metaTheme.setAttribute('content', '#f8fafc');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      if (metaTheme) metaTheme.setAttribute('content', '#090d16');
    }

    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.warn('Gagal menyimpan tema:', e);
  }
}
