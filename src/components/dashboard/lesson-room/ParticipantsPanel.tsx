'use client';

export interface ParticipantInfo {
  uid: number | string;
  name: string;
  isLocal: boolean;
  isMuted: boolean;
  isTeacher?: boolean;
  isHandRaised?: boolean;
}

interface ParticipantsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: ParticipantInfo[];
  isTeacher: boolean;
  onMuteAll: () => void;
  onMuteUser: (uid: number | string) => void;
  onKickUser: (uid: number | string) => void;
}

/**
 * Sidebar listing everyone in the room. Regular participants just see the list.
 * The teacher additionally gets a "Mute all" action plus per-participant
 * mute / kick buttons.
 *
 * Important: Agora's client SDK has no built-in permission model to force-mute
 * or force-remove a peer — this works cooperatively via signaling (a data-stream
 * message the target client listens for and acts on itself). That's the standard
 * approach for this kind of classroom moderation and is handled in the parent
 * component (LessonRoom.tsx).
 */
export default function ParticipantsPanel({
  isOpen,
  onClose,
  participants,
  isTeacher,
  onMuteAll,
  onMuteUser,
  onKickUser,
}: ParticipantsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full sm:w-96 z-[130] bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 flex flex-col shadow-2xl animate-[fade-in-up_0.2s_ease-out]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h3 className="font-semibold text-sm tracking-wide text-zinc-100">
          👥 Учасники ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white text-lg leading-none px-1"
          aria-label="Закрити список учасників"
        >
          ✕
        </button>
      </div>

      {isTeacher && (
        <div className="px-5 py-3 border-b border-white/10">
          <button
            onClick={onMuteAll}
            className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-zinc-100 text-xs font-medium py-2 transition-colors"
          >
            🔇 Вимкнути мікрофони всім
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
        {participants.map((p) => (
          <div
            key={String(p.uid)}
            className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-white/5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-sm ${p.isMuted ? 'text-zinc-500' : 'text-emerald-400'}`}>
                {p.isMuted ? '🔇' : '🎤'}
              </span>
              <span className="text-sm text-zinc-100 truncate">
                {p.name}
                {p.isLocal && ' (Ви)'}
              </span>
              {p.isHandRaised && <span title="Піднята рука" className="text-base leading-none">✋</span>}
              {p.isTeacher && (
                <span className="text-[10px] uppercase tracking-wide bg-indigo-500/20 text-indigo-300 rounded-md px-1.5 py-0.5 shrink-0">
                  Вчитель
                </span>
              )}
            </div>

            {isTeacher && !p.isLocal && (
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => onMuteUser(p.uid)}
                  className="text-[11px] bg-white/10 hover:bg-white/20 text-zinc-200 rounded-lg px-2 py-1 transition-colors"
                  title="Вимкнути мікрофон"
                >
                  Mute
                </button>
                <button
                  onClick={() => onKickUser(p.uid)}
                  className="text-[11px] bg-rose-700/70 hover:bg-rose-600 text-white rounded-lg px-2 py-1 transition-colors"
                  title="Видалити з кімнати"
                >
                  Kick
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
