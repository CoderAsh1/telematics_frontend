import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
  ArrowLeft, Truck, Save, AlertCircle, Loader2, Info, Activity, Gauge, MapPin
} from 'lucide-react';
import * as vehicleApi from '../../api/vehicles';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_no: '',
    imei: '',
    model: '',
    capacity: '',
    odo_meter: '',
    vehicle_type_id: '',
    is_active: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchVehicleDetails();
    fetchTypes();
  }, [id]);

  const fetchVehicleDetails = async () => {
    try {
      setIsLoading(true);
      const response = await vehicleApi.getVehicleById(id);
      const v = response.data;
      setVehicle(v);
      setFormData({
        vehicle_no: v.vehicle_no || '',
        imei: v.imei || '',
        model: v.model || '',
        capacity: v.capacity || '',
        odo_meter: v.odo_meter || '',
        vehicle_type_id: v.vehicle_type_id || '',
        is_active: v.is_active ?? true
      });
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      setMessage({ type: 'error', text: 'Failed to load vehicle details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await vehicleApi.getVehicleTypes();
      setTypes(response.data);
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });
      await vehicleApi.updateVehicle(id, formData);
      setMessage({ type: 'success', text: 'Vehicle updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating vehicle.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-50">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/vehicles')}
                className="p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-md transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-black text-dark tracking-tight">Vehicle Details</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configuration and telemetry settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {message.text && (
              <div className={`mb-4 p-3 rounded-md flex items-center gap-3 animate-in slide-in-from-top-2 ${
                message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {message.type === 'success' ? <Save size={16} /> : <AlertCircle size={16} />}
                <p className="text-xs font-bold uppercase tracking-widest">{message.text}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Summary Card */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 bg-primary/5 rounded-md flex items-center justify-center text-primary mb-6">
                    <Truck size={32} />
                  </div>
                  <h3 className="text-xl font-black text-dark tracking-tight uppercase mb-1">{vehicle?.vehicle_no}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Device IMEI: {vehicle?.imei}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <Gauge size={12} className="text-primary" />
                        Odometer
                      </div>
                      <span className="text-xs font-black text-dark">{vehicle?.odo_meter || 0} km</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <Activity size={12} className="text-success" />
                        Status
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${vehicle?.is_active ? 'bg-success/10 text-success' : 'bg-red-50 text-red-500'}`}>
                        {vehicle?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-black text-dark uppercase tracking-widest">Asset Configuration</h3>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Vehicle Number</label>
                        <input 
                          type="text" 
                          className="input-field uppercase" 
                          value={formData.vehicle_no} 
                          onChange={e => setFormData({...formData, vehicle_no: e.target.value.toUpperCase()})} 
                          required 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Device IMEI</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={formData.imei} 
                          onChange={e => setFormData({...formData, imei: e.target.value})} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Model Name</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={formData.model} 
                          onChange={e => setFormData({...formData, model: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Vehicle Type</label>
                        <select 
                          className="input-field appearance-none" 
                          value={formData.vehicle_type_id} 
                          onChange={e => setFormData({...formData, vehicle_type_id: e.target.value})}
                        >
                          <option value="">Select Type</option>
                          {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Capacity</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={formData.capacity} 
                          onChange={e => setFormData({...formData, capacity: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Odometer (km)</label>
                        <input 
                          type="number" 
                          className="input-field" 
                          value={formData.odo_meter} 
                          onChange={e => setFormData({...formData, odo_meter: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-md border border-slate-100">
                      <input 
                        type="checkbox" 
                        id="is_active"
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20"
                        checked={formData.is_active}
                        onChange={e => setFormData({...formData, is_active: e.target.checked})}
                      />
                      <label htmlFor="is_active" className="text-xs font-bold text-slate-600 uppercase tracking-widest cursor-pointer">
                        Mark as Active Asset
                      </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="btn-primary !w-auto px-8"
                      >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Update Configuration
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VehicleDetails;
