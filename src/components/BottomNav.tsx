import React from 'react';
import { ClipboardCheck, Users, BarChart3, FileText, Settings, UserCheck } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isAdmin = false }) => {
  const tabs = React.useMemo(() => {
    const items: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
      { id: 'absensi', label: 'Absensi', icon: <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" /> },
      { id: 'siswa', label: 'Siswa', icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> },
      { id: 'rekap', label: 'Rekap', icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> },
      { id: 'laporan', label: 'Laporan', icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> },
    ];

    if (isAdmin) {
      items.push({ id: 'akun', label: 'Guru', icon: <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" /> });
    }

    items.push({ id: 'pengaturan', label: 'Setelan', icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" /> });
    return items;
  }, [isAdmin]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 safe-bottom shadow-2xl no-print">
      <div className={`grid ${tabs.length === 6 ? 'grid-cols-6' : 'grid-cols-5'} h-16 items-center px-0.5`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full py-1 transition-all touch-manipulation cursor-pointer relative ${
                isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active top glow indicator */}
              {isActive && (
                <span className="absolute top-0 w-6 sm:w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" />
              )}
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-500/15 scale-110' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate max-w-[54px] text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
