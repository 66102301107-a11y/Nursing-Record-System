import React from 'react';
import { FileSpreadsheet, AlertCircle, X } from 'lucide-react';

export interface SheetConfirmPreviewRow {
  label: string;
  value: string;
}

export interface SheetConfirmRequest {
  title: string;
  description: string;
  spreadsheetTitle: string;
  targetTabs: string[];
  previewRows: SheetConfirmPreviewRow[];
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

interface SheetsConfirmModalProps {
  request: SheetConfirmRequest | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SheetsConfirmModal: React.FC<SheetsConfirmModalProps> = ({
  request,
  isSubmitting,
  onCancel,
  onConfirm,
}) => {
  if (!request) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheets-confirm-title"
    >
      <div className="w-full sm:max-w-lg bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="sheets-confirm-title"
                className="font-display text-base font-semibold text-slate-900 dark:text-slate-100"
              >
                {request.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {request.spreadsheetTitle} · แท็บ: {request.targetTabs.join(', ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="ปิดหน้าต่างยืนยัน"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3.5">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>{request.description}</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              ตัวอย่างข้อมูลที่จะบันทึกลง Google Sheets
            </div>
            <dl className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
              {request.previewRows.map((row, idx) => (
                <div key={idx} className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <dt className="text-slate-500 dark:text-slate-400 shrink-0">{row.label}</dt>
                  <dd className="text-slate-900 dark:text-slate-100 font-medium sm:text-right break-words tabular-nums">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            {isSubmitting ? 'กำลังบันทึก...' : request.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
