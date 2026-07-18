'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useScrollReveal } from '@/components/hooks/useScrollReveal';

export default function PlatformShowcase() {
  const { t } = useLanguage();
  const headerRef = useScrollReveal<HTMLDivElement>();
  const contentRef = useScrollReveal<HTMLDivElement>();

  // Main tab state: 'student' or 'teacher'
  const [activePortal, setActivePortal] = useState<'student' | 'teacher'>('student');

  // Interactive states inside Student Mockup
  const [selectedHwAnswer, setSelectedHwAnswer] = useState<number | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeStudentFeature, setActiveStudentFeature] = useState(0);

  // Interactive states inside Teacher Mockup
  const [activeTeacherFeature, setActiveTeacherFeature] = useState(0);
  const [selectedTeacherStudent, setSelectedTeacherStudent] = useState<'helen' | 'max' | 'alex'>('helen');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [typedFeedback, setTypedFeedback] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState<string[]>([]);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedFeedback.trim()) {
      setSubmittedFeedback([typedFeedback.trim(), ...submittedFeedback]);
      setTypedFeedback('');
    }
  };

  // Student features list
  const studentFeatures = [
    {
      id: 0,
      title: t('platform_student_f1_title'),
      desc: t('platform_student_f1_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
        </svg>
      )
    },
    {
      id: 1,
      title: t('platform_student_f2_title'),
      desc: t('platform_student_f2_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="m22 8-6 4 6 4V8Z" />
          <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('platform_student_f3_title'),
      desc: t('platform_student_f3_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10M6 10h10" />
        </svg>
      )
    },
    {
      id: 3,
      title: t('platform_student_f4_title'),
      desc: t('platform_student_f4_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      )
    }
  ];

  // Teacher features list
  const teacherFeatures = [
    {
      id: 0,
      title: t('platform_teacher_f1_title'),
      desc: t('platform_teacher_f1_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 1,
      title: t('platform_teacher_f2_title'),
      desc: t('platform_teacher_f2_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      )
    },
    {
      id: 2,
      title: t('platform_teacher_f3_title'),
      desc: t('platform_teacher_f3_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      )
    },
    {
      id: 3,
      title: t('platform_teacher_f4_title'),
      desc: t('platform_teacher_f4_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scale-102 {
          transform: scale(1.02);
        }
        .reveal-active-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #8B5CF6;
          border-radius: 0 4px 4px 0;
        }
      `}} />
      <section id="platform" className="py-20 sm:py-28 bg-gradient-to-b from-purple-50/40 via-white to-purple-50/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-purple-600 uppercase bg-purple-100/60 px-4 py-1.5 rounded-full inline-block mb-4 shadow-sm border border-purple-200">
            {t('platform_tag')}
          </span>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight"
            dangerouslySetInnerHTML={{ __html: t('platform_title') }}
          />
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
            {t('platform_desc')}
          </p>
        </div>

        {/* Portal Switch Tabs */}
        <div className="flex justify-center mb-10 sm:mb-16">
          <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center shadow-inner border border-gray-200/50">
            <button
              onClick={() => setActivePortal('student')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                activePortal === 'student'
                  ? 'bg-white text-purple-700 shadow-md scale-102'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <span>{t('platform_tab_student')}</span>
            </button>
            
            <button
              onClick={() => setActivePortal('teacher')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                activePortal === 'teacher'
                  ? 'bg-white text-purple-700 shadow-md scale-102'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{t('platform_tab_teacher')}</span>
            </button>
          </div>
        </div>

        {/* Portal Showcase Area */}
        <div ref={contentRef} className="reveal grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Features description */}
          <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
            {activePortal === 'student' ? (
              studentFeatures.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => setActiveStudentFeature(feature.id)}
                  className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeStudentFeature === feature.id
                      ? 'bg-white border-purple-200 shadow-lg translate-x-2'
                      : 'bg-transparent border-transparent hover:bg-white/50 hover:border-purple-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      activeStudentFeature === feature.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                        : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-base sm:text-lg transition-colors ${
                        activeStudentFeature === feature.id ? 'text-purple-900' : 'text-gray-800'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm sm:text-base text-gray-500 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              teacherFeatures.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => setActiveTeacherFeature(feature.id)}
                  className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeTeacherFeature === feature.id
                      ? 'bg-white border-purple-200 shadow-lg translate-x-2'
                      : 'bg-transparent border-transparent hover:bg-white/50 hover:border-purple-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      activeTeacherFeature === feature.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                        : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-base sm:text-lg transition-colors ${
                        activeTeacherFeature === feature.id ? 'text-purple-900' : 'text-gray-800'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-sm sm:text-base text-gray-500 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Stunning Interactive Device Mockup */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex justify-center w-full">
            <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl p-3 sm:p-4 shadow-2xl border-4 border-slate-800/80 shadow-purple-900/10">
              
              {/* Top notch detail for device look */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-32 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span className="w-12 h-1 bg-slate-700 rounded-full"></span>
              </div>

              {/* Inner screen content */}
              <div className="relative bg-gray-50 rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col font-sans select-none border border-slate-700/10">
                
                {/* Simulated App Header */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-200">
                      N
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-gray-900">NovaFlow Space</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      v1.4
                    </span>
                  </div>
                  
                  {/* Mock User Details */}
                  <div className="flex items-center gap-2.5">
                    <span className="hidden sm:inline text-xs font-bold text-gray-600">
                      {activePortal === 'student' ? 'Helen (Student)' : 'Kyrylo (Teacher)'}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-purple-600 border border-white text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {activePortal === 'student' ? 'H' : 'K'}
                    </div>
                  </div>
                </div>

                {/* Simulated Dashboard Grid */}
                <div className="p-3 sm:p-5 flex-1 overflow-y-auto space-y-4">
                  
                  {/* STUDENT PORTAL VIEWS */}
                  {activePortal === 'student' && (
                    <>
                      {/* Active balance banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl p-4 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/10" />
                          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                            {t('platform_mock_balance')}
                          </p>
                          <h4 className="text-2xl font-black mt-1">8 / 10</h4>
                          <span className="text-[10px] text-purple-100 block mt-2">
                            {t('platform_mock_next_lesson')}
                          </span>
                        </div>

                        {/* Quick assessment level */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                              Current level
                            </p>
                            <h4 className="text-2xl font-black text-purple-600 mt-1">B2.1</h4>
                            <span className="text-[10px] text-gray-500 block mt-2">
                              Intermediate Speaker
                            </span>
                          </div>
                          <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-purple-600 flex items-center justify-center font-bold text-sm text-purple-700 animate-pulse">
                            84%
                          </div>
                        </div>
                      </div>

                      {/* Interactive Section depending on activeStudentFeature state */}
                      <div className="transition-all duration-500">
                        {/* FEATURE 0: Interactive Scheduling */}
                        {activeStudentFeature === 0 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h5 className="font-bold text-xs sm:text-sm text-gray-800 mb-3 flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                              </svg>
                              Book Next Lesson
                            </h5>
                            
                            <div className="grid grid-cols-3 gap-2">
                              {['Mon 19:00', 'Wed 18:00', 'Fri 19:00'].map((time) => (
                                <button
                                  key={time}
                                  onClick={() => setSelectedTimeSlot(time)}
                                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                                    selectedTimeSlot === time
                                      ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                                      : 'bg-purple-50/50 border-purple-100 text-purple-700 hover:bg-purple-100/50'
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                            
                            {selectedTimeSlot && (
                              <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] sm:text-xs text-emerald-800 font-medium text-center animate-fade-in">
                                🎉 Lesson confirmed for {selectedTimeSlot}! Calendar invite sent.
                              </div>
                            )}
                          </div>
                        )}

                        {/* FEATURE 1: Virtual Classroom */}
                        {activeStudentFeature === 1 && (
                          <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800 text-white relative">
                            {/* Live status banner */}
                            <div className="bg-purple-600 text-white px-3 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                {t('platform_badge_live')}
                              </span>
                              <span>Room #28</span>
                            </div>

                            {/* Camera Grid Simulation */}
                            <div className="grid grid-cols-2 gap-1.5 p-2">
                              {/* Teacher Video */}
                              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                                <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-semibold text-purple-300">
                                  Teacher (Kyrylo)
                                </div>
                                {/* Simple animated waveform to mock voice */}
                                <div className="flex gap-0.5 items-end h-8">
                                  <span className="w-1 bg-purple-500 rounded-full animate-bounce h-5" style={{ animationDelay: '0.1s' }} />
                                  <span className="w-1 bg-purple-400 rounded-full animate-bounce h-8" style={{ animationDelay: '0.3s' }} />
                                  <span className="w-1 bg-purple-600 rounded-full animate-bounce h-4" style={{ animationDelay: '0.5s' }} />
                                  <span className="w-1 bg-purple-500 rounded-full animate-bounce h-6" style={{ animationDelay: '0.2s' }} />
                                </div>
                              </div>

                              {/* Student Video */}
                              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                                <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-semibold text-gray-300">
                                  Student (Helen)
                                </div>
                                {isVideoOff ? (
                                  <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 6v12l-3.34-2.23" /><line x1="1" x2="23" y1="1" y2="23" />
                                  </svg>
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                    H
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Live whiteboard / doc mockup */}
                            <div className="px-2 pb-2">
                              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wide mb-1">Interactive Board</p>
                                <p className="text-[11px] text-slate-300 italic font-mono bg-slate-950 p-1.5 rounded border border-slate-800/60">
                                  Kyrylo: "Helen, please rewrite: 'If I will win, I would buy a car'."
                                </p>
                              </div>
                            </div>

                            {/* Meeting Control Buttons */}
                            <div className="bg-slate-900 px-3 py-2 flex items-center justify-center gap-3">
                              {/* Mic Button */}
                              <button
                                onClick={() => setIsVideoMuted(!isVideoMuted)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isVideoMuted ? 'bg-rose-600 text-white' : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                                }`}
                              >
                                {isVideoMuted ? (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <line x1="1" x2="23" y1="1" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                                  </svg>
                                )}
                              </button>

                              {/* Camera Button */}
                              <button
                                onClick={() => setIsVideoOff(!isVideoOff)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
                                }`}
                              >
                                {isVideoOff ? (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /><line x1="1" x2="23" y1="1" y2="23" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                                  </svg>
                                )}
                              </button>

                              {/* Hang Up Mock */}
                              <button className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full transition-all shadow-sm">
                                End Lesson
                              </button>
                            </div>
                          </div>
                        )}

                        {/* FEATURE 2: Smart Homework & Vocab */}
                        {activeStudentFeature === 2 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3.5">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                              <h5 className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                                </svg>
                                {t('platform_mock_hw_title')}
                              </h5>
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                                Pending Check
                              </span>
                            </div>

                            {/* Multiple choice simulation */}
                            <div className="bg-purple-50/40 p-3 rounded-lg border border-purple-100/50">
                              <p className="text-xs font-bold text-purple-950 mb-2">
                                Q1: {t('platform_mock_hw_question')}
                              </p>
                              
                              <div className="space-y-2">
                                <button
                                  onClick={() => setSelectedHwAnswer(1)}
                                  className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                                    selectedHwAnswer === 1
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-purple-200'
                                  }`}
                                >
                                  <span className="inline-block w-4 h-4 rounded-full border border-gray-300 mr-2 text-center text-[10px] leading-4 text-emerald-600 font-bold bg-white">
                                    {selectedHwAnswer === 1 ? '✓' : 'A'}
                                  </span>
                                  {t('platform_mock_hw_opt1')}
                                </button>

                                <button
                                  onClick={() => setSelectedHwAnswer(2)}
                                  className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                                    selectedHwAnswer === 2
                                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-purple-200'
                                  }`}
                                >
                                  <span className="inline-block w-4 h-4 rounded-full border border-gray-300 mr-2 text-center text-[10px] leading-4 text-rose-600 font-bold bg-white">
                                    {selectedHwAnswer === 2 ? '✗' : 'B'}
                                  </span>
                                  {t('platform_mock_hw_opt2')}
                                </button>
                              </div>

                              {selectedHwAnswer === 1 && (
                                <p className="text-[11px] font-bold text-emerald-700 mt-2 flex items-center gap-1 animate-pulse">
                                  🎉 {t('platform_mock_hw_status')}
                                </p>
                              )}
                              {selectedHwAnswer === 2 && (
                                <p className="text-[11px] font-bold text-rose-700 mt-2">
                                  Try again! Hint: Use first conditional for future possibilities.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* FEATURE 3: Speaking Progress */}
                        {activeStudentFeature === 3 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
                            <h5 className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20V10M18 20V4M6 20v-6" />
                              </svg>
                              Speaking Performance Trend
                            </h5>

                            {/* Custom bar chart simulation */}
                            <div className="h-28 flex items-end gap-5 sm:gap-7 justify-center pt-2">
                              {[
                                { week: 'W1', value: 'h-[35%]', label: '55%' },
                                { week: 'W2', value: 'h-[50%]', label: '65%' },
                                { week: 'W3', value: 'h-[75%]', label: '80%' },
                                { week: 'W4', value: 'h-[90%]', label: '92%' }
                              ].map((bar, i) => (
                                <div key={i} className="flex flex-col items-center flex-1 max-w-[42px] group">
                                  <span className="text-[10px] font-bold text-purple-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {bar.label}
                                  </span>
                                  <div className={`w-full ${bar.value} bg-gradient-to-t from-purple-600 to-fuchsia-400 rounded-t-lg shadow-sm group-hover:shadow-md transition-all duration-500`}></div>
                                  <span className="text-[10px] font-semibold text-gray-400 mt-2">
                                    {bar.week}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-center text-gray-500 italic mt-1">
                              Weekly interactive speaking score (CEFR benchmark mapping)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Vocabulary builder mini widget */}
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-2">
                          <span className="font-bold text-xs text-gray-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            {t('platform_mock_vocab_title')}
                          </span>
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                            +12 Learned
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { word: 'resilience', tr: 'стійкість' },
                            { word: 'ubiquitous', tr: 'всюдисущий' },
                            { word: 'compelling', tr: 'переконливий' }
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="group/vocab bg-purple-50/30 hover:bg-purple-600 hover:text-white border border-purple-100/60 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-purple-800 transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{item.word}</span>
                              <span className="text-[10px] font-medium text-purple-400 group-hover/vocab:text-purple-200">
                                ({item.tr})
                              </span>
                              <svg className="w-3 h-3 text-purple-400 group-hover/vocab:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path d="M15.536 8.464a5 5 0 0 1 0 7.072M18.364 5.636a9 9 0 0 1 0 12.728M12 18.25V5.75L7.25 10H4.75v4h2.5L12 18.25z" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mock Chat with Teacher */}
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-2">
                        <span className="font-bold text-xs text-gray-800 block border-b border-gray-50 pb-2">
                          Direct Chat
                        </span>
                        
                        <div className="space-y-2.5 text-xs">
                          {/* Teacher Message */}
                          <div className="flex gap-2 items-start">
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              K
                            </div>
                            <div className="bg-purple-50/80 p-2 rounded-2xl rounded-tl-none text-purple-950 font-medium max-w-[80%]">
                              {t('platform_mock_teacher_msg')}
                            </div>
                          </div>
                          
                          {/* Student Message */}
                          <div className="flex gap-2 items-start justify-end">
                            <div className="bg-white border border-gray-150 p-2 rounded-2xl rounded-tr-none text-gray-700 font-medium max-w-[80%] text-right shadow-sm">
                              {t('platform_mock_student_msg')}
                            </div>
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              H
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}


                  {/* TEACHER PORTAL VIEWS */}
                  {activePortal === 'teacher' && (
                    <>
                      {/* Teacher stats banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white rounded-xl p-4 shadow-md relative overflow-hidden transition-all duration-300">
                          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/10" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                            Active Students
                          </p>
                          <h4 className="text-2xl font-black mt-1">24 Active</h4>
                          <span className="text-[10px] text-purple-200 block mt-2">
                            6 classes scheduled for today
                          </span>
                        </div>

                        {/* Calendar Quick Stats */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Weekly Lessons
                            </p>
                            <h4 className="text-2xl font-black text-indigo-600 mt-1">38 Hours</h4>
                            <span className="text-[10px] text-gray-500 block mt-2">
                              98% attendance rating
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Section depending on activeTeacherFeature state */}
                      <div className="transition-all duration-500">
                        {/* FEATURE 0: Unified Student Profiles */}
                        {activeTeacherFeature === 0 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h5 className="font-bold text-xs sm:text-sm text-gray-800 mb-3 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              Student Directory
                            </h5>
                            
                            {/* Mock Student Directory Selection */}
                            <div className="space-y-2">
                              {[
                                { id: 'helen', name: 'Helen Mitchell', lang: 'English', bal: '8 left', level: 'B2.1' },
                                { id: 'max', name: 'Max Schumann', lang: 'German', bal: '15 left', level: 'A2.3' },
                                { id: 'alex', name: 'Alex Johnson', lang: 'Ukrainian', bal: '3 left', level: 'B1.2' }
                              ].map((stud) => (
                                <div
                                  key={stud.id}
                                  onClick={() => setSelectedTeacherStudent(stud.id as 'helen' | 'max' | 'alex')}
                                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                                    selectedTeacherStudent === stud.id
                                      ? 'bg-purple-50 border-purple-300 shadow-sm'
                                      : 'bg-white border-gray-150 hover:border-purple-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                                      {stud.name[0]}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-800">{stud.name}</p>
                                      <p className="text-[10px] text-gray-400">{stud.lang} • Level {stud.level}</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-full">
                                    {stud.bal}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* FEATURE 1: Smart Calendar Builder */}
                        {activeTeacherFeature === 1 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h5 className="font-bold text-xs sm:text-sm text-gray-800 mb-3 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                              </svg>
                              Teacher Schedule Coordinator
                            </h5>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {[
                                { day: 'Monday', time: '10:00 - 11:30', status: 'Booked by Helen' },
                                { day: 'Monday', time: '14:00 - 15:00', status: 'Available' },
                                { day: 'Tuesday', time: '11:00 - 12:00', status: 'Booked by Max' },
                                { day: 'Tuesday', time: '19:00 - 20:00', status: 'Available' }
                              ].map((slot, i) => (
                                <div key={i} className="bg-purple-50/30 p-2.5 rounded-lg border border-purple-100/60">
                                  <p className="font-bold text-purple-950">{slot.day}</p>
                                  <p className="text-[10px] text-purple-700 mt-0.5">{slot.time}</p>
                                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 ${
                                    slot.status.includes('Booked')
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-850'
                                  }`}>
                                    {slot.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* FEATURE 2: Interactive Materials Assigner */}
                        {activeTeacherFeature === 2 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                            <h5 className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>
                              Assign Learning Material
                            </h5>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-3 text-left font-bold text-purple-800 transition-all flex items-center gap-2">
                                <span>📝 Conditional Exercises</span>
                              </button>
                              <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-3 text-left font-bold text-purple-800 transition-all flex items-center gap-2">
                                <span>📖 Idioms & Slang List</span>
                              </button>
                              <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-3 text-left font-bold text-purple-800 transition-all flex items-center gap-2">
                                <span>🎧 Audio Listening task</span>
                              </button>
                              <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-3 text-left font-bold text-purple-800 transition-all flex items-center gap-2">
                                <span>✍️ Essay Template A2</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* FEATURE 3: Direct Feedback Center */}
                        {activeTeacherFeature === 3 && (
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                            <h5 className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                              Submit Lesson Feedback
                            </h5>

                            <form onSubmit={handleFeedbackSubmit} className="space-y-2">
                              <textarea
                                value={typedFeedback}
                                onChange={(e) => setTypedFeedback(e.target.value)}
                                placeholder="Type performance summary for Helen..."
                                className="w-full text-xs p-2 rounded-lg border border-gray-250 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                rows={2}
                              />
                              <div className="flex justify-end">
                                <button
                                  type="submit"
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                >
                                  Submit Report
                                </button>
                              </div>
                            </form>

                            {submittedFeedback.length > 0 && (
                              <div className="space-y-2 mt-2 pt-2 border-t border-gray-100">
                                <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wide">Recent Feedback Reports</p>
                                {submittedFeedback.map((report, idx) => (
                                  <div key={idx} className="bg-purple-50/50 p-2 rounded border border-purple-100 text-[11px] text-purple-950 font-medium">
                                    {report}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                </div>
                
                {/* Simulated Mock Cabinet Bottom Bar */}
                <div className="bg-white border-t border-gray-200 px-4 py-3 text-center z-10">
                  <a
                    href="/login"
                    className="w-full justify-center inline-flex items-center gap-1.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-200/50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    <span>{t('platform_cta_button')}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
    </>
  );
}
