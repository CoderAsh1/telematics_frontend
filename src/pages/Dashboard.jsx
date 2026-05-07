import React from 'react';
import Layout from '../components/Layout';
import {
  Truck,
  Navigation,
  ShieldCheck,
  Fuel
} from 'lucide-react';

const Dashboard = () => {
  return (
    <Layout>
      <div className="p-4 space-y-4 bg-slate-50 min-h-full">
        <div className="flex justify-between items-center bg-white p-4 rounded-md border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-dark tracking-tight">Fleet Overview</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time status of connected assets</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-slate-200 text-dark text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-slate-50 transition-all">Export</button>
            <button className="btn-primary !w-auto px-4 py-1.5">Add Vehicle</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Truck className="text-blue-500" size={20} />} label="Total Vehicles" value="42" change="+3" trend="up" />
          <StatCard icon={<Navigation className="text-green-500" size={20} />} label="Active Now" value="28" change="74%" trend="neutral" />
          <StatCard icon={<Fuel className="text-orange-500" size={20} />} label="Fuel Usage" value="1,280 L" change="-5%" trend="down" />
          <StatCard icon={<ShieldCheck className="text-purple-500" size={20} />} label="Safety Alerts" value="12" change="+2" trend="up" danger />
        </div>

        {/* Map Placeholder & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white p-4 rounded-md border border-slate-200 shadow-sm h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-dark uppercase tracking-widest">Live Fleet Map</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                  <span className="w-1 h-1 bg-green-600 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 rounded-md flex items-center justify-center border border-dashed border-slate-200 relative overflow-hidden">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Map View Unavailable</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-dark uppercase tracking-widest mb-4">Recent Alerts</h3>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <AlertItem type="Overspeeding" vehicle="TR-4920" time="2 mins ago" />
              <AlertItem type="Idle Timeout" vehicle="TR-1022" time="15 mins ago" />
              <AlertItem type="Geofence Exit" vehicle="TR-8831" time="1 hour ago" />
              <AlertItem type="Low Fuel" vehicle="TR-5521" time="2 hours ago" />
            </div>
            <button className="w-full mt-4 py-2 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 rounded-md transition-all">View All Alerts</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ icon, label, value, change, trend, danger = false }) => (
  <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm flex items-start justify-between group hover:border-primary/20 transition-colors">
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <h4 className="text-xl font-black text-dark leading-none">{value}</h4>
      <p className={`text-[9px] font-bold mt-2 uppercase tracking-widest ${trend === 'up' ? (danger ? 'text-red-500' : 'text-green-500') : trend === 'down' ? 'text-green-500' : 'text-slate-400'}`}>
        {change} <span className="opacity-50">Trend</span>
      </p>
    </div>
    <div className="p-2 bg-slate-50 rounded-md text-slate-400 group-hover:text-primary transition-colors">
      {icon}
    </div>
  </div>
);

const AlertItem = ({ type, vehicle, time }) => (
  <div className="flex gap-3 items-center p-2 rounded-md hover:bg-slate-50 transition-colors cursor-pointer">
    <div className="w-1 h-6 bg-red-500 rounded-full shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-black text-dark uppercase tracking-tight truncate">{type}</p>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{vehicle} • {time}</p>
    </div>
  </div>
);

export default Dashboard;
