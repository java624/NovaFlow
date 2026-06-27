import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Цей middleware НЕ виконує жодних редіректів на основі ролей.
 * Його єдина задача — оновлювати токен сесії Supabase у куках між
 * навігаціями. Без нього @supabase/ssr не може зберігати сесію
 * між серверними запитами і getUser() повертає null.
 *
 * Захист конкретних маршрутів за роллю залишається у клієнтському
 * коді кожної сторінки (verifySession у teacher/page.tsx тощо).
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Оновлюємо куки у запиті та відповіді
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Оновлюємо токен сесії (якщо потрібно) — без перевірки ролей
  // ВАЖЛИВО: не виконуємо жодної іншої логіки між createServerClient та getUser
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Виключаємо: статичні файли, зображення, favicon
     * Включаємо: всі сторінки додатку (/login, /dashboard, /teacher тощо)
     */
    '/((?!_next/static|_next/image|favicon.ico|img/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
