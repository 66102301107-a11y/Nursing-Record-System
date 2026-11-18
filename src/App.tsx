import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  ClipboardCheck,
  BookOpen,
  FileText,
  Target,
  Smile,
  BarChart3,
  Search,
  ArrowRight,
  Sun,
  Moon,
  ChevronLeft,
  FileSpreadsheet,
  UserCircle2,
  AlertTriangle,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  CHECKLIST_ITEMS,
  HemoCultureSitesState,
  LAB_TESTS,
  ORDER_OF_DRAW,
  SURVEY_ITEMS,
  TUBES,
  TubeKey,
  formatHemoCultureSites,
} from './data/hemoData';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logoutGoogle,
  clearAccessToken,
} from './services/googleAuth';
import {
  SpreadsheetMeta,
  LAB_TAB_NAME,
  SCORE_TAB_NAME,
  parseSpreadsheetId,
  getSpreadsheetMetadata,
  createHemoGuideSpreadsheet,
  ensureRequiredTabs,
  appendLabRecord,
  appendScoreRecord,
  readTabRows,
} from './services/googleSheets';
import { LoginView } from './components/LoginView';
import {
  ChecklistStep,
  SearchStep,
  MixStep,
  SavedStep,
  FlowStepper,
  SavedCollectionRecord,
} from './components/ChecklistFlow';
import { QuizView } from './components/QuizView';
import { LearningZoneView } from './components/LearningZoneView';
import { SurveyView } from './components/SurveyView';
import { SummaryView } from './components/SummaryView';
import { ScoreHistoryEntry } from './components/ScoreTrendChart';
import {
  SheetsConfirmModal,
  SheetConfirmRequest,
} from './components/SheetsConfirmModal';
import { exportChecklistAndProcedurePdf } from './services/pdfExport';

type ViewName =
  | 'login'
  | 'home'
  | 'check'
  | 'search'
  | 'mix'
  | 'saved'
  | 'pre'
  | 'post'
  | 'learn'
  | 'survey'
  | 'sum';

const SPREADSHEET_STORAGE_KEY = 'hemoguide_spreadsheet_id';
const SCORE_HISTORY_STORAGE_KEY = 'hemoguide_score_history';
const PATIENT_NOTE_STORAGE_KEY = 'hemoguide_patient_note';

export default function App() {
  const [view, setView] = useState<ViewName>('login');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Profile state
  const [userType, setUserType] = useState('นักศึกษาพยาบาล');
  const [prefix, setPrefix] = useState('นาย');
  const [name, setName] = useState('');

  // Clinical flow & learning state
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem(SCORE_HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as ScoreHistoryEntry[];
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });
  const [checklistMap, setChecklistMap] = useState<Record<number, boolean>>({});
  const [selectedTests, setSelectedTests] = useState<Record<number, boolean>>({});
  const [verifiedTubes, setVerifiedTubes] = useState<Record<TubeKey, boolean>>({
    cult: false,
    red: false,
    blue: false,
    green: false,
    purple: false,
    lav: false,
    grey: false,
  });
  const [hemoSites, setHemoSites] = useState<HemoCultureSitesState>({
    bottle1: '',
    bottle2: '',
  });
  const [patientNote, setPatientNote] = useState<string>(() => {
    try {
      return localStorage.getItem(PATIENT_NOTE_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [savedRecord, setSavedRecord] = useState<SavedCollectionRecord | null>(null);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [issueComment, setIssueComment] = useState('');
  const [suggestionComment, setSuggestionComment] = useState('');

  // Google Auth & Sheets state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetMeta | null>(null);
  const [isConnectingSheet, setIsConnectingSheet] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetSuccessMsg, setSheetSuccessMsg] = useState<string | null>(null);
  const [labRows, setLabRows] = useState<string[][]>([]);
  const [scoreRows, setScoreRows] = useState<string[][]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);

  // Mandatory confirmation dialog before writing to Sheets
  const [confirmRequest, setConfirmRequest] = useState<SheetConfirmRequest | null>(null);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  // Unsaved-to-Google-Sheets reminder tracking (Banner & Toast on Home)
  const [hasUnsavedLabInSheets, setHasUnsavedLabInSheets] = useState(false);
  const [hasUnsavedScoreInSheets, setHasUnsavedScoreInSheets] = useState(false);
  const [reminderBannerDismissed, setReminderBannerDismissed] = useState(false);
  const [homeToastVisible, setHomeToastVisible] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    if (!homeToastVisible) return;
    const timer = window.setTimeout(() => setHomeToastVisible(false), 8000);
    return () => window.clearTimeout(timer);
  }, [homeToastVisible]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const recordQuizAttempt = useCallback(
    (kind: 'pre' | 'post', newScore: number) => {
      const nextPre = kind === 'pre' ? newScore : preScore;
      const nextPost = kind === 'post' ? newScore : postScore;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const fullTs = now.toLocaleString('th-TH');

      setScoreHistory((prev) => {
        const nextEntry: ScoreHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label: `ครั้งที่ ${prev.length + 1} (${timeStr})`,
          timestamp: fullTs,
          preScore: nextPre,
          postScore: nextPost,
        };
        const updated = [...prev, nextEntry].slice(-20);
        try {
          localStorage.setItem(SCORE_HISTORY_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore storage quota errors
        }
        return updated;
      });
    },
    [preScore, postScore]
  );

  const loadRowsFromSpreadsheet = useCallback(
    async (token: string, meta: SpreadsheetMeta) => {
      setIsLoadingRows(true);
      try {
        const tabNames = new Set(meta.sheets.map((s) => s.title));
        const [labs, scores] = await Promise.all([
          tabNames.has(LAB_TAB_NAME)
            ? readTabRows(token, meta.spreadsheetId, LAB_TAB_NAME)
            : Promise.resolve([]),
          tabNames.has(SCORE_TAB_NAME)
            ? readTabRows(token, meta.spreadsheetId, SCORE_TAB_NAME)
            : Promise.resolve([]),
        ]);
        setLabRows(labs);
        setScoreRows(scores);
      } catch {
        // Non-blocking preview error
      } finally {
        setIsLoadingRows(false);
      }
    },
    []
  );

  // Restore saved spreadsheet metadata if user signs in
  const tryRestoreSavedSpreadsheet = useCallback(
    async (token: string) => {
      const savedId = localStorage.getItem(SPREADSHEET_STORAGE_KEY);
      if (!savedId) return;
      setIsConnectingSheet(true);
      try {
        const meta = await getSpreadsheetMetadata(token, savedId);
        setSpreadsheet(meta);
        setSheetError(null);
        await loadRowsFromSpreadsheet(token, meta);
      } catch {
        localStorage.removeItem(SPREADSHEET_STORAGE_KEY);
      } finally {
        setIsConnectingSheet(false);
      }
    },
    [loadRowsFromSpreadsheet]
  );

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setNeedsAuth(false);
        void tryRestoreSavedSpreadsheet(token);
      },
      (user) => {
        setGoogleUser(user);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, [tryRestoreSavedSpreadsheet]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setSheetError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setNeedsAuth(false);
        await tryRestoreSavedSpreadsheet(res.accessToken);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'ไม่สามารถเข้าสู่ระบบ Google ได้';
      setSheetError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setNeedsAuth(true);
    setSpreadsheet(null);
    setLabRows([]);
    setScoreRows([]);
    setSheetSuccessMsg(null);
  };

  const handleAuthErrorIfExpired = (err: unknown): string => {
    const anyErr = err as { status?: number; message?: string };
    if (anyErr?.status === 401) {
      clearAccessToken();
      setNeedsAuth(true);
      return 'สิทธิ์การเชื่อมต่อ Google หมดอายุ กรุณาเข้าสู่ระบบ Google ใหม่อีกครั้ง';
    }
    return anyErr?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets';
  };

  const handleCreateNewSheet = async (customTitle: string) => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      setSheetError('กรุณาเข้าสู่ระบบ Google ก่อนสร้างสเปรดชีต');
      return;
    }

    setIsConnectingSheet(true);
    setSheetError(null);
    setSheetSuccessMsg(null);
    try {
      const meta = await createHemoGuideSpreadsheet(token, customTitle);
      localStorage.setItem(SPREADSHEET_STORAGE_KEY, meta.spreadsheetId);
      setSpreadsheet(meta);
      setSheetSuccessMsg(`สร้างสเปรดชีต "${meta.title}" สำเร็จแล้ว`);
      await loadRowsFromSpreadsheet(token, meta);
    } catch (err) {
      setSheetError(handleAuthErrorIfExpired(err));
    } finally {
      setIsConnectingSheet(false);
    }
  };

  const handleConnectExistingSheet = async (urlOrId: string) => {
    const id = parseSpreadsheetId(urlOrId);
    if (!id) {
      setSheetError('รูปแบบลิงก์หรือ Spreadsheet ID ไม่ถูกต้อง');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      setSheetError('กรุณาเข้าสู่ระบบ Google ก่อนเชื่อมต่อสเปรดชีต');
      return;
    }

    setIsConnectingSheet(true);
    setSheetError(null);
    setSheetSuccessMsg(null);
    try {
      const meta = await getSpreadsheetMetadata(token, id);
      localStorage.setItem(SPREADSHEET_STORAGE_KEY, meta.spreadsheetId);
      setSpreadsheet(meta);
      setSheetSuccessMsg(`เชื่อมต่อสเปรดชีต "${meta.title}" แล้ว`);
      await loadRowsFromSpreadsheet(token, meta);
    } catch (err) {
      setSheetError(handleAuthErrorIfExpired(err));
    } finally {
      setIsConnectingSheet(false);
    }
  };

  const handleDisconnectSheet = () => {
    localStorage.removeItem(SPREADSHEET_STORAGE_KEY);
    setSpreadsheet(null);
    setLabRows([]);
    setScoreRows([]);
    setSheetSuccessMsg(null);
    setSheetError(null);
  };

  const handleRefreshRows = async () => {
    if (!spreadsheet) return;
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    await loadRowsFromSpreadsheet(token, spreadsheet);
  };

  const navigate = (next: ViewName) => {
    setView(next);
    if (next === 'home' && (hasUnsavedLabInSheets || hasUnsavedScoreInSheets)) {
      setHomeToastVisible(true);
    } else if (next !== 'home') {
      setHomeToastVisible(false);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const startGuidedFlow = () => {
    setSavedRecord(null);
    navigate('check');
  };

  const toggleTest = (id: number) => {
    setSelectedTests((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const handleChangePatientNote = (next: string) => {
    setPatientNote(next);
    try {
      if (next.trim()) {
        localStorage.setItem(PATIENT_NOTE_STORAGE_KEY, next);
      } else {
        localStorage.removeItem(PATIENT_NOTE_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  };

  const handleSaveFlow = () => {
    const activeTubeKeys = ORDER_OF_DRAW.filter((k) =>
      LAB_TESTS.some((t) => selectedTests[t.id] && t.tube === k)
    );
    const selectedTestNames = LAB_TESTS.filter((t) => selectedTests[t.id]).map(
      (t) => t.name
    );
    const orderedTubeNames = activeTubeKeys.map((k) => TUBES[k].name);
    const hemoSitesLabel = selectedTests[0] ? formatHemoCultureSites(hemoSites) : '';
    const trimmedNote = patientNote.trim();
    const record: SavedCollectionRecord = {
      at: new Date().toLocaleString('th-TH'),
      testsCount: selectedTestNames.length,
      tubesCount: orderedTubeNames.length,
      selectedTestNames,
      orderedTubeNames,
      ...(hemoSitesLabel ? { hemoSitesLabel } : {}),
      ...(trimmedNote ? { patientNote: trimmedNote } : {}),
    };
    setSavedRecord(record);
    setHasUnsavedLabInSheets(true);
    setReminderBannerDismissed(false);
    navigate('saved');
  };

  // Build payloads for Google Sheets
  const buildLabPayload = () => {
    const activeTubeKeys = ORDER_OF_DRAW.filter((k) =>
      LAB_TESTS.some((t) => selectedTests[t.id] && t.tube === k)
    );
    const hemoSitesLabel = selectedTests[0] ? formatHemoCultureSites(hemoSites) : '';
    const selectedTestNames = LAB_TESTS.filter((t) => selectedTests[t.id]).map((t) =>
      t.id === 0 && hemoSitesLabel ? `${t.name} (${hemoSitesLabel})` : t.name
    );
    const trimmedNote = patientNote.trim();
    const selectedTestsText = trimmedNote
      ? `${selectedTestNames.join(', ')}${selectedTestNames.length ? ' ' : ''}[โน้ตผู้ป่วย: ${trimmedNote}]`
      : selectedTestNames.join(', ');
    const orderedTubeNames = activeTubeKeys.map(
      (k, idx) => `${idx + 1}. ${TUBES[k].name}`
    );
    const checklistComplete = CHECKLIST_ITEMS.every((c) => checklistMap[c.id]);
    const mixVerifiedComplete =
      activeTubeKeys.length > 0 && activeTubeKeys.every((k) => verifiedTubes[k]);

    return {
      savedAt: savedRecord?.at || new Date().toLocaleString('th-TH'),
      userType,
      fullName: `${prefix}${name}`,
      testCount: selectedTestNames.length,
      selectedTests: selectedTestsText,
      tubeCount: activeTubeKeys.length,
      orderedTubes: orderedTubeNames.join(' → '),
      checklistComplete,
      mixVerifiedComplete,
      googleEmail: googleUser?.email || '-',
    };
  };

  const buildScorePayload = () => {
    const ratingKeys = Object.keys(ratings);
    const avg = ratingKeys.length
      ? (
          ratingKeys.reduce((acc, k) => acc + ratings[Number(k)], 0) /
          ratingKeys.length
        ).toFixed(2)
      : '-';
    const breakdown = SURVEY_ITEMS.map((_, idx) =>
      ratings[idx] !== undefined ? `${idx + 1}:${ratings[idx]}` : `${idx + 1}:-`
    ).join(' | ');
    const delta =
      preScore !== null && postScore !== null
        ? `${postScore - preScore >= 0 ? '+' : ''}${postScore - preScore}`
        : '-';

    return {
      savedAt: new Date().toLocaleString('th-TH'),
      userType,
      fullName: `${prefix}${name}`,
      preScore,
      postScore,
      deltaScore: delta,
      surveyAvg: avg,
      surveyBreakdown: breakdown,
      issueComment: issueComment.trim(),
      suggestionComment: suggestionComment.trim(),
      googleEmail: googleUser?.email || '-',
    };
  };

  // Trigger confirmation modal before any Sheets write
  const requestSaveToSheets = async (mode: 'lab' | 'score' | 'both') => {
    setSheetError(null);
    setSheetSuccessMsg(null);

    const token = await getAccessToken();
    if (!token || needsAuth) {
      navigate('sum');
      setSheetError('กรุณาเข้าสู่ระบบ Google ในหน้าสรุปผลก่อนบันทึกข้อมูลลง Sheets');
      return;
    }

    if (!spreadsheet) {
      navigate('sum');
      setSheetError('กรุณาสร้างหรือเชื่อมต่อไฟล์ Google Sheets ในหน้าสรุปผลก่อนบันทึกข้อมูล');
      return;
    }

    const labPayload = buildLabPayload();
    const scorePayload = buildScorePayload();

    const targetTabs: string[] = [];
    const previewRows: Array<{ label: string; value: string }> = [
      { label: 'ผู้ปฏิบัติงาน', value: `${prefix}${name} (${userType})` },
    ];

    if (mode === 'lab' || mode === 'both') {
      targetTabs.push(LAB_TAB_NAME);
      previewRows.push(
        { label: 'รายการตรวจเลือด', value: labPayload.selectedTests || '-' },
        { label: 'ลำดับหลอดที่ใช้', value: labPayload.orderedTubes || '-' },
        {
          label: 'Checklist / ผสมหลอด',
          value: `${labPayload.checklistComplete ? 'Checklist ครบ' : 'Checklist ยังไม่ครบ'} · ${
            labPayload.mixVerifiedComplete ? 'พลิกหลอดครบ' : 'พลิกหลอดยังไม่ครบ'
          }`,
        }
      );
    }

    if (mode === 'score' || mode === 'both') {
      targetTabs.push(SCORE_TAB_NAME);
      previewRows.push(
        {
          label: 'คะแนน Pre / Post-test',
          value: `Pre: ${scorePayload.preScore ?? '-'}/10 · Post: ${scorePayload.postScore ?? '-'}/10 (เปลี่ยน ${scorePayload.deltaScore})`,
        },
        {
          label: 'ความพึงพอใจเฉลี่ย',
          value: `${scorePayload.surveyAvg} / 5`,
        }
      );
      if (scorePayload.issueComment || scorePayload.suggestionComment) {
        previewRows.push({
          label: 'ความคิดเห็น',
          value: [scorePayload.issueComment, scorePayload.suggestionComment]
            .filter(Boolean)
            .join(' / '),
        });
      }
    }

    setConfirmRequest({
      title: 'ยืนยันการบันทึกลง Google Sheets',
      description:
        'ระบบจะเพิ่มแถวข้อมูลใหม่ลงในสเปรดชีตที่เชื่อมต่อไว้ (หากยังไม่มีแท็บดังกล่าว ระบบจะสร้างแท็บและหัวตารางให้อัตโนมัติ)',
      spreadsheetTitle: spreadsheet.title,
      targetTabs,
      previewRows,
      confirmLabel: 'ยืนยันบันทึกลง Google Sheets',
      onConfirm: async () => {
        const freshToken = await getAccessToken();
        if (!freshToken) {
          setNeedsAuth(true);
          throw new Error('สิทธิ์การใช้งานหมดอายุ กรุณาเข้าสู่ระบบ Google ใหม่');
        }
        const needed: Array<'lab' | 'score'> =
          mode === 'both' ? ['lab', 'score'] : [mode];
        const updatedMeta = await ensureRequiredTabs(freshToken, spreadsheet, needed);
        setSpreadsheet(updatedMeta);

        if (mode === 'lab' || mode === 'both') {
          await appendLabRecord(freshToken, updatedMeta.spreadsheetId, labPayload);
          setHasUnsavedLabInSheets(false);
        }
        if (mode === 'score' || mode === 'both') {
          await appendScoreRecord(freshToken, updatedMeta.spreadsheetId, scorePayload);
          setHasUnsavedScoreInSheets(false);
        }

        setHomeToastVisible(false);
        setSheetSuccessMsg(
          `บันทึกข้อมูลลงแท็บ "${targetTabs.join(', ')}" ในไฟล์ "${updatedMeta.title}" เรียบร้อยแล้ว`
        );
        await loadRowsFromSpreadsheet(freshToken, updatedMeta);
      },
    });
  };

  const handleConfirmModalSubmit = async () => {
    if (!confirmRequest) return;
    setIsSubmittingConfirm(true);
    try {
      await confirmRequest.onConfirm();
      setConfirmRequest(null);
    } catch (err) {
      setSheetError(handleAuthErrorIfExpired(err));
      setConfirmRequest(null);
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await exportChecklistAndProcedurePdf({
        nurseName: `${prefix}${name.trim() || 'ผู้ปฏิบัติงาน'}`,
        userType,
        checkedMap: checklistMap,
        selectedTests,
        verifiedTubes,
        hemoSites,
        patientNote,
        savedAt: savedRecord?.at,
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (view === 'login') {
    return (
      <LoginView
        userType={userType}
        prefix={prefix}
        name={name}
        isGoogleAuthed={!needsAuth}
        googleEmail={googleUser?.email || null}
        isLoggingInGoogle={isLoggingIn}
        onChangeUserType={setUserType}
        onChangePrefix={setPrefix}
        onChangeName={setName}
        onGoogleSignIn={handleGoogleLogin}
        onSubmit={() => navigate('home')}
      />
    );
  }

  const pageTitles: Record<Exclude<ViewName, 'login'>, string> = {
    home: 'หน้าหลัก',
    check: 'Checklist ก่อนเจาะ',
    search: 'ค้นหาการตรวจ',
    mix: 'ผสม/พลิกหลอด',
    saved: 'บันทึกสำเร็จ',
    pre: 'แบบประเมินก่อนเรียนรู้ (Pre-test)',
    post: 'แบบทดสอบหลังเรียน (Post-test)',
    learn: 'Learning zone',
    survey: 'แบบประเมินความพึงพอใจ',
    sum: 'สรุปผลและ Google Sheets',
  };

  const checklistDoneCount = CHECKLIST_ITEMS.filter((c) => checklistMap[c.id]).length;
  const selectedTestsCount = Object.keys(selectedTests).length;
  const selectedPrecautionCount = LAB_TESTS.filter(
    (t) => selectedTests[t.id] && !!t.specialPrecaution
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] dark:bg-[#0B121C] text-[#172333] dark:text-[#E6EDF6]">
      {/* 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#131D2B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => navigate('home')}
            className="font-display text-xl font-bold tracking-tight text-[#1565C0] dark:text-blue-400 whitespace-nowrap shrink-0 cursor-pointer"
          >
            HemoGuide
          </button>

          {/* Zone 2: Clean single-line text nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => navigate('home')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'home' ? 'text-[#1565C0] dark:text-blue-400 font-semibold' : ''
              }`}
            >
              หน้าหลัก
            </button>
            <button
              type="button"
              onClick={() => navigate('learn')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'learn' ? 'text-[#1565C0] dark:text-blue-400 font-semibold' : ''
              }`}
            >
              Learning zone
            </button>
            <button
              type="button"
              onClick={() => navigate('search')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'search' ? 'text-[#1565C0] dark:text-blue-400 font-semibold' : ''
              }`}
            >
              ค้นหาการตรวจ
            </button>
            <button
              type="button"
              onClick={() => navigate('sum')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'sum' ? 'text-[#1565C0] dark:text-blue-400 font-semibold' : ''
              }`}
            >
              สรุปผล
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => navigate('sum')}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>บันทึก Sheets</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Sub-page header & workspace toolbar */}
        {view !== 'home' ? (
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => navigate('home')}
                className="min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D2B] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
                aria-label="กลับหน้าหลัก"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                {pageTitles[view]}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              className="min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D2B] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer shrink-0"
              aria-label="สลับโหมดสีหน้าจอ"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          /* Home Workspace Toolbar */
          <div className="bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1565C0] dark:text-blue-400 flex items-center justify-center shrink-0">
                <UserCircle2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 truncate">
                  สวัสดี {prefix}
                  {name}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                  {userType} · แม่นยำทุกการเจาะ
                  {googleUser?.email ? ` · Google: ${googleUser.email}` : ''}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate('login')}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                เปลี่ยนชื่อผู้ใช้
              </button>
              <button
                type="button"
                onClick={() => setIsDark((d) => !d)}
                className="min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D2B] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer"
                aria-label="สลับโหมดสีหน้าจอ"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Unsaved-to-Google-Sheets Warning Banner on Home */}
        {view === 'home' &&
          (hasUnsavedLabInSheets || hasUnsavedScoreInSheets) &&
          !reminderBannerDismissed && (() => {
            const pendingItems: string[] = [];
            if (hasUnsavedLabInSheets && savedRecord) {
              pendingItems.push(`ผลการตรวจเลือด (${savedRecord.testsCount} รายการ)`);
            }
            if (hasUnsavedScoreInSheets) {
              if (preScore !== null) pendingItems.push(`Pre-test (${preScore}/10)`);
              if (postScore !== null) pendingItems.push(`Post-test (${postScore}/10)`);
              if (Object.keys(ratings).length > 0) {
                pendingItems.push('แบบประเมินความพึงพอใจ');
              }
            }
            const saveMode: 'lab' | 'score' | 'both' =
              hasUnsavedLabInSheets && hasUnsavedScoreInSheets
                ? 'both'
                : hasUnsavedLabInSheets
                  ? 'lab'
                  : 'score';
            const canDirectSave = !needsAuth && !!spreadsheet;

            return (
              <div
                role="status"
                aria-live="polite"
                className="bg-amber-50/90 dark:bg-amber-950/35 border border-amber-300 dark:border-amber-800/70 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-display text-sm sm:text-base font-bold text-amber-950 dark:text-amber-200">
                      ยังไม่ได้บันทึกข้อมูลล่าสุดลง Google Sheets
                    </div>
                    <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                      รายการที่รอการบันทึก: {pendingItems.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canDirectSave ? (
                    <button
                      type="button"
                      onClick={() => void requestSaveToSheets(saveMode)}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>บันทึกลง Sheets ทันที</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('sum')}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>ไปบันทึก Google Sheets</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setReminderBannerDismissed(true)}
                    className="min-h-[42px] min-w-[42px] rounded-xl border border-amber-300/80 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 flex items-center justify-center cursor-pointer"
                    aria-label="ซ่อนแถบแจ้งเตือนชั่วคราว"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}

        {/* Views */}
        {view === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Guided Workflow Anchor */}
            <div className="lg:col-span-7 bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="space-y-1.5">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                  เริ่มเก็บเลือดทีละขั้นตอน
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ทำตามลำดับเพื่อช่วยลดความผิดพลาดในการเลือกหลอดและการผสมตัวอย่าง
                </p>
              </div>

              <FlowStepper activeStep={1} />

              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
                <span>Checklist: {checklistDoneCount}/{CHECKLIST_ITEMS.length} ข้อ</span>
                <span>·</span>
                <span>รายการตรวจที่เลือก: {selectedTestsCount} รายการ</span>
                {selectedPrecautionCount > 0 && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>เฝ้าระวังพิเศษ {selectedPrecautionCount} รายการ</span>
                    </span>
                  </>
                )}
                {savedRecord && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      บันทึกล่าสุด {savedRecord.at}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={startGuidedFlow}
                  className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#1565C0] hover:bg-[#1255A1] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>เริ่มขั้นตอน Checklist</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('search')}
                  className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span>ค้นหาการตรวจด่วน</span>
                </button>
              </div>
            </div>

            {/* Menu Modules */}
            <div className="lg:col-span-5 space-y-3">
              <button
                type="button"
                onClick={() => navigate('pre')}
                className="w-full text-left bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 hover:border-[#1565C0]/60 dark:hover:border-blue-500/60 rounded-2xl p-4 flex items-center gap-4 transition-colors cursor-pointer min-h-[72px]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1565C0] text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    แบบประเมินก่อนเรียนรู้
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    Pre-test 10 ข้อ{preScore !== null ? ` · ได้ ${preScore}/10 คะแนน` : ''}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('learn')}
                className="w-full text-left bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 hover:border-[#1565C0]/60 dark:hover:border-blue-500/60 rounded-2xl p-4 flex items-center gap-4 transition-colors cursor-pointer min-h-[72px]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1565C0] text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    Learning zone
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    ชนิดหลอด ลำดับการเก็บ วิธีผสมเลือด
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('post')}
                className="w-full text-left bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 hover:border-[#1565C0]/60 dark:hover:border-blue-500/60 rounded-2xl p-4 flex items-center gap-4 transition-colors cursor-pointer min-h-[72px]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1565C0] text-white flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    แบบทดสอบหลังเรียน
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    Post-test 10 ข้อ{postScore !== null ? ` · ได้ ${postScore}/10 คะแนน` : ''}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('survey')}
                className="w-full text-left bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 hover:border-[#1565C0]/60 dark:hover:border-blue-500/60 rounded-2xl p-4 flex items-center gap-4 transition-colors cursor-pointer min-h-[72px]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1565C0] text-white flex items-center justify-center shrink-0">
                  <Smile className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    แบบประเมินความพึงพอใจ
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    ประเมินการใช้นวัตกรรม ({Object.keys(ratings).length}/{SURVEY_ITEMS.length} ข้อ)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('sum')}
                className="w-full text-left bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 hover:border-emerald-600/60 dark:hover:border-emerald-500/60 rounded-2xl p-4 flex items-center gap-4 transition-colors cursor-pointer min-h-[72px]"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    สรุปผลและบันทึก Google Sheets
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    ดูคะแนน หลอดที่ต้องใช้ และส่งออกข้อมูลลง Sheets
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('check')}
                className="w-full text-left bg-white dark:bg-[#131D2B] border border-slate-200 dark:border-slate-800 hover:border-[#1565C0]/60 dark:hover:border-blue-500/60 rounded-2xl p-4 flex items-center gap-4 transition-colors cursor-pointer min-h-[72px]"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-700 dark:bg-slate-700 text-white flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    Checklist ก่อนส่งตัวอย่าง
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums flex items-center gap-2 flex-wrap">
                    <span>ดำเนินการแล้ว {checklistDoneCount}/{CHECKLIST_ITEMS.length} ข้อ</span>
                    {selectedPrecautionCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>มี {selectedPrecautionCount} รายการเฝ้าระวังพิเศษ</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {view === 'check' && (
          <ChecklistStep
            checkedMap={checklistMap}
            selectedTests={selectedTests}
            patientNote={patientNote}
            onChangePatientNote={handleChangePatientNote}
            onToggleTest={toggleTest}
            onToggle={(id, checked) =>
              setChecklistMap((prev) => ({ ...prev, [id]: checked }))
            }
            onReset={() => setChecklistMap({})}
            onNext={() => navigate('search')}
            onExportPdf={() => void handleExportPdf()}
            isExportingPdf={isExportingPdf}
          />
        )}

        {view === 'search' && (
          <SearchStep
            selectedTests={selectedTests}
            onToggleTest={toggleTest}
            onBackToChecklist={() => navigate('check')}
            onNextMix={() => navigate('mix')}
          />
        )}

        {view === 'mix' && (
          <MixStep
            selectedTests={selectedTests}
            hemoSites={hemoSites}
            onChangeHemoSites={setHemoSites}
            verifiedTubes={verifiedTubes}
            onToggleVerify={(key, checked) =>
              setVerifiedTubes((prev) => ({ ...prev, [key]: checked }))
            }
            onBackToSearch={() => navigate('search')}
            onSaveFlow={handleSaveFlow}
            onExportPdf={() => void handleExportPdf()}
            isExportingPdf={isExportingPdf}
          />
        )}

        {view === 'saved' && savedRecord && (
          <SavedStep
            savedRecord={savedRecord}
            isGoogleReady={!needsAuth && !!spreadsheet}
            onSaveToSheets={() => void requestSaveToSheets('lab')}
            onGoSummary={() => navigate('sum')}
            onStartNewFlow={startGuidedFlow}
            onExportPdf={() => void handleExportPdf()}
            isExportingPdf={isExportingPdf}
          />
        )}

        {view === 'pre' && (
          <QuizView
            quizType="pre"
            existingScore={preScore}
            onComplete={(s) => {
              setPreScore(s);
              recordQuizAttempt('pre', s);
              setHasUnsavedScoreInSheets(true);
              setReminderBannerDismissed(false);
            }}
            onBackHome={() => navigate('home')}
            onGoSummaryForSheets={() => navigate('sum')}
          />
        )}

        {view === 'post' && (
          <QuizView
            quizType="post"
            existingScore={postScore}
            onComplete={(s) => {
              setPostScore(s);
              recordQuizAttempt('post', s);
              setHasUnsavedScoreInSheets(true);
              setReminderBannerDismissed(false);
            }}
            onBackHome={() => navigate('home')}
            onGoSummaryForSheets={() => navigate('sum')}
          />
        )}

        {view === 'learn' && <LearningZoneView />}

        {view === 'survey' && (
          <SurveyView
            ratings={ratings}
            issueComment={issueComment}
            suggestionComment={suggestionComment}
            onRate={(idx, score) => {
              setRatings((prev) => ({ ...prev, [idx]: score }));
              setHasUnsavedScoreInSheets(true);
              setReminderBannerDismissed(false);
            }}
            onChangeIssue={setIssueComment}
            onChangeSuggestion={setSuggestionComment}
            onSubmit={() => {
              setHasUnsavedScoreInSheets(true);
              setReminderBannerDismissed(false);
              navigate('sum');
            }}
          />
        )}

        {view === 'sum' && (
          <SummaryView
            preScore={preScore}
            postScore={postScore}
            scoreHistory={scoreHistory}
            ratings={ratings}
            selectedTests={selectedTests}
            hemoSites={hemoSites}
            patientNote={patientNote}
            savedRecord={savedRecord}
            onGoSearch={() => navigate('search')}
            onGoChecklist={() => navigate('check')}
            onExportPdf={() => void handleExportPdf()}
            isExportingPdf={isExportingPdf}
            isAuthenticated={!needsAuth}
            googleEmail={googleUser?.email || null}
            isLoggingIn={isLoggingIn}
            onGoogleLogin={() => void handleGoogleLogin()}
            onGoogleLogout={() => void handleGoogleLogout()}
            spreadsheet={spreadsheet}
            isConnectingSheet={isConnectingSheet}
            sheetError={sheetError}
            sheetSuccessMsg={sheetSuccessMsg}
            onCreateNewSheet={(title) => void handleCreateNewSheet(title)}
            onConnectExistingSheet={(url) => void handleConnectExistingSheet(url)}
            onDisconnectSheet={handleDisconnectSheet}
            onRequestSaveLab={() => void requestSaveToSheets('lab')}
            onRequestSaveScores={() => void requestSaveToSheets('score')}
            onRequestSaveAll={() => void requestSaveToSheets('both')}
            labRows={labRows}
            scoreRows={scoreRows}
            isLoadingRows={isLoadingRows}
            onRefreshRows={() => void handleRefreshRows()}
          />
        )}
      </main>

      {/* Floating Toast Reminder on Home when returning with unsaved Google Sheets data */}
      {view === 'home' &&
        homeToastVisible &&
        (hasUnsavedLabInSheets || hasUnsavedScoreInSheets) && (
          <div
            role="alert"
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-40 bg-white dark:bg-[#131D2B] border border-amber-300 dark:border-amber-700 rounded-2xl shadow-lg p-3.5 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  อย่าลืมบันทึกลง Google Sheets
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  มีผลตรวจหรือคะแนนใหม่ที่ยังไม่ได้บันทึก
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setHomeToastVisible(false);
                  if (!needsAuth && spreadsheet) {
                    const saveMode: 'lab' | 'score' | 'both' =
                      hasUnsavedLabInSheets && hasUnsavedScoreInSheets
                        ? 'both'
                        : hasUnsavedLabInSheets
                          ? 'lab'
                          : 'score';
                    void requestSaveToSheets(saveMode);
                  } else {
                    navigate('sum');
                  }
                }}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#1565C0] hover:bg-[#1255A1] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                บันทึกเลย
              </button>
              <button
                type="button"
                onClick={() => setHomeToastVisible(false)}
                className="min-h-[36px] min-w-[36px] rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
                aria-label="ปิดการแจ้งเตือน"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      {/* Mandatory Google Sheets Write Confirmation Dialog */}
      <SheetsConfirmModal
        request={confirmRequest}
        isSubmitting={isSubmittingConfirm}
        onCancel={() => {
          if (!isSubmittingConfirm) setConfirmRequest(null);
        }}
        onConfirm={() => void handleConfirmModalSubmit()}
      />
    </div>
  );
}
