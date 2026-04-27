import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import "./AdminAdd.css";

interface AdminDto {
  adminId: number;
  username: string;
  password?: string;
  role: string;
  fullName: string;
  nic: string;
  address: string;
  isActive: boolean;
}

const AdminManagement: React.FC = () => {
  // --- MOCK STATIC DATA ---
  const initialData: AdminDto[] = [
    {
      adminId: 1,
      username: "rasika_dev",
      role: "ROLE_ADMIN",
      fullName: "Rasika Madushanka",
      nic: "199512345678",
      address: "Panadura, Sri Lanka",
      isActive: true,
    },
    {
      adminId: 2,
      username: "amashi_ba",
      role: "ROLE_MANAGER",
      fullName: "Amashi Pathiraja",
      nic: "199887654321",
      address: "Dankotuwa, Sri Lanka",
      isActive: true,
    }
  ];

  const [admins, setAdmins] = useState<AdminDto[]>(initialData);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<AdminDto>({
    adminId: 0,
    username: '',
    password: '',
    role: 'ROLE_ADMIN',
    fullName: '',
    nic: '',
    address: '',
    isActive: true,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // --- STATIC CREATE/UPDATE LOGIC ---
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (isEditMode) {
      // Update existing
      setAdmins(prev => prev.map(a => a.adminId === formData.adminId ? formData : a));
    } else {
      // Add new with fake ID
      const newAdmin = { ...formData, adminId: Math.floor(Math.random() * 1000) };
      setAdmins(prev => [...prev, newAdmin]);
    }
    
    resetForm();
  };

  const handleDelete = (id: number) => {
    setAdmins(prev => prev.filter(admin => admin.adminId !== id));
  };

  const handleEdit = (admin: AdminDto) => {
    setFormData(admin);
    setIsEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      adminId: 0, username: '', password: '', role: 'ROLE_ADMIN',
      fullName: '', nic: '', address: '', isActive: true
    });
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Registration Card */}
        <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            {isEditMode ? "Edit Administrator" : "Admin Onboarding"}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Full Name</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} className="form-input-style" placeholder="Rasika Madushanka" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Username</label>
              <input name="username" value={formData.username} onChange={handleChange} className="form-input-style" placeholder="rasika_dev" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-blue-400 text-[10px] font-black uppercase tracking-widest">NIC / ID</label>
              <input name="nic" value={formData.nic} onChange={handleChange} className="form-input-style" placeholder="95XXXXXXXV" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="form-input-style">
                <option value="ROLE_ADMIN">System Admin</option>
                <option value="ROLE_MANAGER">Project Manager</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-1 lg:col-span-2">
              <label className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Address</label>
              <input name="address" value={formData.address} onChange={handleChange} className="form-input-style" placeholder="Panadura, Sri Lanka" />
            </div>

            <div className="lg:col-span-3 flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 accent-cyan-500 bg-slate-800" />
                <span className="text-white text-sm font-bold">Account Active</span>
              </div>
              
              <div className="flex gap-4">
                {isEditMode && (
                  <button type="button" onClick={resetForm} className="px-6 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold hover:text-white transition-all">CANCEL</button>
                )}
                <button type="submit" className={`px-10 py-3 rounded-xl font-black text-white shadow-lg transition-all active:scale-95 ${isEditMode ? 'bg-amber-500 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
                  {isEditMode ? "UPDATE USER" : "CREATE USER"}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Data Table */}
        <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-6">Personnel</th>
                <th className="p-6">Role</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-400">
              {admins.map((admin) => (
                <tr key={admin.adminId} className="hover:bg-white/[0.02] transition-all group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{admin.fullName}</span>
                      <span className="text-[11px] opacity-50">@{admin.username}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                      {admin.role.replace("ROLE_", "")}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className={`flex items-center gap-2 text-[10px] font-black ${admin.isActive ? 'text-green-400' : 'text-red-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full bg-current ${admin.isActive ? 'animate-pulse' : ''}`} />
                      {admin.isActive ? 'OPERATIONAL' : 'DEACTIVATED'}
                    </div>
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <button onClick={() => handleEdit(admin)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-amber-500 hover:text-white transition-all text-[10px] font-bold">EDIT</button>
                    <button onClick={() => handleDelete(admin.adminId)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold">DELETE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default AdminManagement;