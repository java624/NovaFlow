import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * Безпечний API-роут видалення учня.
 * Дозволений лише для авторизованих користувачів з роллю 'teacher'.
 * Видаляє всі пов'язані дані учня та акаунт з Supabase Auth.
 */
export async function POST(request: NextRequest) {
  try {
    // ── 1. Авторизація: отримуємо сесію користувача через cookies ──────────
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user: currentUser },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !currentUser) {
      return NextResponse.json(
        { error: 'Не авторизовано. Увійдіть у систему.' },
        { status: 401 }
      );
    }

    // ── 2. Перевірка ролі: лише викладач може видаляти учнів ────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Профіль не знайдено.' },
        { status: 403 }
      );
    }

    if (profile.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Доступ заборонено. Лише викладач може видаляти учнів.' },
        { status: 403 }
      );
    }

    // ── 3. Отримуємо studentId з тіла запиту ────────────────────────────────
    const body = await request.json().catch(() => ({}));
    const studentId = body?.studentId as string | undefined;

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return NextResponse.json(
        { error: 'Відсутній обов\'язковий параметр: studentId' },
        { status: 400 }
      );
    }

    // ── 4. Перевіряємо, що цільовий користувач є учнем (не викладачем) ──────
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', studentId)
      .maybeSingle();

    if (targetError) {
      console.error('[DeleteStudent] Помилка перевірки цільового профілю:', targetError);
      return NextResponse.json(
        { error: 'Помилка перевірки профілю учня.' },
        { status: 500 }
      );
    }

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Учня з таким ID не знайдено.' },
        { status: 404 }
      );
    }

    if (targetProfile.role === 'teacher') {
      return NextResponse.json(
        { error: 'Не можна видалити профіль викладача через цей роут.' },
        { status: 403 }
      );
    }

    // ── 5. Створюємо Supabase Admin Client (service_role) для каскадного видалення ──
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // ── 6. Каскадне очищення даних учня у правильному порядку ────────────────
    const deletionSteps: string[] = [];

    // 6.1. Домашні завдання учня
    const { error: homeworksError } = await supabaseAdmin
      .from('homeworks')
      .delete()
      .eq('student_id', studentId);
    if (homeworksError) {
      console.error('[DeleteStudent] Помилка видалення homeworks:', homeworksError);
      return NextResponse.json(
        { error: `Помилка видалення домашніх завдань: ${homeworksError.message}` },
        { status: 500 }
      );
    }
    deletionSteps.push('homeworks');

    // 6.2. Уроки учня (як student_id, так і teacher_id — на випадок, якщо учень був викладачем)
    const { error: lessonsError } = await supabaseAdmin
      .from('lessons')
      .delete()
      .or(`student_id.eq.${studentId},teacher_id.eq.${studentId}`);
    if (lessonsError) {
      console.error('[DeleteStudent] Помилка видалення lessons:', lessonsError);
      return NextResponse.json(
        { error: `Помилка видалення уроків: ${lessonsError.message}` },
        { status: 500 }
      );
    }
    deletionSteps.push('lessons');

    // 6.3. Історія платежів (payments_history має ON DELETE CASCADE на auth.users,
    //      але видаляємо явно для надійності)
    const { error: paymentsError } = await supabaseAdmin
      .from('payments_history')
      .delete()
      .eq('user_id', studentId);
    if (paymentsError) {
      console.error('[DeleteStudent] Помилка видалення payments_history:', paymentsError);
      return NextResponse.json(
        { error: `Помилка видалення історії платежів: ${paymentsError.message}` },
        { status: 500 }
      );
    }
    deletionSteps.push('payments_history');

    // 6.4. Профіль учня
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', studentId);
    if (profileDeleteError) {
      console.error('[DeleteStudent] Помилка видалення profiles:', profileDeleteError);
      return NextResponse.json(
        { error: `Помилка видалення профілю: ${profileDeleteError.message}` },
        { status: 500 }
      );
    }
    deletionSteps.push('profiles');

    // ── 7. Видаляємо акаунт з Supabase Auth ──────────────────────────────────
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(studentId);

    if (deleteUserError) {
      console.error('[DeleteStudent] Помилка видалення auth user:', deleteUserError);
      return NextResponse.json(
        { error: `Помилка видалення акаунту: ${deleteUserError.message}` },
        { status: 500 }
      );
    }
    deletionSteps.push('auth_user');

    console.log(
      `[DeleteStudent] Успішно видалено учня ${studentId} (${targetProfile.full_name || 'без імені'}). Кроки: ${deletionSteps.join(', ')}`
    );

    return NextResponse.json({
      success: true,
      message: 'Учня успішно видалено з системи',
      deletedSteps: deletionSteps,
    });
  } catch (err: unknown) {
    console.error('[DeleteStudent] Критична помилка:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}