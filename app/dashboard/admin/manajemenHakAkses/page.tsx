//app/dashboard/admin/manajemenHakAkses/page.tsx

'use client';

import SidebarUniversal from "@/components/layout/SidebarUniversal";
import { useEffect, useState } from 'react';
import HakAksesChart from "./HakAksesChart";

type HakAkses = {
  id: number;
  id_user: number;
  id_role: number;
  nama_lengkap: string;
  username: string;
  email: string;
  is_active: boolean;
  nama_role: string;
};

type User = {
  id: number;
  nama_lengkap: string;
  username: string;
  email: string;
  is_active: boolean;
};

type Role = {
  id: number;
  nama_role: string;
};

export default function HakAksesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hakAkses, setHakAkses] = useState<HakAkses[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [form, setForm] = useState({
    id: null as number | null,
    id_user: '',
    id_roles: ''
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [hakAksesRes, usersRes, rolesRes] = await Promise.all([
        fetch('/api/hak-akses'),
        fetch('/api/users'), // Pastikan endpoint ini ada
        fetch('/api/roles')
      ]);
      
      const hakAksesData = await hakAksesRes.json();
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      setHakAkses(hakAksesData);
      setUsers(usersData); // Ambil data pengguna
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `/api/hak-akses/${form.id}` : '/api/hak-akses';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_user: Number(form.id_user),
          id_roles: Number(form.id_roles)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data');
      }
      
      handleClear();
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Gagal menyimpan data. Pastikan user belum memiliki hak akses atau data valid.');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await fetch(`/api/hak-akses/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  // Handle edit
  const handleEdit = (item: HakAkses) => {
    setForm({
      id: item.id,
      id_user: String(item.id_user),
      id_roles: String(item.id_role)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  // Clear form
  const handleClear = () => {
    setForm({ id: null, id_user: '', id_roles: '' });
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter hak akses
  const filteredHakAkses = hakAkses.filter(item => {
    const matchesSearch = (
      item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesRole = filterRole === 'all' || String(item.id_role) === filterRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex min-h-screen">
      <SidebarUniversal
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />
      
      <main className={`flex-1 p-4 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} mt-16 md:mt-0`}>
        {/* Mobile sidebar toggle button */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed top-2 left-2 z-30 bg-blue-600 text-white p-2 rounded shadow-lg"
        >
          {sidebarCollapsed ? '☰' : '✕'}
        </button>

        <div className="p-6">
          <h1 className="text-xl font-bold mb-4">Manajemen Hak Akses</h1>

          {/* Search and filter inputs */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Cari Nama Lengkap, Username atau Email"
                className="border p-2 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="border p-2"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">-- Semua Role --</option>
              {roles.map((r) => (
                <option key={`role-${r.id}`} value={r.id}>
                  {r.nama_role}
                </option>
              ))}
            </select>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-6 space-y-3 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">User </label>
                <select
                  value={form.id_user}
                  onChange={(e) => setForm({ ...form, id_user: e.target.value })}
                  required
                  className="border p-2 w-full"
                  disabled={!!form.id} // Disable when editing
                >
                  <option value="">-- Pilih User --</option>
                  {users.map((u) => (
                    <option key={`user-${u.id}`} value={u.id}>
                      {u.nama_lengkap} ({u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Role</label>
                <select
                  value={form.id_roles}
                  onChange={(e) => setForm({ ...form, id_roles: e.target.value })}
                  required
                  className="border p-2 w-full"
                >
                  <option value="">-- Pilih Role --</option>
                  {roles.map((r) => (
                    <option key={`role-${r.id}`} value={r.id}>
                      {r.nama_role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className={`px-4 py-2 rounded text-white ${
                  form.id ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {form.id ? 'Update' : 'Tambah'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Batal
              </button>
            </div>
          </form>

          <div className="mt-8">
            <HakAksesChart roles={roles} hakAkses={hakAkses} />
          </div>

          {/* Table */}
          <h2 className="text-lg font-bold mb-2">Daftar Hak Akses</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100 text-black dark:text-black">
                    <th className="border p-2">No</th>
                    <th className="border p-2">ID Hak Akses</th>
                    <th className="border p-2">Nama Lengkap User</th>
                    <th className="border p-2">Username</th>
                    <th className="border p-2">Email</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Role</th>
                    <th className="border p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHakAkses.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center p-4">
                        {hakAkses.length === 0 ? "Tidak ada data hak akses" : "Tidak ditemukan hasil pencarian"}
                      </td>
                    </tr>
                  )}
                  {filteredHakAkses.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2 text-center">{item.id}</td>
                      <td className="border p-2">{item.nama_lengkap}</td>
                      <td className="border p-2">{item.username}</td>
                      <td className="border p-2">{item.email}</td>
                      <td className="border p-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="border p-2">{item.nama_role}</td>
                      <td className="border p-2 space-x-1 text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
