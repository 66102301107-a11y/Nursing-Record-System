import { jsPDF } from 'jspdf';
import {
  CHECKLIST_ITEMS,
  HEMOLYSIS_TIPS,
  HemoCultureSitesState,
  LAB_TESTS,
  ORDER_OF_DRAW,
  TUBES,
  TubeKey,
  formatHemoCultureSites,
} from '../data/hemoData';

export interface ExportBedsidePdfParams {
  nurseName: string;
  userType: string;
  checkedMap: Record<number, boolean>;
  selectedTests: Record<number, boolean>;
  verifiedTubes: Record<TubeKey, boolean>;
  hemoSites?: HemoCultureSitesState;
  patientNote?: string;
  savedAt?: string;
}

const A4_WIDTH_PX = 1588; // ~192 DPI for A4 (210mm)
const A4_HEIGHT_PX = 2246; // ~192 DPI for A4 (297mm)
const MARGIN_X = 96;
const MARGIN_TOP = 90;
const MARGIN_BOTTOM = 100;
const CONTENT_WIDTH = A4_WIDTH_PX - MARGIN_X * 2;

const FONT_BODY = '"Noto Sans Thai", "Prompt", system-ui, sans-serif';
const FONT_DISPLAY = '"Prompt", "Noto Sans Thai", system-ui, sans-serif';

function segmentThaiWords(text: string): string[] {
  const IntlAny = Intl as unknown as {
    Segmenter?: new (
      locale: string,
      opts: { granularity: string }
    ) => { segment: (input: string) => Iterable<{ segment: string }> };
  };
  if (typeof Intl !== 'undefined' && IntlAny.Segmenter) {
    try {
      const seg = new IntlAny.Segmenter('th', { granularity: 'word' });
      return Array.from(seg.segment(text)).map((s) => s.segment);
    } catch {
      // fallback below
    }
  }
  return text.split(/(\s+)/);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const tokens = segmentThaiWords(text);
  const lines: string[] = [];
  let current = '';

  for (const token of tokens) {
    const candidate = current + token;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current.trim().length > 0) {
        lines.push(current.trimEnd());
        current = token.trimStart();
      } else {
        // Single token wider than maxWidth: split by character
        let chunk = '';
        for (const ch of Array.from(token)) {
          if (ctx.measureText(chunk + ch).width <= maxWidth) {
            chunk += ch;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      }
    }
  }
  if (current.trim().length > 0) {
    lines.push(current.trimEnd());
  }
  return lines.length > 0 ? lines : [''];
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawTubeGraphic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  isCulture: boolean
) {
  ctx.save();
  if (isCulture) {
    // Flip cap
    ctx.fillStyle = color;
    drawRoundedRect(ctx, x + 12, y, 24, 10, 4);
    ctx.fill();
    // Neck collar
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 15, y + 10, 18, 6);
    // Bottle body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, x + 6, y + 18, 36, 56, 8);
    ctx.fill();
    ctx.stroke();
    // Broth fill
    ctx.fillStyle = `${color}44`;
    drawRoundedRect(ctx, x + 8, y + 40, 32, 32, 6);
    ctx.fill();
  } else {
    // Safety cap
    ctx.fillStyle = color;
    drawRoundedRect(ctx, x + 8, y, 32, 16, 5);
    ctx.fill();
    // Tube body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, x + 12, y + 16, 24, 58, 10);
    ctx.fill();
    ctx.stroke();
    // Sample fill
    ctx.fillStyle = `${color}44`;
    drawRoundedRect(ctx, x + 14, y + 40, 20, 32, 8);
    ctx.fill();
  }
  ctx.restore();
}

export async function exportChecklistAndProcedurePdf(
  params: ExportBedsidePdfParams
): Promise<string> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const pages: HTMLCanvasElement[] = [];
  let canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH_PX;
  canvas.height = A4_HEIGHT_PX;
  let ctx = canvas.getContext('2d')!;

  const initPage = (isFirstPage: boolean) => {
    canvas = document.createElement('canvas');
    canvas.width = A4_WIDTH_PX;
    canvas.height = A4_HEIGHT_PX;
    ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);
    pages.push(canvas);

    if (!isFirstPage) {
      ctx.fillStyle = '#1565C0';
      ctx.font = `600 22px ${FONT_DISPLAY}`;
      ctx.fillText('HemoGuide — เอกสารประกอบการเก็บเลือดข้างเตียง (ต่อ)', MARGIN_X, 68);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(MARGIN_X, 86);
      ctx.lineTo(A4_WIDTH_PX - MARGIN_X, 86);
      ctx.stroke();
      return 120;
    }
    return MARGIN_TOP;
  };

  let y = initPage(true);

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > A4_HEIGHT_PX - MARGIN_BOTTOM) {
      y = initPage(false);
    }
  };

  const nowStr = params.savedAt || new Date().toLocaleString('th-TH');
  const selectedLabObjects = LAB_TESTS.filter((t) => params.selectedTests[t.id]);
  const precautionTests = selectedLabObjects.filter((t) => !!t.specialPrecaution);
  const checklistDone = CHECKLIST_ITEMS.filter((c) => params.checkedMap[c.id]).length;
  const activeTubeKeys = ORDER_OF_DRAW.filter((k) =>
    LAB_TESTS.some((t) => params.selectedTests[t.id] && t.tube === k)
  );
  const tubesToPrint: TubeKey[] =
    activeTubeKeys.length > 0 ? activeTubeKeys : ORDER_OF_DRAW;

  // --- Header Banner ---
  ctx.fillStyle = '#1565C0';
  drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, 152, 20);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 38px ${FONT_DISPLAY}`;
  ctx.fillText('HemoGuide — Bedside Phlebotomy Reference', MARGIN_X + 32, y + 54);

  ctx.fillStyle = '#dbeafe';
  ctx.font = `500 24px ${FONT_BODY}`;
  ctx.fillText(
    'แบบตรวจสอบความปลอดภัย (Checklist) และลำดับขั้นตอนการเก็บตัวอย่างเลือด',
    MARGIN_X + 32,
    y + 92
  );

  ctx.fillStyle = '#ffffff';
  ctx.font = `400 21px ${FONT_BODY}`;
  ctx.fillText(
    `ผู้ปฏิบัติงาน: ${params.nurseName || '-'} (${params.userType})   |   วันที่/เวลา: ${nowStr}`,
    MARGIN_X + 32,
    y + 130
  );
  y += 182;

  // --- Summary Strip ---
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, 68, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.font = `600 22px ${FONT_BODY}`;
  ctx.fillText(
    `Checklist: ${checklistDone}/${CHECKLIST_ITEMS.length} ข้อ   •   รายการตรวจที่เลือก: ${selectedLabObjects.length} รายการ   •   หลอดที่ต้องใช้: ${activeTubeKeys.length > 0 ? activeTubeKeys.length : 'ทั้งหมด 7 (คู่มือมาตรฐาน)'} หลอด`,
    MARGIN_X + 26,
    y + 42
  );
  y += 96;

  // --- Patient-Specific Note (if provided) ---
  const trimmedNote = params.patientNote?.trim();
  if (trimmedNote) {
    ctx.font = `400 21px ${FONT_BODY}`;
    const noteLines = wrapText(ctx, trimmedNote, CONTENT_WIDTH - 56);
    const noteBoxH = 62 + noteLines.length * 30;
    ensureSpace(noteBoxH + 18);

    ctx.fillStyle = '#eff6ff';
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, noteBoxH, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e40af';
    ctx.font = `700 22px ${FONT_DISPLAY}`;
    ctx.fillText('โน้ตย่อ / คำแนะนำเพิ่มเติมรายบุคคลสำหรับผู้ป่วย:', MARGIN_X + 24, y + 34);

    ctx.fillStyle = '#0f172a';
    ctx.font = `400 21px ${FONT_BODY}`;
    noteLines.forEach((line, idx) => {
      ctx.fillText(line, MARGIN_X + 24, y + 68 + idx * 30);
    });
    y += noteBoxH + 22;
  }

  // --- Section 1: Special Nursing Precautions (if applicable) ---
  if (precautionTests.length > 0) {
    ensureSpace(140);
    ctx.fillStyle = '#b91c1c';
    ctx.font = `700 28px ${FONT_DISPLAY}`;
    ctx.fillText(
      `1. แจ้งเตือนข้อควรระวังพิเศษทางการพยาบาล (${precautionTests.length} รายการ)`,
      MARGIN_X,
      y + 26
    );
    y += 44;

    for (const test of precautionTests) {
      const p = test.specialPrecaution!;
      const tube = TUBES[test.tube];
      ctx.font = `400 21px ${FONT_BODY}`;
      const detailLines = wrapText(ctx, `${p.title} — ${p.detail}`, CONTENT_WIDTH - 64);
      const boxHeight = 52 + detailLines.length * 30;
      ensureSpace(boxHeight + 14);

      const isHigh = p.severity === 'high';
      ctx.fillStyle = isHigh ? '#fef2f2' : '#fffbeb';
      ctx.strokeStyle = isHigh ? '#fca5a5' : '#fcd34d';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, boxHeight, 12);
      ctx.fill();
      ctx.stroke();

      // Warning triangle glyph
      ctx.fillStyle = isHigh ? '#dc2626' : '#d97706';
      ctx.font = `700 22px ${FONT_BODY}`;
      ctx.fillText('▲', MARGIN_X + 20, y + 34);

      ctx.fillStyle = '#0f172a';
      ctx.font = `700 22px ${FONT_BODY}`;
      ctx.fillText(`${test.name} (${tube.shortName})`, MARGIN_X + 52, y + 34);

      ctx.fillStyle = '#334155';
      ctx.font = `400 20px ${FONT_BODY}`;
      detailLines.forEach((line, i) => {
        ctx.fillText(line, MARGIN_X + 52, y + 66 + i * 28);
      });

      y += boxHeight + 12;
    }
    y += 18;
  }

  // --- Section: Safety Checklist ---
  const sectionIdxChecklist = precautionTests.length > 0 ? 2 : 1;
  ensureSpace(120);
  ctx.fillStyle = '#0f172a';
  ctx.font = `700 28px ${FONT_DISPLAY}`;
  ctx.fillText(
    `${sectionIdxChecklist}. แบบตรวจสอบความปลอดภัยก่อนส่งตัวอย่าง (Checklist)`,
    MARGIN_X,
    y + 26
  );
  y += 44;

  for (const item of CHECKLIST_ITEMS) {
    const checked = !!params.checkedMap[item.id];
    const linkedPrecautions = precautionTests.filter((t) =>
      t.specialPrecaution?.relatedChecklistIds.includes(item.id)
    );
    const noteText =
      linkedPrecautions.length > 0
        ? `เฝ้าระวังพิเศษ: ${linkedPrecautions.map((t) => t.name).join(', ')}`
        : '';

    const rowHeight = noteText ? 98 : 74;
    ensureSpace(rowHeight + 10);

    ctx.fillStyle = checked ? '#f0fdf4' : '#ffffff';
    ctx.strokeStyle = linkedPrecautions.length > 0 && !checked ? '#f59e0b' : '#cbd5e1';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, rowHeight, 12);
    ctx.fill();
    ctx.stroke();

    // Checkbox square
    ctx.strokeStyle = checked ? '#16a34a' : '#64748b';
    ctx.fillStyle = checked ? '#16a34a' : '#ffffff';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, MARGIN_X + 20, y + 20, 30, 30, 6);
    ctx.fill();
    ctx.stroke();

    if (checked) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(MARGIN_X + 27, y + 35);
      ctx.lineTo(MARGIN_X + 33, y + 42);
      ctx.lineTo(MARGIN_X + 44, y + 28);
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = `700 22px ${FONT_BODY}`;
    const titleLabel = `${item.title}${item.critical ? ' [สำคัญ]' : ''}`;
    ctx.fillText(titleLabel, MARGIN_X + 68, y + 34);

    ctx.fillStyle = '#475569';
    ctx.font = `400 20px ${FONT_BODY}`;
    ctx.fillText(item.description, MARGIN_X + 68, y + 61);

    if (noteText) {
      ctx.fillStyle = '#b45309';
      ctx.font = `600 19px ${FONT_BODY}`;
      ctx.fillText(`▲ ${noteText}`, MARGIN_X + 68, y + 86);
    }

    y += rowHeight + 10;
  }
  y += 22;

  // --- Section: Lab Procedure & Order of Draw ---
  const sectionIdxProc = sectionIdxChecklist + 1;
  ensureSpace(130);
  ctx.fillStyle = '#0f172a';
  ctx.font = `700 28px ${FONT_DISPLAY}`;
  ctx.fillText(
    activeTubeKeys.length > 0
      ? `${sectionIdxProc}. ขั้นตอนการเก็บและผสมเลือดตามลำดับ (Order of Draw)`
      : `${sectionIdxProc}. คู่มือลำดับหลอดเก็บเลือดมาตรฐาน (Order of Draw)`,
    MARGIN_X,
    y + 26
  );
  y += 46;

  tubesToPrint.forEach((tubeKey, idx) => {
    const tube = TUBES[tubeKey];
    const testsForTube =
      activeTubeKeys.length > 0
        ? LAB_TESTS.filter((t) => params.selectedTests[t.id] && t.tube === tubeKey).map(
            (t) => t.name
          )
        : LAB_TESTS.filter((t) => t.tube === tubeKey).map((t) => t.name);

    const testsLine = `รายการตรวจ: ${testsForTube.join(', ')}`;
    ctx.font = `500 20px ${FONT_BODY}`;
    const wrappedTests = wrapText(ctx, testsLine, CONTENT_WIDTH - 140);

    const hemoSiteSummary =
      tubeKey === 'cult' && params.selectedTests[0]
        ? formatHemoCultureSites(params.hemoSites)
        : '';
    const wrappedHemoSite = hemoSiteSummary
      ? wrapText(ctx, `ตำแหน่งเจาะ: ${hemoSiteSummary}`, CONTENT_WIDTH - 140)
      : [];

    ctx.font = `400 19px ${FONT_BODY}`;
    const wrappedTip = wrapText(ctx, `ข้อควรระวัง: ${tube.tip}`, CONTENT_WIDTH - 140);

    const cardHeight =
      112 +
      wrappedTests.length * 26 +
      wrappedHemoSite.length * 26 +
      wrappedTip.length * 25;
    ensureSpace(cardHeight + 14);

    const verified = !!params.verifiedTubes[tubeKey];
    ctx.fillStyle = verified ? '#f0fdf4' : '#f8fafc';
    ctx.strokeStyle = verified ? '#86efac' : '#cbd5e1';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, cardHeight, 14);
    ctx.fill();
    ctx.stroke();

    // Tube illustration on left
    drawTubeGraphic(ctx, MARGIN_X + 26, y + 24, tube.color, tubeKey === 'cult');

    const textX = MARGIN_X + 104;
    ctx.fillStyle = '#1565C0';
    ctx.font = `700 21px ${FONT_DISPLAY}`;
    ctx.fillText(`ลำดับที่ ${idx + 1}`, textX, y + 34);

    ctx.fillStyle = '#0f172a';
    ctx.font = `700 24px ${FONT_DISPLAY}`;
    ctx.fillText(tube.name, textX + 108, y + 34);

    if (activeTubeKeys.length > 0) {
      ctx.fillStyle = verified ? '#15803d' : '#64748b';
      ctx.font = `600 19px ${FONT_BODY}`;
      const statusText = verified ? '[✓] ผสม/พลิกหลอดแล้ว' : '[ ] รอยืนยันพลิกหลอด';
      const statusW = ctx.measureText(statusText).width;
      ctx.fillText(statusText, MARGIN_X + CONTENT_WIDTH - statusW - 24, y + 34);
    }

    let curY = y + 66;
    ctx.fillStyle = '#1d4ed8';
    ctx.font = `600 20px ${FONT_BODY}`;
    for (const line of wrappedTests) {
      ctx.fillText(line, textX, curY);
      curY += 26;
    }

    if (wrappedHemoSite.length > 0) {
      ctx.fillStyle = '#0f766e';
      ctx.font = `600 20px ${FONT_BODY}`;
      for (const line of wrappedHemoSite) {
        ctx.fillText(line, textX, curY);
        curY += 26;
      }
    }

    ctx.fillStyle = '#334155';
    ctx.font = `400 20px ${FONT_BODY}`;
    ctx.fillText(
      `สารเติมแต่ง: ${tube.additive}   |   ปริมาณ: ${tube.volume}   |   พลิกกลับเบา ๆ: ${tube.mix} ครั้ง`,
      textX,
      curY + 4
    );
    curY += 32;

    ctx.fillStyle = '#92400e';
    ctx.font = `400 19px ${FONT_BODY}`;
    for (const line of wrappedTip) {
      ctx.fillText(line, textX, curY + 4);
      curY += 25;
    }

    y += cardHeight + 14;
  });

  y += 16;

  // --- Section: Hemolysis Prevention Guidelines ---
  const sectionIdxHemo = sectionIdxProc + 1;
  const hemoHeight = 76 + HEMOLYSIS_TIPS.length * 32;
  ensureSpace(hemoHeight + 20);

  ctx.fillStyle = '#0f172a';
  ctx.font = `700 26px ${FONT_DISPLAY}`;
  ctx.fillText(
    `${sectionIdxHemo}. ข้อควรระวังเพื่อลดภาวะเม็ดเลือดแดงแตก (Hemolysis)`,
    MARGIN_X,
    y + 24
  );
  y += 42;

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, HEMOLYSIS_TIPS.length * 34 + 28, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = `400 20px ${FONT_BODY}`;
  HEMOLYSIS_TIPS.forEach((tip, i) => {
    ctx.fillText(`• ${tip}`, MARGIN_X + 24, y + 36 + i * 34);
  });

  // --- Add Page Footers across all pages ---
  const totalPages = pages.length;
  pages.forEach((pageCanvas, pageIdx) => {
    const pCtx = pageCanvas.getContext('2d')!;
    pCtx.strokeStyle = '#e2e8f0';
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.moveTo(MARGIN_X, A4_HEIGHT_PX - 70);
    pCtx.lineTo(A4_WIDTH_PX - MARGIN_X, A4_HEIGHT_PX - 70);
    pCtx.stroke();

    pCtx.fillStyle = '#64748b';
    pCtx.font = `400 18px ${FONT_BODY}`;
    pCtx.fillText(
      'HemoGuide Bedside Reference · ตรวจสอบชื่อ-HN ผู้ป่วยและข้อกำหนดห้องปฏิบัติการทุกครั้งก่อนเจาะเลือด',
      MARGIN_X,
      A4_HEIGHT_PX - 40
    );

    const pageNumText = `หน้า ${pageIdx + 1} / ${totalPages}`;
    const numW = pCtx.measureText(pageNumText).width;
    pCtx.fillText(pageNumText, A4_WIDTH_PX - MARGIN_X - numW, A4_HEIGHT_PX - 40);
  });

  // --- Assemble PDF via jsPDF ---
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pages.forEach((pageCanvas, index) => {
    if (index > 0) doc.addPage();
    const imgData = pageCanvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  });

  const dateSlug = new Date().toISOString().slice(0, 10);
  const filename = `HemoGuide-Bedside-${dateSlug}.pdf`;
  doc.save(filename);
  return filename;
}
