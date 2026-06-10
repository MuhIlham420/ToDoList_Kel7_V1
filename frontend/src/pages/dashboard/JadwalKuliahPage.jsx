import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, CalendarDays, Loader2, MapPin, Upload, Download, X, Pencil } from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../services/api";

export default function JadwalKuliahPage() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState({ text: "", type: "" });
  const [editingJadwal, setEditingJadwal] = useState(null);
  const fileInputRef = useRef(null);

  const defaultFormData = {
    mata_kuliah: "",
    hari: "Senin",
    jam_mulai: "08:00",
    jam_selesai: "10:00",
    ruangan: ""
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jadwal-kuliah');
      if (response.data.success) {
        setJadwal(response.data.data.jadwal_kuliah);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAdd = () => {
    setEditingJadwal(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (j) => {
    setEditingJadwal(j);
    setFormData({
      mata_kuliah: j.mata_kuliah || "",
      hari: j.hari || "Senin",
      jam_mulai: (j.jam_mulai || "08:00").substring(0, 5),
      jam_selesai: (j.jam_selesai || "10:00").substring(0, 5),
      ruangan: j.ruangan || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJadwal(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingJadwal) {
        await api.put(`/jadwal-kuliah/${editingJadwal.id}`, formData);
      } else {
        await api.post('/jadwal-kuliah', formData);
      }
      handleCloseModal();
      fetchJadwal();
    } catch (err) {
      alert(err.response?.data?.message || (editingJadwal ? "Gagal mengupdate jadwal" : "Gagal menambahkan jadwal"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      await api.delete(`/jadwal-kuliah/${id}`);
      fetchJadwal();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus jadwal");
    }
  };

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const groupedJadwal = days.reduce((acc, day) => {
    acc[day] = jadwal.filter(j => j.hari === day);
    return acc;
  }, {});

  // Excel Logic
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const normalizeTime = (value) => {
    if (!value) return "";
    const str = String(value).trim();
    const match = str.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const h = match[1].padStart(2, '0');
      const m = match[2];
      return `${h}:${m}`;
    }
    if (typeof value === 'number' && value < 1) {
      const totalMinutes = Math.round(value * 24 * 60);
      const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
      const minutes = (totalMinutes % 60).toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return str;
  };

  const normalizeDayName = (value) => {
    if (!value) return "";
    const str = String(value).trim();
    const found = validDays.find(d => d.toLowerCase() === str.toLowerCase());
    if (found && found !== 'Minggu') return found;
    const map = { 'monday': 'Senin', 'tuesday': 'Selasa', 'wednesday': 'Rabu', 'thursday': 'Kamis', 'friday': 'Jumat', 'saturday': 'Sabtu' };
    return map[str.toLowerCase()] || str;
  };

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
          const hari = normalizeDayName(row['Hari'] || row['hari']);
          const jam_mulai = normalizeTime(row['Jam Mulai'] || row['jam_mulai']);
          const jam_selesai = normalizeTime(row['Jam Selesai'] || row['jam_selesai']);
          const nama = String(row['Mata Kuliah'] || row['nama_matakuliah'] || row['mata_kuliah'] || "").trim();
          const ruangan = String(row['Ruangan'] || row['ruangan'] || "").trim();

          if (!nama || !hari || !jam_mulai || !jam_selesai) {
            errorCount++; continue;
          }

          if (!validDays.includes(hari) || hari === 'Minggu') {
            errorCount++; continue;
          }

          const payload = {
            mata_kuliah: nama,
            hari,
            jam_mulai,
            jam_selesai,
            ruangan: ruangan || null
          };
          
          await api.post('/jadwal-kuliah', payload);
          successCount++;
        } catch {
          errorCount++;
        }
      }

      setImportMsg({ 
        text: `Impor selesai: ${successCount} berhasil, ${errorCount} gagal dari ${rows.length} baris.`, 
        type: errorCount === rows.length ? "error" : "success" 
      });
      fetchJadwal();
    } catch (err) {
      setImportMsg({ text: "Gagal membaca file Excel. Pastikan format .xlsx/.xls.", type: "error" });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    window.open('/template_jadwal_kuliah.xlsx', '_blank');
  };

  return (
    <>
      <div className="animate-[fadeIn_0.5s_ease_forwards] w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl mb-2 font-heading">Jadwal Kuliah (Waktu Tetap)</h1>
            <p className="text-slate-500 m-0">Penjadwalan aktivitas ini tidak akan diganggu oleh sistem karena bersifat mutlak.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4" title="Unduh template Excel">
              <Download size={16} /> Template
            </button>
            <button onClick={handleImportClick} className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4" disabled={importing}>
              {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Impor Excel
            </button>
            <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              <Plus size={18} /> Tambah Jadwal
            </button>
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

        {loading ? (
          <div className="text-center p-10"><Loader2 size={32} className="animate-spin opacity-50 mx-auto" /></div>
        ) : (
          <div className="flex flex-col gap-6">
            {days.map(day => (
              <div key={day} className="glass-card p-0 overflow-hidden">
                <div className={`bg-black/5 px-6 py-4 flex items-center gap-3 ${groupedJadwal[day].length > 0 ? 'border-b border-slate-200/80' : ''}`}>
                  <CalendarDays size={20} className="text-energy-normal" />
                  <h3 className="m-0 text-lg font-heading">{day}</h3>
                </div>
                {groupedJadwal[day].length > 0 ? (
                  <div className="px-6 py-4 flex flex-col">
                    {groupedJadwal[day].map(j => (
                      <div key={j.id} className="flex justify-between items-center py-3 border-b border-dashed border-slate-200 last:border-0 group">
                        <div>
                          <h4 className="m-0 mb-1 text-base">{j.mata_kuliah}</h4>
                          <div className="flex gap-4 text-sm text-slate-500">
                            <span>{j.jam_mulai.substring(0, 5)} - {j.jam_selesai.substring(0, 5)}</span>
                            {j.ruangan && <span className="flex items-center gap-1"><MapPin size={14} /> {j.ruangan}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEdit(j)} className="bg-transparent border-none text-sage-500 cursor-pointer p-2 hover:bg-sage-500/10 rounded-lg" title="Edit">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(j.id)} className="bg-transparent border-none text-energy-low cursor-pointer p-2 hover:bg-red-50 rounded-lg" title="Hapus">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-4 text-slate-400 text-sm">Tidak ada jadwal.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
          <div className="glass-card animate-[fadeIn_0.3s_ease_forwards] w-full max-w-[500px] bg-white">
            <h2 className="text-2xl mb-6 font-heading">
              {editingJadwal ? "Edit Jadwal Kuliah" : "Tambah Jadwal Kuliah"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-sm text-slate-700 font-medium">Mata Kuliah</label>
                <input type="text" name="mata_kuliah" className="input-form" value={formData.mata_kuliah} onChange={handleChange} required />
              </div>
              <div>
                <label className="block mb-1.5 text-sm text-slate-700 font-medium">Hari</label>
                <select name="hari" className="input-form cursor-pointer" value={formData.hari} onChange={handleChange}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1.5 text-sm text-slate-700 font-medium">Jam Mulai</label>
                  <input type="time" name="jam_mulai" className="input-form" value={formData.jam_mulai} onChange={handleChange} required />
                </div>
                <div className="flex-1">
                  <label className="block mb-1.5 text-sm text-slate-700 font-medium">Jam Selesai</label>
                  <input type="time" name="jam_selesai" className="input-form" value={formData.jam_selesai} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-sm text-slate-700 font-medium">Ruangan (Opsional)</label>
                <input type="text" name="ruangan" className="input-form" value={formData.ruangan} onChange={handleChange} />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="btn-secondary py-2" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn-primary py-2 min-w-[100px] flex justify-center items-center" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : editingJadwal ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
