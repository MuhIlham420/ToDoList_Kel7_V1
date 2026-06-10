import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Activity, 
  BrainCircuit, 
  LogOut,
  User as UserIcon
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const pathname = location.pathname;

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Manajemen Tugas", href: "/tugas", icon: CheckSquare },
    { name: "Jadwal Kuliah", href: "/jadwal-kuliah", icon: CalendarDays },
    { name: "Profil Sirkadian", href: "/profil-sirkadian", icon: Activity },
    { name: "Rekomendasi Penjadwalan", href: "/rekomendasi", icon: BrainCircuit },
  ];

  return (
    <aside className="w-[260px] bg-white border-r border-slate-200 p-6 flex flex-col fixed h-screen left-0 top-0 z-50">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-400 flex items-center justify-center text-white shadow-sm">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-xl m-0 leading-tight font-heading">DeepWork</h2>
          <span className="text-xs text-sage-500 tracking-wider uppercase font-semibold">Protocol DSS</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.name} to={item.href} className="no-underline block">
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-l-4
                ${isActive 
                  ? "text-slate-900 bg-sage-500/10 border-sage-500 font-semibold" 
                  : "text-slate-500 bg-transparent border-transparent hover:bg-slate-50 hover:text-slate-700 font-medium"}
              `}>
                <item.icon size={20} className={isActive ? "text-sage-500" : "text-current"} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sage-500/10 flex items-center justify-center shrink-0">
            <UserIcon size={20} className="text-slate-500" />
          </div>
          <div className="overflow-hidden">
            <p className="m-0 font-semibold text-sm whitespace-nowrap text-ellipsis overflow-hidden text-slate-900">
              {user?.name || "Mahasiswa"}
            </p>
            <p className="m-0 text-xs text-slate-500 whitespace-nowrap text-ellipsis overflow-hidden">
              {user?.email || "email@unsyiah.ac.id"}
            </p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full p-2.5 bg-transparent border border-slate-200 rounded-lg text-slate-700 cursor-pointer transition-all duration-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 font-medium"
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
