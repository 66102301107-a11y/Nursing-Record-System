import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  Plus,
  Link2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  UploadCloud,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  SpreadsheetMeta,
  LAB_TAB_NAME,
  SCORE_TAB_NAME,
} from '../services/googleSheets';

interface SheetsPanelProps {
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
  canSaveLab: boolean;
  canSaveScores: boolean;
  labRows: string[][];
  scoreRows: string[][];
  isLoadingRows: boolean;
  onRefreshRows: () => void;
  compact?: boolean;
}

export const SheetsPanel: React.FC<SheetsPanelProps> = ({
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
  canSaveLab,
  canSaveScores,
  labRows,
  scoreRows,
  isLoadingRows,
  onRefreshRows,
  compact = false,
}) => {
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [newSheetTitle, setNewSheetTitle] = useState('HemoGuide - บันทึกผลการตรวจและคะแนน');
  const [activePreviewTab, setActivePreviewTab] = useState<'lab' | 'score'>('lab');

  return (
    <section className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              บันทึกข้อมูลลง Google Sheets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              บันทึกผลการตรวจเลือด รายการหลอด และคะแนนแบบทดสอบ/ความพึงพอใจ
            </p>
          </div>
        </div>

        {isAuthenticated && googleEmail && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="truncate max-w-[180px]">{googleEmail}</span>
            <button
              type="button"
              onClick={onGoogleLogout}
              className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="ออกจากระบบบัญชี Google"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>สลับบัญชี</span>
            </button>
          </div>
        )}
      </div>

      {sheetError && (
        <div className="flex items-start gap-2.5 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{sheetError}</span>
        </div>
      )}

      {sheetSuccessMsg && (
        <div className="flex items-start gap-2.5 text-sm text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{sheetSuccessMsg}</span>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              เชื่อมต่อบัญชี Google เพื่อเริ่มบันทึกข้อมูล
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ระบบจะขอสิทธิ์เข้าถึง Google Sheets ของท่านเพื่อสร้างและเพิ่มแถวข้อมูลอย่างปลอดภัย
            </p>
          </div>
          <div className="shrink-0">
            <GoogleSignInButton
              onClick={onGoogleLogin}
              disabled={isLoggingIn}
              label={isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'Sign in with Google'}
            />
          </div>
        </div>
      ) : !spreadsheet ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Option 1: Create new Google Sheet */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/60 dark:bg-slate-900/30">
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              สร้างไฟล์ Google Sheets ใหม่
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              สร้างสเปรดชีตใหม่พร้อมแท็บ “{LAB_TAB_NAME}” และ “{SCORE_TAB_NAME}” อัตโนมัติ
            </p>
            <input
              type="text"
              value={newSheetTitle}
              onChange={(e) => setNewSheetTitle(e.target.value)}
              placeholder="ชื่อไฟล์ Google Sheets"
              className="w-full min-h-[42px] px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B121C] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/40"
            />
            <button
              type="button"
              onClick={() => onCreateNewSheet(newSheetTitle)}
              disabled={isConnectingSheet}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isConnectingSheet ? 'กำลังสร้าง...' : 'สร้างสเปรดชีตใหม่'}</span>
            </button>
          </div>

          {/* Option 2: Connect existing Google Sheet */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/60 dark:bg-slate-900/30">
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              เชื่อมต่อไฟล์ Google Sheets ที่มีอยู่แล้ว
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              วางลิงก์ URL ของ Google Sheets หรือ Spreadsheet ID ที่ท่านมีสิทธิ์แก้ไข
            </p>
            <input
              type="text"
              value={sheetUrlInput}
              onChange={(e) => setSheetUrlInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full min-h-[42px] px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B121C] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/40"
            />
            <button
              type="button"
              onClick={() => onConnectExistingSheet(sheetUrlInput)}
              disabled={isConnectingSheet || !sheetUrlInput.trim()}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131D2B] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Link2 className="w-4 h-4" />
              <span>{isConnectingSheet ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อสเปรดชีต'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected sheet bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <div className="min-w-0">
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                เชื่อมต่อสเปรดชีตแล้ว
              </div>
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                {spreadsheet.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                แท็บที่มี: {spreadsheet.sheets.map((s) => s.title).join(' · ')}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={spreadsheet.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[40px] px-3 py-1.5 rounded-lg bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-700 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>เปิด Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={onDisconnectSheet}
                className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                เปลี่ยนไฟล์
              </button>
            </div>
          </div>

          {/* Action buttons to save to Sheets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={onRequestSaveLab}
              disabled={!canSaveLab}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-45 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 shrink-0" />
              <span className="truncate">บันทึกผลการตรวจ</span>
            </button>
            <button
              type="button"
              onClick={onRequestSaveScores}
              disabled={!canSaveScores}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-45 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 shrink-0" />
              <span className="truncate">บันทึกคะแนน/ประเมิน</span>
            </button>
            <button
              type="button"
              onClick={onRequestSaveAll}
              disabled={!canSaveLab && !canSaveScores}
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-blue-600/30 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-45 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span className="truncate">บันทึกทั้งหมด</span>
            </button>
          </div>

          {(!canSaveLab || !canSaveScores) && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {!canSaveLab && !canSaveScores
                ? 'เลือกรายการตรวจเลือด หรือทำแบบทดสอบ/แบบประเมินก่อนบันทึกข้อมูล'
                : !canSaveLab
                  ? 'หากต้องการบันทึกผลการตรวจ กรุณาเลือกรายการตรวจเลือดในขั้นตอนค้นหา'
                  : 'หากต้องการบันทึกคะแนน กรุณาทำ Pre-test, Post-test หรือแบบประเมินความพึงพอใจ'}
            </p>
          )}

          {/* Live Sheet Preview */}
          {!compact && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('lab')}
                    className={`min-h-[34px] px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      activePreviewTab === 'lab'
                        ? 'bg-white dark:bg-[#131D2B] text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {LAB_TAB_NAME}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('score')}
                    className={`min-h-[34px] px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      activePreviewTab === 'score'
                        ? 'bg-white dark:bg-[#131D2B] text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {SCORE_TAB_NAME}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onRefreshRows}
                  disabled={isLoadingRows}
                  className="min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRows ? 'animate-spin' : ''}`} />
                  <span>รีเฟรชข้อมูล</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                {(() => {
                  const rows = activePreviewTab === 'lab' ? labRows : scoreRows;
                  if (isLoadingRows && rows.length === 0) {
                    return (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        กำลังโหลดข้อมูลจาก Google Sheets...
                      </div>
                    );
                  }
                  if (rows.length <= 1) {
                    return (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        ยังไม่มีรายการบันทึกในแท็บ “{activePreviewTab === 'lab' ? LAB_TAB_NAME : SCORE_TAB_NAME}”
                      </div>
                    );
                  }
                  const headers = rows[0];
                  const bodyRows = rows.slice(1).reverse().slice(0, 8);
                  return (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/30">
                          {headers.map((h, i) => (
                            <th
                              key={i}
                              className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {bodyRows.map((r, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            {headers.map((_, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-3 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-[220px] truncate tabular-nums"
                                title={r[cIdx] || ''}
                              >
                                {r[cIdx] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
