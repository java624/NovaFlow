'use client';

import { StudentProfile } from './types';

interface DashboardHeaderProps {
  profile: StudentProfile | null;
  onMenuToggle: () => void;
}

export function getAvatarUrl(profile: StudentProfile | null): string {
  return profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'User')}&background=5e077e&color=fff&size=158`;
}

export default function DashboardHeader({ profile, onMenuToggle }: DashboardHeaderProps) {
  const avatarUrl = getAvatarUrl(profile);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Mobile hamburger */}


        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            {profile?.full_name ? `Welcome back, ${profile.full_name} 👋` : 'Welcome back! 👋'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Твій мовний потік активний. Продовжуй у тому ж дусі!</p>
        </div>

        {profile && (
          <img
            src={avatarUrl}
            alt={profile.full_name}
            className="w-10 h-10 rounded-full ring-2 ring-purple-100 object-cover flex-shrink-0"
          />
        )}
      </div>
    </header>
  );
}
