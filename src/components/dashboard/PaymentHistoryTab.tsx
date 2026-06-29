'use client';

import { PaymentHistory } from './types';

interface PaymentHistoryTabProps {
  payments: PaymentHistory[];
  loading: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
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

function getStatusBadge(status: PaymentHistory['status']) {
  const config: Record<PaymentHistory['status'], { label: string; class: string }> = {
    pending: { label: 'Очікує', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    completed: { label: '✅ Сплачено', class: 'bg-green-50 text-green-700 border-green-200' },
    refunded: { label: '↩️ Повернення', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    failed: { label: '❌ Помилка', class: 'bg-red-50 text-red-700 border-red-200' },
    cancelled: { label: '🚫 Скасовано', class: 'bg-gray-50 text-gray-500 border-gray-200' },
  };
  return config[status];
}

function PaymentRow({ payment }: { payment: PaymentHistory }) {
  const badge = getStatusBadge(payment.status);
  
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
              {payment.plan_name}
            </h4>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${badge.class}`}>
              {badge.label}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>📚 {payment.lessons_purchased} уроків</span>
            {payment.receipt_number && (
              <span className="font-mono text-purple-600">🧾 {payment.receipt_number}</span>
            )}
            <span>🌐 {payment.learning_language}</span>
            <span>🕐 {formatDate(payment.created_at)}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-lg font-bold text-gray-900">
            {formatAmount(payment.amount_paid_cents, payment.currency)}
          </span>
          {payment.completed_at && payment.status === 'completed' && (
            <p className="text-xs text-green-600 mt-0.5">
              ✓ Завершено {formatDate(payment.completed_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentHistoryTab({ payments, loading }: PaymentHistoryTabProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Історія платежів порожня</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Тут будуть відображатися всі твої покупки уроків та підписки.
          Обери курс та зроби перший платіж, щоб розпочати навчання!
        </p>
      </div>
    );
  }

  // Group by status
  const completedPayments = payments.filter((p) => p.status === 'completed');
  const otherPayments = payments.filter((p) => p.status !== 'completed');

  return (
    <div className="space-y-4">
      {completedPayments.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Успішні платежі ({completedPayments.length})
          </h3>
          <div className="space-y-2">
            {completedPayments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      )}

      {otherPayments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            Інші операції ({otherPayments.length})
          </h3>
          <div className="space-y-2">
            {otherPayments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      )}

      <div className="text-center pt-4">
        <p className="text-xs text-gray-400">
          💳 Усі платежі здійснюються через захищений Stripe. Ваші дані в безпеці.
        </p>
      </div>
    </div>
  );
}