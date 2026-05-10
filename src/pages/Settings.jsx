import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Plus, Edit2, Trash2, Truck, Settings as SettingsIcon,
  ChevronRight, Save, X, Image as ImageIcon, Check,
  Activity, AlertCircle, Upload, Eye, Loader2
} from 'lucide-react';
import * as vehicleApi from '../api/vehicles';

const Settings = () => {
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [typeIcons, setTypeIcons] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [typeFormData, setTypeFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setIsLoading(true);
    try {
      const res = await vehicleApi.getVehicleTypes();
      setTypes(res.data.data);
    } catch (err) {
      console.error('Failed to fetch types:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setSelectedType(item);
    if (item) {
      setTypeFormData({ name: item.name, description: item.description });
    } else {
      setTypeFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleOpenIconModal = async (type) => {
    setSelectedType(type);
    setIsIconModalOpen(true);
    try {
      const res = await vehicleApi.getTypeIcons(type.id);
      const iconMap = {};
      res.data.data.forEach(icon => {
        iconMap[icon.status] = icon.icon_url;
      });
      setTypeIcons(iconMap);
    } catch (err) {
      console.error('Failed to fetch icons:', err);
    }
  };

  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedType) {
        await vehicleApi.updateVehicleType(selectedType.id, typeFormData);
      } else {
        await vehicleApi.addVehicleType(typeFormData);
      }
      setIsModalOpen(false);
      fetchTypes();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleIconUpload = async (status, file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('icon', file);
      const uploadRes = await vehicleApi.uploadImage(formData);
      const iconUrl = uploadRes.data.url;

      await vehicleApi.updateTypeIcon(selectedType.id, {
        status: status,
        icon_url: iconUrl
      });

      setTypeIcons(prev => ({ ...prev, [status]: iconUrl }));
    } catch (err) {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const IconStatusItem = ({ status, iconUrl }) => (
    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group relative">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{status}</span>
        {iconUrl && (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden border border-slate-100">
            <img src={iconUrl} alt={status} className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      <div className="relative">
        <label className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:border-primary/30 transition-all cursor-pointer">
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {iconUrl ? 'Update Icon' : 'Upload Icon'}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files[0] && handleIconUpload(status, e.target.files[0])}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-dark tracking-tight">System Settings</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global configuration & mapping</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn-primary !w-auto px-4 py-1.5 text-[11px]">
              <Plus size={16} />
              Add Type
            </button>
          </div>
        </div>

        <div className="flex-1 p-3 sm:p-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                [1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-md animate-pulse border border-slate-200" />)
              ) : types?.map((type) => (
                <div key={type.id} className="bg-white p-4 rounded-md border border-slate-200 shadow-sm group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <Truck size={20} />
                    </div>
                    <button onClick={() => handleOpenModal(type)} className="p-1.5 text-slate-300 hover:text-primary hover:bg-slate-50 rounded-md transition-all">
                      <Edit2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-black text-dark tracking-tight uppercase">{type.name}</h3>
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{type.description || 'No description.'}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <Activity size={10} className="text-success" />
                        Assets
                      </div>
                      <button
                        onClick={() => handleOpenIconModal(type)}
                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        Icons
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Type Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-dark/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-md p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-dark tracking-tight">{selectedType ? 'Edit' : 'Add'} Type</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-dark"><X size={20} /></button>
              </div>
              <form onSubmit={handleTypeSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Type Name</label>
                  <input type="text" className="input-field" value={typeFormData.name} onChange={e => setTypeFormData({ ...typeFormData, name: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                  <textarea className="input-field h-24 resize-none" value={typeFormData.description} onChange={e => setTypeFormData({ ...typeFormData, description: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary mt-2">Save Type</button>
              </form>
            </div>
          </div>
        )}

        {/* Icon Management Modal */}
        {isIconModalOpen && selectedType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-dark/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-md p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-black text-dark tracking-tight">Icon Mapping</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedType.name}</p>
                </div>
                <button onClick={() => setIsIconModalOpen(false)} className="p-1 text-slate-400 hover:text-dark"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['moving', 'idle', 'stopped', 'offline'].map(status => (
                  <div key={status} className="p-3 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {typeIcons[status] && (
                        <div className="w-8 h-8 bg-white rounded-md border border-slate-200 p-1">
                          <img src={typeIcons[status]} alt={status} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{status}</span>
                    </div>

                    <label className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-primary cursor-pointer">
                      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleIconUpload(status, e.target.files[0])}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
