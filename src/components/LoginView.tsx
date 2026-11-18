import React, { useRef } from 'react';
import { Droplets, ArrowRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { PREFIXES, USER_TYPES } from '../data/hemoData';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginViewProps {
  userType: string;
  prefix: string;
  name: string;
  isGoogleAuthed: boolean;
  googleEmail: string | null;
  isLoggingInGoogle: boolean;
  onChangeUserType: (val: string) => void;
  onChangePrefix: (val: string) => void;
  onChangeName: (val: string) => void;
  onGoogleSignIn: () => void;
  onSubmit: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  userType,
  prefix,
  name,
  isGoogleAuthed,
  googleEmail,
  isLoggingInGoogle,
  onChangeUserType,
  onChangePrefix,
  onChangeName,
  onGoogleSignIn,
  onSubmit,
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      nameInputRef.current?.focus();
      return;
    }
    onSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#F4F7FB] dark:bg-[#0B121C]">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Left Clinical Brand Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1565C0] to-[#2B7DE9] text-white p-8 sm:p-10 flex flex-col justify-between gap-8">
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#1565C0] flex items-center justify-center shadow-xs">
              <Droplets className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                HemoGuide
              </h1>
              <p className="text-blue-100 text-base leading-relaxed">
                แม่นยำทุกการเจาะ ลดความคลาดเคลื่อน ยกระดับความปลอดภัย
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/20 text-sm text-blue-50">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-200" />
              <span>ค้นหาชนิดหลอดและลำดับการเก็บเลือด (Order of Draw) ตามมาตรฐาน</span>
            </div>
            <div className="flex items-start gap-2.5">
              <FileSpreadsheet className="w-4 h-4 shrink-0 mt-0.5 text-blue-200" />
              <span>บันทึกผลการตรวจ คะแนน Pre/Post-test และผลประเมินลง Google Sheets</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-7 p-6 sm:p-10 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
              เข้าสู่ระบบผู้ใช้งาน
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ระบุข้อมูลผู้ปฏิบัติงานเพื่อบันทึกประวัติการตรวจและคะแนน
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                ประเภทผู้ใช้
              </label>
              <div className="flex flex-wrap gap-2">
                {USER_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChangeUserType(t)}
                    className={`min-h-[42px] px-4 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      userType === t
                        ? 'border-[#1565C0] bg-blue-50 dark:bg-blue-950/50 text-[#1565C0] dark:text-blue-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B121C] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                คำนำหน้า
              </label>
              <div className="flex flex-wrap gap-2">
                {PREFIXES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChangePrefix(p)}
                    className={`min-h-[42px] px-4 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      prefix === p
                        ? 'border-[#1565C0] bg-blue-50 dark:bg-blue-950/50 text-[#1565C0] dark:text-blue-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B121C] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="user-fullname"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
              >
                ชื่อผู้ใช้ (ชื่อ-นามสกุล)
              </label>
              <input
                ref={nameInputRef}
                id="user-fullname"
                type="text"
                value={name}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B121C] text-slate-900 dark:text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-600/40"
              />
            </div>

            {/* Optional Google Sign-In at login */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    เชื่อมต่อ Google Sheets (เลือกทำตอนนี้หรือภายหลังได้)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {isGoogleAuthed && googleEmail
                      ? `เชื่อมต่อแล้ว: ${googleEmail}`
                      : 'เข้าสู่ระบบ Google เพื่อเตรียมบันทึกผลลงสเปรดชีต'}
                  </div>
                </div>
                {!isGoogleAuthed && (
                  <GoogleSignInButton
                    onClick={onGoogleSignIn}
                    disabled={isLoggingInGoogle}
                    label={isLoggingInGoogle ? 'กำลังเชื่อมต่อ...' : 'Sign in with Google'}
                  />
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white font-display font-semibold text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>เข้าสู่ระบบ</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
