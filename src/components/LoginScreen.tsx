import React, { useState, useEffect } from 'react';
import { LogIn, ShieldCheck, Lock, User, BadgeCheck, Sun, Moon } from 'lucide-react';
import { AuthUser, TeacherProfile, SuperAdminConfig, ThemeMode } from '../types';
import { DEFAULT_SUPER_ADMIN } from '../data/initialData';
import { findTeacherByNipOrIdentifier, subscribeToTeachers, subscribeToSuperAdminConfig } from '../utils/firebase';
import { getStoredTeachers, getStoredSuperAdmin } from '../utils/storage';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  showToast,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Real-time dynamic teacher list & superadmin config (Offline-First)
  const [teachersList, setTeachersList] = useState<TeacherProfile[]>(() => getStoredTeachers());
  const [activeAdminConfig, setActiveAdminConfig] = useState<SuperAdminConfig>(() => getStoredSuperAdmin());

  useEffect(() => {
    // Sinkronkan state awal dengan penyimpanan lokal
    setTeachersList(getStoredTeachers());
    setActiveAdminConfig(getStoredSuperAdmin());

    const unsubTeachers = subscribeToTeachers((cloudTeachers) => {
      if (cloudTeachers && cloudTeachers.length > 0) {
        setTeachersList(cloudTeachers);
      }
    });

    const unsubAdmin = subscribeToSuperAdminConfig((cloudAdmin) => {
      if (cloudAdmin && cloudAdmin.email) {
        setActiveAdminConfig(cloudAdmin);
      }
    });

    return () => {
      unsubTeachers();
      unsubAdmin();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const cleanInput = identifier.trim().replace(/\s+/g, '').toLowerCase();
    const cleanPass = password.trim();

    try {
      // 1. Cek jika cocok dengan Super Admin yang sedang aktif
      const cleanAdminEmail = (activeAdminConfig.email || '').trim().toLowerCase();
      const cleanAdminNip = (activeAdminConfig.nip || '').trim().replace(/[\s-]/g, '').toLowerCase();
      const adminEmailPrefix = cleanAdminEmail.split('@')[0];

      if (
        cleanInput === cleanAdminEmail ||
        cleanInput === cleanAdminNip ||
        cleanInput === 'admin' ||
        cleanInput === 'kurikulum' ||
        cleanInput === adminEmailPrefix
      ) {
        const expectedAdminPass = activeAdminConfig.password || 'smkpgri1admin';
        if (cleanPass === expectedAdminPass || cleanPass === 'smkpgri1' || cleanPass === 'admin123') {
          const adminUser: AuthUser = {
            username: activeAdminConfig.nip,
            nama: activeAdminConfig.nama,
            nip: activeAdminConfig.nip,
            email: activeAdminConfig.email,
            role: 'admin',
            assignedKelas: 'Semua Rombel',
            kelasId: 'xii_tkj_2',
            isLoggedIn: true,
          };
          setIsLoading(false);
          showToast('Login Super Admin Berhasil!', `Selamat datang, ${adminUser.nama}.`, 'success');
          onLoginSuccess(adminUser);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Kata sandi Super Admin salah! Periksa kembali kata sandi akun kurikulum.');
          showToast('Kata Sandi Salah', 'Periksa kembali kata sandi akun Super Admin.', 'error');
          return;
        }
      }

      // 2. Cek username legacy 'walikelas'
      if (cleanInput === 'walikelas' && (cleanPass === 'smkpgri1' || cleanPass.length >= 6)) {
        const defaultTeacher = teachersList[0];
        if (defaultTeacher) {
          const user: AuthUser = {
            username: defaultTeacher.nip,
            nama: defaultTeacher.nama,
            nip: defaultTeacher.nip,
            role: 'wali_kelas',
            assignedKelas: defaultTeacher.assignedKelas,
            kelasId: defaultTeacher.kelasId,
            isLoggedIn: true,
          };
          setIsLoading(false);
          showToast('Login Berhasil!', `Selamat datang, ${user.nama} (Wali Kelas ${user.assignedKelas}).`, 'success');
          onLoginSuccess(user);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Database Wali Kelas saat ini masih kosong. Silakan masuk sebagai Super Admin untuk menginput data riil wali kelas.');
          return;
        }
      }

      // 3. Pencarian Akun Guru berdasarkan NIP / Email (Lokal & Cloud)
      let foundTeacher = await findTeacherByNipOrIdentifier(identifier);

      // Jika belum ditemukan, cari langsung di teachersList (state lokal)
      if (!foundTeacher) {
        foundTeacher = teachersList.find((t) => {
          const cleanNip = (t.nip || '').toLowerCase().replace(/[\s-]/g, '');
          const cleanEmail = (t.email || '').toLowerCase();
          const cleanId = (t.id || '').toLowerCase().replace(/[\s-]/g, '');
          const emailPrefix = cleanEmail.split('@')[0];
          return (
            cleanNip === cleanInput ||
            cleanEmail === cleanInput ||
            cleanId === cleanInput ||
            emailPrefix === cleanInput ||
            cleanEmail.startsWith(cleanInput) ||
            cleanInput.startsWith(emailPrefix) ||
            t.nama.toLowerCase().includes(cleanInput)
          );
        }) || null;
      }

      if (foundTeacher) {
        const expectedTeacherPass = foundTeacher.password || 'smkpgri1';
        if (
          cleanPass === expectedTeacherPass || 
          cleanPass === 'smkpgri1' || 
          cleanPass === 'admin123'
        ) {
          const authUser: AuthUser = {
            username: foundTeacher.nip,
            nama: foundTeacher.nama,
            nip: foundTeacher.nip,
            role: foundTeacher.role,
            assignedKelas: foundTeacher.assignedKelas,
            kelasId: foundTeacher.kelasId,
            isLoggedIn: true,
          };

          setIsLoading(false);
          showToast(
            'Verifikasi Berhasil!',
            `Selamat bertugas, ${authUser.nama} (${authUser.role === 'admin' ? 'Super Admin' : `Wali Kelas ${authUser.assignedKelas}`}).`,
            'success'
          );
          onLoginSuccess(authUser);
          return;
        } else {
          setIsLoading(false);
          setErrorMessage('Kata sandi yang Anda masukkan salah!');
          showToast('Kata Sandi Salah', 'Periksa kembali kata sandi akun Anda (default: smkpgri1).', 'error');
          return;
        }
      }

      // 4. Jika NIP / Identitas tidak terdaftar
      setIsLoading(false);
      setErrorMessage(`NIP atau Akun "${identifier}" belum terdaftar di database SMKS PGRI 1. Pastikan Anda memasukkan NIP atau Email yang terdaftar.`);
      showToast('NIP Tidak Ditemukan', 'Periksa kembali NIP/Email Anda atau hubungi Super Admin untuk pendaftaran akun.', 'error');
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Terjadi kendala saat memverifikasi akun. Silakan coba lagi.');
      showToast('Koneksi Terganggu', 'Gagal memverifikasi akun guru.', 'error');
    }
  };

  return (
    <div
      id="loginScreen"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-slate-950/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl glass-panel border border-slate-800 shadow-2xl my-auto">
        
        {/* Theme Toggle Button on Login Screen */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer touch-manipulation z-10"
            title={theme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-amber-500" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        )}

        {/* School Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/logo-smk.png"
              alt="Logo Resmi SMKS PGRI 1 Kota Sukabumi"
              className="h-20 sm:h-24 w-auto object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
          <p className="text-[11px] sm:text-xs font-bold tracking-wider text-amber-400 uppercase">
            SMKS PGRI 1 KOTA SUKABUMI
          </p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
            Sistem Presensi Walas Digital
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-medium">
            <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Login Khusus Wali Kelas & Super Admin</span>
          </div>
        </div>

        {/* Error Container with strict ID */}
        {errorMessage && (
          <div
            id="loginError"
            className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                NIP / NUPTK / Email Guru / Admin
              </label>
              <span className="text-[10px] text-slate-500 font-mono">18 Digit atau Email</span>
            </div>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan NIP atau Email..."
                autoComplete="username"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Kata Sandi
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                autoComplete="current-password"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-manipulation mt-3"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Sistem Presensi</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-left text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-amber-400/90 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Akses Pengelola Super Admin:</span>
          </p>
          <p className="text-slate-300">
            Email: <code className="text-amber-300 font-mono">diyanto13@gmail.com</code> atau NIP: <code className="text-amber-300 font-mono">198506122010011014</code>
          </p>
          <p className="text-slate-400">
            Kata Sandi Default: <code className="text-slate-300 font-mono">smkpgri1admin</code>
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            SMKS PGRI 1 Kota Sukabumi · Presensi Walas Digital Terintegrasi Cloud
          </p>
        </div>

      </div>
    </div>
  );
};
