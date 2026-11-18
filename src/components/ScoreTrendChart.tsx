import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface ScoreHistoryEntry {
  id: string;
  label: string;
  timestamp: string;
  preScore: number | null;
  postScore: number | null;
}

interface ScoreTrendChartProps {
  history: ScoreHistoryEntry[];
  sheetScoreRows: string[][];
  currentPreScore: number | null;
  currentPostScore: number | null;
}

interface ChartPoint {
  label: string;
  timestamp: string;
  pre: number | null;
  post: number | null;
}

function parseNumericScore(val: string | undefined): number | null {
  if (!val || val.trim() === '-' || val.trim() === '') return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}

function formatShortTime(ts: string): string {
  const parts = ts.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts[1].slice(0, 5);
  }
  return ts.slice(0, 12);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | null;
    color?: string;
    payload?: ChartPoint;
  }>;
}

const CustomScoreTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const delta =
    point.pre !== null && point.post !== null ? point.post - point.pre : null;

  return (
    <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-md text-xs space-y-1.5 min-w-[170px]">
      <div className="font-semibold text-slate-900 dark:text-slate-100">
        {point.label}
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
        {point.timestamp}
      </div>
      <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800 tabular-nums">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-300">Pre-test</span>
          <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
            {point.pre === null ? '-' : `${point.pre} / 10`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-300">Post-test</span>
          <span className="font-mono font-semibold text-[#1565C0] dark:text-blue-400">
            {point.post === null ? '-' : `${point.post} / 10`}
          </span>
        </div>
        {delta !== null && (
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">พัฒนาการ</span>
            <span
              className={`font-mono font-bold ${
                delta >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {delta >= 0 ? `+${delta}` : delta} คะแนน
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({
  history,
  sheetScoreRows,
  currentPreScore,
  currentPostScore,
}) => {
  const sheetData: ChartPoint[] = useMemo(() => {
    if (sheetScoreRows.length <= 1) return [];
    return sheetScoreRows
      .slice(1)
      .map((row, idx) => {
        const ts = row[0] || `ครั้งที่ ${idx + 1}`;
        const pre = parseNumericScore(row[3]);
        const post = parseNumericScore(row[4]);
        return {
          label: `บันทึก ${idx + 1} (${formatShortTime(ts)})`,
          timestamp: ts,
          pre,
          post,
        };
      })
      .filter((p) => p.pre !== null || p.post !== null);
  }, [sheetScoreRows]);

  const localData: ChartPoint[] = useMemo(() => {
    if (history.length > 0) {
      return history.map((h) => ({
        label: h.label,
        timestamp: h.timestamp,
        pre: h.preScore,
        post: h.postScore,
      }));
    }
    if (currentPreScore !== null || currentPostScore !== null) {
      return [
        {
          label: 'ครั้งล่าสุด',
          timestamp: new Date().toLocaleString('th-TH'),
          pre: currentPreScore,
          post: currentPostScore,
        },
      ];
    }
    return [];
  }, [history, currentPreScore, currentPostScore]);

  const [source, setSource] = useState<'local' | 'sheets'>('local');
  const effectiveSource =
    source === 'sheets' && sheetData.length > 0
      ? 'sheets'
      : localData.length > 0
        ? 'local'
        : sheetData.length > 0
          ? 'sheets'
          : 'local';

  const chartData = effectiveSource === 'sheets' ? sheetData : localData;

  return (
    <section className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1565C0] dark:text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              แนวโน้มพัฒนาการคะแนน (Pre-test เทียบ Post-test)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              เปรียบเทียบคะแนนก่อนเรียนและหลังเรียนแต่ละรอบ · เกณฑ์ผ่าน 8 / 10 คะแนน
            </p>
          </div>
        </div>

        {sheetData.length > 0 && localData.length > 0 && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSource('local')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                effectiveSource === 'local'
                  ? 'bg-white dark:bg-[#131D2B] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ประวัติในแอป ({localData.length})
            </button>
            <button
              type="button"
              onClick={() => setSource('sheets')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                effectiveSource === 'sheets'
                  ? 'bg-white dark:bg-[#131D2B] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              จาก Google Sheets ({sheetData.length})
            </button>
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="py-10 px-4 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
          ยังไม่มีข้อมูลคะแนนสำหรับแสดงกราฟแนวโน้ม — กรุณาทำแบบทดสอบ Pre-test หรือ Post-test เพื่อเริ่มติดตามพัฒนาการ
        </div>
      ) : (
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 16, left: -12, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#94a3b8"
                strokeOpacity={0.25}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip content={<CustomScoreTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
              <ReferenceLine
                y={8}
                stroke="#16a34a"
                strokeDasharray="5 4"
                label={{
                  value: 'เกณฑ์ผ่าน (8)',
                  position: 'insideTopRight',
                  fill: '#16a34a',
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="pre"
                name="Pre-test (ก่อนเรียน)"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="post"
                name="Post-test (หลังเรียน)"
                stroke="#1565C0"
                strokeWidth={3}
                dot={{ r: 5, fill: '#1565C0', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
