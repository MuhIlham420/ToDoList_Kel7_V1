import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { BrainCircuit, Loader2, ArrowLeft } from "lucide-react";
import api from "../services/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    fakultas: "",
    jurusan: "",
    no_hp: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi password tidak cocok!");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        login(token, user);
      } else {
        throw new Error(response.data.message || "Gagal mendaftar.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        // Gabungkan semua error validasi jadi satu string
        const errorMessages = Object.values(err.response.data.errors).flat().join('\n');
        setError(errorMessages);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Gagal mendaftar. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob pointer-events-none" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none"></div>

      <div className="glass-card animate-[fadeIn_0.5s_ease_forwards] w-full max-w-[480px] relative z-10 pt-16 h-full max-h-[95vh] overflow-y-auto">
        <div className="absolute top-6 left-6">
          <Link to="/" className="text-slate-500 flex items-center gap-1.5 text-sm no-underline transition-colors hover:text-slate-900">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>

        <div className="flex justify-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-400 flex items-center justify-center text-white shadow-sm">
            <BrainCircuit size={24} />
          </div>
        </div>
        
        <div className="text-center mb-7">
          <h1 className="text-2xl mb-2 font-heading">Buat Akun Baru</h1>
          <p className="text-slate-500 text-sm">Bergabung dengan DeepWork Protocol DSS</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-energy-low p-3 rounded-lg mb-5 text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1.5 text-sm text-slate-500 font-medium">Nama Lengkap</label>
            <input type="text" name="name" className="input-form" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="block mb-1.5 text-sm text-slate-500 font-medium">Email</label>
            <input type="email" name="email" className="input-form" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-sm text-slate-500 font-medium">Fakultas (Opsional)</label>
              <input type="text" name="fakultas" className="input-form" value={formData.fakultas} onChange={handleChange} />
            </div>
            <div>
              <label className="block mb-1.5 text-sm text-slate-500 font-medium">Jurusan (Opsional)</label>
              <input type="text" name="jurusan" className="input-form" value={formData.jurusan} onChange={handleChange} />
            </div>
          </div>
          
          <div>
            <label className="block mb-1.5 text-sm text-slate-500 font-medium">No HP (Opsional)</label>
            <input type="text" name="no_hp" className="input-form" value={formData.no_hp} onChange={handleChange} />
          </div>
          
          <div>
            <label className="block mb-1.5 text-sm text-slate-500 font-medium">Password</label>
            <input type="password" name="password" className="input-form" value={formData.password} onChange={handleChange} required minLength={8} />
          </div>

          <div>
            <label className="block mb-1.5 text-sm text-slate-500 font-medium">Konfirmasi Password</label>
            <input type="password" name="password_confirmation" className="input-form" value={formData.password_confirmation} onChange={handleChange} required minLength={8} />
          </div>
          
          <button type="submit" className="btn-primary mt-2 flex justify-center items-center gap-2" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Daftar"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500 pb-4">
          Sudah memiliki akun? <Link to="/login" className="text-sage-500 font-medium hover:text-sage-600">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
