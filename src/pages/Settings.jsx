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
      setTypes(res.data);
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
      res.data.forEach(icon => {
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
        <div className="bg-white border-b border-slate-100 p-8 pt-10">
          <div className="max-w-7xl mx-auto flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                <SettingsIcon size={12} />
                Global Configuration
              </div>
              <h1 className="text-4xl font-black text-dark tracking-tighter">System Setup.</h1>
              <p className="text-slate-400 font-medium">Manage vehicle categories and their visual representations.</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn-primary !w-auto px-8">
              <Plus size={18} />
              Add New Type
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                [1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[40px] animate-pulse" />)
              ) : types.map((type) => (
                <div key={type.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-premium group">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Truck size={32} />
                    </div>
                    <button onClick={() => handleOpenModal(type)} className="p-2.5 text-slate-300 hover:text-primary bg-slate-50 rounded-xl">
                      <Edit2 size={14} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-dark tracking-tighter uppercase">{type.name}</h3>
                    <p className="text-sm text-slate-400 font-medium line-clamp-2">{type.description || 'No description provided.'}</p>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Activity size={12} className="text-success" />
                        Mapped Statuses
                      </div>
                      <button 
                        onClick={() => handleOpenIconModal(type)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Manage Icons <ChevronRight size={12} />
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-xl rounded-[48px] p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-dark tracking-tighter">{selectedType ? 'Edit' : 'Add'} Vehicle Type</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl"><X size={20} /></button>
              </div>
              <form onSubmit={handleTypeSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type Name</label>
                  <input type="text" className="input-field" value={typeFormData.name} onChange={e => setTypeFormData({...typeFormData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                  <textarea className="input-field h-32 resize-none" value={typeFormData.description} onChange={e => setTypeFormData({...typeFormData, description: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary"><Save size={18} /> {selectedType ? 'Update' : 'Create'} Type</button>
              </form>
            </div>
          </div>
        )}

        {/* Icon Management Modal */}
        {isIconModalOpen && selectedType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[48px] p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black text-dark tracking-tighter">Icon Configuration.</h2>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Type: {selectedType.name}</p>
                </div>
                <button onClick={() => setIsIconModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl"><X size={20} /></button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {['moving', 'idle', 'stopped', 'offline'].map(status => (
                  <IconStatusItem 
                    key={status} 
                    status={status} 
                    iconUrl={typeIcons[status]} 
                  />
                ))}
              </div>

              <div className="mt-10 p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-4">
                <AlertCircle className="text-primary mt-1" size={20} />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload high-quality PNG or SVG icons. These will be used on the live tracker based on the vehicle's current status.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Settings;
