'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);

  // =========================================================================
  // HANDLE LOGIN
  // =========================================================================
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ text: 'Будь ласка, введіть електронну пошту.', type: 'error' });
      return;
    }
    if (!password.trim()) {
      setMessage({ text: 'Будь ласка, введіть пароль.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: 'Перевірка даних...', type: 'info' });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage({ text: `Помилка входу: ${error.message}`, type: 'error' });
        return;
      }

      if (data.user) {
        setMessage({ text: 'Вхід успішний! Визначаємо роль користувача...', type: 'success' });

        // Fetch profile role using maybeSingle() — safer, no 406 error if profile doesn't exist
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError || !profile) {
          console.error('Profile fetch error:', profileError?.message);
          // If there's an error but user is authenticated, try teacher route as default
          router.push('/teacher');
          return;
        }

        // Instant redirect, no setTimeout — router.push is immediate
        if (profile.role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      setMessage({ text: `Помилка мережі: ${errorMessage}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [email, password, supabase]);

  // =========================================================================
  // HANDLE REGISTER
  // =========================================================================
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!fullName.trim()) {
      setMessage({ text: 'Будь ласка, введіть ваше ім\'я.', type: 'error' });
      return;
    }
    if (!email.trim()) {
      setMessage({ text: 'Будь ласка, введіть електронну пошту.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Пароль має містити щонайменше 6 символів.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: 'Реєстрація... Зачекайте.', type: 'info' });

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (authError) {
        setMessage({ text: `Помилка: ${authError.message}`, type: 'error' });
        return;
      }

      if (authData.user) {
        setMessage({ text: 'Успіх! Перенаправлення в кабінет...', type: 'success' });

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      setMessage({ text: `Критична помилка: ${errorMessage}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [email, password, fullName, supabase]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setMessage(null);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/img/logo.svg"
              alt="NovaFlow"
              width={40}
              height={40}
              className="w-10 h-10 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-xl font-bold text-gray-900 -mb-0.5">NovaFlow</span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-purple-600">
                LANGUAGE SCHOOL
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/50 border border-gray-100 p-8 sm:p-10">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Вхід
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Реєстрація
            </button>
          </div>

          {mode === 'login' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
              <p className="text-sm text-gray-500 mb-6">Вхід до твого мовного простору NovaFlow</p>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Електронна пошта
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Обробка...
                    </>
                  ) : (
                    'Увійти в кабінет'
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Ще немає акаунту?{' '}
                  <button
                    onClick={() => switchMode('register')}
                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Створити зараз
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
              <p className="text-sm text-gray-500 mb-6">Приєднуйся до NovaFlow та розпочни свій мовний шлях</p>

              <form onSubmit={handleRegister} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {`Повне ім'я`}
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Як вас звати?"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Електронна пошта
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Щонайменше 6 символів"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Мінімум 6 символів для безпеки</p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Реєстрація...
                    </>
                  ) : (
                    'Створити акаунт'
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Вже маєте акаунт?{' '}
                  <button
                    onClick={() => switchMode('login')}
                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Увійти
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Message */}
          {message && (
            <div
              className={`mt-6 px-4 py-3 rounded-xl text-sm font-medium transition-all animate-fadeIn ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'error' && <span>❌</span>}
                {message.type === 'success' && <span>✅</span>}
                {message.type === 'info' && (
                  <span className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                )}
                <span>{message.text}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-purple-600 transition-colors">
            ← Повернутися на головну
          </Link>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}