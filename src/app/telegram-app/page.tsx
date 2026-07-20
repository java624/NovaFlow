'use client';

import { useEffect, useState } from 'react';

export default function TelegramMiniApp() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Підключаємо Telegram WebApp SDK
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand(); // Розгортаємо вікно на увесь екран
      setUser(tg.initDataUnsafe?.user);
    }
  }, []);

  return (
    <div className="min-h-screen text-white relative flex flex-col items-center justify-between p-6 bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-500 overflow-hidden">
      
      {/* Плитка з водяними знаками (логотипами) на фоні */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('/img/logo-pattern.png')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 120px',
        }}
      />

      {/* Шапка / Вміст Mini App */}
      <div className="relative z-10 w-full max-w-md text-center mt-4">
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-md">
          NovaFlow School 🚀
        </h1>
        <p className="mt-2 text-pink-100 text-sm">
          {user ? `Вітаємо, ${user.first_name}!` : 'Особистий кабінет'}
        </p>

        {/* Картка з балансом або інформацією */}
        <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl text-left">
          <h2 className="text-xl font-bold mb-2">📊 Твій кабінет</h2>
          <p className="text-sm text-gray-200">
            Тут відображаються твої уроки, розклад та нагадування в фірмовому стилі NovaFlow.
          </p>
        </div>
      </div>

      {/* Футер або додаткові кнопки */}
      <div className="relative z-10 w-full max-w-md text-center mb-4">
        <button 
          onClick={() => (window as any).Telegram?.WebApp?.close()}
          className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30 text-white font-semibold rounded-xl transition"
        >
          Закрити
        </button>
      </div>

    </div>
  );
}