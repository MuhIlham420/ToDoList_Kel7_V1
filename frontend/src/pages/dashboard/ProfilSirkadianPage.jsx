import { useState, useEffect } from "react";
import { Save, Loader2, Info } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";
import api from "../../services/api";

export default function ProfilSirkadianPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    tipe_sirkadian: "pagi",
    jam_fokus_mulai: "08:00",
    jam_fokus_selesai: "12:00",
    jam_tidur: "22:00",
    jam_bangun: "06:00"
  });

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await api.get('/profil-sirkadian');
        if (response.data.success && response.data.data.profil_sirkadian) {
          const p = response.data.data.profil_sirkadian;
          setFormData({
            tipe_sirkadian: p.tipe_sirkadian || "pagi",
            jam_fokus_mulai: (p.jam_fokus_mulai || "08:00").substring(0, 5),
            jam_fokus_selesai: (p.jam_fokus_selesai || "12:00").substring(0, 5),
            jam_tidur: (p.jam_tidur || "22:00").substring(0, 5),
            jam_bangun: (p.jam_bangun || "06:00").substring(0, 5)
          });
        }
      } catch (err) {
        console.error("Gagal mengambil profil", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const payload = {
        tipe_sirkadian: formData.tipe_sirkadian,
        jam_fokus_mulai: formData.jam_fokus_mulai,
        jam_fokus_selesai: formData.jam_fokus_selesai,
        jam_tidur: formData.jam_tidur,
        jam_bangun: formData.jam_bangun,
      };
      const response = await api.put('/profil-sirkadian', payload);
      if (response.data.success) {
        setMessage({ text: "Profil sirkadian berhasil disimpan.", type: "success" });
        if (user) {
          updateUser({ ...user, profil_sirkadian: response.data.data.profil_sirkadian });
        }
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "Gagal menyimpan profil.", 
        type: "error" 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[80vh]"><Loader2 size={32} className="animate-spin text-sage-500" /></div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] w-full">
      <header className="mb-8">
        <h1 className="text-3xl mb-2 font-heading">Profil Sirkadian</h1>
        <p className="text-slate-500 m-0">Atur ritme biologis Anda agar sistem dapat menjadwalkan tugas berat di waktu paling produktif.</p>
      </header>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 border
          ${message.type === 'error' ? 'bg-red-50 border-red-200 text-energy-low' : 'bg-green-50 border-green-200 text-energy-peak'}
        `}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="glass-card flex-[2] min-w-[300px]">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div>
              <label className="block mb-2 font-medium text-slate-800">Tipe Sirkadian (Kronotipe)</label>
              <select 
                name="tipe_sirkadian" 
                value={formData.tipe_sirkadian} 
                onChange={handleChange}
                className="input-form cursor-pointer"
              >
                <option value="pagi">Early Bird (Pagi)</option>
                <option value="siang">Day Owl (Siang/Sore)</option>
                <option value="malam">Night Owl (Malam/Dini Hari)</option>
              </select>
              <p className="text-sm text-slate-500 mt-2">Pilih kecenderungan alami tubuh Anda untuk merasa berenergi.</p>
            </div>

            <div className="p-5 bg-black/5 rounded-xl border border-black/5">
              <h3 className="text-lg mb-4 text-energy-peak font-heading">Jam Fokus Puncak (Peak)</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1.5 text-sm text-slate-700">Mulai</label>
                  <input type="time" name="jam_fokus_mulai" value={formData.jam_fokus_mulai} onChange={handleChange} className="input-form bg-white" required />
                </div>
                <div className="flex-1">
                  <label className="block mb-1.5 text-sm text-slate-700">Selesai</label>
                  <input type="time" name="jam_fokus_selesai" value={formData.jam_fokus_selesai} onChange={handleChange} className="input-form bg-white" required />
                </div>
              </div>
            </div>

            <div className="p-5 bg-black/5 rounded-xl border border-black/5">
              <h3 className="text-lg mb-4 text-energy-low font-heading">Waktu Istirahat (Tidur)</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1.5 text-sm text-slate-700">Jam Tidur</label>
                  <input type="time" name="jam_tidur" value={formData.jam_tidur} onChange={handleChange} className="input-form bg-white" required />
                </div>
                <div className="flex-1">
                  <label className="block mb-1.5 text-sm text-slate-700">Jam Bangun</label>
                  <input type="time" name="jam_bangun" value={formData.jam_bangun} onChange={handleChange} className="input-form bg-white" required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary flex items-center justify-center gap-2 py-3.5" disabled={saving}>
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              <span>{saving ? "Menyimpan..." : "Simpan Profil Sirkadian"}</span>
            </button>
          </form>
        </div>

        {/* Helper Card */}
        <div className="glass-card flex-1 min-w-[250px] bg-sage-500/5 border-sage-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Info size={24} className="text-sage-500" />
            <h3 className="m-0 text-lg font-heading text-slate-800">Panduan Pengisian</h3>
          </div>
          <ul className="pl-5 text-slate-500 text-[0.95rem] flex flex-col gap-3 marker:text-sage-500">
            <li><strong className="text-slate-800">Peak Focus:</strong> Rentang waktu di mana Anda bisa mengerjakan tugas rumit berjam-jam tanpa mudah terdistraksi (Deep Work).</li>
            <li><strong className="text-slate-800">Jam Tidur/Bangun:</strong> Informasi ini digunakan sistem agar tidak merekomendasikan tugas pada jam tersebut.</li>
            <li>Sistem akan menempatkan tugas <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-sage-500/10 text-sage-500 border border-sage-500/30 ml-1">High Load</span> secara otomatis pada Peak Focus Anda.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
