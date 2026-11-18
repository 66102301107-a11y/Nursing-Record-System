import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Hand,
} from 'lucide-react';
import { TUBES, TubeKey } from '../data/hemoData';

interface TubeInversionDemoProps {
  tubeKeys: TubeKey[];
  selectedTubeKey: TubeKey;
  autoPlaySignal: number;
  onSelectTube: (key: TubeKey) => void;
}

function getTargetInversions(mixStr: string): number {
  const match = mixStr.match(/\d+/g);
  if (!match || match.length === 0) return 8;
  return Number(match[match.length - 1]);
}

export const TubeInversionDemo: React.FC<TubeInversionDemoProps> = ({
  tubeKeys,
  selectedTubeKey,
  autoPlaySignal,
  onSelectTube,
}) => {
  const tube = TUBES[selectedTubeKey];
  const targetCount = getTargetInversions(tube.mix);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isInverted, setIsInverted] = useState(false);
  const [count, setCount] = useState(0);
  const [isManualStepping, setIsManualStepping] = useState(false);
  const timerRefs = useRef<number[]>([]);

  const clearTimers = () => {
    timerRefs.current.forEach((id) => window.clearTimeout(id));
    timerRefs.current = [];
  };

  // Reset counter when tube changes
  useEffect(() => {
    clearTimers();
    setIsPlaying(false);
    setIsInverted(false);
    setCount(0);
    setIsManualStepping(false);
  }, [selectedTubeKey]);

  // Trigger autoplay when user clicks "สาธิตการพลิก" on a tube card
  useEffect(() => {
    if (autoPlaySignal > 0) {
      clearTimers();
      setIsInverted(false);
      setCount(0);
      setIsManualStepping(false);
      setIsPlaying(true);
    }
  }, [autoPlaySignal]);

  // Auto-inversion loop (0° -> 180° -> 0° = 1 gentle inversion)
  useEffect(() => {
    if (!isPlaying) return;

    if (count >= targetCount) {
      setIsPlaying(false);
      setIsInverted(false);
      return;
    }

    const t1 = window.setTimeout(() => {
      setIsInverted(true);
    }, 120);

    const t2 = window.setTimeout(() => {
      setIsInverted(false);
    }, 880);

    const t3 = window.setTimeout(() => {
      setCount((c) => c + 1);
    }, 1620);

    timerRefs.current = [t1, t2, t3];
    return () => clearTimers();
  }, [isPlaying, count, targetCount]);

  const handleTogglePlay = () => {
    if (isManualStepping) return;
    if (isPlaying) {
      clearTimers();
      setIsPlaying(false);
      setIsInverted(false);
    } else {
      if (count >= targetCount) {
        setCount(0);
      }
      setIsPlaying(true);
    }
  };

  const handleManualFlip = () => {
    if (isPlaying || isManualStepping) return;
    clearTimers();
    setIsManualStepping(true);
    setIsInverted(true);

    const tBack = window.setTimeout(() => {
      setIsInverted(false);
    }, 700);

    const tDone = window.setTimeout(() => {
      setCount((c) => c + 1);
      setIsManualStepping(false);
    }, 1400);

    timerRefs.current = [tBack, tDone];
  };

  const handleReset = () => {
    clearTimers();
    setIsPlaying(false);
    setIsInverted(false);
    setIsManualStepping(false);
    setCount(0);
  };

  const completed = count >= targetCount;
  const isCultureBottle = selectedTubeKey === 'cult';

  return (
    <section
      aria-label="สาธิตการพลิกผสมเลือดในหลอด"
      className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1565C0] dark:text-blue-400 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
              สาธิตการพลิกเลือด (Gentle Inversion 180°)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              พลิกหลอดกลับหัว 180° และตั้งตรงกลับ 1 รอบ = นับ 1 ครั้ง อย่างนุ่มนวล
            </p>
          </div>
        </div>

        {/* Tube selector buttons if multiple tubes are active */}
        {tubeKeys.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {tubeKeys.map((key) => {
              const t = TUBES[key];
              const active = key === selectedTubeKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectTube(key)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'border-[#1565C0] bg-blue-50 dark:bg-blue-950/50 text-[#1565C0] dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: t.color }}
                    aria-hidden="true"
                  />
                  <span>{t.shortName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Interactive Rotation Stage */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-4">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {tube.shortName}
            </span>
            <span className="font-mono font-semibold text-[#1565C0] dark:text-blue-400">
              {isInverted ? '180° (คว่ำหลอด)' : '0° (ตั้งตรง)'}
            </span>
          </div>

          {/* Rotation Ring + Animated Blood Tube */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Circular guide ring & directional arcs */}
            <svg
              viewBox="0 0 180 180"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <circle
                cx="90"
                cy="90"
                r="76"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="text-slate-300 dark:text-slate-700"
              />
              {/* Right arc arrow (0 -> 180) */}
              <path
                d="M 142 36 A 76 76 0 0 1 142 144"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className={`transition-opacity duration-300 ${
                  isInverted
                    ? 'text-[#1565C0] dark:text-blue-400 opacity-100'
                    : 'text-slate-300 dark:text-slate-700 opacity-60'
                }`}
              />
              {/* Left arc arrow (180 -> 0) */}
              <path
                d="M 38 144 A 76 76 0 0 1 38 36"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className={`transition-opacity duration-300 ${
                  !isInverted && (isPlaying || isManualStepping)
                    ? 'text-emerald-600 dark:text-emerald-400 opacity-100'
                    : 'text-slate-300 dark:text-slate-700 opacity-60'
                }`}
              />
            </svg>

            {/* Rotating Tube Container (compositor transform only) */}
            <div
              className="w-16 h-28 flex items-center justify-center will-change-transform"
              style={{
                transform: isInverted ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 650ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {isCultureBottle ? (
                <svg viewBox="0 0 44 74" className="w-full h-full drop-shadow-sm">
                  <rect x="13" y="2" width="18" height="7.5" rx="2.5" fill={tube.color} />
                  <rect x="15" y="9.5" width="14" height="4" rx="1" fill="#94a3b8" />
                  <path
                    d="M15 13.5 L15 20 L8.5 27 L8.5 63 C8.5 67 11.5 70 15.5 70 L28.5 70 C32.5 70 35.5 67 35.5 63 L35.5 27 L29 20 L29 13.5 Z"
                    fill="#ffffff"
                    fillOpacity="0.92"
                    stroke="#cbd5e1"
                    strokeWidth="1.8"
                  />
                  {/* Blood + Broth shifting smoothly */}
                  <path
                    d={
                      isInverted
                        ? 'M10 27 L34 27 L34 52 L10 52 Z'
                        : 'M10 38 L34 38 L34 62.5 C34 65.8 31.5 68.2 28.2 68.2 L15.8 68.2 C12.5 68.2 10 65.8 10 62.5 Z'
                    }
                    fill="#b91c1c"
                    fillOpacity="0.65"
                    style={{ transition: 'all 500ms ease-in-out' }}
                  />
                  {/* Air bubble pocket */}
                  <circle
                    cx="22"
                    cy={isInverted ? 58 : 30}
                    r="3.2"
                    fill="#fef2f2"
                    fillOpacity="0.85"
                    style={{ transition: 'cy 600ms ease-in-out' }}
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 38 70" className="w-full h-full drop-shadow-sm">
                  {/* Cap */}
                  <rect x="7.5" y="2" width="23" height="11.5" rx="3.5" fill={tube.color} />
                  <rect x="6.5" y="11" width="25" height="4.5" rx="1.5" fill={tube.color} opacity="0.9" />
                  {/* Tube body */}
                  <path
                    d="M10.5 15.5 L10.5 57 C10.5 63 14 67 19 67 C24 67 27.5 63 27.5 57 L27.5 15.5 Z"
                    fill="#ffffff"
                    fillOpacity="0.92"
                    stroke="#cbd5e1"
                    strokeWidth="1.8"
                  />
                  {/* Blood column shifting smoothly toward gravity side */}
                  <path
                    d={
                      isInverted
                        ? 'M11.7 16.5 L26.3 16.5 L26.3 50 L11.7 50 Z'
                        : 'M11.7 31 L26.3 31 L26.3 57 C26.3 62 23.2 65.5 19 65.5 C14.8 65.5 11.7 62 11.7 57 Z'
                    }
                    fill="#b91c1c"
                    fillOpacity="0.72"
                    style={{ transition: 'all 500ms ease-in-out' }}
                  />
                  {/* Moving air bubble showing gentle mixing */}
                  <circle
                    cx="19"
                    cy={isInverted ? 56 : 25}
                    r="2.8"
                    fill="#ffffff"
                    fillOpacity="0.85"
                    style={{ transition: 'cy 600ms ease-in-out' }}
                  />
                  {/* Glass highlight */}
                  <line
                    x1="13.5"
                    y1="19"
                    x2="13.5"
                    y2="54"
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Inversion Counter */}
          <div className="text-center space-y-1">
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {count} / {targetCount} ครั้ง
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              เกณฑ์ของ {tube.shortName}: พลิกเบา ๆ {tube.mix} ครั้ง
            </div>
          </div>
        </div>

        {/* Right: Controls & Technique Guide */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#1565C0] dark:text-blue-400">
              กำลังสาธิต: {tube.name}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              เอียงหลอดจากแนวตั้ง (0°) คว่ำลง 180° จนฟองอากาศลอยขึ้นด้านบนสุด แล้วพลิกตั้งตรงกลับ (0°) อย่างนุ่มนวล นับเป็น 1 ครั้ง
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex flex-wrap gap-1.5" aria-label="ตัวนับจำนวนครั้งที่พลิก">
            {Array.from({ length: targetCount }).map((_, idx) => {
              const done = idx < count;
              return (
                <span
                  key={idx}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold flex items-center justify-center border tabular-nums transition-colors ${
                    done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </span>
              );
            })}
          </div>

          {completed && (
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-xl px-3.5 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>ครบ {targetCount} ครั้งแล้ว — สามารถติ๊กยืนยัน “ผสม/พลิกหลอดแล้ว” ด้านล่างได้เลย</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isManualStepping}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>
                {isPlaying
                  ? 'หยุดสาธิต'
                  : completed
                    ? 'เล่นสาธิตซ้ำ'
                    : 'เล่นสาธิตอัตโนมัติ'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleManualFlip}
              disabled={isPlaying || isManualStepping}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#1565C0] dark:text-blue-300 text-sm font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <Hand className="w-4 h-4" />
              <span>ฝึกพลิก 1 ครั้ง</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D2B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>เริ่มนับใหม่</span>
            </button>
          </div>

          {/* Safety reminder */}
          <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              ห้ามเขย่าหลอดแรงหรือเร่งจังหวะเกินไป เพราะแรงกระแทกทำให้เม็ดเลือดแดงแตก (Hemolysis) และเกิดฟองอากาศในตัวอย่างเลือด
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
