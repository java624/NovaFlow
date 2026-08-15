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

// Generate stable unique UID in the safe range [1, MAX_REGULAR_UID].
// Values >= SCREEN_UID_OFFSET are reserved for screen-share secondary clients.
export function generateUid(userName?: string): number {
  if (userName) {
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      const char = userName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return (Math.abs(hash) % MAX_REGULAR_UID) + 1;
  }
  return Math.floor(Math.random() * MAX_REGULAR_UID) + 1;
}

// Screen share UID constant and detection helper
export const SCREEN_UID_OFFSET = 1_000_000_000;
/** Regular participants must stay below this so they are never mistaken for screen-share clients. */
export const MAX_REGULAR_UID = SCREEN_UID_OFFSET - 1;

export function isScreenShareUser(uid: number | string): boolean {
  const numericUid = Number(uid);
  // Screen-share clients join as baseUid + SCREEN_UID_OFFSET (always >= 1_000_000_000).
  // Regular UIDs are constrained to [1, MAX_REGULAR_UID] in generateUid().
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
