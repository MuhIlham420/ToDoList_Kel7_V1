import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Trash2, Loader2, CheckCircle2, Clock, Filter, Upload, Download, X, ArrowUpDown, Pencil } from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../services/api";

export default function TugasPage() {
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState({ text: "", type: "" });
  const [editingTugas, setEditingTugas] = useState(null);
  const fileInputRef = useRef(null);

  const [filterBeban, setFilterBeban] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOption, setSortOption] = useState("deadline_asc");

  const defaultFormData = {
    judul_tugas: "",
    deskripsi: "",
    deadline: "",
    cognitive_load: 3,
    importance: 3,
    preference: 3,
    estimasi_durasi: 60
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchTugas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tugas');
      if (response.data.success) {
        setTugas(response.data.data.tugas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTugas();
  }, []);

  const filteredTugas = useMemo(() => {
    let result = [...tugas];
    if (filterBeban !== 'all') {
      if (filterBeban === 'high') result = result.filter(t => t.cognitive_load >= 4);
      else if (filterBeban === 'low') result = result.filter(t => t.cognitive_load <= 3);
    }
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }
    result.sort((a, b) => {
      switch (sortOption) {
        case 'deadline_asc': return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'deadline_desc': return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        case 'created_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return 0;
      }
    });
    return result;
  }, [tugas, filterBeban, filterStatus, sortOption]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAdd = () => {
    setEditingTugas(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTugas(t);
    setFormData({
      judul_tugas: t.judul_tugas || "",
      deskripsi: t.deskripsi || "",
      deadline: t.deadline ? t.deadline.substring(0, 16) : "",
      cognitive_load: t.cognitive_load || 3,
      importance: t.importance || 3,
      preference: t.preference || 3,
      estimasi_durasi: t.estimasi_durasi || 60,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTugas(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTugas) {
        await api.put(`/tugas/${editingTugas.id}`, formData);
      } else {
        await api.post('/tugas', formData);
      }
      handleCloseModal();
      fetchTugas();
    } catch (err) {
      alert(err.response?.data?.message || (editingTugas ? "Gagal mengupdate tugas" : "Gagal menambahkan tugas"));
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === 'completed') {
        await api.patch(`/tugas/${id}/complete`);
        fetchTugas();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengupdate status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;
    try {
      await api.delete(`/tugas/${id}`);
      fetchTugas();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus tugas");
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg({ text: "", type: "" });
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        setImportMsg({ text: "File Excel kosong atau format tidak sesuai.", type: "error" });
        setImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      for (const row of rows) {
        try {
          const payload = {
            judul_tugas: String(row['Judul Tugas'] || row['judul_tugas'] || "").trim(),
            deskripsi: String(row['Deskripsi'] || row['deskripsi'] || "").trim() || null,
            deadline: parseExcelDate(row['Deadline'] || row['deadline']),
            cognitive_load: parseInt(row['Cognitive Load'] || row['cognitive_load'] || "3"),
            importance: parseInt(row['Importance'] || row['importance'] || "3"),
            preference: parseInt(row['Preference'] || row['preference'] || "3"),
            estimasi_durasi: parseInt(row['Estimasi Durasi (Menit)'] || row['estimasi_durasi'] || "60"),
          };
          if (!payload.judul_tugas || !payload.deadline) { errorCount++; continue; }
          payload.cognitive_load = Math.max(1, Math.min(5, payload.cognitive_load));
          payload.importance = Math.max(1, Math.min(5, payload.importance));
          payload.preference = Math.max(1, Math.min(5, payload.preference));
          
          await api.post('/tugas', payload);
          successCount++;
        } catch { errorCount++; }
      }
      setImportMsg({ text: `Impor selesai: ${successCount} berhasil, ${errorCount} gagal dari ${rows.length} baris.`, type: errorCount === rows.length ? "error" : "success" });
      fetchTugas();
    } catch (err) {
      setImportMsg({ text: "Gagal membaca file Excel. Pastikan format .xlsx/.xls.", type: "error" });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const parseExcelDate = (value) => {
    if (!value) return "";
    if (typeof value === 'string') {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 16);
      return value;
    }
    if (typeof value === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const d = new Date(excelEpoch.getTime() + (value * 86400000));
      return d.toISOString().slice(0, 16);
    }
    return String(value);
  };

  const downloadTemplate = () => window.open('/template_tugas.xlsx', '_blank');

  const activeFilterCount = [filterBeban !== 'all', filterStatus !== 'all'].filter(Boolean).length;

  return (
    <>
      <div className="animate-[fadeIn_0.5s_ease_forwards] w-full">
        <header className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-3xl mb-2 font-heading">Manajemen Tugas</h1>
            <p className="text-slate-500 m-0">Kelola daftar pekerjaan Anda dengan menandai prioritas kognitifnya.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4" title="Unduh template Excel"><Download size={16} /> Template</button>
            <button onClick={handleImportClick} className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4" disabled={importing}>{importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Impor Excel</button>
            <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"><Plus size={18} /> Tambah Tugas</button>
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
        </header>

        {importMsg.text && (
          <div className={`px-4 py-3 rounded-lg mb-5 flex justify-between items-center text-sm border
            ${importMsg.type === 'success' ? 'bg-green-50 border-green-200 text-energy-peak' : 'bg-red-50 border-red-200 text-energy-low'}
          `}>
            <span>{importMsg.text}</span>
            <button onClick={() => setImportMsg({ text: "", type: "" })} className="bg-transparent border-none cursor-pointer text-inherit p-1 hover:opacity-70"><X size={16}/></button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="glass-card mb-6 py-4 px-5 flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Filter size={16} /> Filter
            {activeFilterCount > 0 && <span className="bg-green-500/10 text-energy-peak px-1.5 py-0.5 rounded text-xs font-bold">{activeFilterCount}</span>}
          </div>
          
          <div className="flex gap-1.5">
            <button onClick={() => setFilterBeban('all')} className={`px-3 py-1.5 rounded-md font-medium text-sm border cursor-pointer transition-colors ${filterBeban === 'all' ? 'bg-sage-500 text-white border-sage-500' : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-300'}`}>Semua</button>
            <button onClick={() => setFilterBeban('high')} className={`px-3 py-1.5 rounded-md font-medium text-sm border cursor-pointer transition-colors ${filterBeban === 'high' ? 'bg-sage-500 text-white border-sage-500' : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-300'}`}>Deep Work</button>
            <button onClick={() => setFilterBeban('low')} className={`px-3 py-1.5 rounded-md font-medium text-sm border cursor-pointer transition-colors ${filterBeban === 'low' ? 'bg-sage-500 text-white border-sage-500' : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-300'}`}>Shallow</button>
          </div>

          <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 rounded-md font-medium text-xs border cursor-pointer transition-colors ${filterStatus === 'all' ? 'bg-sage-500 text-white border-sage-500' : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-300'}`}>Semua Status</button>
            <button onClick={() => setFilterStatus('pending')} className={`px-3 py-1.5 rounded-md font-medium text-xs border cursor-pointer transition-colors ${filterStatus === 'pending' ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-300'}`}>Pending</button>
            <button onClick={() => setFilterStatus('in_progress')} className={`px-3 py-1.5 rounded-md font-medium text-xs border cursor-pointer transition-colors ${filterStatus === 'in_progress' ? 'bg-sage-500/15 text-sage-600 border-sage-500/30' : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-300'}`}>In Progress</button>
            <button onClick={() => setFilterStatus('completed')} className={`px-3 py-1.5 rounded-md font-medium text-xs border cursor-pointer transition-colors ${filterStatus === 'completed' ? 'bg-green-500/15 text-energy-peak border-green-500/30' : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-300'}`}>Completed</button>
          </div>

          <div className="w-px h-6 bg-slate-200 hidden lg:block"></div>

          <div className="flex items-center gap-1.5 mt-2 lg:mt-0">
            <ArrowUpDown size={14} className="text-slate-500" />
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="input-form py-1.5 px-2.5 text-xs w-auto min-w-[160px]">
              <option value="deadline_asc">Deadline Terdekat</option>
              <option value="deadline_desc">Deadline Terlama</option>
              <option value="created_desc">Terbaru Ditambahkan</option>
              <option value="created_asc">Terlama Ditambahkan</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-10"><Loader2 size={32} className="animate-spin opacity-50 mx-auto" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTugas.length === 0 ? (
              <p className="col-span-full text-center py-10 text-slate-400">
                {tugas.length === 0 ? "Belum ada tugas. Klik Tambah Tugas di atas." : "Tidak ada tugas yang cocok dengan filter ini."}
              </p>
            ) : filteredTugas.map((t) => (
              <div key={t.id} className={`glass-card flex flex-col ${t.status === 'completed' ? 'opacity-60' : 'opacity-100'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`text-lg m-0 ${t.status === 'completed' ? 'line-through' : ''}`}>{t.judul_tugas}</h3>
                  <div className="flex gap-2">
                    {t.status !== 'completed' && (
                      <>
                        <button onClick={() => handleOpenEdit(t)} className="bg-transparent border-none text-sage-500 cursor-pointer hover:opacity-80" title="Edit Tugas"><Pencil size={18} /></button>
                        <button onClick={() => updateStatus(t.id, 'completed')} className="bg-transparent border-none text-energy-normal cursor-pointer hover:opacity-80" title="Tandai Selesai"><CheckCircle2 size={20} /></button>
                      </>
                    )}
                    <button onClick={() => handleDelete(t.id)} className="bg-transparent border-none text-energy-low cursor-pointer hover:opacity-80" title="Hapus"><Trash2 size={20} /></button>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-4 flex-1">{t.deskripsi || "Tidak ada deskripsi"}</p>
                
                <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 text-sage-500 font-medium">
                      <Clock size={16} /> <span>{new Date(t.deadline).toLocaleDateString('id-ID')}</span>
                    </div>
                    <span className="text-slate-400">{t.estimasi_durasi} menit</span>
                  </div>
                  
                  <div className="flex gap-2 text-[10px] font-bold tracking-wider uppercase flex-wrap">
                    <span className={`px-2 py-1 rounded border ${t.cognitive_load >= 4 ? 'bg-sage-500/10 text-sage-500 border-sage-500/30' : 'bg-blue-500/10 text-energy-normal border-blue-500/30'}`}>
                      {t.cognitive_load >= 4 ? 'DEEP WORK' : 'SHALLOW'}
                    </span>
                    <span className="px-2 py-1 rounded border bg-purple-500/10 text-purple-600 border-purple-500/30">
                      CL: {t.cognitive_load} | I: {t.importance} | P: {t.preference}
                    </span>
                    <span className={`px-2 py-1 rounded border 
                      ${t.status === 'completed' ? 'bg-green-500/10 text-energy-peak border-green-500/30' : 
                        t.status === 'in_progress' ? 'bg-sage-500/10 text-sage-500 border-sage-500/30' : 
                        'bg-black/5 text-slate-500 border-transparent'}
                    `}>
                      {t.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={handleCloseModal} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              {editingTugas
                ? <><Pencil size={24} className="text-sage-500" /> Edit Tugas</>
                : <><Plus size={24} className="text-sage-500" /> Tambah Tugas</>
              }
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm text-slate-700 font-medium">Judul Tugas</label>
                    <input type="text" name="judul_tugas" className="input-form" value={formData.judul_tugas} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm text-slate-700 font-medium">Deskripsi (Opsional)</label>
                    <textarea name="deskripsi" className="input-form min-h-[100px]" value={formData.deskripsi} onChange={handleChange}></textarea>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm text-slate-700 font-medium">Deadline</label>
                    <input type="datetime-local" name="deadline" className="input-form" value={formData.deadline} onChange={handleChange} required />
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-slate-700 font-medium">Cognitive Load (Beban Pikiran)</label>
                    <span className="text-sm font-bold text-sage-500 w-6 text-center">{formData.cognitive_load}</span>
                  </div>
                  <input type="range" name="cognitive_load" min="1" max="5" value={formData.cognitive_load} onChange={handleChange} className="w-full accent-sage-500" />
                  <div className="flex justify-between text-xs text-slate-400 mt-[-10px]"><span>Sangat Ringan</span><span>Sangat Berat</span></div>

                  <div className="flex items-center justify-between mt-2">
                    <label className="text-sm text-slate-700 font-medium">Importance (Dampak Hasil)</label>
                    <span className="text-sm font-bold text-sage-500 w-6 text-center">{formData.importance}</span>
                  </div>
                  <input type="range" name="importance" min="1" max="5" value={formData.importance} onChange={handleChange} className="w-full accent-sage-500" />
                  <div className="flex justify-between text-xs text-slate-400 mt-[-10px]"><span>Tidak Penting</span><span>Sangat Penting</span></div>

                  <div className="flex items-center justify-between mt-2">
                    <label className="text-sm text-slate-700 font-medium">Preference (Kesukaan)</label>
                    <span className="text-sm font-bold text-sage-500 w-6 text-center">{formData.preference}</span>
                  </div>
                  <input type="range" name="preference" min="1" max="5" value={formData.preference} onChange={handleChange} className="w-full accent-sage-500" />
                  <div className="flex justify-between text-xs text-slate-400 mt-[-10px]"><span>Sangat Tidak Suka</span><span>Sangat Suka</span></div>

                  <div className="mt-2">
                    <label className="block mb-1.5 text-sm text-slate-700 font-medium">Estimasi Durasi (Menit)</label>
                    <input type="number" name="estimasi_durasi" className="input-form" value={formData.estimasi_durasi} onChange={handleChange} min={15} max={480} required />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8 border-t border-slate-100 pt-6">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium">Batal</button>
                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : editingTugas ? <Pencil size={18} /> : <Plus size={18} />}
                  {editingTugas ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
