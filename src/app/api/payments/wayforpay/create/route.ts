import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function generateHmacMd5(data: string, key: string): string {
  return crypto.createHmac('md5', key).update(data, 'utf8').digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, lessonsCount, amount, planName, lang, currency = 'USD' } = body;

    if (!userId || amount === undefined || !lessonsCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT || 'novaflow_school_com';
    const secretKey = process.env.WAYFORPAY_SECRET_KEY || 'b85872d3530aae9339458de8e60a5496f7140fbd';
    const merchantDomainName = process.env.WAYFORPAY_MERCHANT_DOMAIN || 'novaflow-school.com';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://novaflow-school.com';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const paymentId = crypto.randomUUID();
    const cleanUserId = String(userId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const orderReference = `NF_ORD_${Date.now()}_${cleanUserId}`;
    const orderDate = Math.floor(Date.now() / 1000);

    const productName = `${lessonsCount} Lesson${lessonsCount > 1 ? 's' : ''} - ${planName}`;

    // WayForPay amount: if currency is USD convert to UAH (1 USD = 40 UAH approx) or if UAH use directly
    let amountUah = Number(amount);
    if (currency.toUpperCase() === 'USD') {
      amountUah = Math.round(Number(amount) * 40);
    }
    if (amountUah < 1) amountUah = 1;

    // Save pending transaction to Supabase
    const { error: dbError } = await supabase
      .from('payments_history')
      .insert([{
        id: paymentId,
        user_id: userId,
        order_reference: orderReference,
        stripe_session_id: orderReference, // backward compatibility
        plan_name: planName || 'Lessons Package',
        learning_language: lang || 'english',
        lessons_purchased: Number(lessonsCount),
        amount_paid_cents: Math.round(Number(amount) * 100),
        currency: currency.toLowerCase(),
        status: 'pending',
      }]);

    if (dbError) {
      console.error('Supabase DB insertion error:', dbError);
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }

    // WayForPay CREATE_INVOICE signature components
    const signatureComponents = [
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate,
      amountUah,
      'UAH',
      productName,
      1,
      amountUah
    ];

    const signatureString = signatureComponents.join(';');
    const merchantSignature = generateHmacMd5(signatureString, secretKey);

    const serviceUrl = `${siteUrl}/api/payments/wayforpay/callback`;
    const returnUrl = `${siteUrl}/api/payments/wayforpay/return-success?order=${orderReference}`;
    const failedUrl = `${siteUrl}/api/payments/wayforpay/return-failed?order=${orderReference}`;

    const wfpPayload = {
      transactionType: 'CREATE_INVOICE',
      merchantAccount,
      merchantAuthType: 'SimpleSignature',
      merchantDomainName,
      merchantSignature,
      apiVersion: 1,
      orderReference,
      orderDate,
      amount: amountUah,
      currency: 'UAH',
      productName: [productName],
      productPrice: [amountUah],
      productCount: [1],
      serviceUrl,
      returnUrl,
      failedUrl,
    };

    console.log('Sending invoice request to WayForPay:', { orderReference, amountUah, serviceUrl });

    const wfpResponse = await fetch('https://api.wayforpay.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wfpPayload),
    });

    const wfpData = await wfpResponse.json();
    console.log('WayForPay response:', wfpData);

    if (!wfpData.invoiceUrl) {
      return NextResponse.json({
        error: wfpData.reason || `WayForPay error: ${JSON.stringify(wfpData)}`,
        wfpData
      }, { status: 400 });
    }

    return NextResponse.json({
      url: wfpData.invoiceUrl,
      orderReference,
    });

  } catch (error: any) {
    console.error('Error in /api/payments/wayforpay/create:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
