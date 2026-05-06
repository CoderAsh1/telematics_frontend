import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Plus, Search, Edit2, Trash2, Truck, Save, X
} from 'lucide-react';
import * as vehicleApi from '../api/vehicles';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    vehicle_no: '', imei: '', model: '', capacity: '', odo_meter: '', vehicle_type_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vRes, tRes] = await Promise.all([
        vehicleApi.getVehicles(),
        vehicleApi.getVehicleTypes()
      ]);
      setVehicles(vRes.data);
      setTypes(tRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (vehicle = null) => {
    setSelectedVehicle(vehicle);
    if (vehicle) {
      setFormData({ ...vehicle });
    } else {
      setFormData({ vehicle_no: '', imei: '', model: '', capacity: '', odo_meter: '', vehicle_type_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedVehicle) {
        await vehicleApi.updateVehicle(selectedVehicle.id, formData);
      } else {
        await vehicleApi.addVehicle(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleApi.deleteVehicle(id);
        fetchData();
      } catch (err) {
        alert('Failed to delete vehicle');
      }
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.vehicle_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.imei?.includes(searchQuery)
  );

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-dark tracking-tight">Fleet Assets</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your logistics network</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="btn-primary !w-auto px-4 py-1.5"
            >
              <Plus size={16} />
              Add Asset
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="max-w-xs relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search vehicles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs font-medium shadow-sm focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Vehicle</th>
                    <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">IMEI</th>
                    <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Type</th>
                    <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    [1,2,3].map(i => <tr key={i} className="h-12 animate-pulse bg-white"></tr>)
                  ) : filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <Truck size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-dark tracking-tight uppercase">{v.vehicle_no}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{v.model || 'Standard'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 font-mono tracking-tight">{v.imei}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md">
                          {v.vehicle_type_name || 'Standard'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleOpenModal(v)} className="p-1.5 text-slate-300 hover:text-primary hover:bg-white rounded-md transition-all">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-md transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-xl rounded-[48px] p-10 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-dark tracking-tighter">{selectedVehicle ? 'Update' : 'Add'} Vehicle</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vehicle No</label>
                    <input type="text" className="input-field" value={formData.vehicle_no} onChange={e => setFormData({...formData, vehicle_no: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">IMEI</label>
                    <input type="text" className="input-field" value={formData.imei} onChange={e => setFormData({...formData, imei: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                    <select className="input-field appearance-none" value={formData.vehicle_type_id} onChange={e => setFormData({...formData, vehicle_type_id: e.target.value})}>
                      <option value="">Select Type</option>
                      {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Capacity</label>
                    <input type="text" className="input-field" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="btn-primary"><Save size={18} /> {selectedVehicle ? 'Update' : 'Create'} Asset</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Vehicles;
