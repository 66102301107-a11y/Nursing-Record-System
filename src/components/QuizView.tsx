import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { QUIZZES } from '../data/hemoData';

interface QuizViewProps {
  quizType: 'pre' | 'post';
  existingScore: number | null;
  onComplete: (score: number) => void;
  onBackHome: () => void;
  onGoSummaryForSheets: () => void;
}

const OPTION_LETTERS = ['ก', 'ข', 'ค', 'ง'];

export const QuizView: React.FC<QuizViewProps> = ({
  quizType,
  existingScore,
  onComplete,
  onBackHome,
  onGoSummaryForSheets,
}) => {
  const questions = QUIZZES[quizType];
  const title =
    quizType === 'pre'
      ? 'แบบประเมินก่อนเรียนรู้ (Pre-test)'
      : 'แบบทดสอบหลังเรียน (Post-test)';

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [finished, setFinished] = useState(existingScore !== null && index === 0 ? false : false);

  const handleRestart = () => {
    setIndex(0);
    setScore(0);
    setSelectedOption(null);
    setFinished(false);
  };

  const handlePick = (optIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);
    if (optIdx === questions[index].correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    const nextIdx = index + 1;
    if (nextIdx >= questions.length) {
      setFinished(true);
      onComplete(score);
    } else {
      setIndex(nextIdx);
      setSelectedOption(null);
    }
  };

  if (finished) {
    const passed = score >= 8;
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <div className="font-mono text-5xl font-bold text-[#1565C0] dark:text-blue-400 tabular-nums">
            {score} / {questions.length}
          </div>
          <div
            className={`inline-flex items-center gap-2 text-sm font-semibold ${
              passed
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {passed ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>
              {passed
                ? 'ผ่านเกณฑ์ (≥ 8 คะแนน)'
                : 'ยังไม่ผ่านเกณฑ์ (ต้อง ≥ 8 คะแนน)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onGoSummaryForSheets}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>บันทึกคะแนนลง Sheets</span>
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ทำใหม่</span>
          </button>
          <button
            type="button"
            onClick={onBackHome}
            className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D2B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium cursor-pointer"
          >
            กลับเมนูหลัก
          </button>
        </div>
      </div>
    );
  }

  const current = questions[index];
  const progressPct = Math.round((index * 100) / questions.length);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{title}</span>
          <span className="font-mono font-semibold text-[#1565C0] dark:text-blue-400 tabular-nums">
            ข้อ {index + 1} / {questions.length}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1565C0] transition-all duration-200 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
          {index + 1}. {current.question}
        </h3>

        <div className="space-y-2.5">
          {current.options.map((opt, optIdx) => {
            const isAnswered = selectedOption !== null;
            const isCorrect = optIdx === current.correctIndex;
            const isChosen = optIdx === selectedOption;

            let styleClass =
              'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B121C] hover:border-blue-400 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200';
            if (isAnswered) {
              if (isCorrect) {
                styleClass =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
              } else if (isChosen) {
                styleClass =
                  'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
              } else {
                styleClass =
                  'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400';
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isAnswered}
                onClick={() => handlePick(optIdx)}
                className={`w-full min-h-[48px] text-left px-4 py-3 rounded-xl border text-sm sm:text-base transition-colors flex items-start gap-3 cursor-pointer disabled:cursor-default ${styleClass}`}
              >
                <span className="font-semibold shrink-0">{OPTION_LETTERS[optIdx]}.</span>
                <span className="flex-1">{opt}</span>
                {isAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
                {isAnswered && isChosen && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div className="pt-2 space-y-3">
            <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3.5 text-sm text-slate-800 dark:text-slate-200">
              <span className="font-semibold text-[#1565C0] dark:text-blue-300">
                เฉลย: {OPTION_LETTERS[current.correctIndex]}.
              </span>{' '}
              {current.options[current.correctIndex]}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{index === questions.length - 1 ? 'ดูคะแนน' : 'ข้อต่อไป'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
