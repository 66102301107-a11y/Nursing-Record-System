import React from 'react';
import { Send } from 'lucide-react';
import { SURVEY_ITEMS } from '../data/hemoData';

interface SurveyViewProps {
  ratings: Record<number, number>;
  issueComment: string;
  suggestionComment: string;
  onRate: (idx: number, score: number) => void;
  onChangeIssue: (val: string) => void;
  onChangeSuggestion: (val: string) => void;
  onSubmit: () => void;
}

const RATING_LABELS: Record<number, string> = {
  5: '5 · มากที่สุด',
  4: '4 · มาก',
  3: '3 · ปานกลาง',
  2: '2 · น้อย',
  1: '1 · น้อยที่สุด',
};

export const SurveyView: React.FC<SurveyViewProps> = ({
  ratings,
  issueComment,
  suggestionComment,
  onRate,
  onChangeIssue,
  onChangeSuggestion,
  onSubmit,
}) => {
  const answeredCount = Object.keys(ratings).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
        <span>5 = มากที่สุด · 4 = มาก · 3 = ปานกลาง · 2 = น้อย · 1 = น้อยที่สุด</span>
        <span className="font-mono font-semibold text-[#1565C0] dark:text-blue-400 tabular-nums">
          ประเมินแล้ว {answeredCount}/{SURVEY_ITEMS.length} ข้อ
        </span>
      </div>

      <div className="space-y-3">
        {SURVEY_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3"
          >
            <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100">
              <span className="font-mono text-xs text-slate-400 mr-2 tabular-nums">
                {idx + 1}.
              </span>
              {item}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[5, 4, 3, 2, 1].map((score) => {
                const selected = ratings[idx] === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => onRate(idx, score)}
                    title={RATING_LABELS[score]}
                    className={`min-h-[44px] rounded-xl border text-sm font-semibold tabular-nums transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#1565C0] bg-[#1565C0] text-white'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <label
            htmlFor="survey-issue"
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
          >
            ท่านพบปัญหาหรืออุปสรรคระหว่างการใช้งานแอปพลิเคชัน
          </label>
          <textarea
            id="survey-issue"
            rows={2}
            value={issueComment}
            onChange={(e) => onChangeIssue(e.target.value)}
            placeholder="ระบุปัญหาที่พบ (ถ้ามี)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B121C] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40"
          />
        </div>

        <div>
          <label
            htmlFor="survey-suggestion"
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
          >
            ข้อเสนอแนะในการปรับปรุงหรือพัฒนาแอปพลิเคชัน
          </label>
          <textarea
            id="survey-suggestion"
            rows={2}
            value={suggestionComment}
            onChange={(e) => onChangeSuggestion(e.target.value)}
            placeholder="ระบุข้อเสนอแนะเพิ่มเติม..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B121C] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>ส่งแบบประเมินและไปหน้าสรุปผล</span>
        </button>
      </div>
    </div>
  );
};
