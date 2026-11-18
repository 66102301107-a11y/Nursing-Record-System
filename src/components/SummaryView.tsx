import React from 'react';
import { TrendingUp, CheckCircle2, Search, FileDown, MapPin, StickyNote } from 'lucide-react';
import {
  HemoCultureSitesState,
  LAB_TESTS,
  ORDER_OF_DRAW,
  TUBES,
  formatHemoCultureSites,
} from '../data/hemoData';
import { BloodTubeIllustration } from './BloodTubeIllustration';
import { SavedCollectionRecord } from './ChecklistFlow';
import { SheetsPanel } from './SheetsPanel';
import { SpreadsheetMeta } from '../services/googleSheets';
import { ScoreTrendChart, ScoreHistoryEntry } from './ScoreTrendChart';

interface SummaryViewProps {
  preScore: number | null;
  postScore: number | null;
  scoreHistory: ScoreHistoryEntry[];
  ratings: Record<number, number>;
  selectedTests: Record<number, boolean>;
  hemoSites: HemoCultureSitesState;
  patientNote: string;
  savedRecord: SavedCollectionRecord | null;
  onGoSearch: () => void;
  onGoChecklist: () => void;
  onExportPdf: () => void;
  isExportingPdf?: boolean;
  // Sheets props
  isAuthenticated: boolean;
  googleEmail: string | null;
  isLoggingIn: boolean;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  spreadsheet: SpreadsheetMeta | null;
  isConnectingSheet: boolean;
  sheetError: string | null;
  sheetSuccessMsg: string | null;
  onCreateNewSheet: (customTitle: string) => void;
  onConnectExistingSheet: (urlOrId: string) => void;
  onDisconnectSheet: () => void;
  onRequestSaveLab: () => void;
  onRequestSaveScores: () => void;
  onRequestSaveAll: () => void;
  labRows: string[][];
  scoreRows: string[][];
  isLoadingRows: boolean;
  onRefreshRows: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  preScore,
  postScore,
  scoreHistory,
  ratings,
  selectedTests,
  hemoSites,
  patientNote,
  savedRecord,
  onGoSearch,
  onGoChecklist,
  onExportPdf,
  isExportingPdf = false,
  isAuthenticated,
  googleEmail,
  isLoggingIn,
  onGoogleLogin,
  onGoogleLogout,
  spreadsheet,
  isConnectingSheet,
  sheetError,
  sheetSuccessMsg,
  onCreateNewSheet,
  onConnectExistingSheet,
  onDisconnectSheet,
  onRequestSaveLab,
  onRequestSaveScores,
  onRequestSaveAll,
  labRows,
  scoreRows,
  isLoadingRows,
  onRefreshRows,
}) => {
  const ratingKeys = Object.keys(ratings);
  const avgSatisfaction = ratingKeys.length
    ? (
        ratingKeys.reduce((acc, k) => acc + ratings[Number(k)], 0) /
        ratingKeys.length
      ).toFixed(2)
    : '-';

  const scoreDelta =
    preScore !== null && postScore !== null ? postScore - preScore : null;

  const groupedTubes = ORDER_OF_DRAW.map((tubeKey) => {
    const tests = LAB_TESTS.filter(
      (t) => selectedTests[t.id] && t.tube === tubeKey
    ).map((t) => t.name);
    return { tubeKey, tests };
  }).filter((g) => g.tests.length > 0);

  const canSaveLab = groupedTubes.length > 0;
  const canSaveScores =
    preScore !== null || postScore !== null || ratingKeys.length > 0;

  return (
    <div className="space-y-6">
      {/* Score Overview KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Pre-test
          </div>
          <div className="font-mono text-4xl font-bold text-[#1565C0] dark:text-blue-400 tabular-nums">
            {preScore === null ? '-' : preScore}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">เต็ม 10 คะแนน</div>
        </div>

        <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Post-test
          </div>
          <div className="font-mono text-4xl font-bold text-[#1565C0] dark:text-blue-400 tabular-nums">
            {postScore === null ? '-' : postScore}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">เต็ม 10 คะแนน</div>
        </div>

        <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            ความพึงพอใจเฉลี่ย
          </div>
          <div className="font-mono text-4xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {avgSatisfaction}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">เต็ม 5 คะแนน</div>
        </div>
      </section>

      {scoreDelta !== null && (
        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl px-5 py-3.5 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <TrendingUp className="w-4 h-4 text-[#1565C0] dark:text-blue-400" />
            <span>คะแนนเปลี่ยนแปลง (Post-test เทียบ Pre-test)</span>
          </div>
          <span className="font-mono font-bold text-base text-[#1565C0] dark:text-blue-300 tabular-nums">
            {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} คะแนน
          </span>
        </div>
      )}

      {/* Pre-test vs Post-test Visual Trend Chart */}
      <ScoreTrendChart
        history={scoreHistory}
        sheetScoreRows={scoreRows}
        currentPreScore={preScore}
        currentPostScore={postScore}
      />

      {/* Selected Lab Tests & Tubes */}
      <section className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              ตรวจเลือดอะไรบ้าง ใช้หลอดสีอะไร
            </h3>
            {savedRecord && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ยืนยันขั้นตอนล่าสุดเมื่อ {savedRecord.at}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-semibold text-[#1565C0] dark:text-blue-300 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'กำลังสร้าง PDF...' : 'ส่งออก PDF (Checklist & ขั้นตอน)'}</span>
            </button>
            <button
              type="button"
              onClick={onGoSearch}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5" />
              <span>เลือก/แก้ไขรายการตรวจ</span>
            </button>
          </div>
        </div>

        {groupedTubes.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
            ยังไม่ได้เลือกรายการตรวจ — ไปที่ขั้นตอน “ค้นหาการตรวจ”
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedTubes.map(({ tubeKey, tests }, idx) => {
              const tube = TUBES[tubeKey];
              return (
                <div
                  key={tubeKey}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <BloodTubeIllustration tubeKey={tubeKey} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono text-[#1565C0] dark:text-blue-400 tabular-nums">
                      ลำดับที่ {idx + 1}
                    </div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {tube.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {tests.join(', ')}
                    </div>
                    {tubeKey === 'cult' && (
                      <div className="text-xs font-medium text-teal-700 dark:text-teal-300 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          ตำแหน่งเจาะ:{' '}
                          {formatHemoCultureSites(hemoSites) || 'ยังไม่ได้ระบุตำแหน่งขวด 1'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {patientNote.trim().length > 0 && (
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/70 bg-blue-50/60 dark:bg-blue-950/30 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <StickyNote className="w-4 h-4 text-[#1565C0] dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#1565C0] dark:text-blue-300">
                  โน้ตย่อ / คำแนะนำเพิ่มเติมรายบุคคล
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-0.5 break-words">
                  {patientNote}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onGoChecklist}
              className="text-xs font-medium text-[#1565C0] dark:text-blue-400 hover:underline shrink-0 cursor-pointer whitespace-nowrap"
            >
              แก้ไขโน้ต
            </button>
          </div>
        )}
      </section>

      {/* Google Sheets Integration Panel */}
      <SheetsPanel
        isAuthenticated={isAuthenticated}
        googleEmail={googleEmail}
        isLoggingIn={isLoggingIn}
        onGoogleLogin={onGoogleLogin}
        onGoogleLogout={onGoogleLogout}
        spreadsheet={spreadsheet}
        isConnectingSheet={isConnectingSheet}
        sheetError={sheetError}
        sheetSuccessMsg={sheetSuccessMsg}
        onCreateNewSheet={onCreateNewSheet}
        onConnectExistingSheet={onConnectExistingSheet}
        onDisconnectSheet={onDisconnectSheet}
        onRequestSaveLab={onRequestSaveLab}
        onRequestSaveScores={onRequestSaveScores}
        onRequestSaveAll={onRequestSaveAll}
        canSaveLab={canSaveLab}
        canSaveScores={canSaveScores}
        labRows={labRows}
        scoreRows={scoreRows}
        isLoadingRows={isLoadingRows}
        onRefreshRows={onRefreshRows}
      />
    </div>
  );
};
