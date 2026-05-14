import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  Users,
  ChevronRight,
  Menu,
  Truck,
  SettingsIcon,
  X,
  ArrowLeft
} from 'lucide-react';

const Layout = ({ children, hideSidebar = false, showBack = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Live Tracker', path: '/live-tracker', icon: <Map size={20} /> },
    { name: 'Vehicles', path: '/vehicles', icon: <Truck size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-dark overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {!hideSidebar && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!hideSidebar && (
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-xl lg:shadow-sm transition-transform duration-300 transform
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-auto
        `}>
          <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <h1 className="text-lg font-black tracking-tighter flex items-center gap-2">
              <span className="text-primary">BDPH</span>
              <span className="text-slate-400 font-light text-base">PRO</span>
            </h1>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-dark transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            <p className="px-3 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Menu</p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
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
            {!hideSidebar && (
              <button 
                onClick={toggleMobileMenu}
                className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-50 rounded-md transition-all"
              >
                <Menu size={20} />
              </button>
            )}
            
            {(hideSidebar || showBack) && (
              <div className="flex items-center gap-3">
                {showBack && (
                  <button 
                    onClick={() => navigate(-1)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-md transition-all"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h1 className="text-lg font-black tracking-tighter flex items-center gap-2">
                  <span className="text-primary">BDPH</span>
                  <span className="text-slate-400 font-light text-base">PRO</span>
                </h1>
              </div>
            )}
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
