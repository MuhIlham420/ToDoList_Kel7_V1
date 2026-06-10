import { useState, useEffect } from "react";
import { BrainCircuit, Loader2, CheckCircle2, Flame, Target, Info } from "lucide-react";
import api from "../../services/api";

export default function RekomendasiPage() {
  const [rekomendasi, setRekomendasi] = useState([]);
  const [profilContext, setProfilContext] = useState(null);
  const [dalamJamFokus, setDalamJamFokus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  const fetchRekomendasi = async () => {
    setLoading(true);
    setStatusMsg({ text: "", type: "" });
    try {
      const response = await api.get('/rekomendasi');
      if (response.data.success) {
        setRekomendasi(response.data.data.rekomendasi || []);
        setProfilContext(response.data.data.profil_sirkadian);
        setDalamJamFokus(response.data.data.dalam_jam_fokus);
        
        if (response.data.data.rekomendasi.length === 0) {
          setStatusMsg({ text: "Tidak ada tugas pending yang perlu direkomendasikan saat ini.", type: "info" });
        } else {
          setStatusMsg({ text: "Rekomendasi berhasil dimuat berdasarkan profil sirkadian Anda.", type: "success" });
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: err.response?.data?.message || "Gagal memuat rekomendasi.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekomendasi();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      if (status === 'completed') {
        await api.patch(`/tugas/${id}/complete`);
        fetchRekomendasi(); // Refresh setelah update
      }
    } catch (err) {
      alert("Gagal update status tugas");
    }
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] w-full">
      <header className="mb-8">
        <h1 className="text-3xl mb-2 flex items-center gap-3 font-heading">
          <BrainCircuit className="text-sage-500" /> Rekomendasi Cerdas
        </h1>
        <p className="text-slate-500 m-0">Sistem memprioritaskan tugas berdasarkan urgensi dan ritme biologis sirkadian Anda.</p>
      </header>

      {/* Control Bar */}
      <div className="glass-card mb-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between p-6">
        <div className="flex-1 w-full">
          {profilContext ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">Status Sirkadian Saat Ini:</span>
                {dalamJamFokus ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-energy-peak border border-green-500/30 text-xs font-bold uppercase tracking-wider">
                    <Flame size={14} /> Peak Focus
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-wider">
                    Di Luar Jam Fokus
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500">
                Jam Fokus Anda: <strong>{profilContext.jam_fokus_mulai?.substring(0, 5)} - {profilContext.jam_fokus_selesai?.substring(0, 5)}</strong> (Tipe: {profilContext.tipe_sirkadian})
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Info size={16} /> Memuat profil sirkadian...
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchRekomendasi}
            className="btn-primary py-3 px-5 text-sm inline-flex items-center justify-center gap-2 flex-1 sm:flex-none"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
            <span>Refresh Rekomendasi</span>
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl mb-6 border text-sm font-medium
          ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-energy-peak' : 
            statusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-energy-low' :
            'bg-slate-100 border-slate-200 text-slate-700'}
        `}>
          {statusMsg.text}
        </div>
      )}

      {loading ? (
        <div className="text-center p-10"><Loader2 size={32} className="animate-spin opacity-50 mx-auto" /></div>
      ) : rekomendasi.length > 0 && (
        <div className="relative">
          <div className="flex flex-col gap-5 relative z-10">
            {rekomendasi.map((rec, index) => (
              <div key={rec.id} className="flex flex-col md:flex-row gap-4 md:gap-6">
                
                {/* Ranking */}
                <div className="hidden md:flex flex-col items-center pt-4 w-12">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-energy-peak text-white shadow-md shadow-green-500/30' : 
                      index === 1 ? 'bg-sage-500 text-white' : 
                      index === 2 ? 'bg-blue-500 text-white' : 
                      'bg-slate-200 text-slate-600'}
                  `}>
                    {index + 1}
                  </div>
                </div>

                {/* Event Card */}
                <div className={`glass-card flex-1 p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4
                  ${index === 0 ? 'border-l-energy-peak bg-gradient-to-r from-green-50/50 to-transparent' :
                    index === 1 ? 'border-l-sage-500' : 'border-l-slate-300'}
                `}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="md:hidden w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-slate-200 text-slate-600">
                        {index + 1}
                      </div>
                      <h3 className="m-0 text-xl font-medium text-slate-800">
                        {rec.judul_tugas}
                      </h3>
                    </div>
                    
                    {rec.deadline && (
                      <div className="text-xs text-slate-500 mb-3 font-medium">
                        Deadline: {new Date(rec.deadline).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 items-center text-[10px] font-bold tracking-wider uppercase mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        <Target size={12} /> SKOR: {rec.skor_prioritas?.toFixed(2)}
                      </span>
                      {rec.cognitive_load >= 4 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-sage-500/10 text-sage-500 border border-sage-500/30">
                          DEEP WORK
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 m-0 bg-white/60 p-3 rounded-lg border border-slate-100">
                      <strong>Alasan:</strong> {rec.alasan}
                    </p>
                  </div>

                  <div className="sm:pl-4">
                    <button 
                      onClick={() => updateStatus(rec.id, 'completed')}
                      className="btn-secondary py-2 px-4 flex items-center gap-2 border-energy-normal text-energy-normal hover:bg-blue-50 whitespace-nowrap"
                    >
                      <CheckCircle2 size={16} /> Tandai Selesai
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
