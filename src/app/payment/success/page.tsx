'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get('order') || searchParams.get('session_id') || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center space-y-6 animate-fadeIn">
        {/* Animated Checkmark */}
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-500/20 animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30 mb-3">
            WayForPay Confirmed
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Оплата Успішна!</h1>
          <p className="text-gray-300 text-sm mt-2">
            Дякуємо за покупку. Ваші уроки зараховано на баланс та доступні в кабінеті.
          </p>
        </div>

        {orderRef && (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-purple-200 font-mono flex items-center justify-between">
            <span className="text-gray-400">ID замовлення:</span>
            <span className="font-semibold">{orderRef}</span>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <Link
            href="/dashboard?tab=payments&payment=success"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
          >
            🎓 Перейти в особистий кабінет
          </Link>
          <Link
            href="/languages/english"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-gray-200 font-medium rounded-xl border border-white/10 transition-colors text-sm"
          >
            🏫 На головну / До курсів
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
