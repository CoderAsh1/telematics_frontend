import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  ArrowLeft, User, Mail, Phone, Shield, Save, Key, AlertCircle, Loader2
} from 'lucide-react';
import * as userApi from '../../api/users';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    access_role: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getUserById(id);
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        role: response.data.role || '',
        access_role: response.data.access_role || '',
        password: ''
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      setMessage({ type: 'error', text: 'Failed to load user information.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });

      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      await userApi.updateUser(id, updateData);
      setMessage({ type: 'success', text: 'User updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating user.' });
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
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/users')}
                className="p-1.5 sm:p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-md transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-dark tracking-tight">User Details</h1>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">View and edit account profile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {message.text && (
              <div className={`mb-4 p-3 rounded-md flex items-center gap-3 animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                {message.type === 'success' ? <Save size={16} /> : <AlertCircle size={16} />}
                <p className="text-xs font-bold uppercase tracking-widest">{message.text}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Profile Card */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-md mx-auto flex items-center justify-center text-slate-300 mb-4">
                    <User size={40} />
                  </div>
                  <h3 className="text-lg font-black text-dark tracking-tight uppercase">{user?.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{user?.email}</p>

                  <div className="pt-4 border-t border-slate-50 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                      <span className="font-bold text-slate-400">Account Type</span>
                      <span className="font-black text-primary">{user?.role || 'Not Set'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                      <span className="font-bold text-slate-400">Permission</span>
                      <span className="font-black text-slate-600">{user?.access_role || 'Not Set'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xs font-black text-dark uppercase tracking-widest">Account Information</h3>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input
                            type="text"
                            className="input-field pl-9"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input
                            type="email"
                            className="input-field pl-9"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input
                            type="text"
                            className="input-field pl-9"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Role</label>
                        <div className="relative">
                          <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <select
                            className="input-field pl-9 appearance-none"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                          >
                            <option value="">Select Role</option>
                            <option value="ADMIN">Administrator</option>
                            <option value="TRANSPORTER">Transporter</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Level</label>
                        <div className="relative">
                          <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <select
                            className="input-field pl-9 appearance-none"
                            value={formData.access_role}
                            onChange={e => setFormData({ ...formData, access_role: e.target.value })}
                          >
                            <option value="">Select Level</option>
                            <option value="OWNER">Owner (Full Access)</option>
                            <option value="EDITOR">Editor (Can Update)</option>
                            <option value="VIEWER">Viewer (Read Only)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Change Password (Leave blank to keep current)</label>
                      <div className="relative">
                        <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="password" 
                          className="input-field pl-9" 
                          placeholder="New secure password"
                          value={formData.password} 
                          onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                      </div>
                    </div> */}

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary !w-full sm:!w-auto px-8"
                      >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
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

export default UserDetails;
