import { Link } from "react-router-dom";
import { BrainCircuit, Clock, Zap, Target, ArrowRight, LayoutDashboard, CalendarDays, Activity, CheckCircle2, PlayCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden selection:bg-sage-500/30">
      {/* Navbar - Sticky and Glassmorphic */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-400 flex items-center justify-center text-white shadow-lg shadow-sage-500/20">
              <BrainCircuit size={24} />
            </div>
            <h1 className="text-2xl m-0 font-heading font-bold text-slate-800">
              DeepWork <span className="text-sage-500">DSS</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-sage-500 transition-colors">Fitur Utama</a>
            <a href="#cara-kerja" className="hover:text-sage-500 transition-colors">Cara Kerja</a>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-slate-600 font-medium hover:text-sage-500 transition-colors">Masuk</Link>
            <Link to="/register" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 group">
              Mulai Gratis <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-20 relative">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" style={{ animationDelay: "2s" }}></div>
        <div className="absolute -bottom-8 left-40 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" style={{ animationDelay: "4s" }}></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Hero Content */}
          <div className="text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-500/10 border border-sage-500/20 text-sage-600 text-xs font-semibold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse"></span>
              Sistem Pendukung Keputusan
            </div>
            
            <h2 className="text-5xl lg:text-7xl leading-[1.1] mb-6 font-heading font-extrabold text-slate-900 tracking-tight">
              Sinkronkan Tugas dengan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sage-500 via-emerald-500 to-teal-500">
                Ritme Biologis Alami
              </span>
            </h2>
            
            <p className="text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              Tingkatkan produktivitas tanpa kelelahan berlebih. DeepWork Protocol secara cerdas menyusun jadwal Anda berdasarkan kapan tingkat fokus kognitif Anda berada di puncaknya.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 group shadow-xl shadow-sage-500/20">
                Jadwalkan Sekarang <Zap size={20} className="group-hover:scale-110 transition-transform" />
              </Link>
              <a href="#fitur" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
                Pelajari Lebih Lanjut
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-sage-500"/> Algoritma Cerdas</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-sage-500"/> Personalisasi 100%</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-sage-500"/> Bebas Burnout</div>
            </div>
          </div>

          {/* Hero Abstract Mockup/Visual */}
          <div className="relative lg:h-[600px] flex items-center justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative w-full max-w-md animate-float">
              {/* Decorative behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-tr from-sage-500/20 to-transparent rounded-3xl blur-2xl transform -rotate-6 scale-105"></div>
              
              {/* Mockup Container */}
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 overflow-hidden">
                {/* Header Mockup */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="h-4 w-24 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-3 w-32 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-sage-500/10 flex items-center justify-center">
                    <Activity size={20} className="text-sage-500" />
                  </div>
                </div>

                {/* Body Mockup */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-sage-500 to-emerald-400 p-5 rounded-2xl text-white shadow-lg shadow-sage-500/30">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">Peak Energy</span>
                      <Clock size={16} />
                    </div>
                    <div className="h-6 w-3/4 bg-white/30 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-white/20 rounded"></div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-2 h-12 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 w-2/3 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-1/3 bg-slate-100 rounded"></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-2 h-12 bg-orange-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 w-1/2 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-1/4 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements on Mockup */}
                <div className="absolute -right-6 top-1/2 bg-white p-3 rounded-xl shadow-xl border border-slate-100 animate-float" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-energy-peak/20 flex items-center justify-center">
                      <Target size={16} className="text-energy-peak" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">Fokus Optimal</div>
                      <div className="text-[10px] text-slate-400">08:00 - 10:00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Bento Grid */}
      <section id="fitur" className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-heading font-bold text-slate-900 mb-4">Dirancang untuk Performa Puncak</h2>
            <p className="text-slate-500 text-lg">Tidak ada lagi kelelahan yang tidak perlu. Sistem kami menganalisis dan merekomendasikan jadwal terbaik untuk otak Anda.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card md:col-span-2 group bg-gradient-to-br from-slate-50 to-white hover:from-sage-50 hover:to-white">
              <div className="flex flex-col md:flex-row gap-8 h-full items-center">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-sage-500/10 flex justify-center items-center mb-6 group-hover:scale-110 transition-transform">
                    <Activity size={28} className="text-sage-500" />
                  </div>
                  <h3 className="text-2xl mb-3 font-heading font-bold text-slate-800">Analisis Energi Sirkadian</h3>
                  <p className="text-slate-600 leading-relaxed">Identifikasi jam biologis di mana Anda merasa paling kreatif dan siap untuk tugas kognitif tinggi. Kami menyesuaikan jadwal Anda bukan hanya dengan jam, tapi dengan ritme alami tubuh Anda.</p>
                </div>
                <div className="flex-1 bg-slate-100/50 rounded-2xl p-6 w-full h-full border border-slate-200 flex flex-col justify-center gap-3">
                  <div className="h-8 bg-sage-500/20 rounded-md w-full relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-sage-500 w-3/4"></div>
                  </div>
                  <div className="h-8 bg-blue-500/20 rounded-md w-full relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-blue-500 w-1/2"></div>
                  </div>
                  <div className="h-8 bg-red-500/20 rounded-md w-full relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-red-500 w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card group bg-gradient-to-br from-slate-50 to-white hover:from-blue-50 hover:to-white">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex justify-center items-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={28} className="text-blue-500" />
              </div>
              <h3 className="text-xl mb-3 font-heading font-bold text-slate-800">Time Blocking Dinamis</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Sistem secara otomatis membagi hari Anda ke dalam blok waktu efisien, menyesuaikan jadwal kelas yang tetap secara dinamis.</p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card group bg-gradient-to-br from-slate-50 to-white hover:from-orange-50 hover:to-white">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex justify-center items-center mb-6 group-hover:scale-110 transition-transform">
                <Target size={28} className="text-orange-500" />
              </div>
              <h3 className="text-xl mb-3 font-heading font-bold text-slate-800">Prioritas Cerdas</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Menyatukan tingkat urgensi deadline dan kompleksitas kognitif pekerjaan menjadi sistem prioritas tunggal yang dapat ditindaklanjuti.</p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card md:col-span-2 group bg-gradient-to-br from-slate-50 to-white hover:from-emerald-50 hover:to-white">
              <div className="flex flex-col md:flex-row-reverse gap-8 h-full items-center">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex justify-center items-center mb-6 group-hover:scale-110 transition-transform">
                    <CalendarDays size={28} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl mb-3 font-heading font-bold text-slate-800">Integrasi Jadwal Kelas</h3>
                  <p className="text-slate-600 leading-relaxed">Jangan biarkan tugas bentrok dengan kelas. Masukkan jadwal kuliah Anda, dan sistem akan mencari celah waktu ("Time Windows") yang aman dan produktif untuk mengerjakan tugas.</p>
                </div>
                <div className="flex-1 bg-slate-100/50 rounded-2xl p-6 w-full h-full border border-slate-200 grid grid-cols-2 gap-2">
                  <div className="h-12 bg-white rounded border border-slate-200 shadow-sm"></div>
                  <div className="h-12 bg-emerald-500/20 rounded border border-emerald-200"></div>
                  <div className="h-12 bg-white rounded border border-slate-200 shadow-sm"></div>
                  <div className="h-12 bg-white rounded border border-slate-200 shadow-sm"></div>
                  <div className="h-12 bg-emerald-500/20 rounded border border-emerald-200"></div>
                  <div className="h-12 bg-white rounded border border-slate-200 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-24 bg-slate-50 relative z-20 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-heading font-bold text-slate-900 mb-4">Bagaimana Cara Kerjanya?</h2>
            <p className="text-slate-500 text-lg">Hanya dalam tiga langkah sederhana, ubah cara Anda mengelola waktu dan energi selamanya.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
            
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full bg-sage-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-sage-500/30 group-hover:scale-110 transition-transform">1</div>
              <h3 className="text-xl font-heading font-bold text-slate-800 mb-3">Tentukan Profil Sirkadian</h3>
              <p className="text-slate-600">Sistem akan menganalisis preferensi tidur dan bangun Anda untuk memetakan jendela energi puncak harian Anda.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">2</div>
              <h3 className="text-xl font-heading font-bold text-slate-800 mb-3">Input Jadwal & Tugas</h3>
              <p className="text-slate-600">Masukkan jadwal kuliah tetap dan daftar tugas dengan tingkat urgensi dan beban kognitifnya.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">3</div>
              <h3 className="text-xl font-heading font-bold text-slate-800 mb-3">Dapatkan Rekomendasi</h3>
              <p className="text-slate-600">Algoritma kami akan mencocokkan tugas terberat Anda dengan waktu di mana Anda memiliki energi tertinggi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sage-500/20 rounded-full mix-blend-screen filter blur-[100px] transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
            Siap Mengambil Kendali atas Waktu Anda?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Bergabunglah dan alami perpaduan sempurna antara manajemen tugas dan manajemen energi. Gratis untuk mahasiswa.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-sage-500 text-white hover:bg-sage-400 py-4 px-8 rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_40px_rgba(107,155,118,0.4)]">
              Buat Akun Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sage-500 flex items-center justify-center text-white">
              <BrainCircuit size={18} />
            </div>
            <span className="font-heading font-bold text-slate-800 text-lg">DeepWork DSS</span>
          </div>
          
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} DeepWork Protocol. All rights reserved.
          </div>
          
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-sage-500 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-sage-500 transition-colors">Syarat Ketentuan</a>
            <a href="#" className="hover:text-sage-500 transition-colors">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
