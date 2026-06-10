import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { BrainCircuit, Loader2, ArrowLeft } from "lucide-react";
import api from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        login(token, user);
      } else {
        throw new Error(response.data.message || "Gagal login.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Gagal login. Periksa email dan password Anda.");
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

      <div className="glass-card animate-[fadeIn_0.5s_ease_forwards] w-full max-w-[420px] relative z-10 pt-16">
        <div className="absolute top-6 left-6">
          <Link to="/" className="text-slate-500 flex items-center gap-1.5 text-sm no-underline transition-colors hover:text-slate-900">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-500 to-sage-400 flex items-center justify-center text-white shadow-sm">
            <BrainCircuit size={28} />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2 font-heading">Selamat Datang</h1>
          <p className="text-slate-500">Masuk ke akun DeepWork Anda</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-energy-low p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 text-sm text-slate-500 font-medium">Email</label>
            <input 
              type="email" 
              className="input-form" 
              placeholder="email@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm text-slate-500 font-medium">Password</label>
            <input 
              type="password" 
              className="input-form" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary mt-3 flex justify-center items-center gap-2" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Masuk"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500">
          Belum memiliki akun? <Link to="/register" className="text-sage-500 font-medium hover:text-sage-600">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
