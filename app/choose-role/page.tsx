//app/choose-role/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Role {
  id: number;
  nama_role: string;
}

const slugify = (str: string) =>
  str.toLowerCase().trim().replace(/\s+/g, "-");

export default function ChooseRolePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    fetch("/api/auth/roles", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.roles) {
          setRoles(data.roles);
          if (data.roles.length === 1) {
            handleSelectRole(data.roles[0].nama_role);
          }
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleSelectRole = async (roleName: string) => {
    const roleSlug = slugify(roleName);

    await fetch("/api/auth/select-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: roleName }),
    });

    router.push(`/dashboard/${roleSlug}`);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Pilih Peran Anda</h1>
      <div className="flex gap-4 flex-wrap justify-center">
        {roles.map((role) => (
          <button
            key={role.id}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            onClick={() => handleSelectRole(role.nama_role)}
          >
            {role.nama_role}
          </button>
        ))}
      </div>
    </main>
  );
}
