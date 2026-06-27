'use client';

import { StudentProfile } from './types';

interface TeacherStudentsTabProps {
  students: StudentProfile[];
  onStudentClick: (student: StudentProfile) => void;
}

export default function TeacherStudentsTab({ students, onStudentClick }: TeacherStudentsTabProps) {
  const getStudentAvatarUrl = (s: StudentProfile) =>
    s.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name || s.first_name || 'Учень')}&background=5e077e&color=fff&size=80`;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-2">👥 Список активних учнів</h2>
      <p className="text-sm text-gray-500 mb-6">Оберіть учня, щоб перейти до керування розкладом та ДЗ.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left py-3 px-3 font-semibold text-gray-600">Учень</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-600">Залишок уроків</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-600">Дія</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-400">
                  Учнів поки немає.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img src={getStudentAvatarUrl(s)} alt={s.full_name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-medium text-gray-900">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700">
                      {s.lessons_left || 0} уроків
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onStudentClick(s)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl transition-all shadow-sm"
                    >
                      🎓 Керувати
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}