import React, { useState } from 'react';
import { LogIn, ShieldCheck, Lock, User, Sparkles, School } from 'lucide-react';
import { AuthUser } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, showToast }) => {
  const [username, setUsername] = useState('walikelas');
  const [password, setPassword] = useState('smkpgri1');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      // Validasi kredensial login
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      if (
        (cleanUser === 'walikelas' && cleanPass === 'smkpgri1') ||
        (cleanUser === 'admin' && cleanPass === 'admin123') ||
        (cleanUser.includes('@') && cleanPass.length >= 6)
      ) {
        const user: AuthUser = {
          username: cleanUser,
          nama: cleanUser === 'walikelas' ? 'Diyanto, S.Kom. (Wali Kelas)' : 'Administrator Presensi',
          role: 'admin',
          isLoggedIn: true,
        };
        setIsLoading(false);
        showToast('Login Berhasil!', `Selamat datang, ${user.nama}.`, 'success');
        onLoginSuccess(user);
      } else {
        setIsLoading(false);
        setErrorMessage('Username atau password salah! Gunakan akun wali kelas (walikelas / smkpgri1).');
        showToast('Gagal Masuk', 'Periksa kembali kredensial akun Anda.', 'error');
      }
    }, 400);
  };

  const handleUseDemo = () => {
    setUsername('walikelas');
    setPassword('smkpgri1');
    setErrorMessage(null);
  };

  return (
    <div
      id="loginScreen"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="relative w-full max-w-sm p-6 sm:p-8 rounded-2xl glass-panel border border-slate-800 shadow-2xl my-auto">
        
        {/* School Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-800 text-white shadow-md border border-indigo-500/20 mb-3">
            <School className="w-7 h-7 text-indigo-200" />
          </div>
          <p className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase">
            SMKS PGRI 1 KOTA SUKABUMI
          </p>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Sistem Presensi Digital
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelas XII TKJ 2 · Tapel 2026/2027
          </p>
        </div>

        {/* Error Container with strict ID */}
        {errorMessage && (
          <div
            id="loginError"
            className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in"
          >
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Username / NIP
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="walikelas"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-manipulation mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Access helper */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 mb-1.5">Akses Uji Coba Cepat:</p>
          <button
            type="button"
            onClick={handleUseDemo}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-indigo-300 font-medium transition touch-manipulation cursor-pointer"
          >
            Gunakan Akun Wali Kelas (walikelas / smkpgri1)
          </button>
        </div>
      </div>
    </div>
  );
};
