import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PaymentHistory } from '@/components/dashboard/types';

export function useStudentPaymentHistory() {
  const supabase = createClient();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentPaymentHistory = useCallback(async (studentId: string) => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('payments_history')
        .select('*')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setPayments(data || []);
    } catch (err: unknown) {
      console.error('Error fetching student payment history:', err);
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити історію платежів');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    payments,
    loading,
    error,
    fetchStudentPaymentHistory,
  };
}
