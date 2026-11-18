export const LAB_TAB_NAME = 'ผลการตรวจเลือด';
export const SCORE_TAB_NAME = 'คะแนนและแบบประเมิน';

export const LAB_HEADERS = [
  'วัน-เวลาที่บันทึก',
  'ประเภทผู้ใช้',
  'ชื่อ-นามสกุล',
  'จำนวนรายการตรวจ',
  'รายการตรวจที่เลือก',
  'จำนวนหลอดที่ใช้',
  'ชนิดหลอด (เรียงตามลำดับเก็บ)',
  'Checklist ครบ 8 ข้อ',
  'ยืนยันผสม/พลิกหลอดครบ',
  'บัญชี Google ผู้บันทึก',
];

export const SCORE_HEADERS = [
  'วัน-เวลาที่บันทึก',
  'ประเภทผู้ใช้',
  'ชื่อ-นามสกุล',
  'คะแนน Pre-test (/10)',
  'คะแนน Post-test (/10)',
  'คะแนนเปลี่ยนแปลง',
  'ความพึงพอใจเฉลี่ย (/5)',
  'คะแนนรายข้อ (ข้อ 1-8)',
  'ปัญหา/อุปสรรค',
  'ข้อเสนอแนะ',
  'บัญชี Google ผู้บันทึก',
];

export interface SheetTabMeta {
  sheetId: number;
  title: string;
}

export interface SpreadsheetMeta {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheets: SheetTabMeta[];
}

export interface LabRecordPayload {
  savedAt: string;
  userType: string;
  fullName: string;
  testCount: number;
  selectedTests: string;
  tubeCount: number;
  orderedTubes: string;
  checklistComplete: boolean;
  mixVerifiedComplete: boolean;
  googleEmail: string;
}

export interface ScoreRecordPayload {
  savedAt: string;
  userType: string;
  fullName: string;
  preScore: number | null;
  postScore: number | null;
  deltaScore: string;
  surveyAvg: string;
  surveyBreakdown: string;
  issueComment: string;
  suggestionComment: string;
  googleEmail: string;
}

export function parseSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) return urlMatch[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) return trimmed;
  return null;
}

async function sheetsFetch<T>(url: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    let msg = `Google Sheets API Error (${res.status})`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch {
      // ignore json parse error
    }
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetMeta> {
  const data = await sheetsFetch<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    properties: { title: string };
    sheets: Array<{ properties: { sheetId: number; title: string } }>;
  }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId,spreadsheetUrl,properties.title,sheets.properties(sheetId,title)`,
    accessToken
  );

  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
    title: data.properties.title,
    sheets: (data.sheets || []).map((s) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
    })),
  };
}

export async function createHemoGuideSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<SpreadsheetMeta> {
  const title = customTitle?.trim() || 'HemoGuide - บันทึกผลการตรวจและคะแนน';
  const created = await sheetsFetch<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    properties: { title: string };
    sheets: Array<{ properties: { sheetId: number; title: string } }>;
  }>('https://sheets.googleapis.com/v4/spreadsheets', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      properties: { title, locale: 'th_TH' },
      sheets: [
        {
          properties: {
            title: LAB_TAB_NAME,
            gridProperties: { frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: SCORE_TAB_NAME,
            gridProperties: { frozenRowCount: 1 },
          },
        },
      ],
    }),
  });

  // Write headers to both tabs
  await writeHeaderRow(accessToken, created.spreadsheetId, LAB_TAB_NAME, LAB_HEADERS);
  await writeHeaderRow(accessToken, created.spreadsheetId, SCORE_TAB_NAME, SCORE_HEADERS);

  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
    title: created.properties.title,
    sheets: (created.sheets || []).map((s) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
    })),
  };
}

async function writeHeaderRow(
  accessToken: string,
  spreadsheetId: string,
  tabName: string,
  headers: string[]
) {
  const range = `'${tabName.replace(/'/g, "''")}'!A1`;
  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    accessToken,
    {
      method: 'PUT',
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [headers],
      }),
    }
  );
}

export async function ensureRequiredTabs(
  accessToken: string,
  meta: SpreadsheetMeta,
  neededTabs: Array<'lab' | 'score'>
): Promise<SpreadsheetMeta> {
  const existingTitles = new Set(meta.sheets.map((s) => s.title));
  const requests: Array<{ addSheet: { properties: { title: string; gridProperties: { frozenRowCount: number } } } }> = [];
  const toInitHeader: Array<{ tabName: string; headers: string[] }> = [];

  if (neededTabs.includes('lab') && !existingTitles.has(LAB_TAB_NAME)) {
    requests.push({
      addSheet: {
        properties: { title: LAB_TAB_NAME, gridProperties: { frozenRowCount: 1 } },
      },
    });
    toInitHeader.push({ tabName: LAB_TAB_NAME, headers: LAB_HEADERS });
  }

  if (neededTabs.includes('score') && !existingTitles.has(SCORE_TAB_NAME)) {
    requests.push({
      addSheet: {
        properties: { title: SCORE_TAB_NAME, gridProperties: { frozenRowCount: 1 } },
      },
    });
    toInitHeader.push({ tabName: SCORE_TAB_NAME, headers: SCORE_HEADERS });
  }

  if (requests.length > 0) {
    await sheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(meta.spreadsheetId)}:batchUpdate`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({ requests }),
      }
    );
  }

  for (const item of toInitHeader) {
    await writeHeaderRow(accessToken, meta.spreadsheetId, item.tabName, item.headers);
  }

  // Also check if existing tabs are completely empty and need headers
  for (const key of neededTabs) {
    const tabName = key === 'lab' ? LAB_TAB_NAME : SCORE_TAB_NAME;
    const headers = key === 'lab' ? LAB_HEADERS : SCORE_HEADERS;
    if (existingTitles.has(tabName)) {
      const existingRows = await readTabRows(accessToken, meta.spreadsheetId, tabName, 1);
      if (existingRows.length === 0) {
        await writeHeaderRow(accessToken, meta.spreadsheetId, tabName, headers);
      }
    }
  }

  return getSpreadsheetMetadata(accessToken, meta.spreadsheetId);
}

export async function appendLabRecord(
  accessToken: string,
  spreadsheetId: string,
  payload: LabRecordPayload
) {
  const range = `'${LAB_TAB_NAME}'!A:J`;
  const row = [
    payload.savedAt,
    payload.userType,
    payload.fullName,
    payload.testCount,
    payload.selectedTests,
    payload.tubeCount,
    payload.orderedTubes,
    payload.checklistComplete ? 'ครบถ้วน' : 'ยังไม่ครบ',
    payload.mixVerifiedComplete ? 'ยืนยันครบ' : 'ยังไม่ครบ',
    payload.googleEmail,
  ];

  return sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: [row],
      }),
    }
  );
}

export async function appendScoreRecord(
  accessToken: string,
  spreadsheetId: string,
  payload: ScoreRecordPayload
) {
  const range = `'${SCORE_TAB_NAME}'!A:K`;
  const row = [
    payload.savedAt,
    payload.userType,
    payload.fullName,
    payload.preScore === null ? '-' : payload.preScore,
    payload.postScore === null ? '-' : payload.postScore,
    payload.deltaScore,
    payload.surveyAvg,
    payload.surveyBreakdown,
    payload.issueComment || '-',
    payload.suggestionComment || '-',
    payload.googleEmail,
  ];

  return sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: [row],
      }),
    }
  );
}

export async function readTabRows(
  accessToken: string,
  spreadsheetId: string,
  tabName: string,
  maxRows = 15
): Promise<string[][]> {
  const range = `'${tabName.replace(/'/g, "''")}'!A1:K${maxRows}`;
  const data = await sheetsFetch<{ values?: string[][] }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`,
    accessToken
  );
  return data.values || [];
}
