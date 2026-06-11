import { useState, useEffect } from "react";
import { BrainCircuit, Loader2, CheckCircle2, Flame, Target, Info, Clock, CalendarRange } from "lucide-react";
import api from "../../services/api";

export default function RekomendasiPage() {
  const [rekomendasi, setRekomendasi] = useState([]);
  const [profilContext, setProfilContext] = useState(null);
  const [dalamJamFokus, setDalamJamFokus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [kuliahAktif, setKuliahAktif] = useState(null);
  const [ringkasan, setRingkasan] = useState(null);
  const [viewMode, setViewMode] = useState("now"); // "now" or "full_schedule"
  const [kuliahHariIni, setKuliahHariIni] = useState([]);

  const fetchRekomendasi = async () => {
    setLoading(true);
    setStatusMsg({ text: "", type: "" });
    try {
      const response = await api.get('/rekomendasi');
      if (response.data.success) {
        setRekomendasi(response.data.data.rekomendasi || []);
        setProfilContext(response.data.data.profil_sirkadian);
        setDalamJamFokus(response.data.data.dalam_jam_fokus);
        setKuliahAktif(response.data.data.kuliah_aktif);
        setRingkasan(response.data.data.ringkasan_hari_ini);
        setKuliahHariIni(response.data.data.kuliah_hari_ini || []);
        
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

  const buildTimeline = () => {
    const items = [];
    
    const toMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return (h * 60) + m;
    };

    const compareTime = (a, b) => toMinutes(a.jam_mulai) - toMinutes(b.jam_mulai);

    const addMinutes = (timeStr, mins) => {
      const totalMins = toMinutes(timeStr) + mins;
      const newH = Math.floor(totalMins / 60) % 24;
      const newM = totalMins % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    const timeOverlaps = (start1, end1, start2, end2) => {
      return toMinutes(start1) < toMinutes(end2) && toMinutes(start2) < toMinutes(end1);
    };

    const isTimeBetween = (time, start, end) => {
      const t = toMinutes(time);
      const s = toMinutes(start);
      const e = toMinutes(end);
      return s <= e ? (t >= s && t <= e) : (t >= s || t <= e);
    };

    // 1. Add lectures
    kuliahHariIni.forEach(k => {
      items.push({
        id: `kuliah-${k.id}`,
        type: 'kuliah',
        jam_mulai: k.jam_mulai,
        jam_selesai: k.jam_selesai,
        title: k.mata_kuliah,
        subtitle: k.ruangan,
      });
    });

    if (rekomendasi.length === 0) return items.sort(compareTime);

    const jamFokusMulai = profilContext?.jam_fokus_mulai || "08:00";
    const jamFokusSelesai = profilContext?.jam_fokus_selesai || "12:00";
    const jamTidur = profilContext?.jam_tidur || "22:00";
    const jamBangun = profilContext?.jam_bangun || "06:00";

    const isTimeInSleep = (time) => {
      const t = toMinutes(time);
      const s = toMinutes(jamTidur);
      const e = toMinutes(jamBangun);
      return s <= e ? (t >= s && t < e) : (t >= s || t < e);
    };

    const isInPeakFocus = (start, end) => {
      return toMinutes(start) >= toMinutes(jamFokusMulai) && toMinutes(end) <= toMinutes(jamFokusSelesai);
    };

    const sortedLectures = [...items].sort(compareTime);

    // Fungsi untuk mencari slot bebas mulai dari `startFrom`
    const findFreeSlot = (startFrom, durasi) => {
      let taskStart = startFrom;
      let taskEnd = addMinutes(taskStart, durasi);
      let adjusted = true;
      while (adjusted) {
        adjusted = false;
        // Cek bentrok jam tidur
        const overlapsSleep = isTimeInSleep(taskStart) ||
          (isTimeInSleep(taskEnd) && taskEnd !== jamTidur) ||
          (toMinutes(taskStart) < toMinutes(jamTidur) && toMinutes(taskEnd) > toMinutes(jamTidur));
        if (overlapsSleep) {
          taskStart = jamBangun;
          taskEnd = addMinutes(taskStart, durasi);
          adjusted = true;
        }
        // Cek bentrok jadwal kuliah
        for (const lecture of sortedLectures) {
          if (timeOverlaps(taskStart, taskEnd, lecture.jam_mulai, lecture.jam_selesai)) {
            taskStart = lecture.jam_selesai.substring(0, 5);
            taskEnd = addMinutes(taskStart, durasi);
            adjusted = true;
            break;
          }
        }
      }
      return { taskStart, taskEnd };
    };

    // ================================================================
    // ALGORITMA SCHEDULING CERDAS:
    // 1. Tugas BERAT (cognitive_load >= 4) dijadwal dalam Peak Focus
    // 2. Tugas RINGAN/SEDANG dijadwal di luar Peak Focus
    // ================================================================
    const tugasBerat = rekomendasi.filter(t => (t.cognitive_load || 1) >= 4);
    const tugasRingan = rekomendasi.filter(t => (t.cognitive_load || 1) < 4);

    // Pointer untuk slot Peak Focus (mulai dari jam_fokus_mulai)
    let peakPointer = jamFokusMulai;
    // Pointer untuk slot di luar Peak Focus (mulai dari jam_fokus_selesai)
    let offPeakPointer = jamFokusSelesai;

    // Jadwalkan tugas BERAT di dalam Peak Focus dulu
    tugasBerat.forEach(task => {
      const durasi = task.estimasi_durasi || 60;
      const { taskStart, taskEnd } = findFreeSlot(peakPointer, durasi);

      // Jika masih muat di Peak Focus, taruh di sana
      // Jika tidak muat, taruh di offPeak (overflow)
      let finalStart = taskStart;
      let finalEnd = taskEnd;
      if (!isInPeakFocus(taskStart, taskEnd)) {
        // Overflow: tidak muat di peak, taruh setelah peak
        const overflow = findFreeSlot(offPeakPointer, durasi);
        finalStart = overflow.taskStart;
        finalEnd = overflow.taskEnd;
        offPeakPointer = finalEnd;
      } else {
        peakPointer = taskEnd;
      }

      const tipeBlok = isInPeakFocus(finalStart, finalEnd) ? 'peak' : 'normal';
      items.push({
        id: `tugas-${task.id}`,
        type: 'tugas',
        jam_mulai: finalStart,
        jam_selesai: finalEnd,
        title: task.judul_tugas,
        tipe_blok: tipeBlok,
        cognitive_load: task.cognitive_load,
        alasan: task.alasan,
        skor_prioritas: task.skor_prioritas,
        rawId: task.id,
      });
    });

    // Jadwalkan tugas RINGAN di luar Peak Focus
    tugasRingan.forEach(task => {
      const durasi = task.estimasi_durasi || 60;
      const { taskStart, taskEnd } = findFreeSlot(offPeakPointer, durasi);
      offPeakPointer = taskEnd;

      const tipeBlok = isInPeakFocus(taskStart, taskEnd) ? 'peak' :
                       isTimeInSleep(taskStart) ? 'low' : 'normal';
      items.push({
        id: `tugas-${task.id}`,
        type: 'tugas',
        jam_mulai: taskStart,
        jam_selesai: taskEnd,
        title: task.judul_tugas,
        tipe_blok: tipeBlok,
        cognitive_load: task.cognitive_load,
        alasan: task.alasan,
        skor_prioritas: task.skor_prioritas,
        rawId: task.id,
      });
    });

    return items.sort(compareTime);
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
                {kuliahAktif ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                     Sedang Kuliah
                  </span>
                ) : dalamJamFokus ? (
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
                Jam Fokus Anda: <strong>{profilContext.jam_fokus_mulai?.substring(0, 5)} - {profilContext.jam_fokus_selesai?.substring(0, 5)}</strong> (Tipe: {
                  profilContext.tipe === 'pagi' ? 'Pagi (Early Bird)' : 
                  profilContext.tipe === 'siang' ? 'Siang (Day Owl)' : 
                  profilContext.tipe === 'malam' ? 'Malam (Night Owl)' : 
                  (profilContext.tipe_sirkadian || profilContext.tipe || '-')
                })
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Info size={16} /> Memuat profil sirkadian...
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setViewMode("now")}
            className={`py-3 px-5 text-sm inline-flex items-center justify-center gap-2 flex-1 sm:flex-none transition-all duration-200 rounded-xl font-medium cursor-pointer ${
              viewMode === "now" 
                ? "bg-sage-500 text-white shadow-md shadow-sage-500/20 border-sage-500" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Clock size={18} />
            <span>Tugas Sekarang</span>
          </button>
          
          <button 
            onClick={() => setViewMode("full_schedule")}
            className={`py-3 px-5 text-sm inline-flex items-center justify-center gap-2 flex-1 sm:flex-none transition-all duration-200 rounded-xl font-medium cursor-pointer ${
              viewMode === "full_schedule" 
                ? "bg-sage-500 text-white shadow-md shadow-sage-500/20 border-sage-500" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <CalendarRange size={18} />
            <span>Jadwal Pagi-Malam</span>
          </button>

          <button 
            onClick={fetchRekomendasi}
            className="p-3 text-sm inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all duration-200 cursor-pointer"
            title="Refresh Rekomendasi"
            disabled={loading}
          >
            <Loader2 size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {kuliahAktif && (
        <div className="p-4 rounded-xl mb-6 border bg-amber-50 border-amber-200 text-amber-800 text-sm font-medium flex items-center gap-3">
          <Info size={20} className="shrink-0" />
          <div>
            <strong>Sedang Berlangsung Kuliah:</strong> Anda saat ini terdaftar sedang dalam kelas <strong>{kuliahAktif.mata_kuliah}</strong> ({kuliahAktif.jam_mulai} - {kuliahAktif.jam_selesai}) di ruangan {kuliahAktif.ruangan || '-'}. Skor rekomendasi tugas berat otomatis diturunkan untuk membantu Anda fokus pada perkuliahan.
          </div>
        </div>
      )}

      {statusMsg.text && (
        <div className={`p-4 rounded-xl mb-6 border text-sm font-medium
          ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-energy-peak' : 
            statusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-energy-low' :
            'bg-slate-100 border-slate-200 text-slate-700'}
        `}>
          {statusMsg.text}
        </div>
      )}

      {/* Ringkasan Pembagian Waktu Hari Ini */}
      {ringkasan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card bg-slate-50 border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Total Jam Kuliah</span>
            <h3 className="m-0 text-xl font-semibold text-slate-800">
              {Math.floor(ringkasan.total_kuliah_menit / 60)}j {ringkasan.total_kuliah_menit % 60}m
            </h3>
            <span className="text-xs text-slate-400 mt-1 block">Dari {ringkasan.jumlah_kuliah} mata kuliah hari ini</span>
          </div>
          
          <div className="glass-card bg-green-500/5 border-green-500/20">
            <span className="text-xs font-bold uppercase tracking-wider text-energy-peak block mb-1">Fokus Efektif Tersisa</span>
            <h3 className="m-0 text-xl font-semibold text-energy-peak">
              {Math.floor(ringkasan.fokus_efektif_menit / 60)}j {ringkasan.fokus_efektif_menit % 60}m
            </h3>
            <span className="text-xs text-slate-500 mt-1 block">Siap digunakan untuk tugas berat (Deep Work)</span>
          </div>

          <div className={`glass-card ${ringkasan.bentrok_menit > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Fokus Terpotong Kuliah</span>
            <h3 className={`m-0 text-xl font-semibold ${ringkasan.bentrok_menit > 0 ? 'text-energy-low' : 'text-slate-800'}`}>
              {Math.floor(ringkasan.bentrok_menit / 60)}j {ringkasan.bentrok_menit % 60}m
            </h3>
            <span className="text-xs text-slate-400 mt-1 block">
              {ringkasan.bentrok_menit > 0 ? 'Waktu fokus Anda bertubrukan dengan jam kelas' : 'Tidak ada bentrok jadwal kuliah'}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center p-10"><Loader2 size={32} className="animate-spin opacity-50 mx-auto" /></div>
      ) : (
        <div>
          {viewMode === "now" ? (
            /* ==================================================== */
            /* VIEW MODE: TUGAS SEKARANG                            */
            /* ==================================================== */
            <div className="flex flex-col gap-6">
              {kuliahAktif ? (
                <div className="glass-card text-center p-8 border-amber-200 bg-amber-500/5">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info size={32} />
                  </div>
                  <h3 className="text-xl font-heading text-amber-800 mb-2">Saat ini sedang Jam Kuliah</h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-0">
                    Anda sedang berada dalam kelas <strong>{kuliahAktif.mata_kuliah}</strong> ({kuliahAktif.jam_mulai} - {kuliahAktif.jam_selesai}). Harap fokus mengikuti perkuliahan terlebih dahulu!
                  </p>
                </div>
              ) : (
                (() => {
                  // Cek apakah jam tidur
                  const now = new Date();
                  const nowMin = now.getHours() * 60 + now.getMinutes();
                  
                  const toMinutes = (timeStr) => {
                    if (!timeStr) return 0;
                    const [h, m] = timeStr.split(':').map(Number);
                    return (h * 60) + m;
                  };
                  
                  const sMin = toMinutes(profilContext?.jam_tidur || "22:00");
                  const wMin = toMinutes(profilContext?.jam_bangun || "06:00");
                  
                  const isSleepTime = sMin <= wMin 
                    ? (nowMin >= sMin && nowMin <= wMin) 
                    : (nowMin >= sMin || nowMin <= wMin);
                    
                  if (isSleepTime) {
                    return (
                      <div className="glass-card text-center p-8 border-blue-200 bg-blue-500/5">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-heading text-blue-800 mb-2">Waktunya Istirahat (Tidur)</h3>
                        <p className="text-slate-600 max-w-md mx-auto mb-0">
                          Berdasarkan jam tidur Anda ({profilContext?.jam_tidur || "22:00"}), Anda direkomendasikan untuk beristirahat saat ini untuk memulihkan energi kognitif Anda.
                        </p>
                      </div>
                    );
                  }

                  // Cari tugas yang cocok dengan kondisi sirkadian saat ini
                  // Jika jam fokus: cari yang cognitive_load >= 3. Jika tidak: cari cognitive_load <= 2.
                  let filtered = rekomendasi.filter(t => 
                    dalamJamFokus ? t.cognitive_load >= 3 : t.cognitive_load <= 2
                  );
                  
                  // Fallback ke semua tugas jika filter kosong
                  if (filtered.length === 0) {
                    filtered = rekomendasi;
                  }

                  if (filtered.length === 0) {
                    return <div className="text-center py-10 text-slate-400">Tidak ada tugas pending saat ini.</div>;
                  }

                  const topTask = filtered[0];

                  return (
                    <div className="flex flex-col gap-6">
                      <div className="glass-card border-l-4 border-l-energy-peak bg-gradient-to-r from-green-500/5 to-transparent p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2.5 py-1 rounded bg-green-500/10 text-energy-peak border border-green-500/30 text-xs font-bold uppercase tracking-wider">
                            Rekomendasi Utama Sekarang
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-heading text-slate-800 mb-3">{topTask.judul_tugas}</h2>
                        {topTask.deadline && (
                          <p className="text-sm text-slate-500 mb-4">
                            Deadline: {new Date(topTask.deadline).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 items-center text-xs font-bold tracking-wider uppercase mb-5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            <Target size={14} /> SKOR: {topTask.skor_prioritas?.toFixed(2)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded ${topTask.cognitive_load >= 4 ? 'bg-sage-500/10 text-sage-500 border border-sage-500/30' : 'bg-blue-500/10 text-energy-normal border border-blue-500/30'}`}>
                            Beban Kognitif: {topTask.cognitive_load}/5
                          </span>
                        </div>
                        <div className="p-4 bg-white/80 rounded-xl border border-slate-100 mb-6">
                          <h4 className="m-0 mb-1 text-sm font-bold text-slate-700">Mengapa tugas ini?</h4>
                          <p className="text-sm text-slate-600 m-0">{topTask.alasan}</p>
                        </div>
                        <button 
                          onClick={() => updateStatus(topTask.id, 'completed')}
                          className="btn-primary py-3 px-6 flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                          <CheckCircle2 size={18} />
                          <span>Tandai Selesai & Lanjut</span>
                        </button>
                      </div>

                      {filtered.length > 1 && (
                        <div>
                          <h4 className="text-lg font-heading text-slate-700 mb-4">Alternatif Tugas Lainnya</h4>
                          <div className="flex flex-col gap-4">
                            {filtered.slice(1, 4).map((alt) => (
                              <div key={alt.id} className="glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-1">
                                  <h4 className="m-0 text-lg font-medium text-slate-800 mb-1">{alt.judul_tugas}</h4>
                                  <p className="text-xs text-slate-500 mb-2">Skor Prioritas: {alt.skor_prioritas?.toFixed(2)} | Beban: {alt.cognitive_load}/5</p>
                                  <p className="text-sm text-slate-600 m-0">{alt.alasan}</p>
                                </div>
                                <button 
                                  onClick={() => updateStatus(alt.id, 'completed')}
                                  className="btn-secondary py-2 px-4 flex items-center gap-2 border-energy-normal text-energy-normal hover:bg-blue-50 whitespace-nowrap"
                                >
                                  <CheckCircle2 size={16} /> Selesai
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          ) : (
            /* ==================================================== */
            /* VIEW MODE: JADWAL PAGI-MALAM                         */
            /* ==================================================== */
            (() => {
              const timelineItems = buildTimeline();
              if (timelineItems.length === 0) {
                return <div className="text-center py-10 text-slate-400">Tidak ada jadwal kuliah maupun tugas hari ini.</div>;
              }

              return (
                <div className="relative border-l-2 border-slate-200 ml-4 pl-6 flex flex-col gap-6">
                  {timelineItems.map((item, index) => (
                    <div key={item.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border-2 border-white
                        ${item.type === 'kuliah' ? 'bg-blue-500' : ''}
                        ${item.type === 'tugas' && item.tipe_blok === 'peak' ? 'bg-energy-peak' : ''}
                        ${item.type === 'tugas' && item.tipe_blok === 'normal' ? 'bg-energy-normal' : ''}
                        ${item.type === 'tugas' && item.tipe_blok === 'low' ? 'bg-energy-low' : ''}
                      `} />
                      
                      <div className={`glass-card p-5 border-l-4 
                        ${item.type === 'kuliah' ? 'border-l-blue-500 bg-blue-500/5' : ''}
                        ${item.type === 'tugas' && item.tipe_blok === 'peak' ? 'border-l-energy-peak bg-gradient-to-r from-green-500/5 to-transparent' : ''}
                        ${item.type === 'tugas' && item.tipe_blok === 'normal' ? 'border-l-energy-normal' : ''}
                        ${item.type === 'tugas' && item.tipe_blok === 'low' ? 'border-l-energy-low' : ''}
                      `}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500">
                              <Clock size={12} />
                              <span>{item.jam_mulai} - {item.jam_selesai}</span>
                              <span className="mx-1">-</span>
                              {item.type === 'kuliah' ? (
                                <span className="text-blue-600 uppercase tracking-wider">Mata Kuliah</span>
                              ) : (
                                <span className="uppercase tracking-wider">
                                  {item.tipe_blok} Focus
                                </span>
                              )}
                            </div>
                            
                            <h3 className="m-0 text-xl font-medium text-slate-800 mb-1">{item.title}</h3>
                            {item.subtitle && <p className="text-sm text-slate-500 m-0">Ruangan: {item.subtitle}</p>}
                            
                            {item.type === 'tugas' && (
                              <div className="mt-3">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Analisis Sirkadian:</div>
                                <p className="text-sm text-slate-600 m-0 bg-white/60 p-3 rounded-lg border border-slate-100">
                                  <strong>Skor: {item.skor_prioritas?.toFixed(2)}</strong> - {item.alasan}
                                </p>
                              </div>
                            )}
                          </div>

                          {item.type === 'tugas' && (
                            <div className="shrink-0">
                              <button 
                                onClick={() => updateStatus(item.rawId, 'completed')}
                                className="btn-secondary py-2 px-4 flex items-center gap-2 border-energy-normal text-energy-normal hover:bg-blue-50 whitespace-nowrap"
                              >
                                <CheckCircle2 size={16} /> Tandai Selesai
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}
