import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  let orderRef = req.nextUrl.searchParams.get('order') || req.nextUrl.searchParams.get('orderReference') || '';
  if (!orderRef) {
    try {
      const formData = await req.formData();
      orderRef = (formData.get('orderReference') || formData.get('order') || '').toString();
    } catch {
      // ignore
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://novaflow-school.com';
  const targetUrl = new URL('/payment/failed', siteUrl);
  if (orderRef) {
    targetUrl.searchParams.set('order', orderRef);
  }

  return NextResponse.redirect(targetUrl.toString(), 303);
}

export async function GET(req: NextRequest) {
  const orderRef = req.nextUrl.searchParams.get('order') || req.nextUrl.searchParams.get('orderReference') || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://novaflow-school.com';
  const targetUrl = new URL('/payment/failed', siteUrl);
  if (orderRef) {
    targetUrl.searchParams.set('order', orderRef);
  }

  return NextResponse.redirect(targetUrl.toString(), 303);
}
