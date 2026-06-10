import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import Sidebar from "./components/Sidebar";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import JadwalKuliahPage from "./pages/dashboard/JadwalKuliahPage";
import ProfilSirkadianPage from "./pages/dashboard/ProfilSirkadianPage";
import RekomendasiPage from "./pages/dashboard/RekomendasiPage";
import TugasPage from "./pages/dashboard/TugasPage";

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8 md:p-10">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename="/ToDoList_Kel7_V1/">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/jadwal-kuliah" element={<DashboardLayout><JadwalKuliahPage /></DashboardLayout>} />
          <Route path="/profil-sirkadian" element={<DashboardLayout><ProfilSirkadianPage /></DashboardLayout>} />
          <Route path="/rekomendasi" element={<DashboardLayout><RekomendasiPage /></DashboardLayout>} />
          <Route path="/tugas" element={<DashboardLayout><TugasPage /></DashboardLayout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
