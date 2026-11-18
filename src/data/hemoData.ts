export type TubeKey = 'cult' | 'red' | 'blue' | 'green' | 'purple' | 'lav' | 'grey';

export type HemoCultureSite = 'แขนซ้าย' | 'แขนขวา' | 'ขาซ้าย' | 'ขาขวา';
export type HemoCultureBottle2Site = HemoCultureSite | 'เจาะ 1 ขวด';

export interface HemoCultureSitesState {
  bottle1: HemoCultureSite | '';
  bottle2: HemoCultureBottle2Site | '';
}

export const HEMO_CULTURE_SITES: HemoCultureSite[] = [
  'แขนซ้าย',
  'แขนขวา',
  'ขาซ้าย',
  'ขาขวา',
];

export function formatHemoCultureSites(sites?: HemoCultureSitesState): string {
  if (!sites) return '';
  const parts: string[] = [];
  if (sites.bottle1) parts.push(`ขวด 1: ${sites.bottle1}`);
  if (sites.bottle2) parts.push(`ขวด 2: ${sites.bottle2}`);
  return parts.join(' · ');
}

export interface TubeInfo {
  key: TubeKey;
  name: string;
  shortName: string;
  color: string;
  additive: string;
  volume: string;
  mix: string;
  tip: string;
}

export interface LabTest {
  id: number;
  name: string;
  tube: TubeKey;
  specialPrecaution?: {
    title: string;
    detail: string;
    severity: 'high' | 'medium';
    relatedChecklistIds: number[];
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ChecklistItem {
  id: number;
  title: string;
  description: string;
  critical: boolean;
}

export const USER_TYPES = ['พยาบาล', 'นักศึกษาพยาบาล', 'อื่นๆ'] as const;
export const PREFIXES = ['นาย', 'นาง', 'นางสาว'] as const;

export const ORDER_OF_DRAW: TubeKey[] = ['cult', 'red', 'blue', 'green', 'purple', 'lav', 'grey'];

export const TUBES: Record<TubeKey, TubeInfo> = {
  cult: {
    key: 'cult',
    name: 'ขวดเพาะเชื้อ (Hemo culture)',
    shortName: 'ขวดเพาะเชื้อ',
    color: '#d4a017',
    additive: 'อาหารเลี้ยงเชื้อ',
    volume: 'ผู้ใหญ่ ~5 ml/ขวด (เจาะ 2 ขวด)',
    mix: '8',
    tip: 'เก็บก่อนหลอดอื่นเสมอ ใช้เทคนิคปลอดเชื้อ ห้ามแช่ตู้เย็น',
  },
  red: {
    key: 'red',
    name: 'หลอดจุกสีแดง (Clot activator)',
    shortName: 'สีแดง',
    color: '#d83a3a',
    additive: 'Clot activator',
    volume: '~5 ml',
    mix: '5',
    tip: 'ตรวจ Calcium ห้ามใช้หลอดพลาสติก; ตัวอย่างที่เม็ดเลือดแดงแตกมีผลต่อ K, AST, ALT, LDH ฯลฯ',
  },
  blue: {
    key: 'blue',
    name: 'หลอดจุกสีฟ้า (Sodium citrate)',
    shortName: 'สีฟ้า',
    color: '#5bb5e8',
    additive: 'Sodium citrate',
    volume: 'เติมถึงขีด (≥ 90%) สัดส่วนเลือด 9 : ยา 1',
    mix: '3–4',
    tip: 'ถ้าเป็นหลอดแรกที่เก็บ ให้ทิ้งเลือด 2 ml แรก ห้ามรัดสายรัดนานเกินไป อย่าให้เกิดฟอง',
  },
  green: {
    key: 'green',
    name: 'หลอดจุกสีเขียว (Lithium heparin)',
    shortName: 'สีเขียว',
    color: '#3aa655',
    additive: 'Lithium heparin',
    volume: 'ตามขีดกำหนด',
    mix: '8–10',
    tip: 'ใช้ตรวจเคมีที่ระบุ Lithium heparin; ห้ามใช้ตรวจ Lithium',
  },
  purple: {
    key: 'purple',
    name: 'หลอดจุกสีม่วง (EDTA)',
    shortName: 'สีม่วง',
    color: '#8e5bb8',
    additive: 'K3EDTA / K2EDTA',
    volume: 'ตามขีด (CBC ต้องไม่น้อยกว่า 60% ของหลอด)',
    mix: '8',
    tip: 'ห้ามปั่นแยกก่อนตรวจ CBC ต้องป้องกันการแข็งตัวของเลือดในหลอด',
  },
  lav: {
    key: 'lav',
    name: 'หลอดจุกสีม่วงยาว (Blood group)',
    shortName: 'สีม่วงยาว',
    color: '#6f3f9b',
    additive: 'EDTA',
    volume: 'ตามที่ห้องปฏิบัติการกำหนด',
    mix: '8',
    tip: 'ตรวจหมู่เลือด ติดชื่อผู้ป่วยข้างหลอดให้ชัดเจน',
  },
  grey: {
    key: 'grey',
    name: 'หลอดจุกสีเทา (Sodium fluoride)',
    shortName: 'สีเทา',
    color: '#8a949e',
    additive: 'Sodium fluoride',
    volume: '2–3 ml',
    mix: '8–10',
    tip: 'ยับยั้ง glycolysis เพื่อรักษาระดับกลูโคสในตัวอย่างเลือด',
  },
};

const RED_TEST_PRECAUTIONS: Record<string, LabTest['specialPrecaution']> = {
  Electrolytes: {
    title: 'ระวัง Hemolysis และห้ามรัดสายรัดแขนนาน',
    detail: 'เม็ดเลือดแดงแตกหรือการรัดสายรัดแขนนานเกินไปทำให้ค่า Potassium (K) สูงคลาดเคลื่อน',
    severity: 'high',
    relatedChecklistIds: [3, 6],
  },
  'Total bilirubin': {
    title: 'ป้องกันแสงและหลีกเลี่ยง Hemolysis',
    detail: 'แสงสว่างทำให้ Bilirubin สลายตัวและ Hemolysis รบกวนการตรวจวัด ควรนำส่งห้องปฏิบัติการทันที',
    severity: 'medium',
    relatedChecklistIds: [6],
  },
  LFT: {
    title: 'ระวังภาวะเม็ดเลือดแดงแตก (Hemolysis)',
    detail: 'Hemolysis ส่งผลให้ค่า AST, ALT และ LDH สูงผิดปกติ ผสมเลือดเบา ๆ ห้ามเขย่าแรง',
    severity: 'medium',
    relatedChecklistIds: [3, 6],
  },
  'Calcium (Inor.)': {
    title: 'ห้ามใช้หลอดพลาสติกและห้ามรัดแขนนาน',
    detail: 'การตรวจ Calcium ห้ามใช้หลอดพลาสติก และไม่ควรรัดสายรัดแขนนานหรือให้ผู้ป่วยกำมือแน่น',
    severity: 'high',
    relatedChecklistIds: [1, 6],
  },
  'Phosphorus (Inor.)': {
    title: 'ระวังภาวะ Hemolysis',
    detail: 'เม็ดเลือดแดงแตกทำให้ค่า Phosphorus สูงคลาดเคลื่อน ควรเจาะอย่างนุ่มนวล',
    severity: 'medium',
    relatedChecklistIds: [6],
  },
  'Magnesium (Inor.)': {
    title: 'ระวังภาวะ Hemolysis',
    detail: 'เม็ดเลือดแดงแตกทำให้ค่า Magnesium สูงคลาดเคลื่อน ห้ามเขย่าหลอดแรง',
    severity: 'medium',
    relatedChecklistIds: [3, 6],
  },
  'Anti-HIV (4th gen)': {
    title: 'ตรวจสอบการยินยอมและป้องกัน Biohazard',
    detail: 'ตรวจสอบเอกสารความยินยอมตามนโยบาย ปฏิบัติตามหลัก Universal Precautions และปิดฝาให้สนิท',
    severity: 'high',
    relatedChecklistIds: [0, 7],
  },
};

const RED_TESTS = [
  'BUN',
  'Creatinine',
  'Electrolytes',
  'Lipid profile',
  'Albumin',
  'Total bilirubin',
  'LFT',
  'Calcium (Inor.)',
  'Phosphorus (Inor.)',
  'Magnesium (Inor.)',
  'TFT-FT3',
  'TFT-FT4',
  'TFT-TSH',
  'CPK',
  'CRP',
  'ESR',
  'Anti-HIV (4th gen)',
  'HBsAg',
  'HBsAb',
  'HBcAb',
  'HBeAg',
];

export const LAB_TESTS: LabTest[] = [
  {
    id: 0,
    name: 'Hemo culture',
    tube: 'cult',
    specialPrecaution: {
      title: 'เทคนิคปลอดเชื้อเข้มงวด · เก็บเป็นลำดับแรก · ห้ามแช่ตู้เย็น',
      detail: 'รอให้แอลกอฮอล์แห้งสนิทก่อนเจาะ เก็บก่อนหลอดอื่นเสมอ และห้ามนำขวดเพาะเชื้อแช่ตู้เย็น',
      severity: 'high',
      relatedChecklistIds: [1, 3, 7],
    },
  },
  ...RED_TESTS.map((name, idx) => ({
    id: idx + 1,
    name,
    tube: 'red' as TubeKey,
    ...(RED_TEST_PRECAUTIONS[name] ? { specialPrecaution: RED_TEST_PRECAUTIONS[name] } : {}),
  })),
  {
    id: 22,
    name: 'PT/INR',
    tube: 'blue',
    specialPrecaution: {
      title: 'ต้องเติมเลือด ≥ 90% และทิ้งเลือด 2 ml แรกหากเจาะเป็นหลอดแรก',
      detail: 'สัดส่วนเลือดต่อยาต้องเป็น 9:1 เท่านั้น ห้ามรัดแขนนาน อย่าให้เกิดฟอง และพลิกเบา ๆ 3–4 ครั้ง',
      severity: 'high',
      relatedChecklistIds: [3, 4, 5],
    },
  },
  {
    id: 23,
    name: 'aPTT',
    tube: 'blue',
    specialPrecaution: {
      title: 'ต้องเติมเลือด ≥ 90% และระวังการแข็งตัว/ฟองอากาศ',
      detail: 'หากเป็นหลอดแรกให้ทิ้งเลือด 2 ml แรก ปริมาณเลือดต้องถึงขีดกำหนด ≥ 90% และพลิกเบา ๆ 3–4 ครั้ง',
      severity: 'high',
      relatedChecklistIds: [3, 4, 5],
    },
  },
  {
    id: 24,
    name: 'hs-Troponin I',
    tube: 'green',
    specialPrecaution: {
      title: 'ห้ามใช้ตรวจ Lithium และนำส่งตรวจเร่งด่วน',
      detail: 'ใช้หลอด Lithium heparin พลิกกลับเบา ๆ 8–10 ครั้งทันที และรีบส่งตรวจเพื่อการประเมินภาวะหัวใจขาดเลือด',
      severity: 'high',
      relatedChecklistIds: [2, 3],
    },
  },
  {
    id: 25,
    name: 'CBC',
    tube: 'purple',
    specialPrecaution: {
      title: 'ปริมาณเลือด ≥ 60% · ห้ามปั่นแยก · ระวังลิ่มเลือด',
      detail: 'พลิกกลับเบา ๆ 8 ครั้งทันทีหลังเจาะเพื่อป้องกัน micro-clot และห้ามปั่นแยกตัวอย่างก่อนตรวจ CBC',
      severity: 'medium',
      relatedChecklistIds: [3, 4, 5],
    },
  },
  { id: 26, name: 'HbA1c', tube: 'purple' },
  {
    id: 27,
    name: 'Blood group',
    tube: 'lav',
    specialPrecaution: {
      title: 'ตรวจสอบตัวระบุตัวตนผู้ป่วยข้างเตียง 2 ครั้ง',
      detail: 'ต้องยืนยันชื่อ-นามสกุลและ HN ข้างเตียงให้ตรงกับฉลากข้างหลอดอย่างเคร่งครัด เพื่อความปลอดภัยในการให้เลือด',
      severity: 'high',
      relatedChecklistIds: [0, 2],
    },
  },
  {
    id: 28,
    name: 'FBS',
    tube: 'grey',
    specialPrecaution: {
      title: 'ยืนยันการงดอาหารและเครื่องดื่ม (NPO ≥ 8 ชม.)',
      detail: 'ตรวจสอบว่าผู้ป่วยงดอาหารตามเกณฑ์ก่อนเจาะ และพลิกหลอด NaF เบา ๆ 8–10 ครั้งเพื่อยับยั้ง glycolysis',
      severity: 'medium',
      relatedChecklistIds: [0, 3],
    },
  },
];

export const QUIZZES: Record<'pre' | 'post', QuizQuestion[]> = {
  pre: [
    {
      question: 'การตรวจ CBC ควรเลือกใช้หลอดเก็บเลือดชนิดใด',
      options: [
        'หลอดจุกสีม่วง (EDTA)',
        'หลอดจุกสีฟ้า (Sodium citrate)',
        'หลอดจุกสีเทา (Fluoride)',
        'ขวดเพาะเชื้อในเลือด',
      ],
      correctIndex: 0,
    },
    {
      question: 'การตรวจ PT/INR โดยทั่วไปควรใช้หลอดใด',
      options: [
        'หลอดจุกสีแดง',
        'หลอดจุกสีฟ้า (Sodium citrate)',
        'หลอดจุกสีม่วง',
        'หลอดจุกสีเทา',
      ],
      correctIndex: 1,
    },
    {
      question: 'เหตุใดจึงต้องตรวจสอบชื่อและตัวระบุผู้ป่วยก่อนเก็บเลือด',
      options: [
        'เพื่อลดจำนวนหลอดที่ใช้',
        'เพื่อป้องกันการสลับตัวอย่างเลือด',
        'เพื่อทำให้เลือดไหลเร็วขึ้น',
        'เพื่อลดเวลาแยกเลือด',
      ],
      correctIndex: 1,
    },
    {
      question: 'ในการเก็บเลือดหลายหลอด ข้อใดควรทำเพื่อป้องกันการปนเปื้อนสารเติมแต่ง',
      options: [
        'เก็บหลอดตามลำดับที่กำหนด (Order of Draw)',
        'เลือกหลอดตามสีที่หยิบได้ก่อน',
        'เขย่าหลอดทุกชนิดพร้อมกัน',
        'เปิดฝาหลอดทั้งหมดก่อนเจาะ',
      ],
      correctIndex: 0,
    },
    {
      question: 'หลังเก็บเลือดในหลอดที่มีสารกันเลือดแข็ง ควรทำอย่างไร',
      options: [
        'เขย่าแรง ๆ จนเกิดฟอง',
        'พลิกกลับหลอดเบา ๆ ตามข้อกำหนดของหลอด',
        'ปล่อยทิ้งไว้โดยไม่ผสม',
        'เปิดฝาแล้วใช้ไม้คน',
      ],
      correctIndex: 1,
    },
    {
      question: 'ข้อใดเป็นผลที่อาจเกิดจากการเขย่าตัวอย่างเลือดแรงเกินไป',
      options: [
        'ภาวะเม็ดเลือดแดงแตก (Hemolysis)',
        'การเพิ่มปริมาตรเลือด',
        'การเพิ่มจำนวนเกล็ดเลือดจริง',
        'การลดปริมาณสารกันเลือดแข็ง',
      ],
      correctIndex: 0,
    },
    {
      question: 'การตรวจระดับน้ำตาลที่ต้องยับยั้ง glycolysis มักใช้หลอดใด',
      options: [
        'หลอดจุกสีฟ้า',
        'หลอดจุกสีม่วง',
        'หลอดจุกสีเทาที่มีสารยับยั้ง glycolysis',
        'ขวดเพาะเชื้อ',
      ],
      correctIndex: 2,
    },
    {
      question: 'หากพบว่าเก็บเลือดผิดชนิดหลอด ควรทำอย่างไร',
      options: [
        'เปลี่ยนฉลากให้ตรงรายการตรวจ',
        'แจ้งผู้เกี่ยวข้องและเก็บตัวอย่างใหม่ด้วยหลอดที่ถูกต้องตามแนวทาง',
        'เติมสารเติมแต่งลงในหลอดเดิม',
        'ส่งตรวจโดยไม่แจ้งห้องปฏิบัติการ',
      ],
      correctIndex: 1,
    },
    {
      question: 'การรัดสายรัดแขนนานเกินไปอาจส่งผลอย่างไร',
      options: [
        'เพิ่มความเสี่ยงต่อการเปลี่ยนแปลงค่าตรวจบางรายการ',
        'ทำให้ทุกค่าตรวจแม่นยำขึ้น',
        'ป้องกัน hemolysis ได้เสมอ',
        'ทำให้ไม่ต้องตรวจสอบตัวผู้ป่วย',
      ],
      correctIndex: 0,
    },
    {
      question: 'จุดประสงค์หลักของ HemoGuide Application คือข้อใด',
      options: [
        'ใช้แทนการยืนยันตัวตนผู้ป่วย',
        'ช่วยค้นหาข้อมูลการเลือกหลอดและวิธีเก็บเลือดที่เหมาะสม',
        'ใช้วินิจฉัยโรคจากผลเลือดโดยอัตโนมัติ',
        'ใช้แทนการตรวจวิเคราะห์ในห้องปฏิบัติการ',
      ],
      correctIndex: 1,
    },
  ],
  post: [
    {
      question: 'พยาบาลต้องเก็บเลือดเพื่อตรวจ HbA1c โดยทั่วไปควรเลือกหลอดใด',
      options: [
        'หลอดจุกสีม่วง (EDTA)',
        'หลอดจุกสีฟ้า',
        'หลอดจุกสีแดง',
        'ขวดเพาะเชื้อ',
      ],
      correctIndex: 0,
    },
    {
      question: 'การตรวจ aPTT ควรใช้หลอดเก็บเลือดชนิดใด',
      options: [
        'หลอดจุกสีเทา',
        'หลอดจุกสีฟ้า (Sodium citrate)',
        'หลอดจุกสีม่วง',
        'หลอดจุกสีเขียว',
      ],
      correctIndex: 1,
    },
    {
      question: 'ก่อนติดฉลากหลอดเลือด ข้อใดเหมาะสมที่สุด',
      options: [
        'ใช้หมายเลขเตียงเพียงอย่างเดียว',
        'ยืนยันตัวผู้ป่วยด้วยตัวระบุที่กำหนดและติดฉลากให้ตรงกัน',
        'รอกลับถึงเคาน์เตอร์แล้วจึงจำชื่อผู้ป่วยมาติด',
        'ติดฉลากจากรายชื่อผู้ป่วยรายก่อน',
      ],
      correctIndex: 1,
    },
    {
      question: 'เมื่อต้องเก็บเลือดเพาะเชื้อร่วมกับหลอดตรวจอื่น ควรเก็บสิ่งส่งตรวจใดก่อน',
      options: [
        'หลอด EDTA',
        'หลอด Heparin',
        'ขวดเพาะเชื้อในเลือด',
        'หลอด Fluoride',
      ],
      correctIndex: 2,
    },
    {
      question: 'หากหลอด EDTA ไม่ได้รับการผสมอย่างเหมาะสม อาจเกิดปัญหาใด',
      options: [
        'เกิดลิ่มเลือดในตัวอย่าง',
        'ทำให้เลือดมีปริมาณมากขึ้น',
        'ทำให้ไม่ต้องตรวจ CBC',
        'ทำให้หลอดเปลี่ยนสี',
      ],
      correctIndex: 0,
    },
    {
      question: 'ข้อใดเป็นวิธีลดความเสี่ยง Hemolysis ระหว่างเก็บตัวอย่าง',
      options: [
        'ใช้แรงดูดหรือแรงดันที่รุนแรง',
        'เขย่าหลอดหลังเก็บเลือด',
        'ใช้เทคนิคเก็บและผสมเลือดอย่างนุ่มนวลตามแนวทาง',
        'บีบตำแหน่งเจาะอย่างแรงต่อเนื่อง',
      ],
      correctIndex: 2,
    },
    {
      question: 'เหตุใดหลอด Sodium citrate จึงต้องมีปริมาณเลือดตามขีดกำหนด',
      options: [
        'เพื่อรักษาสัดส่วนเลือดต่อสารกันเลือดแข็งที่เหมาะสม',
        'เพื่อให้หลอดหนักขึ้น',
        'เพื่อให้ผล CBC แม่นยำขึ้น',
        'เพื่อให้หลอดเปลี่ยนสี',
      ],
      correctIndex: 0,
    },
    {
      question: 'หากตัวอย่างเลือดสำหรับ CBC มีลิ่มเลือดจนตรวจไม่ได้ ควรทำอย่างไร',
      options: [
        'เขย่าแรง ๆ เพื่อสลายลิ่มเลือด',
        'เติม EDTA เพิ่มเอง',
        'ประสานห้องปฏิบัติการและเก็บตัวอย่างใหม่ตามแนวทาง',
        'นำลิ่มเลือดออกแล้วส่งหลอดเดิม',
      ],
      correctIndex: 2,
    },
    {
      question: 'หลังทำความสะอาดผิวหนังก่อนเจาะเลือด ควรปฏิบัติอย่างไร',
      options: [
        'เจาะทันทีขณะแอลกอฮอล์ยังเปียก',
        'ปล่อยให้บริเวณที่ทำความสะอาดแห้งตามคำแนะนำ',
        'สัมผัสตำแหน่งเจาะซ้ำโดยไม่รักษาความสะอาด',
        'เป่าลมใส่ผิวหนังเพื่อให้แห้ง',
      ],
      correctIndex: 1,
    },
    {
      question: 'ก่อนใช้ข้อมูลจาก HemoGuide เลือกหลอดเก็บเลือด ควรตรวจสอบสิ่งใดร่วมด้วย',
      options: [
        'ชื่อรายการตรวจและข้อกำหนดของห้องปฏิบัติการที่ให้บริการ',
        'เพียงสีหลอดที่มีจำนวนมากที่สุด',
        'เพียงความคุ้นเคยของผู้เก็บเลือด',
        'เพียงเวลาเปิดแอปพลิเคชัน',
      ],
      correctIndex: 0,
    },
  ],
};

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 0, title: 'ยืนยันตัวตนผู้ป่วย', description: 'ตรวจสอบชื่อ-นามสกุล, HN, วันเกิด', critical: true },
  { id: 1, title: 'เลือกหลอดถูกต้อง', description: 'ตรวจสอบสีหลอดและสารเติมแต่ง', critical: true },
  { id: 2, title: 'ติดฉลากถูกต้อง', description: 'ชื่อ, HN, วันเวลา, ชนิดการตรวจ', critical: true },
  { id: 3, title: 'พลิกหลอดตามจำนวนที่กำหนด', description: 'พลิกทันทีหลังเก็บตามชนิดหลอด', critical: true },
  { id: 4, title: 'ปริมาณเลือดเพียงพอ', description: 'เต็มตามที่กำหนด (Citrate ≥ 90%)', critical: true },
  { id: 5, title: 'ไม่พบลิ่มเลือด', description: 'ตรวจสอบว่าไม่มีเลือดแข็งตัว', critical: false },
  { id: 6, title: 'ไม่พบ Hemolysis', description: 'ตัวอย่างไม่มีสีแดงของเม็ดเลือดแดงแตก', critical: false },
  { id: 7, title: 'ภายนอกหลอดสะอาด', description: 'ไม่มีเลือดเปื้อนข้างภาชนะ', critical: false },
];

export const SURVEY_ITEMS: string[] = [
  'แอปพลิเคชันมีรูปแบบที่สวยงาม อ่านง่าย และเหมาะสมต่อการใช้งาน',
  'การจัดวางเมนูและองค์ประกอบหน้าจอมีความชัดเจนและเหมาะสม',
  'เมนูและขั้นตอนการใช้งานมีความสะดวก ไม่ซับซ้อน',
  'สามารถค้นหาข้อมูลชนิดหลอดเก็บเลือดและรายการตรวจได้อย่างรวดเร็ว',
  'ข้อมูลเกี่ยวกับชนิดหลอด ลำดับการเก็บเลือด และวิธีการผสมเลือดมีความชัดเจน เข้าใจง่าย',
  'แอปพลิเคชันช่วยลดโอกาสเกิดความผิดพลาดในการเก็บตัวอย่างเลือด',
  'แอปพลิเคชันมีประโยชน์ต่อการปฏิบัติงานและช่วยลดโอกาสเกิดความผิดพลาด',
  'โดยภาพรวม ท่านมีความพึงพอใจต่อการใช้นวัตกรรม HemoGuide Application',
];

export const HEMOLYSIS_TIPS: string[] = [
  'ใช้เข็มขนาดเหมาะสม ไม่ดึงลูกสูบเร็วหรือฉีดเลือดแรงเกินไป',
  'ผสมเลือดเบา ๆ ไม่เขย่า',
  'รอให้แอลกอฮอล์แห้งก่อนเจาะ',
  'ไม่บีบเค้นตำแหน่งเจาะ',
  'รัดสายรัดแขนไม่นานเกินไป',
];
