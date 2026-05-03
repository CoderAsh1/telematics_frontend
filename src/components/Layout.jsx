import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  ChevronRight,
  Menu
} from 'lucide-react';

const Layout = ({ children, hideSidebar = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Live Tracker', path: '/live-tracker', icon: <Map size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-dark overflow-hidden">
      {/* Sidebar */}
      {!hideSidebar && (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-30 shadow-sm transition-all duration-300">
          <div className="p-8 border-b border-slate-50">
            <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <span className="text-primary">BDPH</span>
              <span className="text-slate-400 font-light text-xl">PRO</span>
            </h1>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Main Menu</p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${isActive(item.path)
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
                    {item.icon}
                  </span>
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
                {isActive(item.path) && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            ))}
          </nav>

          <div className="p-6 mt-auto border-t border-slate-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {hideSidebar && (
              <div className="mr-4">
                <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                  <span className="text-primary">BDPH</span>
                  <span className="text-slate-400 font-light text-lg">PRO</span>
                </h1>
              </div>
            )}
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search assets, reports..."
                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
            </button>
            <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-dark leading-none">Admin User</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
