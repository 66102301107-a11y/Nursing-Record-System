import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Search,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  FileSpreadsheet,
  Check,
  ChevronDown,
  ChevronUp,
  Play,
  FileDown,
  History,
  X,
  MapPin,
  StickyNote,
} from 'lucide-react';
import {
  CHECKLIST_ITEMS,
  HEMO_CULTURE_SITES,
  HemoCultureBottle2Site,
  HemoCultureSite,
  HemoCultureSitesState,
  LAB_TESTS,
  ORDER_OF_DRAW,
  TUBES,
  TubeKey,
  LabTest,
  formatHemoCultureSites,
} from '../data/hemoData';
import { BloodTubeIllustration } from './BloodTubeIllustration';
import { TubeInversionDemo } from './TubeInversionDemo';

export interface SavedCollectionRecord {
  at: string;
  testsCount: number;
  tubesCount: number;
  selectedTestNames: string[];
  orderedTubeNames: string[];
  hemoSitesLabel?: string;
  patientNote?: string;
}

interface HemoCultureSiteSelectorProps {
  hemoSites: HemoCultureSitesState;
  onChange: (next: HemoCultureSitesState) => void;
}

const HemoCultureSiteSelector: React.FC<HemoCultureSiteSelectorProps> = ({
  hemoSites,
  onChange,
}) => {
  const bottle2Options: HemoCultureBottle2Site[] = [
    ...HEMO_CULTURE_SITES,
    'เจาะ 1 ขวด',
  ];

  const handleSelectBottle1 = (site: HemoCultureSite) => {
    onChange({
      ...hemoSites,
      bottle1: hemoSites.bottle1 === site ? '' : site,
    });
  };

  const handleSelectBottle2 = (site: HemoCultureBottle2Site) => {
    onChange({
      ...hemoSites,
      bottle2: hemoSites.bottle2 === site ? '' : site,
    });
  };

  const sameArmWarning =
    hemoSites.bottle1 &&
    hemoSites.bottle2 &&
    hemoSites.bottle2 !== 'เจาะ 1 ขวด' &&
    hemoSites.bottle1 === hemoSites.bottle2;

  return (
    <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100">
          <MapPin className="w-3.5 h-3.5 text-[#1565C0] dark:text-blue-400 shrink-0" />
          <span>เช็กตำแหน่งเจาะ Hemo culture</span>
        </div>
        {!hemoSites.bottle1 && (
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            ต้องเลือกขวด 1
          </span>
        )}
      </div>

      {/* Bottle 1 */}
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
          ขวดที่ 1 (ตำแหน่งที่เจาะ) <span className="text-red-600 dark:text-red-400">*</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {HEMO_CULTURE_SITES.map((site) => {
            const active = hemoSites.bottle1 === site;
            return (
              <button
                key={site}
                type="button"
                onClick={() => handleSelectBottle1(site)}
                className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#1565C0] border-[#1565C0] text-white font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                <span>{site}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottle 2 */}
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
          ขวดที่ 2 (ถ้าเจาะ 2 ขวด)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {bottle2Options.map((site) => {
            const active = hemoSites.bottle2 === site;
            return (
              <button
                key={site}
                type="button"
                onClick={() => handleSelectBottle2(site)}
                className={`min-h-[38px] px-2 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-emerald-700 border-emerald-700 text-white font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                <span>{site}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!hemoSites.bottle1 && (
        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>กรุณาเลือกตำแหน่งที่เจาะของขวดที่ 1 (แขนซ้าย/แขนขวา/ขาซ้าย/ขาขวา)</span>
        </p>
      )}

      {sameArmWarning && (
        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            แนะนำ: นิยมเจาะขวดที่ 1 และขวดที่ 2 คนละตำแหน่ง (เช่น แขนซ้าย กับ แขนขวา) เพื่อลดการปนเปื้อน
          </span>
        </p>
      )}
    </div>
  );
};

interface FlowStepperProps {
  activeStep: 1 | 2 | 3 | 4;
}

export const FlowStepper: React.FC<FlowStepperProps> = ({ activeStep }) => {
  const steps = ['Checklist', 'ค้นหาการตรวจ', 'ผสม/พลิกหลอด', 'บันทึก'];
  return (
    <nav aria-label="ขั้นตอนการเก็บเลือด" className="grid grid-cols-4 gap-1.5 sm:gap-2">
      {steps.map((label, idx) => {
        const num = idx + 1;
        const isDone = num < activeStep;
        const isActive = num === activeStep;
        return (
          <div
            key={label}
            className={`text-center py-2 px-1 border-b-2 text-xs sm:text-sm font-medium transition-colors truncate tabular-nums ${
              isActive
                ? 'border-[#1565C0] text-[#1565C0] dark:text-blue-400 font-semibold'
                : isDone
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {num}. {label}
          </div>
        );
      })}
    </nav>
  );
};

interface ChecklistStepProps {
  checkedMap: Record<number, boolean>;
  selectedTests: Record<number, boolean>;
  patientNote: string;
  onChangePatientNote: (note: string) => void;
  onToggleTest: (id: number) => void;
  onToggle: (id: number, checked: boolean) => void;
  onReset: () => void;
  onNext: () => void;
  onExportPdf: () => void;
  isExportingPdf?: boolean;
}

const PATIENT_NOTE_PRESETS = [
  'หลอดเลือดเปราะ/เจาะยาก',
  'ห้ามเจาะแขนที่มีสาย IV/AVF',
  'ทานยาละลายลิ่มเลือด (กดแผลนานขึ้น)',
  'ผู้ป่วย NPO (งดน้ำงดอาหาร)',
  'กลัวเข็ม/ต้องมีผู้ช่วยประคอง',
  'แพ้พลาสเตอร์/แอลกอฮอล์',
];

export const ChecklistStep: React.FC<ChecklistStepProps> = ({
  checkedMap,
  selectedTests,
  patientNote,
  onChangePatientNote,
  onToggleTest,
  onToggle,
  onReset,
  onNext,
  onExportPdf,
  isExportingPdf = false,
}) => {
  const [showQuickTestPicker, setShowQuickTestPicker] = useState(false);

  const toggleNotePreset = (preset: string) => {
    const parts = patientNote
      .split(' · ')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.includes(preset)) {
      onChangePatientNote(parts.filter((p) => p !== preset).join(' · '));
    } else {
      onChangePatientNote([...parts, preset].join(' · '));
    }
  };

  const doneCount = CHECKLIST_ITEMS.filter((item) => checkedMap[item.id]).length;
  const pct = Math.round((doneCount * 100) / CHECKLIST_ITEMS.length);
  const allDone = doneCount === CHECKLIST_ITEMS.length;

  const selectedLabObjects = useMemo(
    () => LAB_TESTS.filter((t) => selectedTests[t.id]),
    [selectedTests]
  );

  const precautionTests = useMemo(
    () => selectedLabObjects.filter((t) => !!t.specialPrecaution),
    [selectedLabObjects]
  );

  const quickPickTests = useMemo(
    () => LAB_TESTS.filter((t) => !!t.specialPrecaution),
    []
  );

  const checklistAlertsMap = useMemo(() => {
    const map: Record<number, LabTest[]> = {};
    for (const test of precautionTests) {
      const ids = test.specialPrecaution?.relatedChecklistIds || [];
      for (const cid of ids) {
        if (!map[cid]) map[cid] = [];
        map[cid].push(test);
      }
    }
    return map;
  }, [precautionTests]);

  const hasHighSeverity = precautionTests.some(
    (t) => t.specialPrecaution?.severity === 'high'
  );

  return (
    <div className="space-y-5">
      <FlowStepper activeStep={1} />

      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-700 dark:text-slate-200">
        <div>
          <span className="font-semibold text-[#1565C0] dark:text-blue-300">ขั้นที่ 1</span>{' '}
          ตรวจสอบข้อมูลผู้ป่วยและความพร้อมของหลอด ก่อนค้นหารายการตรวจ
        </div>
        <button
          type="button"
          onClick={() => setShowQuickTestPicker((v) => !v)}
          className="min-h-[38px] px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-[#131D2B] text-xs font-semibold text-[#1565C0] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>
            ระบุรายการตรวจล่วงหน้า ({selectedLabObjects.length})
          </span>
          {showQuickTestPicker ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Quick Test Picker for Special Precaution Pre-Check */}
      {showQuickTestPicker && (
        <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                เลือกรายการตรวจที่มีข้อควรระวังพิเศษ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ติ๊กเลือกรายการตรวจที่ต้องเจาะในรอบนี้เพื่อแสดงระบบแจ้งเตือนและไอคอนเตือนใน Checklist ทันที
              </p>
            </div>
            <button
              type="button"
              onClick={onNext}
              className="text-xs font-semibold text-[#1565C0] dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap"
            >
              ดูรายการตรวจทั้งหมด →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPickTests.map((test) => {
              const active = !!selectedTests[test.id];
              const tube = TUBES[test.tube];
              return (
                <button
                  key={test.id}
                  type="button"
                  onClick={() => onToggleTest(test.id)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: tube.color }}
                    aria-hidden="true"
                  />
                  <span>{test.name}</span>
                  {active && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Special Precaution Nursing Safety Alert Banner */}
      {precautionTests.length > 0 && (
        <section
          role="alert"
          aria-label="แจ้งเตือนข้อควรระวังพิเศษทางการพยาบาล"
          className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${
            hasHighSeverity
              ? 'bg-red-50/75 dark:bg-red-950/30 border-red-200 dark:border-red-900/60'
              : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                hasHighSeverity
                  ? 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className={`font-display text-sm sm:text-base font-bold ${
                  hasHighSeverity
                    ? 'text-red-900 dark:text-red-200'
                    : 'text-amber-900 dark:text-amber-200'
                }`}
              >
                แจ้งเตือนข้อควรระวังพิเศษทางการพยาบาล ({precautionTests.length} รายการ)
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  hasHighSeverity
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-amber-800 dark:text-amber-300'
                }`}
              >
                พบรายการตรวจที่ต้องเฝ้าระวังเป็นพิเศษ กรุณาตรวจสอบหัวข้อ Checklist ที่มีไอคอนเตือนด้านล่าง
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {precautionTests.map((test) => {
              const p = test.specialPrecaution!;
              const tube = TUBES[test.tube];
              const isHigh = p.severity === 'high';
              return (
                <div
                  key={test.id}
                  className="bg-white/90 dark:bg-[#131D2B]/90 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-start gap-2.5"
                >
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isHigh
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold text-slate-900 dark:text-slate-100">
                      <span>{test.name}</span>
                      <span className="text-slate-400 font-normal">·</span>
                      <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: tube.color }}
                          aria-hidden="true"
                        />
                        {tube.shortName}
                      </span>
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        isHigh
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {p.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900 dark:text-slate-100">ความคืบหน้า</span>
          <span className="font-mono font-semibold text-[#1565C0] dark:text-blue-400 tabular-nums">
            {doneCount}/{CHECKLIST_ITEMS.length} ข้อ · {pct}%
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1565C0] transition-all duration-200 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CHECKLIST_ITEMS.map((item) => {
          const checked = !!checkedMap[item.id];
          const alertedTests = checklistAlertsMap[item.id] || [];
          const hasWarning = alertedTests.length > 0;
          const hasHighAlert = alertedTests.some(
            (t) => t.specialPrecaution?.severity === 'high'
          );

          return (
            <label
              key={item.id}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-colors cursor-pointer min-h-[68px] ${
                checked
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/70'
                  : hasWarning
                    ? hasHighAlert
                      ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-800/70 hover:border-red-400'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/70 hover:border-amber-400'
                    : 'bg-white dark:bg-[#131D2B] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggle(item.id, e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded accent-[#1565C0] shrink-0 cursor-pointer"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {item.title}
                    </span>
                    {item.critical && (
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                        · สำคัญ
                      </span>
                    )}
                  </div>
                  {hasWarning && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                        hasHighAlert
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                      title={`มีข้อควรระวังพิเศษสำหรับ: ${alertedTests.map((t) => t.name).join(', ')}`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>เฝ้าระวัง</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>

                {hasWarning && (
                  <p
                    className={`text-xs font-medium flex items-start gap-1.5 pt-0.5 ${
                      hasHighAlert
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      ข้อควรระวังพิเศษ ({alertedTests.map((t) => t.name).join(', ')})
                    </span>
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Patient-Specific Notes & Additional Instructions */}
      <section className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1565C0] dark:text-blue-400 flex items-center justify-center shrink-0">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                โน้ตย่อ / คำแนะนำเพิ่มเติมรายบุคคล
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                บันทึกรายละเอียดพิเศษของผู้ป่วยเพื่อใช้ประกอบการเจาะเลือด ส่งต่อ PDF และบันทึก Google Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {patientNote.trim().length > 0 && (
              <>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>บันทึกอัตโนมัติ</span>
                </span>
                <button
                  type="button"
                  onClick={() => onChangePatientNote('')}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ล้างโน้ต
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            แตะเพิ่มรายละเอียดด่วน:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PATIENT_NOTE_PRESETS.map((preset) => {
              const isIncluded = patientNote
                .split(' · ')
                .map((s) => s.trim())
                .includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => toggleNotePreset(preset)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isIncluded
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-[#1565C0] text-[#1565C0] dark:text-blue-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {isIncluded && <Check className="w-3.5 h-3.5 shrink-0" />}
                  <span>{preset}</span>
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          value={patientNote}
          onChange={(e) => onChangePatientNote(e.target.value)}
          rows={3}
          maxLength={400}
          placeholder="พิมพ์โน้ตย่อหรือคำแนะนำเพิ่มเติมรายบุคคล เช่น เตียง/รหัสอ้างอิง ใช้เข็ม Butterfly เบอร์ 23, แขนซ้ายห้ามเจาะเพราะมีสายน้ำเกลือ..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0F1722] text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600/40"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
          <span>ข้อมูลโน้ตจะถูกรวมในเอกสาร PDF ข้างเตียงและรายงานสรุปผล</span>
          <span>{patientNote.length}/400</span>
        </div>
      </section>

      {allDone && (
        <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Checklist ครบถ้วน</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onNext}
          disabled={!allDone}
          className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-45 cursor-pointer"
        >
          <span>{allDone ? 'ถัดไป: ค้นหาการตรวจ' : 'ทำ Checklist ให้ครบก่อนดำเนินการต่อ'}</span>
          {allDone && <ArrowRight className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          className="min-h-[48px] px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[#1565C0] dark:text-blue-300 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          <FileDown className="w-4 h-4" />
          <span>{isExportingPdf ? 'กำลังสร้าง PDF...' : 'ส่งออก PDF ข้างเตียง'}</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D2B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ล้างรายการ</span>
        </button>
      </div>
    </div>
  );
};

interface SearchStepProps {
  selectedTests: Record<number, boolean>;
  onToggleTest: (id: number) => void;
  onBackToChecklist: () => void;
  onNextMix: () => void;
}

const RECENT_SEARCHES_STORAGE_KEY = 'hemoguide_recent_searched_tests';
const MAX_RECENT_SEARCHES = 5;

export const SearchStep: React.FC<SearchStepProps> = ({
  selectedTests,
  onToggleTest,
  onBackToChecklist,
  onNextMix,
}) => {
  const [query, setQuery] = useState('');
  const [recentTestIds, setRecentTestIds] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((id): id is number => typeof id === 'number' && LAB_TESTS.some((t) => t.id === id))
            .slice(0, MAX_RECENT_SEARCHES);
        }
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const persistRecentIds = useCallback((ids: number[]) => {
    try {
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore storage errors
    }
  }, []);

  const recordRecentTests = useCallback(
    (testIds: number[]) => {
      if (testIds.length === 0) return;
      setRecentTestIds((prev) => {
        const next = [...testIds, ...prev.filter((id) => !testIds.includes(id))].slice(
          0,
          MAX_RECENT_SEARCHES
        );
        persistRecentIds(next);
        return next;
      });
    },
    [persistRecentIds]
  );

  const clearRecentSearches = () => {
    setRecentTestIds([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const recentTests = useMemo(
    () =>
      recentTestIds
        .map((id) => LAB_TESTS.find((t) => t.id === id))
        .filter((t): t is LabTest => !!t),
    [recentTestIds]
  );

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LAB_TESTS;
    return LAB_TESTS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        TUBES[t.tube].name.toLowerCase().includes(q) ||
        TUBES[t.tube].shortName.toLowerCase().includes(q)
    );
  }, [query]);

  // Automatically record narrow search lookups (1-3 matches) after brief pause
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || filteredTests.length === 0 || filteredTests.length > 3) {
      return;
    }
    const timer = window.setTimeout(() => {
      recordRecentTests(filteredTests.map((t) => t.id));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [query, filteredTests, recordRecentTests]);

  const handleToggleFromList = (testId: number) => {
    if (query.trim().length > 0) {
      recordRecentTests([testId]);
    }
    onToggleTest(testId);
  };

  const handleToggleFromRecent = (testId: number) => {
    recordRecentTests([testId]);
    onToggleTest(testId);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim().length > 0 && filteredTests.length > 0) {
      e.preventDefault();
      const topTest = filteredTests[0];
      recordRecentTests([topTest.id]);
      onToggleTest(topTest.id);
    }
  };

  const selectedCount = Object.keys(selectedTests).length;

  const groupedTubes = useMemo(() => {
    return ORDER_OF_DRAW.map((tubeKey) => {
      const testsForTube = LAB_TESTS.filter(
        (t) => selectedTests[t.id] && t.tube === tubeKey
      );
      return { tubeKey, tests: testsForTube };
    }).filter((g) => g.tests.length > 0);
  }, [selectedTests]);

  return (
    <div className="space-y-5">
      <FlowStepper activeStep={2} />

      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200">
        <span className="font-semibold text-[#1565C0] dark:text-blue-300">ขั้นที่ 2</span>{' '}
        เลือกรายการตรวจที่ต้องการเก็บเลือด แอปจะแสดงหลอดที่เกี่ยวข้องและเรียงตามลำดับการเก็บ
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Test Picker */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
              เลือกรายการตรวจ
            </h3>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              เลือกแล้ว {selectedCount} รายการ
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ค้นหา เช่น CBC, FBS, LFT, สีม่วง..."
              className="w-full min-h-[46px] pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131D2B] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="ล้างคำค้นหา"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {recentTests.length > 0 && (
            <div className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <History className="w-3.5 h-3.5 text-[#1565C0] dark:text-blue-400" />
                  <span>ค้นหาล่าสุด (5 รายการ)</span>
                </div>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ล้างประวัติ
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentTests.map((test) => {
                  const active = !!selectedTests[test.id];
                  const tube = TUBES[test.tube];
                  return (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => handleToggleFromRecent(test.id)}
                      title={
                        active
                          ? `เลือก ${test.name} แล้ว (${tube.shortName}) — แตะเพื่อยกเลิก`
                          : `แตะเพื่อเลือก ${test.name} (${tube.shortName})`
                      }
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-[#1565C0] text-[#1565C0] dark:text-blue-300 font-semibold'
                          : 'bg-white dark:bg-[#131D2B] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tube.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate max-w-[180px]">{test.name}</span>
                      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
            {filteredTests.map((test) => {
              const checked = !!selectedTests[test.id];
              const tube = TUBES[test.tube];
              const hasPrecaution = !!test.specialPrecaution;
              return (
                <label
                  key={test.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer min-h-[52px] ${
                    checked
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#1565C0]/60 dark:border-blue-500/60'
                      : 'bg-white dark:bg-[#131D2B] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleFromList(test.id)}
                      className="w-5 h-5 rounded accent-[#1565C0] shrink-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                          {test.name}
                        </span>
                        {hasPrecaution && (
                          <span
                            title={test.specialPrecaution?.title}
                            className="inline-flex items-center shrink-0"
                          >
                            <AlertTriangle
                              className={`w-3.5 h-3.5 ${
                                test.specialPrecaution?.severity === 'high'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            />
                          </span>
                        )}
                      </div>
                      {checked && hasPrecaution && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 truncate">
                          {test.specialPrecaution?.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs text-slate-600 dark:text-slate-300">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tube.color }}
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">{tube.shortName}</span>
                  </div>
                </label>
              );
            })}
            {filteredTests.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-xl">
                ไม่พบรายการตรวจที่ตรงกับคำค้นหา “{query}”
              </div>
            )}
          </div>
        </div>

        {/* Right: Ordered Tube Recommendations */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
              หลอดที่ต้องใช้ (เรียงตามลำดับเก็บ)
            </h3>
            {groupedTubes.length > 0 && (
              <span className="text-xs font-medium text-[#1565C0] dark:text-blue-400 tabular-nums">
                {groupedTubes.length} หลอด
              </span>
            )}
          </div>

          {groupedTubes.length === 0 ? (
            <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              เลือกรายการตรวจอย่างน้อย 1 รายการ เพื่อดูลำดับหลอดและวิธีการผสมเลือด
            </div>
          ) : (
            <div className="space-y-3">
              {groupedTubes.map(({ tubeKey, tests }, index) => {
                const tube = TUBES[tubeKey];
                return (
                  <div
                    key={tubeKey}
                    className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-4"
                  >
                    <BloodTubeIllustration tubeKey={tubeKey} size="md" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xs font-semibold text-[#1565C0] dark:text-blue-400 tabular-nums">
                          ลำดับที่ {index + 1}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {tube.name}
                        </h4>
                      </div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        รายการตรวจ: {tests.map((t) => t.name).join(' · ')}
                      </p>
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                        <div>สารเติมแต่ง: {tube.additive} · ปริมาณ: {tube.volume}</div>
                        <div>พลิกกลับเบา ๆ: {tube.mix} ครั้ง (หรือตาม IFU/SOP)</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                เมื่อตรวจสอบรายการครบแล้ว กดปุ่มถัดไปเพื่อเข้าสู่ขั้นตอนผสม/พลิกหลอด
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={onNextMix}
                  className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>ถัดไป: ผสม/พลิกหลอด</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onBackToChecklist}
                  className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D2B] text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Checklist</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MixStepProps {
  selectedTests: Record<number, boolean>;
  hemoSites: HemoCultureSitesState;
  onChangeHemoSites: (next: HemoCultureSitesState) => void;
  verifiedTubes: Record<TubeKey, boolean>;
  onToggleVerify: (key: TubeKey, checked: boolean) => void;
  onBackToSearch: () => void;
  onSaveFlow: () => void;
  onExportPdf: () => void;
  isExportingPdf?: boolean;
}

export const MixStep: React.FC<MixStepProps> = ({
  selectedTests,
  hemoSites,
  onChangeHemoSites,
  verifiedTubes,
  onToggleVerify,
  onBackToSearch,
  onSaveFlow,
  onExportPdf,
  isExportingPdf = false,
}) => {
  const activeTubeKeys = useMemo(() => {
    return ORDER_OF_DRAW.filter((k) =>
      LAB_TESTS.some((t) => selectedTests[t.id] && t.tube === k)
    );
  }, [selectedTests]);

  const [demoTubeKey, setDemoTubeKey] = useState<TubeKey>(
    () => activeTubeKeys[0] || 'purple'
  );
  const [autoPlaySignal, setAutoPlaySignal] = useState(0);
  const demoRef = React.useRef<HTMLDivElement>(null);

  const effectiveDemoKey = activeTubeKeys.includes(demoTubeKey)
    ? demoTubeKey
    : activeTubeKeys[0] || 'purple';

  const handleLaunchTubeDemo = (key: TubeKey) => {
    setDemoTubeKey(key);
    setAutoPlaySignal((s) => s + 1);
    demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const doneCount = activeTubeKeys.filter((k) => verifiedTubes[k]).length;
  const allVerified = activeTubeKeys.length > 0 && doneCount === activeTubeKeys.length;
  const needsHemoBottle1 = !!selectedTests[0] && !hemoSites.bottle1;
  const canSaveMix = allVerified && !needsHemoBottle1;
  const pct = activeTubeKeys.length ? Math.round((doneCount * 100) / activeTubeKeys.length) : 0;

  return (
    <div className="space-y-5">
      <FlowStepper activeStep={3} />

      <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200">
        <span className="font-semibold text-[#1565C0] dark:text-blue-300">ขั้นที่ 3</span>{' '}
        {selectedTests[0]
          ? 'หลังเก็บเลือด ให้พลิกหลอดเบา ๆ ทันทีตามจำนวนครั้งของแต่ละชนิด ห้ามเขย่าแรง และเช็กตำแหน่งเจาะ Hemo culture ขวดที่ 1 (แขนซ้าย/แขนขวา/ขา)'
          : 'หลังเก็บเลือด ให้พลิกหลอดเบา ๆ ทันทีตามจำนวนครั้งของแต่ละชนิด ห้ามเขย่าแรง'}
      </div>

      {/* Interactive Blood Inversion Demonstration */}
      {activeTubeKeys.length > 0 && (
        <div ref={demoRef}>
          <TubeInversionDemo
            tubeKeys={activeTubeKeys}
            selectedTubeKey={effectiveDemoKey}
            autoPlaySignal={autoPlaySignal}
            onSelectTube={(key) => setDemoTubeKey(key)}
          />
        </div>
      )}

      <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900 dark:text-slate-100">ความคืบหน้า</span>
          <span className="font-mono font-semibold text-[#1565C0] dark:text-blue-400 tabular-nums">
            {doneCount}/{activeTubeKeys.length} หลอด
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1565C0] transition-all duration-200 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTubeKeys.map((key) => {
          const tube = TUBES[key];
          const tests = LAB_TESTS.filter((t) => selectedTests[t.id] && t.tube === key).map(
            (t) => t.name
          );
          const verified = !!verifiedTubes[key];
          return (
            <div
              key={key}
              className={`bg-white dark:bg-[#131D2B] border rounded-2xl p-4 space-y-3 transition-colors ${
                verified
                  ? 'border-emerald-300 dark:border-emerald-800/70'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-4">
                <BloodTubeIllustration tubeKey={key} size="md" />
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {tube.name}
                  </h4>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {tests.join(' · ')}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 pt-1">
                    พลิกกลับเบา ๆ {tube.mix} ครั้ง
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{tube.tip}</span>
                  </p>
                  {key === 'cult' && formatHemoCultureSites(hemoSites) && (
                    <div className="pt-1 text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>ตำแหน่งเจาะ: {formatHemoCultureSites(hemoSites)}</span>
                    </div>
                  )}
                </div>
              </div>

              {key === 'cult' && (
                <HemoCultureSiteSelector
                  hemoSites={hemoSites}
                  onChange={onChangeHemoSites}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleLaunchTubeDemo(key)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800/70 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[#1565C0] dark:text-blue-300 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>สาธิตการพลิก ({tube.mix} ครั้ง)</span>
                </button>

                <label
                  className={`flex-1 flex items-center gap-3 px-3.5 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors min-h-[44px] ${
                    verified
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => onToggleVerify(key, e.target.checked)}
                    className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
                  />
                  <span>ผสม/พลิกหลอดแล้ว</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {canSaveMix && (
        <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>
            {selectedTests[0]
              ? 'ผสม/พลิกครบทุกหลอด และระบุตำแหน่ง Hemo culture แล้ว'
              : 'ผสม/พลิกครบทุกหลอด'}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onSaveFlow}
          disabled={!canSaveMix}
          className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-45 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>
            {canSaveMix
              ? 'บันทึกการดำเนินการ'
              : needsHemoBottle1 && allVerified
                ? 'เลือกตำแหน่งเจาะขวด 1 (Hemo culture) ก่อนบันทึก'
                : 'ติ๊กยืนยันให้ครบทุกหลอดก่อนบันทึก'}
          </span>
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          className="min-h-[48px] px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[#1565C0] dark:text-blue-300 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          <FileDown className="w-4 h-4" />
          <span>{isExportingPdf ? 'กำลังสร้าง PDF...' : 'ส่งออก PDF ข้างเตียง'}</span>
        </button>
        <button
          type="button"
          onClick={onBackToSearch}
          className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D2B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปแก้รายการตรวจ</span>
        </button>
      </div>
    </div>
  );
};

interface SavedStepProps {
  savedRecord: SavedCollectionRecord;
  isGoogleReady: boolean;
  onSaveToSheets: () => void;
  onGoSummary: () => void;
  onStartNewFlow: () => void;
  onExportPdf: () => void;
  isExportingPdf?: boolean;
}

export const SavedStep: React.FC<SavedStepProps> = ({
  savedRecord,
  isGoogleReady,
  onSaveToSheets,
  onGoSummary,
  onStartNewFlow,
  onExportPdf,
  isExportingPdf = false,
}) => {
  return (
    <div className="space-y-5">
      <FlowStepper activeStep={4} />

      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl p-6 sm:p-8 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
          บันทึกการดำเนินการแล้ว
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 tabular-nums">
          รายการตรวจ {savedRecord.testsCount} รายการ · {savedRecord.tubesCount} หลอด
          <br />
          {savedRecord.at}
        </p>
        <div className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto space-y-1.5">
          <div>{savedRecord.selectedTestNames.join(' · ')}</div>
          {savedRecord.hemoSitesLabel && (
            <div className="font-semibold text-teal-700 dark:text-teal-300 inline-flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>ตำแหน่ง Hemo culture: {savedRecord.hemoSitesLabel}</span>
            </div>
          )}
          {savedRecord.patientNote && (
            <div className="mt-2 p-2.5 rounded-xl bg-white/80 dark:bg-[#131D2B]/80 border border-blue-200/70 dark:border-blue-800/60 text-left text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2">
              <StickyNote className="w-3.5 h-3.5 text-[#1565C0] dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong className="font-semibold">โน้ตผู้ป่วย:</strong> {savedRecord.patientNote}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={onSaveToSheets}
          className="min-h-[48px] px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>{isGoogleReady ? 'บันทึกลง Sheets' : 'เชื่อมต่อ & บันทึก Sheets'}</span>
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          className="min-h-[48px] px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[#1565C0] dark:text-blue-300 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          <FileDown className="w-4 h-4 shrink-0" />
          <span>{isExportingPdf ? 'กำลังสร้าง PDF...' : 'ส่งออก PDF ข้างเตียง'}</span>
        </button>
        <button
          type="button"
          onClick={onGoSummary}
          className="min-h-[48px] px-4 py-3 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>ดูสรุปผล</span>
        </button>
        <button
          type="button"
          onClick={onStartNewFlow}
          className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D2B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>เริ่มขั้นตอนใหม่</span>
        </button>
      </div>
    </div>
  );
};
