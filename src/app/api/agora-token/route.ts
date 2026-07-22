import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelName = searchParams.get('channelName');
    const uidParam = searchParams.get('uid');

    if (!channelName) {
      return NextResponse.json(
        { error: 'Missing required parameter: channelName' },
        { status: 400 }
      );
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE?.trim();

    if (!appId) {
      console.error('[Agora Token] Missing NEXT_PUBLIC_AGORA_APP_ID in env');
      return NextResponse.json(
        { error: 'Вкажіть змінні середовища NEXT_PUBLIC_AGORA_APP_ID та AGORA_APP_CERTIFICATE у налаштуваннях Netlify (Site settings -> Environment variables)' },
        { status: 200 }
      );
    }

    // Parse UID — if not provided or invalid, use 0 (Agora will auto-assign)
    const uid = uidParam ? Number(uidParam) : 0;
    const uidNumber = Number.isFinite(uid) && uid >= 0 ? uid : 0;

    // Token expires in 3600 seconds (1 hour)
    const tokenExpire = 3600;
    const privilegeExpire = 3600;

    let rtcToken: string | null = null;

    // Check if appCertificate is valid (32-character hex) and not placeholder
    const isValidCertificate =
      appCertificate &&
      appCertificate !== 'ваш_app_certificate' &&
      /^[0-9a-fA-F]{32}$/.test(appCertificate);

    if (isValidCertificate) {
      try {
        rtcToken = RtcTokenBuilder.buildTokenWithUid(
          appId,
          appCertificate,
          channelName,
          uidNumber,
          RtcRole.PUBLISHER,
          tokenExpire,
          privilegeExpire
        );
        console.log(
          `[Agora Token] Generated token for channel="${channelName}" uid=${uidNumber}`
        );
      } catch (err) {
        console.error('[Agora Token] Failed building token with certificate:', err);
      }
    } else {
      console.warn(
        `[Agora Token] AGORA_APP_CERTIFICATE is not configured or is placeholder ("${appCertificate}"). Operating in App ID testing mode (token = null).`
      );
    }

    return NextResponse.json({
      rtcToken: rtcToken || null,
      hasValidCertificate: isValidCertificate,
      channelName,
      uid: uidNumber,
      appId,
    });
  } catch (error) {
    console.error('[Agora Token] Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate Agora token' },
      { status: 500 }
    );
  }
}