import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
  Search, User, Mail, Phone, ChevronRight, UserPlus, Shield
} from 'lucide-react';
import * as userApi from '../../api/users';
import Pagination from '../../components/Pagination';
import useDebounce from '../../hooks/useDebounce';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, debouncedSearch]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch
      });
      setUsers(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-50">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-dark tracking-tight">User Management</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage system users and access roles</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="btn-primary !w-auto px-4 py-1.5 text-[11px]">
                <UserPlus size={16} />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
              {/* Table Search */}
              <div className="p-3 border-b border-slate-50 bg-slate-50/30">
                <div className="relative group w-full sm:max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search name, email..."
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
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Access</th>
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
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                <User size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-dark tracking-tight uppercase">{user.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                                <Mail size={12} className="text-slate-300" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                                  <Phone size={12} className="text-slate-300" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                              user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <Shield size={10} />
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.access_role || '-'}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="p-1.5 text-slate-300 hover:text-primary transition-colors">
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <User size={32} className="text-slate-200" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No users found</p>
                          </div>
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
      </div>
    </Layout>
  );
};

export default Users;
