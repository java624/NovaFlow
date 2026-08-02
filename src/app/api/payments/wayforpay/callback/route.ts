import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function generateHmacMd5(data: string, key: string): string {
  return crypto.createHmac('md5', key).update(data, 'utf8').digest('hex');
}

export async function POST(req: Request) {
  try {
    let body: any;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      // Handle form-urlencoded body if sent by legacy acquirers
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
      // Parse JSON if single field payload
      if (typeof body === 'object' && Object.keys(body).length === 1) {
        try {
          const firstKey = Object.keys(body)[0];
          body = JSON.parse(firstKey);
        } catch {
          // ignore
        }
      }
    }

    console.log('Received WayForPay callback:', body);

    const secretKey = process.env.WAYFORPAY_SECRET_KEY || 'b85872d3530aae9339458de8e60a5496f7140fbd';
    const {
      merchantAccount,
      orderReference,
      amount,
      currency,
      authCode = '',
      cardPan = '',
      transactionStatus,
      reasonCode = '',
      reason = '',
      signature,
      recId,
      payMethod,
      createdDate
    } = body;

    if (!orderReference || !transactionStatus) {
      return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
    }

    // 1. CRITICAL SECURITY: Verify Signature
    const fieldsToSign = [
      merchantAccount,
      orderReference,
      amount,
      currency,
      authCode,
      cardPan,
      transactionStatus,
      reasonCode,
      reason
    ];
    const signatureString = fieldsToSign.join(';');
    const calculatedSignature = generateHmacMd5(signatureString, secretKey);

    if (signature && signature.toLowerCase() !== calculatedSignature.toLowerCase()) {
      console.error('WayForPay Callback Signature Mismatch!', {
        received: signature,
        calculated: calculatedSignature,
        signatureString
      });
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Find payment in database
    const { data: payment, error: pError } = await supabase
      .from('payments_history')
      .select('*')
      .or(`order_reference.eq.${orderReference},stripe_session_id.eq.${orderReference}`)
      .maybeSingle();

    if (pError) {
      console.error('DB Payment Lookup Error:', pError);
    }

    if (payment && transactionStatus === 'Approved') {
      // Check idempotency: if already completed, do not credit twice
      if (payment.status !== 'completed') {
        // Fetch student profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('lessons_left')
          .eq('id', payment.user_id)
          .single();

        const currentLessons = profile?.lessons_left ?? 0;
        const newLessons = currentLessons + (payment.lessons_purchased || 0);

        // Update student lessons balance
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ lessons_left: newLessons })
          .eq('id', payment.user_id);

        if (profileUpdateError) {
          console.error('Error updating user lessons balance:', profileUpdateError);
        } else {
          console.log(`Successfully credited ${payment.lessons_purchased} lessons to user ${payment.user_id}`);
        }

        // Update payment history record
        const { error: paymentUpdateError } = await supabase
          .from('payments_history')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            wayforpay_transaction_id: recId || payment.wayforpay_transaction_id,
            metadata: {
              ...(payment.metadata || {}),
              wayforpay_callback: body,
              recId,
              payMethod,
              createdDate,
              cardPan,
              authCode
            }
          })
          .eq('id', payment.id);

        if (paymentUpdateError) {
          console.error('Error updating payment record status:', paymentUpdateError);
        }
      } else {
        console.log(`Payment ${orderReference} is already completed. Idempotent skip.`);
      }
    } else if (payment && (transactionStatus === 'Declined' || transactionStatus === 'Expired')) {
      await supabase
        .from('payments_history')
        .update({
          status: 'failed',
          metadata: {
            ...(payment.metadata || {}),
            wayforpay_callback: body
          }
        })
        .eq('id', payment.id);
    }

    // 3. Prepare mandatory WayForPay Response
    const status = 'accept';
    const time = Math.floor(Date.now() / 1000);
    const responseSignatureString = `${orderReference};${status};${time}`;
    const responseSignature = generateHmacMd5(responseSignatureString, secretKey);

    const responsePayload = {
      orderReference,
      status,
      time,
      signature: responseSignature
    };

    console.log('Sending response to WayForPay callback:', responsePayload);
    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error: any) {
    console.error('WayForPay callback error:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 400 });
  }
}
