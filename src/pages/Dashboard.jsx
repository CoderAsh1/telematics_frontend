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
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-dark">Fleet Overview</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time status of your connected assets.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 text-dark text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all">Export Report</button>
            <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-accent transition-all shadow-lg shadow-primary/20">Add Vehicle</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Truck className="text-blue-500" />} label="Total Vehicles" value="42" change="+3" trend="up" />
          <StatCard icon={<Navigation className="text-green-500" />} label="Active Now" value="28" change="74%" trend="neutral" />
          <StatCard icon={<Fuel className="text-orange-500" />} label="Fuel Usage" value="1,280 L" change="-5%" trend="down" />
          <StatCard icon={<ShieldCheck className="text-purple-500" />} label="Safety Alerts" value="12" change="+2" trend="up" danger />
        </div>

        {/* Map Placeholder & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-dark">Live Fleet Map</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 rounded-xl flex items-center justify-center border border-dashed border-slate-300 relative overflow-hidden">
              <p className="text-slate-400 font-medium">Map View Placeholder</p>
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-dark mb-6">Recent Alerts</h3>
            <div className="space-y-6 flex-1 overflow-y-auto">
              <AlertItem type="Overspeeding" vehicle="TR-4920" time="2 mins ago" />
              <AlertItem type="Idle Timeout" vehicle="TR-1022" time="15 mins ago" />
              <AlertItem type="Geofence Exit" vehicle="TR-8831" time="1 hour ago" />
              <AlertItem type="Low Fuel" vehicle="TR-5521" time="2 hours ago" />
            </div>
            <button className="w-full mt-6 py-3 text-primary text-sm font-bold hover:bg-primary/5 rounded-lg transition-all">View All Alerts</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ icon, label, value, change, trend, danger = false }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
      <h4 className="text-2xl font-black text-dark leading-none">{value}</h4>
      <p className={`text-[10px] font-bold mt-2 ${trend === 'up' ? (danger ? 'text-red-500' : 'text-green-500') : trend === 'down' ? 'text-green-500' : 'text-slate-400'}`}>
        {change} from last week
      </p>
    </div>
    <div className="p-3 bg-slate-50 rounded-xl">
      {icon}
    </div>
  </div>
);

const AlertItem = ({ type, vehicle, time }) => (
  <div className="flex gap-4">
    <div className="w-1 h-10 bg-red-500 rounded-full shrink-0" />
    <div>
      <p className="text-sm font-bold text-dark leading-tight">{type}</p>
      <p className="text-xs text-slate-500 mt-0.5">{vehicle} • {time}</p>
    </div>
  </div>
);

export default Dashboard;
