// components/layout/SidebarUniversal.tsx
"use client";

import ThemeToggle from "@/components/theme/ThemeToggle";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarUniversalProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface Role {
  id: number;
  nama_role: string;
}

// role map: id → slug
const roleMap: Record<number, string> = {
  1: "admin",
  2: "dosen",
  3: "mahasiswa",
  4: "unit-kerja",
};

// helper slugify untuk fallback
const slugify = (str: string) =>
  str.toLowerCase().trim().replace(/\s+/g, "-");

const SidebarUniversal = ({ collapsed, setCollapsed }: SidebarUniversalProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRole, setCurrentRole] = useState<number | null>(null);

  // Ambil roles dari API saat pertama mount
  useEffect(() => {
    fetch("/api/auth/roles", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.roles) {
          setRoles(data.roles);

          // Sesuaikan currentRole dengan pathname
          const roleFromPath = Object.entries(roleMap).find(([id, slug]) =>
            pathname?.includes(slug)
          );
          setCurrentRole(roleFromPath ? Number(roleFromPath[0]) : data.roles[0]?.id);
        }
      })
      .catch((err) => console.error("Gagal ambil role:", err));
  }, [pathname]);

  // Update currentRole saat route berubah
  useEffect(() => {
    const roleFromPath = Object.entries(roleMap).find(([id, slug]) =>
      pathname?.includes(slug)
    );
    if (roleFromPath) setCurrentRole(Number(roleFromPath[0]));
  }, [pathname]);

  const redirectToDashboard = async (roleId: number) => {
    setCurrentRole(roleId);

    try {
      await fetch("/api/auth/select-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roles.find(r => r.id === roleId)?.nama_role || "" }),
      });
    } catch (error) {
      console.error("Gagal set role:", error);
    }

    router.push(`/dashboard/${roleMap[roleId]}`);
  };

  const handleLogout = async () => {
    if (!window.confirm("Apakah Anda yakin ingin logout?")) return;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  // Menu navigasi per role
  const menuItems: Record<number, { href: string; icon: string; label: string }[]> = {
    1: [
      { href: "/dashboard/admin", icon: "📊", label: "Dashboard" },
      { href: "/dashboard/admin/profile", icon: "👤", label: "Profile" },
      { href: "/dashboard/admin/manajemenUsers", icon: "👥", label: "Manajemen Pengguna" },
      { href: "/dashboard/admin/manajemenRegistrasi", icon: "📝", label: "Manajemen Registrasi" },
      { href: "/dashboard/admin/manajemenGedung", icon: "🏢", label: "Manajemen Gedung" },
      { href: "/dashboard/admin/manajemenRuangan", icon: "🚪", label: "Manajemen Ruangan" },
      { href: "/dashboard/admin/manajemenRoles", icon: "🔑", label: "Manajemen Role" },
      { href: "/dashboard/admin/manajemenHakAkses", icon: "🛡️", label: "Manajemen Hak Akses" },
      { href: "/dashboard/admin/manajemenPeminjaman", icon: "📅", label: "Manajemen Peminjaman" },
      { href: "/dashboard/admin/manajemenRiwayatPeminjaman", icon: "📋", label: "Riwayat Peminjaman" },
    ],
    2: [
      { href: "/dashboard/dosen", icon: "📊", label: "Dashboard" },
      { href: "/dashboard/dosen/profile", icon: "👤", label: "Profile" },
      { href: "/dashboard/dosen/peminjamanSaya", icon: "📅", label: "Peminjaman Saya" },
    ],
    3: [
      { href: "/dashboard/mahasiswa", icon: "📊", label: "Dashboard" },
      { href: "/dashboard/mahasiswa/profile", icon: "👤", label: "Profile" },
      { href: "/dashboard/mahasiswa/peminjamanSaya", icon: "📅", label: "Peminjaman Saya" },
    ],
    4: [
      { href: "/dashboard/unit-kerja", icon: "📊", label: "Dashboard" },
      { href: "/dashboard/unit-kerja/profile", icon: "👤", label: "Profile" },
      { href: "/dashboard/unit-kerja/peminjamanSaya", icon: "📅", label: "Peminjaman Saya" },
    ],
  };

  return (
    <aside className={`h-full bg-blue-600 dark:bg-blue-800 text-white p-4 fixed transition-all duration-300 z-40 ${collapsed ? "w-16" : "w-64"} flex flex-col overflow-hidden`}>
      {/* Tombol toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)} 
        className="mb-4 text-white hover:bg-blue-700 dark:hover:bg-blue-900 p-2 rounded flex items-center justify-center w-full"
      >
        {collapsed ? "☰" : "✕"}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-2 mb-6 ${collapsed ? "justify-center" : ""}`}>
        <Image src="/Logo-PNC.png" alt="Logo PNC" width={40} height={40} className="min-w-[40px]" />
        {!collapsed && (
          <h1 className="text-lg font-semibold whitespace-nowrap leading-tight">Sistem Peminjaman</h1>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="list-none p-0 space-y-2">
          {currentRole && menuItems[currentRole]?.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={`flex items-center gap-3 p-2 hover:bg-blue-700 dark:hover:bg-blue-900 rounded ${collapsed ? "justify-center" : ""}`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Dropdown ganti role */}
      {roles.length > 1 && !collapsed && (
        <select
          value={currentRole ?? ""}
          onChange={(e) => redirectToDashboard(Number(e.target.value))}
          className="w-full bg-blue-700 dark:bg-blue-900 text-white p-2 rounded text-sm mt-4"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>{role.nama_role}</option>
          ))}
        </select>
      )}

      {/* Theme Toggle & Logout */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-center">
          <ThemeToggle collapsed={collapsed} />
        </div>
        
        <button
          onClick={handleLogout}
          className={`bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center ${
            collapsed ? "p-2 w-10 h-10" : "py-2 px-3 gap-2 w-full"
          }`}
        >
          <span className="text-lg">🚪</span>
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default SidebarUniversal;
