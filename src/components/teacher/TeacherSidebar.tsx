'use client';

import Image from 'next/image';
import { Tab } from './types';

interface TeacherSidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  selectedStudentName?: string;
  selectedStudentAvatar?: string;
  sidebarOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function TeacherSidebar({
  activeTab,
  onTabChange,
  selectedStudentName,
  selectedStudentAvatar,
  sidebarOpen,
  onClose,
  onLogout,
}: TeacherSidebarProps) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Головна', icon: '📊' },
    { id: 'students', label: 'Мої Учні', icon: '👥' },
    { id: 'workspace', label: 'Робоча зона', icon: '🎯' },
    { id: 'comments', label: 'Відгуки сайту', icon: '💬' },
  ];

  const defaultAvatar = (name?: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Учень')}&background=5e077e&color=fff&size=80`;

  return (
    <>
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
            <Image src="/img/logo.svg" alt="NovaFlow" width={32} height={32} className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-gray-900 -mb-0.5">NovaFlow</span>
              <span className="text-[9px] font-semibold tracking-[0.15em] text-purple-600">TEACHER HUB</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 min-h-0 px-3 py-4 pb-20 space-y-0.5 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}

          {/* Selected student indicator */}
          {selectedStudentName && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50/50 rounded-xl">
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 border border-purple-200">
                  <img
                    src={selectedStudentAvatar || defaultAvatar(selectedStudentName)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="truncate">{selectedStudentName}</span>
              </div>
            </div>
          )}
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