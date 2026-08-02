import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Цей middleware:
 * 1. Оновлює токен сесії Supabase у куках між навігаціями.
 * 2. Обробляє POST-запити від WayForPay на /payment/success та /payment/failed,
 *    перетворюючи їх на GET-запити (303 See Other redirect), щоб уникнути помилки 404 у Next.js.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle POST redirects from WayForPay returnUrl / failedUrl
  if (request.method === 'POST' && (pathname === '/payment/success' || pathname === '/payment/failed')) {
    let orderRef = request.nextUrl.searchParams.get('order') || request.nextUrl.searchParams.get('orderReference') || '';
    
    if (!orderRef) {
      try {
        const formData = await request.formData();
        orderRef = (formData.get('orderReference') || formData.get('order') || '').toString();
      } catch {
        // ignore
      }
    }

    const redirectUrl = new URL(pathname, request.url);
    if (orderRef) {
      redirectUrl.searchParams.set('order', orderRef);
    }

    // 303 See Other forces browser to use GET method
    return NextResponse.redirect(redirectUrl, 303);
  }

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

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Виключаємо: статичні файли, зображення, favicon
     * Включаємо: всі сторінки додатку (/login, /dashboard, /teacher, /payment/* тощо)
     */
    '/((?!_next/static|_next/image|favicon.ico|img/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
