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
  Menu,
  Truck,
  SettingsIcon
} from 'lucide-react';

const Layout = ({ children, hideSidebar = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Live Tracker', path: '/live-tracker', icon: <Map size={20} /> },
    { name: 'Vehicles', path: '/vehicles', icon: <Truck size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
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
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-30 shadow-sm transition-all duration-300">
          <div className="p-4 border-b border-slate-50">
            <h1 className="text-lg font-black tracking-tighter flex items-center gap-2">
              <span className="text-primary">BDPH</span>
              <span className="text-slate-400 font-light text-base">PRO</span>
            </h1>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            <p className="px-3 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Menu</p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-md transition-all group ${isActive(item.path)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
                    {React.cloneElement(item.icon, { size: 18 })}
                  </span>
                  <span className="font-bold text-xs">{item.name}</span>
                </div>
                {isActive(item.path) && <ChevronRight size={12} className="opacity-50" />}
              </Link>
            ))}
          </nav>

          <div className="p-4 mt-auto border-t border-slate-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-xs"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {hideSidebar && (
              <div className="mr-4">
                <h1 className="text-lg font-black tracking-tighter flex items-center gap-2">
                  <span className="text-primary">BDPH</span>
                  <span className="text-slate-400 font-light text-base">PRO</span>
                </h1>
              </div>
            )}
            <div className="relative max-w-xs w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-50 border border-slate-100 rounded-md py-1.5 pl-9 pr-3 text-xs focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-slate-400 hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 border-2 border-white rounded-full" />
            </button>
            <div className="h-6 w-[1px] bg-slate-100 hidden sm:block" />
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-dark leading-none">Admin</p>
              </div>
              <div className="w-8 h-8 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 border border-slate-200">
                <User size={16} />
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
