// Apps Script Web App: receives student answers and appends to a Google Sheet.
// Deploy: Extensions → Apps Script → 部署 → 新增部署作業 → 類型 Web 應用程式
//   執行身分: 我  /  存取權: 任何人
// Copy the resulting /exec URL into web/quiz.js as GAS_URL.

const SHEET_ID = '<PASTE_GOOGLE_SHEET_ID_HERE>';
const SHEET_NAME = 'answers';
const HEADERS = ['timestamp', 'studentId', 'questionId', 'kind', 'questionEn', 'selected', 'correct', 'meta'];
const STUDENT_ID_RE = /^[A-Za-z0-9]{4,15}$/;

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
  }
  return sh;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ok: true, msg: 'GAS endpoint alive' });
}

function serializeSelected_(sel) {
  if (sel === undefined || sel === null) return '';
  if (typeof sel === 'string') return sel;
  if (typeof sel === 'number') return String(sel);
  return JSON.stringify(sel);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const studentId = String(body.studentId || '').trim();
    const answers = Array.isArray(body.answers) ? body.answers : [];
    if (!STUDENT_ID_RE.test(studentId)) {
      return json_({ ok: false, error: 'bad studentId format (need 4–15 alnum)' });
    }
    if (answers.length === 0) {
      return json_({ ok: false, error: 'no answers' });
    }
    const ts = new Date();
    const rows = answers.map(a => [
      ts,
      studentId,
      String(a.id || ''),
      String(a.kind || ''),
      String(a.questionEn || ''),
      serializeSelected_(a.selected),
      a.correct === true,
      a.meta == null ? '' : (typeof a.meta === 'string' ? a.meta : JSON.stringify(a.meta)),
    ]);
    const sh = getSheet_();
    const startRow = sh.getLastRow() + 1;
    sh.getRange(startRow, 1, rows.length, HEADERS.length).setValues(rows);
    return json_({ ok: true, count: rows.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
