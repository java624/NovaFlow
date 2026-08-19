'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getStorageStats } from '@/lib/materialsSupabase';

export default function StorageUsageWidget() {
  const supabase = createClient();
  const [stats, setStats] = useState<{ usedMb: string; usedPercent: number; totalFiles: number }>({
    usedMb: '0',
    usedPercent: 0,
    totalFiles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const res = await getStorageStats(supabase);
      setStats(res);
      setLoading(false);
    }
    loadStats();
  }, [supabase]);

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center text-lg">
            💾
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Використання Сховища Supabase</h3>
            <p className="text-[11px] text-gray-400">Безкоштовний ліміт: 1 GB (1024 MB)</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-extrabold text-gray-900">{loading ? '...' : stats.usedMb} MB</span>
          <span className="text-[11px] text-gray-400"> / 1024 MB</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            stats.usedPercent > 85 ? 'bg-red-500' : stats.usedPercent > 65 ? 'bg-amber-500' : 'bg-purple-600'
          }`}
          style={{ width: `${Math.max(stats.usedPercent, 2)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
        <span>Завантажено файлів: <strong className="text-gray-800">{stats.totalFiles}</strong></span>
        <span className="font-semibold text-purple-700">{stats.usedPercent}% використано</span>
      </div>
    </div>
  );
}
