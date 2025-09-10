//app/dashboard/dosen/peminjamanSaya/page.tsx
"use client";

import FileUpload from "@/components/FileUpload";
import SidebarUniversal from "@/components/layout/SidebarUniversal";
import { useEffect, useState } from "react";

interface Peminjaman {
  id: number;
  ruangan: string;
  gedung: string;
  nama_kegiatan: string;
  waktu_peminjaman_mulai: string;
  waktu_peminjaman_selesai: string;
  surat_peminjaman?: string | null;
  status_peminjaman: string;
}

interface Ruangan {
  id: number;
  nama_ruangan: string;
  nama_gedung: string;
}

export default function PeminjamanSayaPage() {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [ruangan, setRuangan] = useState<Ruangan[]>([]);
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [oldFileToDelete, setOldFileToDelete] = useState<string>("");
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    id_ruangan: "",
    nama_kegiatan: "",
    waktu_peminjaman_mulai: "",
    waktu_peminjaman_selesai: "",
    surat_peminjaman: ""
  });
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // useEffect(() => {
  //   fetchRuangan();
  //   fetchPeminjaman();
  // }, []);
  
  useEffect(() => {
  fetchRuangan();
  fetchPeminjaman();
  
  // Baca dari query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDate = urlParams.get('date');
  
  if (selectedDate) {
    const date = new Date(selectedDate);
    const formattedDate = date.toISOString().slice(0, 16);
    
    setForm(prev => ({
      ...prev,
      waktu_peminjaman_mulai: formattedDate,
      waktu_peminjaman_selesai: formattedDate
    }));
  }
}, []);

  const fetchPeminjaman = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/peminjaman/saya", { credentials: "include" });
      const data = await res.json();
      setPeminjaman(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const fetchRuangan = async () => {
  try {
    const res = await fetch("/api/ruangan");
    const data = await res.json();

    // ⬇️ Filter hanya yang statusnya "tersedia"
    const availableRooms = data.filter((r: any) => r.status_ruangan === "tersedia");
    setRuangan(availableRooms);
  } catch (err) {
    console.error(err);
  }
};
  // const fetchRuangan = async () => {
  //   try {
  //     const res = await fetch("/api/ruangan");
  //     const data = await res.json();
  //     setRuangan(data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  
const handleFileUpload = (filePath: string) => {
  // Simpan file lama untuk nanti dihapus jika update berhasil
  if (form.surat_peminjaman && form.surat_peminjaman.startsWith('/uploads/')) {
    setOldFileToDelete(form.surat_peminjaman);
  }
  setUploadedFile(filePath);
  setForm(prev => ({ ...prev, surat_peminjaman: filePath }));
};

  const handleChange = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  function toLocalInputValue(isoString: string) {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); 
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

const handleEdit = (p: Peminjaman) => {
  if (p.status_peminjaman !== "menunggu persetujuan") {
    return alert("Hanya bisa edit jika status masih menunggu persetujuan");
  }

  const now = new Date();
  const duaHariSebelum = new Date(p.waktu_peminjaman_mulai);
  duaHariSebelum.setDate(duaHariSebelum.getDate() - 2);
  if (now > duaHariSebelum) return alert("Tidak bisa edit, H-2 sebelum acara");

  setEditingId(p.id);
  setForm({
    id_ruangan: ruangan.find(r => r.nama_ruangan === p.ruangan)?.id.toString() || "",
    nama_kegiatan: p.nama_kegiatan,
    waktu_peminjaman_mulai: toLocalInputValue(p.waktu_peminjaman_mulai),
    waktu_peminjaman_selesai: toLocalInputValue(p.waktu_peminjaman_selesai),
    surat_peminjaman: p.surat_peminjaman || ""
  });
};

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   const mulai = new Date(form.waktu_peminjaman_mulai);
//   const selesai = new Date(form.waktu_peminjaman_selesai);
//   const now = new Date();

//   // ❌ Tidak boleh booking hari ini / ke belakang
//   const besok = new Date();
//   besok.setHours(0, 0, 0, 0);
//   besok.setDate(besok.getDate() + 1);
//   if (mulai < besok) {
//     alert("Tanggal mulai minimal besok, tidak bisa hari ini atau ke belakang.");
//     return;
//   }

//   if (selesai <= mulai) {
//     alert("Tanggal selesai harus lebih besar dari tanggal mulai.");
//     return;
//   }

//   const payload = {
//     id: editingId,
//     id_ruangan: Number(form.id_ruangan),
//     nama_kegiatan: form.nama_kegiatan,
//     waktu_peminjaman_mulai: form.waktu_peminjaman_mulai,
//     waktu_peminjaman_selesai: form.waktu_peminjaman_selesai,
//     surat_peminjaman: form.surat_peminjaman
//   };

//   try {
//     const res = await fetch("/api/peminjaman/saya", {
//       method: editingId ? "PUT" : "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//       credentials: "include"
//     });
//     const data = await res.json();
//     if (res.ok) {
//       setEditingId(null);
//       setForm({ id_ruangan: "", nama_kegiatan: "", waktu_peminjaman_mulai: "", waktu_peminjaman_selesai: "", surat_peminjaman: "" });
//       fetchPeminjaman();
//     } else {
//       alert(data.error || "Gagal menyimpan");
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Terjadi kesalahan");
//   }
// };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const mulai = new Date(form.waktu_peminjaman_mulai);
  const selesai = new Date(form.waktu_peminjaman_selesai);
  const now = new Date();

  // ❌ Tidak boleh booking hari ini / ke belakang
  const besok = new Date();
  besok.setHours(0, 0, 0, 0);
  besok.setDate(besok.getDate() + 1);
  if (mulai < besok) {
    alert("Tanggal mulai minimal besok, tidak bisa hari ini atau ke belakang.");
    return;
  }

  if (selesai <= mulai) {
    alert("Tanggal selesai harus lebih besar dari tanggal mulai.");
    return;
  }

  const payload = {
    id: editingId,
    id_ruangan: Number(form.id_ruangan),
    nama_kegiatan: form.nama_kegiatan,
    waktu_peminjaman_mulai: form.waktu_peminjaman_mulai,
    waktu_peminjaman_selesai: form.waktu_peminjaman_selesai,
    surat_peminjaman: form.surat_peminjaman
  };

  try {
    const res = await fetch("/api/peminjaman/saya", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    });
    
    const data = await res.json();
    
    if (res.ok) {
      // Hapus file lama hanya jika update/pembuatan berhasil
      if (oldFileToDelete) {
        try {
          await fetch('/api/delete-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: oldFileToDelete })
          });
        } catch (deleteError) {
          console.error('Gagal menghapus file lama:', deleteError);
        }
        setOldFileToDelete("");
      }
      
      setEditingId(null);
      setForm({ id_ruangan: "", nama_kegiatan: "", waktu_peminjaman_mulai: "", waktu_peminjaman_selesai: "", surat_peminjaman: "" });
      fetchPeminjaman();
    } else {
      alert(data.error || "Gagal menyimpan");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan");
  }
};

const handleCancel = () => {
  setEditingId(null);
  setForm({ id_ruangan: "", nama_kegiatan: "", waktu_peminjaman_mulai: "", waktu_peminjaman_selesai: "", surat_peminjaman: "" });
  setOldFileToDelete(""); // Reset file yang mau dihapus
};

  const formatDatetime = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="flex min-h-screen">
      <SidebarUniversal collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <main className={`flex-1 p-4 transition-all duration-300 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"} mt-16 md:mt-0`}>
        <button onClick={toggleSidebar} className="md:hidden fixed top-2 left-2 z-30 bg-blue-600 text-white p-2 rounded">
          {sidebarCollapsed ? "☰" : "✕"}
        </button>

        <h1 className="text-xl font-bold mb-4">{editingId ? "Edit Pengajuan" : "Pengajuan Peminjaman"}</h1>

        {/* Formulir pengajuan */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-2xl">
          <div>
            <label className="block mb-1 font-semibold">Ruangan</label>
            <select value={form.id_ruangan} onChange={e => handleChange("id_ruangan", e.target.value)} className="border p-2 w-full rounded" required>
              <option value="">-- Pilih Ruangan --</option>
              {ruangan.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nama_ruangan} - {r.nama_gedung}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Nama Kegiatan</label>
            <input type="text" placeholder="Nama Kegiatan" value={form.nama_kegiatan} onChange={e => handleChange("nama_kegiatan", e.target.value)} className="border p-2 w-full rounded" required />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Waktu Mulai</label>
            <input type="datetime-local" value={form.waktu_peminjaman_mulai} onChange={e => handleChange("waktu_peminjaman_mulai", e.target.value)} className="border p-2 w-full rounded" required />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Waktu Selesai</label>
            <input type="datetime-local" value={form.waktu_peminjaman_selesai} onChange={e => handleChange("waktu_peminjaman_selesai", e.target.value)} className="border p-2 w-full rounded" required />
          </div>

          {/* <div>
            <label className="block mb-1 font-semibold">Surat (URL)</label>
            <input type="text" placeholder="Surat (URL)" value={form.surat_peminjaman} onChange={e => handleChange("surat_peminjaman", e.target.value)} className="border p-2 w-full rounded" />
          </div> */}
          <div>
            <label className="block mb-1 font-semibold">Surat Peminjaman</label>
            <FileUpload 
              onFileUpload={handleFileUpload} 
              existingFile={form.surat_peminjaman}
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Update" : "Ajukan"}</button>
            <button 
                type="button" 
                onClick={handleCancel} 
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Batal
              </button>
          </div>
        </form>

        {/* Tabel daftar peminjaman */}
        <h2 className="text-lg font-bold mb-2">Daftar Pengajuan Peminjaman</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100 text-black dark:text-black">
                <th className="border p-2">No</th>
                <th className="border p-2">Ruangan</th>
                <th className="border p-2">Gedung</th>
                <th className="border p-2">Kegiatan</th>
                <th className="border p-2">Mulai</th>
                <th className="border p-2">Selesai</th>
                <th className="border p-2">Surat</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {peminjaman.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">
                    Belum ada pengajuan
                  </td>
                </tr>
              ) : (
                peminjaman.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="border p-2 text-center">{idx + 1}</td>
                    <td className="border p-2">{p.ruangan}</td>
                    <td className="border p-2">{p.gedung}</td>
                    <td className="border p-2">{p.nama_kegiatan}</td>
                    <td className="border p-2">{formatDatetime(p.waktu_peminjaman_mulai)}</td>
                    <td className="border p-2">{formatDatetime(p.waktu_peminjaman_selesai)}</td>
                    <td className="border p-2">
                      {p.surat_peminjaman ? (
                        <a href={p.surat_peminjaman} target="_blank" className="text-blue-600 hover:underline">
                          Lihat
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border p-2">{p.status_peminjaman}</td>
                    <td className="border p-2">
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(p)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
