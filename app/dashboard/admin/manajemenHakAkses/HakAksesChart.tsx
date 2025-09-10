//app/dashboard/admin/manajemenHakAkses/HakAksesChart.tsx

"use client";

type Role = {
  id: number;
  nama_role: string;
};

type HakAkses = {
  id: number;
  id_role: number;
  nama_role: string;
};

interface HakAksesChartProps {
  roles: Role[];
  hakAkses: HakAkses[];
}

export default function HakAksesChart({ roles, hakAkses }: HakAksesChartProps) {
  const roleCounts = roles.map((role) => ({
    name: role.nama_role,
    value: hakAkses.filter((h) => h.id_role === role.id).length,
  }));

  const maxValue = Math.max(...roleCounts.map((r) => r.value), 1);

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors">
      <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">
        Distribusi Hak Akses per Role
      </h2>
      <div className="space-y-4">
        {roleCounts.map((role) => (
          <div key={role.name}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {role.name}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {role.value}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
              <div
                className="h-4 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(role.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
