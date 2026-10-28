import React, { useState, useRef } from 'react';
import { 
  Users, UserPlus, FileSpreadsheet, Download, Upload, 
  Search, Edit3, Trash2, CheckCircle2, AlertTriangle, Phone, MapPin, X 
} from 'lucide-react';
import { Student } from '../types';
import { exportStudentsToExcel, parseStudentsFromExcel, downloadStudentTemplateExcel } from '../utils/excel';

interface SiswaTabProps {
  students: Student[];
  onSaveStudents: (newStudents: Student[]) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SiswaTab: React.FC<SiswaTabProps> = ({
  students,
  onSaveStudents,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJK, setFilterJK] = useState<'ALL' | 'L' | 'P'>('ALL');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    nis: string;
    nama: string;
    jenisKelamin: 'L' | 'P';
    noHpOrtu: string;
    alamat: string;
    catatan: string;
  }>({
    nis: '',
    nama: '',
    jenisKelamin: 'L',
    noHpOrtu: '',
    alamat: '',
    catatan: '',
  });

  // Excel file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<Student[] | null>(null);

  // Delete confirmation modal state
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Counts
  const totalL = students.filter((s) => s.jenisKelamin === 'L').length;
  const totalP = students.filter((s) => s.jenisKelamin === 'P').length;

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.alamat && s.alamat.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchQuery) return false;
    if (filterJK === 'ALL') return true;
    return s.jenisKelamin === filterJK;
  });

  // Buka Modal Tambah Siswa
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      nis: `2223${1000 + students.length + 1}`,
      nama: '',
      jenisKelamin: 'L',
      noHpOrtu: '',
      alamat: '',
      catatan: '',
    });
    setIsModalOpen(true);
  };

  // Buka Modal Edit Siswa
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nama: student.nama,
      jenisKelamin: student.jenisKelamin,
      noHpOrtu: student.noHpOrtu,
      alamat: student.alamat || '',
      catatan: student.catatan || '',
    });
    setIsModalOpen(true);
  };

  // Simpan Form (Tambah atau Edit)
  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.nis.trim()) {
      showToast('Data Tidak Lengkap', 'Nama dan NIS wajib diisi.', 'error');
      return;
    }

    if (editingStudent) {
      // Update
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              nis: formData.nis.trim(),
              nama: formData.nama.trim(),
              jenisKelamin: formData.jenisKelamin,
              noHpOrtu: formData.noHpOrtu.trim() || '081200000000',
              alamat: formData.alamat.trim() || undefined,
              catatan: formData.catatan.trim() || undefined,
            }
          : s
      );
      onSaveStudents(updated);
      showToast('Siswa Diperbarui', `Data ${formData.nama} berhasil diperbarui.`, 'success');
    } else {
      // Tambah Baru
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        nis: formData.nis.trim(),
        nama: formData.nama.trim(),
        jenisKelamin: formData.jenisKelamin,
        noHpOrtu: formData.noHpOrtu.trim() || '081200000000',
        alamat: formData.alamat.trim() || undefined,
        catatan: formData.catatan.trim() || undefined,
      };
      onSaveStudents([...students, newStudent]);
      showToast('Siswa Ditambahkan', `${formData.nama} berhasil didaftarkan ke kelas XII TKJ 2.`, 'success');
    }

    setIsModalOpen(false);
  };

  // Hapus Siswa
  const handleConfirmDelete = () => {
    if (deletingStudent) {
      const updated = students.filter((s) => s.id !== deletingStudent.id);
      onSaveStudents(updated);
      showToast('Siswa Dihapus', `${deletingStudent.nama} telah dihapus dari data kelas.`, 'info');
      setDeletingStudent(null);
    }
  };

  // Handler Upload Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseStudentsFromExcel(file);
      if (parsed.length === 0) {
        showToast('File Kosong', 'Tidak ada baris data siswa yang valid dalam file Excel.', 'error');
      } else {
        setImportPreview(parsed);
      }
    } catch (err: any) {
      showToast('Gagal Membaca Excel', err.message || 'Pastikan format file .xlsx valid.', 'error');
    }

    // Reset input agar bisa re-upload file yang sama jika diinginkan
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Konfirmasi Impor Excel Massal
  const handleApplyImport = () => {
    if (!importPreview) return;
    const combined = [...students, ...importPreview];
    onSaveStudents(combined);
    showToast('Impor Berhasil!', `${importPreview.length} siswa baru berhasil ditambahkan dari file Excel.`, 'success');
    setImportPreview(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Panel with Stats & Actions */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Stats */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Master Data Peserta Didik
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs">
                <span className="text-slate-400">Total: <strong className="text-white">{students.length}</strong> Siswa</span>
                <span className="text-slate-600">•</span>
                <span className="text-blue-300">Laki-laki: <strong>{totalL}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-pink-300">Perempuan: <strong>{totalP}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden Excel Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Unggah file .xlsx untuk memasukkan siswa secara massal"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Impor Excel (.xlsx)</span>
            </button>

            <button
              onClick={downloadStudentTemplateExcel}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1.5 transition cursor-pointer"
              title="Unduh contoh template format Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Template</span>
            </button>

            <button
              onClick={() => exportStudentsToExcel(students)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition cursor-pointer"
              title="Ekspor seluruh data siswa saat ini ke Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Ekspor Excel</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama, NIS, atau Alamat..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm text-white placeholder-slate-400"
          />
        </div>

        {/* Gender Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterJK('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterJK === 'ALL'
                ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200'
                : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({students.length})
          </button>
          <button
            onClick={() => setFilterJK('L')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterJK === 'L'
                ? 'bg-blue-500/25 border border-blue-400 text-blue-200'
                : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            Laki-laki ({totalL})
          </button>
          <button
            onClick={() => setFilterJK('P')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterJK === 'P'
                ? 'bg-pink-500/25 border border-pink-400 text-pink-200'
                : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            Perempuan ({totalP})
          </button>
        </div>
      </div>

      {/* Table of Students */}
      <div className="glass-panel rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-28">NIS</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-3 w-16 text-center">L/P</th>
                <th className="py-3.5 px-4">No. HP / WA Orang Tua</th>
                <th className="py-3.5 px-4">Domisili / Alamat</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="font-medium text-slate-300">Tidak ada data peserta didik yang cocok.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-cyan-300 font-semibold">
                      {student.nis}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            student.jenisKelamin === 'L'
                              ? 'bg-gradient-to-tr from-cyan-600 to-blue-700'
                              : 'bg-gradient-to-tr from-pink-600 to-purple-700'
                          }`}
                        >
                          {student.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">{student.nama}</p>
                          {student.catatan && (
                            <p className="text-[11px] text-amber-300/80 mt-0.5">{student.catatan}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.jenisKelamin === 'L'
                            ? 'bg-blue-950/70 text-blue-300 border border-blue-500/30'
                            : 'bg-pink-950/70 text-pink-300 border border-pink-500/30'
                        }`}
                      >
                        {student.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{student.noHpOrtu}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {student.alamat ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[200px]">{student.alamat}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-950/80 text-cyan-400 border border-white/5 hover:border-cyan-500/30 transition cursor-pointer"
                          title="Ubah data siswa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingStudent(student)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 text-rose-400 border border-white/5 hover:border-rose-500/30 transition cursor-pointer"
                          title="Hapus siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                {editingStudent ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nomor Induk Siswa (NIS) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="Contoh: 22231035"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900 cursor-pointer"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama lengkap sesuai ijazah/akta..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  No. HP / WhatsApp Orang Tua / Wali *
                </label>
                <input
                  type="text"
                  required
                  value={formData.noHpOrtu}
                  onChange={(e) => setFormData({ ...formData, noHpOrtu: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Format awalan 08 atau 628 untuk kemudahan pengiriman notifikasi WhatsApp.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Alamat / Domisili
                </label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Contoh: Baros, Kota Sukabumi"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Contoh: Siswa berprestasi / Pengurus OSIS / Alergi..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs sm:text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-600/30 transition cursor-pointer"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 rounded-2xl glass-panel border border-rose-500/30 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Konfirmasi Hapus Siswa</h3>
            <p className="text-xs text-slate-300 mb-4">
              Apakah Anda yakin ingin menghapus data <strong>{deletingStudent.nama}</strong> (NIS: {deletingStudent.nis})?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Preview Modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl p-6 rounded-2xl glass-panel border border-emerald-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Pratinjau Impor Excel ({importPreview.length} Siswa Terdeteksi)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Berikut adalah daftar peserta didik yang berhasil diekstrak dari file Excel:
            </p>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 sticky top-0 text-slate-400 font-bold">
                  <tr>
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">NIS</th>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-3">L/P</th>
                    <th className="py-2 px-3">No HP Ortu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {importPreview.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono text-cyan-300">{s.nis}</td>
                      <td className="py-2 px-3 font-medium text-white">{s.nama}</td>
                      <td className="py-2 px-3">{s.jenisKelamin}</td>
                      <td className="py-2 px-3 font-mono text-slate-400">{s.noHpOrtu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleApplyImport}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                Konfirmasi & Simpan ke Kelas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
