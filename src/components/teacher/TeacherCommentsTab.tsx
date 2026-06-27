'use client';

import { useState } from 'react';
import { Comment } from './types';

interface TeacherCommentsTabProps {
  comments: Comment[];
  onDelete: (id: string) => void;
  onSaveReply: (id: string, reply: string) => void;
}

function CommentCard({ comment, avatarUrl, dateFormatted, starIcons, onDelete, onSaveReply }: {
  comment: Comment; avatarUrl: string; dateFormatted: string; starIcons: string;
  onDelete: (id: string) => void; onSaveReply: (id: string, reply: string) => void;
}) {
  const [replyText, setReplyText] = useState(comment.teacher_reply || '');
  const [showInput, setShowInput] = useState(false);
  return (
    <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 min-w-0">
          <img src={avatarUrl} alt={comment.name} className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm">{comment.name}</h4>
            <div className="flex items-center gap-2 mt-0.5"><span className="text-xs text-gray-400">{dateFormatted}</span><span className="text-xs">{starIcons}</span></div>
            <p className="text-sm text-gray-700 mt-1.5">{comment.text}</p>
          </div>
        </div>
        <button onClick={() => onDelete(comment.id)} className="flex-shrink-0 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">Видалити</button>
      </div>
      <div className="mt-3 border-l-2 border-purple-200 pl-4">
        {comment.teacher_reply && !showInput && <div className="bg-purple-50 rounded-lg px-3 py-2 text-sm text-gray-700 mb-2"><strong className="text-purple-700">Ваша відповідь: </strong>{comment.teacher_reply}</div>}
        {showInput ? (
          <div className="flex gap-2">
            <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Напишіть відповідь..." className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200" autoFocus />
            <button onClick={() => { onSaveReply(comment.id, replyText); setShowInput(false); }} disabled={!replyText.trim()} className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg disabled:opacity-50">{comment.teacher_reply ? 'Оновити' : 'Відповісти'}</button>
            <button onClick={() => { setShowInput(false); setReplyText(comment.teacher_reply || ''); }} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg">Скасувати</button>
          </div>
        ) : (
          <button onClick={() => setShowInput(true)} className="text-xs font-medium text-purple-600">{comment.teacher_reply ? '✏️ Змінити' : '💬 Відповісти'}</button>
        )}
      </div>
    </div>
  );
}

export default function TeacherCommentsTab({ comments, onDelete, onSaveReply }: TeacherCommentsTabProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">💬 Відгуки</h2>
        <span className="text-sm text-gray-500">Усього: {comments.length}</span>
      </div>
      <p className="text-sm text-gray-500 mb-6">Тут ви можете відповідати на відгуки студентів та видаляти небажані.</p>
      {comments.length === 0 ? (
        <p className="text-center py-8 text-gray-400">Відгуків немає.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              avatarUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=5E077E&color=fff&rounded=true&size=64`}
              dateFormatted={new Date(c.created_at).toLocaleString('uk-UA')}
              starIcons={Array.from({ length: 5 }, (_, i) => i < (c.rating || 5) ? '⭐' : '☆').join('')}
              onDelete={onDelete}
              onSaveReply={onSaveReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}