// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   LayoutDashboard, 
//   Truck, 
//   Users, 
//   MapPin, 
//   Settings, 
//   LogOut, 
//   Bell, 
//   Search,
//   Activity,
//   Navigation,
//   ShieldCheck,
//   Fuel
// } from 'lucide-react';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     navigate('/');
//   };

//   if (!user) return null;

//   return (
//     <div className="flex min-h-screen bg-slate-50 font-sans">
//       {/* Sidebar */}
//       <aside className="w-64 bg-dark text-white flex flex-col">
//         <div className="p-6 border-b border-white/10">
//           <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
//             <span className="text-primary">BDPH</span>
//             <span className="text-slate-400 font-light text-lg">GROUP</span>
//           </h1>
//         </div>

//         <nav className="flex-1 p-4 space-y-1">
//           <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
//           <NavItem icon={<MapPin className="w-5 h-5" />} label="Live Tracking" />
//           <NavItem icon={<Truck className="w-5 h-5" />} label="Vehicles" />
//           <NavItem icon={<Users className="w-5 h-5" />} label="Drivers" />
//           <NavItem icon={<Activity className="w-5 h-5" />} label="Analytics" />
//           <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
//         </nav>

//         <div className="p-4 border-t border-white/10">
//           <button 
//             onClick={handleLogout}
//             className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
//           >
//             <LogOut className="w-5 h-5" />
//             <span className="font-medium">Logout</span>
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col">
//         {/* Header */}
//         <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
//           <div className="relative w-96">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//             <input 
//               type="text" 
//               placeholder="Search vehicles, drivers..." 
//               className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
//             />
//           </div>

//           <div className="flex items-center gap-6">
//             <button className="relative text-slate-400 hover:text-dark transition-colors">
//               <Bell className="w-6 h-6" />
//               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
//             </button>

//             <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
//               <div className="text-right">
//                 <p className="text-sm font-bold text-dark leading-none">{user.name}</p>
//                 <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">{user.role}</p>
//               </div>
//               <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
//                 {user.name.charAt(0)}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <div className="p-8 space-y-8">
//           <div className="flex justify-between items-end">
//             <div>
//               <h2 className="text-2xl font-bold text-dark">Fleet Overview</h2>
//               <p className="text-slate-500 text-sm mt-1">Real-time status of your connected assets.</p>
//             </div>
//             <div className="flex gap-3">
//               <button className="px-4 py-2 bg-white border border-slate-200 text-dark text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all">Export Report</button>
//               <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-accent transition-all shadow-lg shadow-primary/20">Add Vehicle</button>
//             </div>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <StatCard icon={<Truck className="text-blue-500" />} label="Total Vehicles" value="42" change="+3" trend="up" />
//             <StatCard icon={<Navigation className="text-green-500" />} label="Active Now" value="28" change="74%" trend="neutral" />
//             <StatCard icon={<Fuel className="text-orange-500" />} label="Fuel Usage" value="1,280 L" change="-5%" trend="down" />
//             <StatCard icon={<ShieldCheck className="text-purple-500" />} label="Safety Alerts" value="12" change="+2" trend="up" danger />
//           </div>

//           {/* Map Placeholder & Recent Activity */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="font-bold text-dark">Live Fleet Map</h3>
//                 <div className="flex gap-2">
//                     <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
//                         <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
//                         Live
//                     </span>
//                 </div>
//               </div>
//               <div className="flex-1 bg-slate-100 rounded-xl flex items-center justify-center border border-dashed border-slate-300 relative overflow-hidden">
//                 <p className="text-slate-400 font-medium">Map View Placeholder</p>
//                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
//               <h3 className="font-bold text-dark mb-6">Recent Alerts</h3>
//               <div className="space-y-6 flex-1 overflow-y-auto">
//                 <AlertItem type="Overspeeding" vehicle="TR-4920" time="2 mins ago" />
//                 <AlertItem type="Idle Timeout" vehicle="TR-1022" time="15 mins ago" />
//                 <AlertItem type="Geofence Exit" vehicle="TR-8831" time="1 hour ago" />
//                 <AlertItem type="Low Fuel" vehicle="TR-5521" time="2 hours ago" />
//               </div>
//               <button className="w-full mt-6 py-3 text-primary text-sm font-bold hover:bg-primary/5 rounded-lg transition-all">View All Alerts</button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// const NavItem = ({ icon, label, active = false }) => (
//   <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
//     {icon}
//     <span>{label}</span>
//   </a>
// );

// const StatCard = ({ icon, label, value, change, trend, danger = false }) => (
//   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
//     <div>
//       <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
//       <h4 className="text-2xl font-black text-dark leading-none">{value}</h4>
//       <p className={`text-[10px] font-bold mt-2 ${trend === 'up' ? (danger ? 'text-red-500' : 'text-green-500') : trend === 'down' ? 'text-green-500' : 'text-slate-400'}`}>
//         {change} from last week
//       </p>
//     </div>
//     <div className="p-3 bg-slate-50 rounded-xl">
//       {icon}
//     </div>
//   </div>
// );

// const AlertItem = ({ type, vehicle, time }) => (
//   <div className="flex gap-4">
//     <div className="w-1 h-10 bg-red-500 rounded-full shrink-0" />
//     <div>
//       <p className="text-sm font-bold text-dark leading-tight">{type}</p>
//       <p className="text-xs text-slate-500 mt-0.5">{vehicle} • {time}</p>
//     </div>
//   </div>
// );

// export default Dashboard;


import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Replace with your EC2 Public IP
const SOCKET_URL = "http://3.108.43.58:3000";

const LiveDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Initialize Connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket'], // Forces websocket for better performance
    });

    // 2. Connection Lifecycle Events
    socket.on('connect', () => {
      console.log('✅ Connected to Telematics Server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected');
      setIsConnected(false);
    });

    // 3. Listen for the Telemetry Data
    socket.on('v1_live_update', (data) => {
      console.log('🚛 New Live Data Received:', data);

      // Tip: You can check specific fields like data.angle 
      // or data.speed right here in the log.
    });

    // 4. Cleanup on Unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Telematics Live Feed</h1>
      <p>Status: <strong>{isConnected ? 'Online' : 'Offline'}</strong></p>
      <p>Check the browser console (F12) to see incoming vehicle pings.</p>
    </div>
  );
};

export default LiveDashboard;
