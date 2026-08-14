// Classroom DataChannel constant
export const CLASSROOM_DATA_CHANNEL_ID = 7;

// Helper to generate initials from username
export function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Generate stable unique UID
export function generateUid(userName?: string): number {
  if (userName) {
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      const char = userName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash) % 2147483647;
  }
  return Math.floor(Math.random() * 2147483647);
}

// Screen share UID constant and detection helper
export const SCREEN_UID_OFFSET = 1_000_000_000;

export function isScreenShareUser(uid: number | string): boolean {
  const numericUid = Number(uid);
  return Number.isFinite(numericUid) && numericUid >= SCREEN_UID_OFFSET;
}

interface AgoraTokenResponse {
  rtcToken?: string | null;
  error?: string;
}

export async function requestRtcToken(channelName: string, uid: number): Promise<string | null> {
  const response = await fetch(`/api/agora-token?channelName=${encodeURIComponent(channelName)}&uid=${uid}`);
  if (!response.ok) throw new Error(`Помилка сервера токенів (статус ${response.status}).`);
  const data = (await response.json()) as AgoraTokenResponse;
  if (data.error) throw new Error(data.error);
  return data.rtcToken ?? null;
}
