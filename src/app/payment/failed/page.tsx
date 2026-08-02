'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function FailedContent() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get('order') || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center space-y-6 animate-fadeIn">
        {/* Warning Icon */}
        <div className="w-20 h-20 bg-gradient-to-tr from-rose-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30 ring-8 ring-rose-500/20">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-full border border-rose-500/30 mb-3">
            Помилка платежу
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Оплату не завершено</h1>
          <p className="text-gray-300 text-sm mt-2">
            Транзакцію було скасовано або відхилено банком. Кошти з вашої картки не списувалися.
          </p>
        </div>

        {orderRef && (
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-rose-200 font-mono flex items-center justify-between">
            <span className="text-gray-400">ID замовлення:</span>
            <span className="font-semibold">{orderRef}</span>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <Link
            href="/dashboard?tab=payments"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-rose-600/25 transition-all transform hover:-translate-y-0.5"
          >
            🔄 Спробувати ще раз в кабінеті
          </Link>
          <Link
            href="/contact-support"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-gray-200 font-medium rounded-xl border border-white/10 transition-colors text-sm"
          >
            💬 Зв'язатися з підтримкою
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}
