import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Shield, KeyRound, Edit3, Trash2, Search, 
  CheckCircle, AlertTriangle, School, Lock, Phone, Mail, 
  Sparkles, Layers, RefreshCw, X, ChevronRight, UserCheck
} from 'lucide-react';
import { TeacherProfile, SuperAdminConfig, AuthUser } from '../types';
import { ALL_SMK_PGRI_1_ROMBELS } from '../data/initialData';

interface AkunGuruTabProps {
  currentUser: AuthUser;
  teachers: TeacherProfile[];
  superAdminConfig: SuperAdminConfig;
  onSaveTeacher: (teacher: TeacherProfile) => Promise<void>;
  onDeleteTeacher: (teacherId: string) => Promise<void>;
  onSaveSuperAdminConfig: (config: SuperAdminConfig) => Promise<void>;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AkunGuruTab: React.FC<AkunGuruTabProps> = ({
  currentUser,
  teachers,
  superAdminConfig,
  onSaveTeacher,
  onDeleteTeacher,
  onSaveSuperAdminConfig,
  showToast,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState<'ALL' | 'X' | 'XI' | 'XII'>('ALL');
  const [selectedJurusan, setSelectedJurusan] = useState<'ALL' | 'TKJ' | 'AKL' | 'MPLB' | 'PM'>('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState<TeacherProfile | null>(null);

  // Form State: Tambah / Edit Guru
  const [formData, setFormData] = useState<Partial<TeacherProfile>>({
    nama: '',
    nip: '',
    email: '',
    assignedKelas: 'X TKJ 1',
    kelasId: 'x_tkj_1',
    role: 'wali_kelas',
    noHp: '',
    password: 'smkpgri1',
  });

  // Form State: Super Admin Config
  const [adminFormData, setAdminFormData] = useState<SuperAdminConfig>(superAdminConfig);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map kelas yang sudah ada wali kelasnya
  const occupiedClasses = useMemo(() => {
    const map = new Set<string>();
    teachers.forEach((t) => {
      if (t.role === 'wali_kelas' && t.kelasId) {
        map.add(t.kelasId);
      }
    });
    return map;
  }, [teachers]);

  // Filter daftar guru
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch = 
        t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nip.includes(searchQuery) ||
        t.assignedKelas.toLowerCase().includes(searchQuery.toLowerCase());

      const rombel = ALL_SMK_PGRI_1_ROMBELS.find((r) => r.id === t.kelasId);
      const matchTingkat = selectedTingkat === 'ALL' || (rombel && rombel.tingkat === selectedTingkat);

      let matchJurusan = true;
      if (selectedJurusan !== 'ALL' && rombel) {
        if (selectedJurusan === 'TKJ') matchJurusan = rombel.jurusan.includes('TKJ');
        else if (selectedJurusan === 'AKL') matchJurusan = rombel.jurusan.includes('AKL');
        else if (selectedJurusan === 'MPLB') matchJurusan = rombel.jurusan.includes('MPLB');
        else if (selectedJurusan === 'PM') matchJurusan = rombel.jurusan.includes('PM');
      }

      return matchSearch && matchTingkat && matchJurusan;
    });
  }, [teachers, searchQuery, selectedTingkat, selectedJurusan]);

  // Handler Buka Modal Buat Baru
  const handleOpenCreateModal = () => {
    // Pilih kelas pertama yang belum ada wali kelasnya jika ada
    const firstAvailable = ALL_SMK_PGRI_1_ROMBELS.find((r) => !occupiedClasses.has(r.id)) || ALL_SMK_PGRI_1_ROMBELS[0];
    setFormData({
      nama: '',
      nip: '',
      email: '',
      assignedKelas: firstAvailable.nama,
      kelasId: firstAvailable.id,
      role: 'wali_kelas',
      noHp: '',
      password: 'smkpgri1',
    });
    setIsCreateModalOpen(true);
  };

  // Handler Buka Modal Edit
  const handleOpenEditModal = (teacher: TeacherProfile) => {
    setSelectedTeacherForEdit(teacher);
    setFormData({
      ...teacher,
      password: teacher.password || 'smkpgri1',
    });
    setIsEditModalOpen(true);
  };

  // Handler Pilih Kelas dari Dropdown
  const handleSelectKelas = (kelasId: string) => {
    const rombel = ALL_SMK_PGRI_1_ROMBELS.find((r) => r.id === kelasId);
    if (rombel) {
      setFormData((prev) => ({
        ...prev,
        kelasId: rombel.id,
        assignedKelas: rombel.nama,
      }));
    }
  };

  // Submit Simpan Akun Guru (Baru atau Edit)
  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nip) {
      showToast('Data Tidak Lengkap', 'Nama dan NIP wajib diisi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanNip = (formData.nip || '').trim();
      const teacherId = isEditModalOpen && selectedTeacherForEdit 
        ? selectedTeacherForEdit.id 
        : `teacher-${cleanNip.replace(/\s+/g, '')}`;

      const newTeacher: TeacherProfile = {
        id: teacherId,
        nip: cleanNip,
        nama: (formData.nama || '').trim(),
        email: (formData.email || `${cleanNip}@smkpgri1sukabumi.sch.id`).trim(),
        role: formData.role || 'wali_kelas',
        assignedKelas: formData.assignedKelas || 'XII TKJ 2',
        kelasId: formData.kelasId || 'xii_tkj_2',
        noHp: formData.noHp || '',
        password: formData.password || 'smkpgri1',
      };

      await onSaveTeacher(newTeacher);
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      showToast(
        'Akun Guru Disimpan!',
        `Akun wali kelas untuk ${newTeacher.nama} (${newTeacher.assignedKelas}) sukses disimpan di Cloud.`,
        'success'
      );
    } catch (err: any) {
      setIsSubmitting(false);
      showToast('Gagal Menyimpan', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  // Submit Hapus Akun Guru
  const handleDeleteTeacher = async (teacher: TeacherProfile) => {
    if (teacher.role === 'admin') {
      showToast('Peringatan', 'Akun Administrator tidak dapat dihapus melalui menu ini.', 'error');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun wali kelas ${teacher.nama} (${teacher.assignedKelas})? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await onDeleteTeacher(teacher.id);
        showToast('Akun Dihapus', `Akun ${teacher.nama} telah dihapus dari sistem.`, 'info');
      } catch (err: any) {
        showToast('Gagal Menghapus', err.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  // Submit Simpan Perubahan Super Admin
  const handleSubmitSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormData.email || !adminFormData.nama || !adminFormData.nip) {
      showToast('Data Tidak Lengkap', 'Email, Nama, dan NIP Super Admin wajib diisi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveSuperAdminConfig({
        ...adminFormData,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.nama,
      });
      setIsSubmitting(false);
      setIsSuperAdminModalOpen(false);
      showToast(
        'Super Admin Diperbarui!',
        `Akun Super Admin berhasil dialihkan ke ${adminFormData.nama} (${adminFormData.email}).`,
        'success'
      );
    } catch (err: any) {
      setIsSubmitting(false);
      showToast('Gagal Memperbarui', err.message || 'Gagal menyimpan akun super admin.', 'error');
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Manajemen Akun Guru & Wali Kelas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasi akun login per rombel SMKS PGRI 1 Kota Sukabumi dan pengaturan akun Super Admin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAdminFormData(superAdminConfig);
                setIsSuperAdminModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-2 transition cursor-pointer touch-manipulation"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Ganti Akun Super Admin</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer touch-manipulation"
            >
              <UserPlus className="w-4 h-4" />
              <span>Buat Akun Wali Kelas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Super Admin Active Info Card */}
      <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-950/20 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">{superAdminConfig.nama}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SUPER ADMIN UTAMA
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="font-mono text-slate-400">NIP: {superAdminConfig.nip}</span>
                <span className="text-slate-600">·</span>
                <span className="text-indigo-300 font-mono">{superAdminConfig.email}</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400 font-semibold">Akses Penuh Seluruh {ALL_SMK_PGRI_1_ROMBELS.length} Rombel (21 Kelas)</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setAdminFormData(superAdminConfig);
              setIsSuperAdminModalOpen(true);
            }}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer touch-manipulation flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Kelola Super Admin</span>
          </button>
        </div>
      </div>

      {/* Rombel Structure Overview (21 Rombel Resmi) */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Struktur Program Keahlian & Rombel (21 Rombel SMKS PGRI 1)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            {occupiedClasses.size} / {ALL_SMK_PGRI_1_ROMBELS.length} Rombel Terisi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* TKJ */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-indigo-300">1. TKJ (6 Rombel)</span>
              <span className="text-[10px] text-slate-400">Teknik Komputer</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <p><strong className="text-slate-400">X:</strong> X TKJ 1, X TKJ 2</p>
              <p><strong className="text-slate-400">XI:</strong> XI TKJ 1, XI TKJ 2</p>
              <p><strong className="text-slate-400">XII:</strong> XII TKJ 1, XII TKJ 2</p>
            </div>
          </div>

          {/* AKL */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-emerald-300">2. AKL (3 Rombel)</span>
              <span className="text-[10px] text-slate-400">Akuntansi</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <p><strong className="text-slate-400">X:</strong> X AKL</p>
              <p><strong className="text-slate-400">XI:</strong> XI AKL</p>
              <p><strong className="text-slate-400">XII:</strong> XII AKL</p>
            </div>
          </div>

          {/* MPLB */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sky-300">3. MPLB (6 Rombel)</span>
              <span className="text-[10px] text-slate-400">Perkantoran</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <p><strong className="text-slate-400">X:</strong> X MPLB 1, X MPLB 2</p>
              <p><strong className="text-slate-400">XI:</strong> XI MPLB 1, XI MPLB 2</p>
              <p><strong className="text-slate-400">XII:</strong> XII MPLB 1, XII MPLB 2</p>
            </div>
          </div>

          {/* PM */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/90">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-300">4. PM (6 Rombel)</span>
              <span className="text-[10px] text-slate-400">Bisnis/Pemasaran</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <p><strong className="text-slate-400">X:</strong> X PM 1, X PM 2</p>
              <p><strong className="text-slate-400">XI:</strong> XI PM 1, XI PM 2</p>
              <p><strong className="text-slate-400">XII:</strong> XII PM 1, XII PM 2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari guru berdasarkan Nama, NIP, atau Rombel..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Filter Tingkat */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'X', 'XI', 'XII'] as const).map((tingkat) => (
              <button
                key={tingkat}
                onClick={() => setSelectedTingkat(tingkat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  selectedTingkat === tingkat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {tingkat === 'ALL' ? 'Semua Tingkat' : `Kelas ${tingkat}`}
              </button>
            ))}
          </div>

          {/* Filter Jurusan */}
          <select
            value={selectedJurusan}
            onChange={(e) => setSelectedJurusan(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl glass-input text-xs text-white border border-slate-800 cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">Semua Program Keahlian (4 Jurusan)</option>
            <option value="TKJ" className="bg-slate-900">TKJ (Teknik Komputer & Jaringan)</option>
            <option value="AKL" className="bg-slate-900">AKL (Akuntansi)</option>
            <option value="MPLB" className="bg-slate-900">MPLB (Manajemen Perkantoran)</option>
            <option value="PM" className="bg-slate-900">PM (Bisnis Daring/Pemasaran)</option>
          </select>
        </div>

        {/* Quick Stats of Rombels */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>
            Total Guru Terdaftar: <strong className="text-white">{teachers.length}</strong> (Ditampilkan: {filteredTeachers.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Program Keahlian: TKJ, AKL, MPLB, PM
          </span>
        </div>
      </div>

      {/* Grid of Registered Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTeachers.map((teacher) => {
          const rombel = ALL_SMK_PGRI_1_ROMBELS.find((r) => r.id === teacher.kelasId);
          const isCurrentUser = currentUser.nip === teacher.nip;
          const isAdmin = teacher.role === 'admin';

          return (
            <div
              key={teacher.id}
              className={`p-4 rounded-2xl glass-panel border transition hover:border-slate-700 flex flex-col justify-between ${
                isAdmin 
                  ? 'border-amber-500/30 bg-amber-950/10' 
                  : isCurrentUser 
                    ? 'border-indigo-500/40 bg-indigo-950/10' 
                    : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAdmin 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {teacher.nama.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate" title={teacher.nama}>
                        {teacher.nama}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        NIP: {teacher.nip}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    isAdmin 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {teacher.assignedKelas}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 py-2.5 border-y border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <School className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{rombel?.jurusan || 'Teknik & Manajemen'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate text-slate-300 font-mono">{teacher.email}</span>
                  </div>
                  {teacher.noHp && (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono text-emerald-300">{teacher.noHp}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Kata sandi login: <strong className="text-slate-200 font-mono">{teacher.password || 'smkpgri1'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 mt-1">
                <span className="text-[10px] text-slate-500">
                  {isAdmin ? 'Akses Kurikulum' : 'Wali Kelas Aktif'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(teacher)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                    title="Edit Profil Akun"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={() => handleDeleteTeacher(teacher)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20 transition cursor-pointer"
                      title="Hapus Akun"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Buat / Edit Akun Wali Kelas */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800 shadow-2xl my-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {isEditModalOpen ? 'Edit Akun Wali Kelas' : 'Buat Akun Wali Kelas Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    SMKS PGRI 1 Kota Sukabumi
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTeacher} className="space-y-3.5 text-xs sm:text-sm">
              {/* Pilihan Rombel SMKS PGRI 1 */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilih Rombel / Kelas (SMKS PGRI 1)
                </label>
                <select
                  value={formData.kelasId}
                  onChange={(e) => handleSelectKelas(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white cursor-pointer"
                  required
                >
                  <optgroup label="--- TINGKAT KELAS X ---" className="bg-slate-900 text-indigo-300">
                    {ALL_SMK_PGRI_1_ROMBELS.filter((r) => r.tingkat === 'X').map((r) => {
                      const isOccupied = occupiedClasses.has(r.id) && (!isEditModalOpen || selectedTeacherForEdit?.kelasId !== r.id);
                      return (
                        <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                          {r.nama} · {r.jurusan} {isOccupied ? '(Sudah ada Wali Kelas)' : ''}
                        </option>
                      );
                    })}
                  </optgroup>

                  <optgroup label="--- TINGKAT KELAS XI ---" className="bg-slate-900 text-indigo-300">
                    {ALL_SMK_PGRI_1_ROMBELS.filter((r) => r.tingkat === 'XI').map((r) => {
                      const isOccupied = occupiedClasses.has(r.id) && (!isEditModalOpen || selectedTeacherForEdit?.kelasId !== r.id);
                      return (
                        <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                          {r.nama} · {r.jurusan} {isOccupied ? '(Sudah ada Wali Kelas)' : ''}
                        </option>
                      );
                    })}
                  </optgroup>

                  <optgroup label="--- TINGKAT KELAS XII ---" className="bg-slate-900 text-indigo-300">
                    {ALL_SMK_PGRI_1_ROMBELS.filter((r) => r.tingkat === 'XII').map((r) => {
                      const isOccupied = occupiedClasses.has(r.id) && (!isEditModalOpen || selectedTeacherForEdit?.kelasId !== r.id);
                      return (
                        <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                          {r.nama} · {r.jurusan} {isOccupied ? '(Sudah ada Wali Kelas)' : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>

              {/* Nama Guru */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap Guru (beserta Gelar)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dra. Hj. Nurlaela, M.Pd."
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white"
                />
              </div>

              {/* NIP / NUPTK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    NIP / NUPTK (18 Digit)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="198506122010011014"
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    No. WhatsApp Guru
                  </label>
                  <input
                    type="text"
                    placeholder="081289123456"
                    value={formData.noHp || ''}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Akun Guru
                  </label>
                  <input
                    type="email"
                    placeholder="guru@smkpgri1sukabumi.sch.id"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kata Sandi Login
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="smkpgri1"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono"
                  />
                </div>
              </div>

              {/* Peran Akun */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Peran Akun
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition ${
                    formData.role === 'wali_kelas' 
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="wali_kelas"
                      checked={formData.role === 'wali_kelas'}
                      onChange={() => setFormData({ ...formData, role: 'wali_kelas' })}
                      className="hidden"
                    />
                    <School className="w-4 h-4 text-indigo-400" />
                    <span>Wali Kelas</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition ${
                    formData.role === 'kurikulum' 
                      ? 'bg-amber-600/30 border-amber-500 text-white font-bold' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="kurikulum"
                      checked={formData.role === 'kurikulum'}
                      onChange={() => setFormData({ ...formData, role: 'kurikulum' })}
                      className="hidden"
                    />
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Tim Kurikulum</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{isEditModalOpen ? 'Simpan Pembaruan' : 'Buat Akun Wali Kelas'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ganti & Kelola Akun Super Admin */}
      {isSuperAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg p-5 sm:p-6 rounded-2xl glass-panel border border-amber-500/40 shadow-2xl my-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Konfigurasi Akun Super Admin
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pengalihan Wewenang & Hak Akses Penuh Sistem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSuperAdminModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Akun Super Admin memiliki hak penuh untuk mengakses semua rombel, mengubah identitas sekolah, dan mengelola seluruh akun guru. Anda dapat mengganti email, nama pejabat kurikulum, dan kata sandi sesuai kebutuhan.
              </p>
            </div>

            <form onSubmit={handleSubmitSuperAdmin} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap Pejabat Super Admin
                </label>
                <input
                  type="text"
                  required
                  value={adminFormData.nama}
                  onChange={(e) => setAdminFormData({ ...adminFormData, nama: e.target.value })}
                  placeholder="Diyanto, S.Kom., M.T."
                  className="w-full px-3 py-2 rounded-xl glass-input text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Resmi Super Admin (Untuk Verifikasi & Login)
                </label>
                <input
                  type="email"
                  required
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  placeholder="diyanto13@gmail.com"
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    NIP / NUPTK Super Admin
                  </label>
                  <input
                    type="text"
                    required
                    value={adminFormData.nip}
                    onChange={(e) => setAdminFormData({ ...adminFormData, nip: e.target.value })}
                    placeholder="198506122010011014"
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    No. WhatsApp Super Admin
                  </label>
                  <input
                    type="text"
                    value={adminFormData.noHp || ''}
                    onChange={(e) => setAdminFormData({ ...adminFormData, noHp: e.target.value })}
                    placeholder="081289123456"
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kata Sandi Baru Super Admin
                </label>
                <input
                  type="text"
                  required
                  value={adminFormData.password || ''}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                  placeholder="smkpgri1admin"
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSuperAdminModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Terapkan Super Admin Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
