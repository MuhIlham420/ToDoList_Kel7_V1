import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";
import { CheckSquare, AlertTriangle, BatteryCharging, Calendar, BookOpen } from "lucide-react";
import api from "../../services/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTodayJakarta = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  };

  const getDayName = (dateStr) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const todayStr = getTodayJakarta();
        const dayName = getDayName(todayStr);
        const todayDate = new Date(todayStr);
        todayDate.setHours(0,0,0,0);

        // Fetch all data from API in parallel
        const [tugasRes, profilRes, rekomendasiRes, jadwalRes] = await Promise.all([
          api.get('/tugas'),
          api.get('/profil-sirkadian'),
          api.get('/rekomendasi').catch(() => ({ data: { success: false, data: { rekomendasi: [] } } })),
          api.get('/jadwal-kuliah'),
        ]);

        // --- Process tugas ---
        const allTasks = tugasRes.data.success ? tugasRes.data.data.tugas : [];
        const pendingTasks = allTasks.filter(t => t.status === 'pending');

        let overdueCount = 0;
        const upcoming = [];

        pendingTasks.forEach(t => {
          const dl = new Date(t.deadline);
          dl.setHours(0,0,0,0);
          if (dl.getTime() < todayDate.getTime()) {
            overdueCount++;
          } else {
            upcoming.push(t);
          }
        });

        upcoming.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

        // --- Process profil sirkadian ---
        const prof = profilRes.data.success && profilRes.data.data.profil_sirkadian
          ? profilRes.data.data.profil_sirkadian
          : { jam_fokus_mulai: "08:00", jam_fokus_selesai: "12:00" };

        // --- Process rekomendasi ---
        const rekomendasi = rekomendasiRes.data.success
          ? (rekomendasiRes.data.data.rekomendasi || [])
          : [];

        // --- Process jadwal kuliah (filter hari ini) ---
        const allJadwal = jadwalRes.data.success ? jadwalRes.data.data.jadwal_kuliah : [];
        const kuliahToday = allJadwal.filter(j => j.hari === dayName);

        setStats({
          statistik: { total_tugas: pendingTasks.length, overdue: overdueCount },
          jadwal_hari_ini: rekomendasi,
          kuliah_hari_ini: kuliahToday,
          profil_sirkadian: prof,
          upcoming_deadlines: upcoming.slice(0, 5)
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[80vh]">Loading...</div>;
  }

  const { statistik, jadwal_hari_ini, kuliah_hari_ini, profil_sirkadian, upcoming_deadlines } = stats || {};

  const buildTimeline = () => {
    const items = [];
    if (kuliah_hari_ini && kuliah_hari_ini.length > 0) {
      kuliah_hari_ini.forEach(kuliah => {
        items.push({
          id: `kuliah-${kuliah.id}`,
          type: 'kuliah',
          jam_mulai: kuliah.jam_mulai,
          jam_selesai: kuliah.jam_selesai,
          title: kuliah.mata_kuliah,
          subtitle: kuliah.ruangan,
          tipe_blok: 'kuliah'
        });
      });
    }

    if (jadwal_hari_ini && jadwal_hari_ini.length > 0) {
      jadwal_hari_ini.forEach(rec => {
        items.push({
          id: `rec-${rec.id}`,
          type: 'tugas',
          jam_mulai: rec.jam_mulai,
          jam_selesai: rec.jam_selesai,
          title: rec.tugas?.judul_tugas || rec.judul_tugas,
          tipe_blok: rec.tipe_blok,
          cognitive_load: rec.tugas?.cognitive_load || rec.cognitive_load,
          status: rec.status
        });
      });
    }

    items.sort((a, b) => {
      const parseTime = (time) => {
        if (!time) return 0;
        const [h, m] = time.split(':').map(Number);
        return (h * 60) + m;
      };
      return parseTime(a.jam_mulai) - parseTime(b.jam_mulai);
    });

    return items;
  };

  const timeline = buildTimeline();

  const peakDisplay = profil_sirkadian?.jam_fokus_mulai && profil_sirkadian?.jam_fokus_selesai 
    ? `${profil_sirkadian.jam_fokus_mulai.substring(0, 5)} – ${profil_sirkadian.jam_fokus_selesai.substring(0, 5)}`
    : "Belum Diatur";

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] w-full">
      <header className="mb-8">
        <h1 className="text-3xl mb-2 font-heading">Halo, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-slate-500">Berikut adalah ringkasan aktivitas dan metrik energi Anda hari ini.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <CheckSquare size={20} className="text-energy-normal" />
            </div>
            <span className="font-medium text-slate-500">Total Tugas</span>
          </div>
          <h2 className="text-4xl m-0 font-heading">{statistik?.total_tugas || 0}</h2>
        </div>

        <div className="glass-card flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-red-500/10">
              <AlertTriangle size={20} className="text-energy-low" />
            </div>
            <span className="font-medium text-slate-500">Tugas Overdue</span>
          </div>
          <h2 className="text-4xl m-0 font-heading">{statistik?.overdue || 0}</h2>
        </div>

        <div className="glass-card flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <BatteryCharging size={20} className="text-energy-peak" />
            </div>
            <span className="font-medium text-slate-500">Sirkadian Peak</span>
          </div>
          <h2 className="text-2xl mt-4 mb-0 font-heading">{peakDisplay}</h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Timeline Section */}
        <div className="glass-card flex-[2] min-w-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl m-0 font-heading">Jadwal Hari Ini</h3>
            <Link to="/rekomendasi" className="text-sm text-sage-500 font-medium hover:text-sage-600 no-underline">Lihat Detail</Link>
          </div>

          {timeline.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Calendar size={40} className="mx-auto mb-4 opacity-50" />
              <p>Tidak ada jadwal hari ini.</p>
              <Link to="/rekomendasi" className="btn-primary inline-block mt-4 py-2 px-4">Buat Jadwal di Rekomendasi</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {timeline.map((item) => (
                <div key={item.id} className={`
                  flex gap-4 p-4 rounded-xl border-l-[3px]
                  ${item.type === 'kuliah' ? 'bg-blue-500/5 border-energy-normal' : 'bg-black/5'}
                  ${item.type !== 'kuliah' && item.tipe_blok === 'peak' ? 'border-energy-peak' : ''}
                  ${item.type !== 'kuliah' && item.tipe_blok === 'normal' ? 'border-energy-normal' : ''}
                  ${item.type !== 'kuliah' && item.tipe_blok === 'low' ? 'border-energy-low' : ''}
                  ${item.status === 'completed' ? 'opacity-50' : 'opacity-100'}
                `}>
                  <div className="w-20 text-slate-500 font-medium shrink-0">
                    {item.jam_mulai.substring(0, 5)}
                    <div className="text-xs text-slate-400">{item.jam_selesai.substring(0, 5)}</div>
                  </div>
                  <div className="flex-1">
                    <h4 className={`m-0 mb-1 text-base ${item.status === 'completed' ? 'line-through' : ''}`}>{item.title}</h4>
                    <div className="flex gap-2 items-center flex-wrap">
                      {item.type === 'kuliah' ? (
                        <Fragment>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide bg-blue-500/10 text-energy-normal">
                            <BookOpen size={12} /> KULIAH
                          </span>
                          {item.subtitle && <span className="text-xs text-slate-500">{item.subtitle}</span>}
                        </Fragment>
                      ) : (
                        <Fragment>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide
                            ${item.tipe_blok === 'peak' ? 'bg-green-500/10 text-energy-peak' : ''}
                            ${item.tipe_blok === 'normal' ? 'bg-blue-500/10 text-energy-normal' : ''}
                            ${item.tipe_blok === 'low' ? 'bg-red-500/10 text-energy-low' : ''}
                          `}>
                            {item.tipe_blok?.toUpperCase()} FOCUS
                          </span>
                          {item.cognitive_load >= 4 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide bg-sage-500/10 text-sage-500 border border-sage-500/30">
                              DEEP WORK
                            </span>
                          )}
                        </Fragment>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Mini Section */}
        <div className="glass-card flex-1 min-w-[300px]">
          <h3 className="text-xl mb-6 font-heading">Deadline Mendekat</h3>
          {!upcoming_deadlines || upcoming_deadlines.length === 0 ? (
            <p className="text-slate-400 text-center py-5">Tidak ada deadline mendatang.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {upcoming_deadlines.map(tugas => {
                return (
                  <div key={tugas.id} className="flex flex-col gap-1 pb-3 border-b border-slate-100 last:border-0">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{tugas.judul_tugas}</span>
                      <span className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar size={12} /> {new Date(tugas.deadline).toLocaleDateString('id-ID', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {tugas.cognitive_load >= 4 && (
                      <span className="text-[10px] font-bold px-2 py-1 w-max mt-1 bg-sage-500/10 text-sage-500 border border-sage-500/20 rounded">
                        DEEP WORK
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
