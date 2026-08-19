'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Files } from 'lucide-react';
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

  const getStatusDetails = () => {
    if (stats.usedPercent > 85) {
      return {
        barColor: 'from-red-500 to-rose-600',
        pulseBg: 'bg-red-500',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        text: 'Критичний обсяг',
      };
    }
    if (stats.usedPercent > 65) {
      return {
        barColor: 'from-amber-500 to-orange-500',
        pulseBg: 'bg-amber-500',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'Помірне заповнення',
      };
    }
    return {
      barColor: 'from-purple-600 to-indigo-600',
      pulseBg: 'bg-emerald-500',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      text: 'Оптимальний стан',
    };
  };

  const status = getStatusDetails();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/60 shadow-lg shadow-purple-500/5 space-y-4 relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/20 border border-purple-200/50 flex items-center justify-center text-purple-700 shadow-sm">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Використання Сховища Supabase</h3>
              {/* Pulsing Status Dot */}
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.pulseBg} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.pulseBg}`} />
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Безкоштовний ліміт: 1 GB (1024 MB)</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${status.badgeBg}`}>
            {status.text}
          </span>
          <div className="text-right">
            <span className="text-sm font-extrabold text-gray-900">{loading ? '...' : stats.usedMb} MB</span>
            <span className="text-xs text-gray-400"> / 1024 MB</span>
          </div>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="relative z-10">
        <div className="w-full bg-gray-100/80 h-3 rounded-full overflow-hidden p-0.5 border border-gray-200/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(stats.usedPercent, 2)}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full rounded-full bg-gradient-to-r ${status.barColor} shadow-sm relative overflow-hidden`}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5 relative z-10">
        <span className="flex items-center gap-1.5">
          <Files className="w-3.5 h-3.5 text-gray-400" />
          Завантажено файлів: <strong className="text-gray-800 font-bold">{stats.totalFiles}</strong>
        </span>
        <span className="font-bold text-purple-700">{stats.usedPercent}% використано</span>
      </div>
    </motion.div>
  );
}
