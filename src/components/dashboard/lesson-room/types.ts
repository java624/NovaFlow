export interface LessonRoomProps {
  channelName: string;
  onLeave: () => void;
  userName?: string;
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
