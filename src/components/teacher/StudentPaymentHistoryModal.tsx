'use client';

import React, { useEffect } from 'react';
import { StudentProfile } from './types';
import { useStudentPaymentHistory } from './hooks/useStudentPaymentHistory';
import { PaymentHistory } from '@/components/dashboard/types';

interface StudentPaymentHistoryModalProps {
  student: StudentProfile | null;
  visible: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(2);
  const symbols: Record<string, string> = {
    usd: '$',
    eur: '€',
    uah: '₴',
    gbp: '£',
  };
  const sym = symbols[currency.toLowerCase()] || currency.toUpperCase() + ' ';
  return `${sym}${amount}`;
}

function getStatusBadge(status: PaymentHistory['status'] | string) {
  const st = String(status).toLowerCase();
  if (st === 'completed' || st === 'paid' || st === 'approved') {
    return { label: '🟢 Успішно', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (st === 'pending') {
    return { label: '🟡 В очікуванні', class: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  return { label: '🔴 Відхилено', class: 'bg-rose-50 text-rose-700 border-rose-200' };
}

export default function StudentPaymentHistoryModal({
  student,
  visible,
  onClose,
}: StudentPaymentHistoryModalProps) {
  const { payments, loading, error, fetchStudentPaymentHistory } = useStudentPaymentHistory();

  useEffect(() => {
    if (visible && student?.id) {
      fetchStudentPaymentHistory(student.id);
    }
  }, [visible, student?.id, fetchStudentPaymentHistory]);

  if (!visible || !student) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative border border-purple-100/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors text-lg"
          title="Закрити"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">
            💳
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Історія платежів: {student.full_name || student.first_name || 'Учень'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Перегляд транзакцій WayForPay та поповнень балансу
            </p>
          </div>
        </div>

        {/* Body / Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl text-sm border border-rose-200 text-center">
              ⚠️ {error}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-5xl mb-3">📭</div>
              <h3 className="text-base font-bold text-gray-900">Платежів ще немає</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Цей учень ще не здійснював покупок пакетів уроків або тестових платежів через WayForPay.
              </p>
            </div>
          ) : (
            payments.map((payment) => {
              const badge = getStatusBadge(payment.status);
              const orderRef = payment.order_reference || payment.stripe_session_id || payment.id;
              const wfpId = payment.wayforpay_transaction_id;

              return (
                <div
                  key={payment.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">
                        {payment.plan_name || 'Пакет уроків'}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.class}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>📚 {payment.lessons_purchased} уроків</span>
                      <span>🌐 {payment.learning_language}</span>
                      <span>🕐 {formatDate(payment.created_at)}</span>
                    </div>

                    <div className="text-xs font-mono text-purple-600 truncate max-w-md">
                      🆔 ID: {orderRef}
                      {wfpId && <span className="ml-2 text-gray-400">(WFP: {wfpId})</span>}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-50">
                    <span className="text-lg font-extrabold text-gray-900">
                      {formatAmount(payment.amount_paid_cents, payment.currency)}
                    </span>
                    {payment.completed_at && payment.status === 'completed' && (
                      <p className="text-[10px] text-emerald-600 font-medium">
                        ✓ {formatDate(payment.completed_at)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>🔒 Доступ лише для читання (Read-only)</span>
          <button
            onClick={onClose}
            className="px-5 py-2 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-xs"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
