import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  FlaskConical,
  Droplets,
  RefreshCw,
  TestTube2,
  Syringe,
  Clock,
  Hand,
  Timer,
  ArrowRight,
} from 'lucide-react';
import {
  HEMOLYSIS_TIPS,
  LAB_TESTS,
  ORDER_OF_DRAW,
  TUBES,
  TubeKey,
} from '../data/hemoData';
import { BloodTubeIllustration } from './BloodTubeIllustration';

const HEMOLYSIS_ICONS = [Syringe, RefreshCw, Clock, Hand, Timer];

const TUBE_SHORT_LABEL: Record<TubeKey, string> = {
  cult: 'ขวดเพาะเชื้อ',
  red: 'จุกสีแดง',
  blue: 'จุกสีฟ้า',
  green: 'จุกสีเขียว',
  purple: 'จุกสีม่วง',
  lav: 'จุกสีม่วงยาว',
  grey: 'จุกสีเทา',
};

export const LearningZoneView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Order of Draw section */}
      <section className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1565C0] dark:text-blue-400 flex items-center justify-center shrink-0">
            <TestTube2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              ลำดับการเก็บหลอด (Order of Draw)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              ลำดับตามคู่มือห้องปฏิบัติการ: Hemoculture → Clot blood → Sodium citrate → Lithium heparin → EDTA → NaF (ข้ามหลอดที่ไม่มีรายการตรวจ)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {ORDER_OF_DRAW.map((key, idx) => {
            const tube = TUBES[key];
            return (
              <div
                key={key}
                className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col items-center text-center gap-2"
              >
                <div className="w-full flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className="font-semibold text-[#1565C0] dark:text-blue-400">
                    #{idx + 1}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tube.color }}
                    aria-hidden="true"
                  />
                </div>

                <BloodTubeIllustration tubeKey={key} size="md" />

                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {tube.name.split(' (')[0]}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {tube.additive}
                  </div>
                </div>

                {idx < ORDER_OF_DRAW.length - 1 && (
                  <ArrowRight
                    className="hidden lg:block w-3.5 h-3.5 text-slate-300 dark:text-slate-700 absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-[#131D2B] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Tube Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            ชนิดหลอดเก็บเลือดและรายละเอียด
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            ทั้งหมด {ORDER_OF_DRAW.length} ชนิด
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ORDER_OF_DRAW.map((key, idx) => {
            const tube = TUBES[key];
            const tests = LAB_TESTS.filter((t) => t.tube === key).map((t) => t.name);
            return (
              <article
                key={key}
                className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch gap-4"
              >
                {/* Visual Tube Specimen Stage */}
                <div className="sm:w-28 shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex sm:flex-col items-center justify-between sm:justify-center gap-3">
                  <BloodTubeIllustration tubeKey={key} size="xl" />
                  <div className="flex sm:flex-col items-center gap-1.5 text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tube.color }}
                        aria-hidden="true"
                      />
                      <span>{TUBE_SHORT_LABEL[key]}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      พลิก {tube.mix} ครั้ง
                    </span>
                  </div>
                </div>

                {/* Tube Information & Icons */}
                <div className="min-w-0 flex-1 space-y-2.5">
                  <div>
                    <div className="text-xs font-mono text-[#1565C0] dark:text-blue-400 font-semibold tabular-nums">
                      ลำดับที่ {idx + 1}
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                      {tube.name}
                    </h3>
                  </div>

                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300 leading-relaxed">
                    รายการตรวจ: {tests.join(' · ')}
                  </div>

                  <dl className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">สารเติมแต่ง: </span>
                        <span>{tube.additive}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Droplets className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">ปริมาณเลือด: </span>
                        <span>{tube.volume}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">พลิกกลับเบา ๆ: </span>
                        <span className="font-semibold">{tube.mix} ครั้ง (หรือตาม IFU/SOP)</span>
                      </div>
                    </div>
                  </dl>

                  <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-xl p-2.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{tube.tip}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Hemolysis Prevention */}
      <section className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            ข้อควรระวังเพื่อลดภาวะเม็ดเลือดแดงแตก (Hemolysis)
          </h2>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-slate-700 dark:text-slate-300">
          {HEMOLYSIS_TIPS.map((tip, i) => {
            const TipIcon = HEMOLYSIS_ICONS[i % HEMOLYSIS_ICONS.length];
            return (
              <li
                key={i}
                className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1565C0] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <TipIcon className="w-4 h-4" />
                </div>
                <span className="pt-0.5">{tip}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
