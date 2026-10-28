import React, { useState, useEffect } from 'react';
import { School, Users, CheckCircle, Clock, LogOut, Activity, Calendar, ShieldCheck, Cloud, RefreshCw } from 'lucide-react';
import { ClassConfig, AuthUser, ActiveTab } from '../types';

interface HeaderProps {
  config: ClassConfig;
  user: AuthUser;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalStudents: number;
  todayStats: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    belum: number;
    rate: number;
  };
  isSyncing?: boolean;
  onManualSync?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  user,
  activeTab,
  setActiveTab,
  totalStudents,
  todayStats,
  isSyncing = false,
  onManualSync,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'absensi', label: 'Absensi Harian', icon: 'fa-clipboard-check' },
    { id: 'siswa', label: 'Data Siswa', icon: 'fa-user-graduate' },
    { id: 'rekap', label: 'Rekap & Analitik', icon: 'fa-chart-pie' },
    { id: 'laporan', label: 'Cetak & WhatsApp', icon: 'fa-file-invoice' },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'fa-sliders' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* School & Class Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-800 flex items-center justify-center text-white border border-indigo-400/20 shadow-sm shrink-0">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  SMKS PGRI 1
                </h1>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shrink-0">
                  {config.kelas}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 hidden xs:block">
                <span>{config.programKeahlian}</span>
                <span className="mx-1.5 text-slate-600">·</span>
                <span>{config.tahunAjaran}</span>
              </p>
            </div>
          </div>

          {/* Real-time stats & Mobile Header Elements */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Clock & Date (Hidden on small mobile to save precious screen space) */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentTime}</span>
              <span className="text-slate-600">·</span>
              <span>{currentDate}</span>
            </div>

            {/* Attendance Rate Badge (Compact on mobile) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-emerald-300/90 text-[11px]">Hadir:</span>
              <span className="font-bold text-emerald-300 text-xs sm:text-sm font-mono tabular-nums">
                {todayStats.rate}%
              </span>
            </div>

            {/* Quick Count Badges (Desktop only) */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono font-medium">
              <span className="text-emerald-400" title="Hadir">H:{todayStats.hadir}</span>
              <span className="text-slate-600">/</span>
              <span className="text-amber-400" title="Sakit">S:{todayStats.sakit}</span>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-400" title="Izin">I:{todayStats.izin}</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400" title="Alpa">A:{todayStats.alpa}</span>
            </div>

            {/* Cloud Firestore Real-time Sync Indicator & Manual Sync Button */}
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition border cursor-pointer ${
                isSyncing
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  : 'bg-indigo-950/40 hover:bg-indigo-900/50 border-indigo-500/30 text-indigo-300'
              }`}
              title="Status Cloud Firestore: Real-time Aktif. Klik untuk sinkronisasi ulang manual."
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="hidden sm:inline text-[11px] font-medium">
                {isSyncing ? 'Sinkronisasi...' : 'Cloud Aktif'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* Teacher Profile & Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-800">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{user.nama}</p>
                <p className="text-[10px] text-slate-400">Wali Kelas XII TKJ 2</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition touch-manipulation cursor-pointer"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Desktop Top Nav Items (Hidden on Mobile, replaced by BottomNav) */}
        <nav className="hidden md:flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-xs ${isActive ? 'text-white' : 'text-slate-400'}`}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
