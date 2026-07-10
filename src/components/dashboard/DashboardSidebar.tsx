'use client';

import { Tab } from './types';

interface DashboardSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  hasLessons: boolean;
  sidebarOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const SIDEBAR_TABS: { id: Tab; label: string; icon: string; locked?: boolean }[] = [
  { id: 'dashboard', label: 'Головна', icon: '📊' },
  { id: 'lessons', label: 'Заняття', icon: '🎓', locked: true },
  { id: 'homework', label: 'Домашні завдання', icon: '📖', locked: true },
  { id: 'materials', label: 'Матеріали', icon: '📂', locked: true },
  { id: 'payments', label: 'Оплата', icon: '💳' },
  { id: 'profile', label: 'Мій профіль', icon: '⚙️' },
];

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  hasLessons,
  sidebarOpen,
  onClose,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => (window.location.href = '/')}>
            <img src="/img/logo.svg" alt="NovaFlow" className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-gray-900 -mb-0.5">NovaFlow</span>
              <span className="text-[9px] font-semibold tracking-[0.15em] text-purple-600">STUDENT HUB</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 px-3 py-4 pb-20 space-y-0.5 overflow-y-auto">
          {SIDEBAR_TABS.map((tab) => {
            const isLocked = tab.locked && !hasLessons;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isLocked) {
                    alert('Оплати курс, щоб розблокувати цей розділ!');
                    onTabChange('payments');
                  } else {
                    onTabChange(tab.id);
                  }
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-700 shadow-sm'
                    : isLocked
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {isLocked && <span className="ml-auto text-[10px] text-gray-400">🔒</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout — absolutely pinned to the bottom of the fixed sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <span>🚪</span>
            <span>Вийти</span>
          </button>
        </div>
      </aside>
    </>
  );
}
