import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  Plus, Search, Edit2, Trash2, Truck, Save, X, ChevronRight
} from 'lucide-react';
import * as vehicleApi from '../../api/vehicles';
import Pagination from '../../components/Pagination';
import useDebounce from '../../hooks/useDebounce';

const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [formData, setFormData] = useState({
    vehicle_no: '',
    imei: '',
    vehicle_type_id: '',
    capacity: ''
  });

  useEffect(() => {
    fetchVehicles();
    fetchTypes();
  }, [pagination.page, debouncedSearch]);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await vehicleApi.getVehicles({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch
      });
      setVehicles(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await vehicleApi.getVehicleTypes();
      setTypes(response.data.data);
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setFormData({
        vehicle_no: vehicle.vehicle_no,
        imei: vehicle.imei,
        vehicle_type_id: vehicle.vehicle_type_id,
        capacity: vehicle.capacity || ''
      });
    } else {
      setSelectedVehicle(null);
      setFormData({ vehicle_no: '', imei: '', vehicle_type_id: '', capacity: '' });
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
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleApi.deleteVehicle(id);
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-dark tracking-tight">Fleet Management</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your tracking assets and devices</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => handleOpenModal()} className="btn-primary !w-auto px-4 py-1.5">
                <Plus size={16} />
                Add Vehicle
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              {/* Table Search */}
              <div className="p-3 border-b border-slate-50 bg-slate-50/30">
                <div className="relative group max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search vehicle no, imei..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs font-medium focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle info</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">IMEI / Device</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="5" className="px-4 py-4"><div className="h-4 bg-slate-50 rounded w-full" /></td>
                        </tr>
                      ))
                    ) : vehicles.length > 0 ? (
                      vehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                <Truck size={16} />
                              </div>
                              <p className="text-xs font-black text-dark tracking-tight uppercase">{vehicle.vehicle_no}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{vehicle.imei}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-widest">
                              {vehicle.vehicle_type_name || 'General'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vehicle.capacity || '-'}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenModal(vehicle); }}
                                className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-white"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-white"
                              >
                                <Trash2 size={14} />
                              </button>
                              <ChevronRight size={14} className="text-slate-300 ml-1" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-12 text-center text-slate-400">
                          <p className="text-xs font-bold uppercase tracking-widest">No vehicles found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-md p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-dark tracking-tight">{selectedVehicle ? 'Update' : 'Add'} Vehicle</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-dark transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Vehicle No</label>
                    <input type="text" className="input-field" value={formData.vehicle_no} onChange={e => setFormData({ ...formData, vehicle_no: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">IMEI</label>
                    <input type="text" className="input-field" value={formData.imei} onChange={e => setFormData({ ...formData, imei: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                    <select className="input-field appearance-none" value={formData.vehicle_type_id} onChange={e => setFormData({ ...formData, vehicle_type_id: e.target.value })}>
                      <option value="">Select Type</option>
                      {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Capacity</label>
                    <input type="text" className="input-field" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn-primary mt-2">
                  <Save size={16} />
                  {selectedVehicle ? 'Update' : 'Create'} Asset
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Vehicles;
