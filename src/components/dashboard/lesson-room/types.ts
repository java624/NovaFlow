export interface LessonRoomProps {
  channelName: string;
  onLeave: () => void;
  userName?: string;
  /** NEW: 'teacher' unlocks moderation (mute all / mute one / kick) and poll creation. Defaults to 'student'. */
  userRole?: 'teacher' | 'student';
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSelf: boolean;
}

export interface ControlButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  activeClass: string;
  inactiveClass: string;
}

// NEW: shared directory entry describing a peer's display name + role,
// built from broadcast PROFILE messages (Agora UIDs alone carry no name/role).
export interface ParticipantProfile {
  name: string;
  role: 'teacher' | 'student';
}
