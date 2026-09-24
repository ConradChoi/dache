/**
 * Google Apps Script for Dache Contact Form
 * This script handles contact form submissions and adds them to a Google Spreadsheet
 */

// Replace this with your actual Google Spreadsheet ID
const SPREADSHEET_ID = '1HktmO1lwbhGghEOeg1MCYbZ3Q9G0weQn2FnKP7xzpMg';
const SHEET_NAME = 'Contact Submissions';
const MAX_FIELD_LENGTH = 500;

// =, +, -, @ 로 시작하는 값은 시트에서 수식으로 실행되므로 앞에 '를 붙여 텍스트로 저장한다.
// 시트 화면에는 '가 보이지 않고 입력한 글자 그대로 표시된다.
function sanitize(value) {
  const text = String(value == null ? '' : value).slice(0, MAX_FIELD_LENGTH);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function buildRow(data) {
  return [
    new Date(), // Timestamp
    sanitize(data.name),
    sanitize(data.birthdate),
    sanitize(data.phone),
    sanitize(data.email),
    sanitize(data.gender),
    sanitize(data.education),
    sanitize(data.region),
    sanitize(data.occupation),
    sanitize(data.income),
    sanitize(data.past_decision), // 과거 결정사 진행
    sanitize(data.ip_address),
    sanitize(data.user_agent),
    'New', // Status
    sanitize(data.privacy_agreed) // 개인정보 수집·이용 동의
  ];
}

function appendSubmission(data) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || createSheetWithHeaders(spreadsheet);
  sheet.appendRow(buildRow(data));
}

function doPost(e) {
  try {
    appendSubmission(JSON.parse(e.postData.contents));

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data successfully added to Google Sheets'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error processing request:', error.message);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error processing request'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createSheetWithHeaders(spreadsheet) {
  const sheet = spreadsheet.insertSheet(SHEET_NAME);

  // Set headers
  const headers = [
    'Timestamp',
    'Name',
    'Birthdate',
    'Phone',
    'Email',
    'Gender',
    'Education',
    'Region',
    'Occupation',
    'Income',
    'Past Decision',
    'IP Address',
    'User Agent',
    'Status',
    'Privacy Consent'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#a6edcd')
    .setHorizontalAlignment('center');

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);

  // Freeze the header row
  sheet.setFrozenRows(1);

  return sheet;
}

function doGet(e) {
  // 콜백 이름은 contact.html이 만드는 형식(callback_숫자)만 허용
  const callback = /^callback_\d+$/.test(e.parameter.callback || '') ? e.parameter.callback : null;

  function jsonp(response) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(response)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  try {
    const dataParam = e.parameter.data;

    if (callback && dataParam) {
      appendSubmission(JSON.parse(dataParam));
      return jsonp({
        success: true,
        message: 'Data successfully added to Google Sheets'
      });
    }

    // 일반 GET 요청
    return ContentService
      .createTextOutput('Dache Contact Form Handler is running')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    console.error('doGet 함수 에러:', error.message);

    if (callback) {
      return jsonp({
        success: false,
        message: 'Error processing request'
      });
    }

    return ContentService
      .createTextOutput('Error processing request')
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Test function to verify the script is working
function testConnection() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('Successfully connected to spreadsheet:', spreadsheet.getName());
    return true;
  } catch (error) {
    console.error('Error connecting to spreadsheet:', error);
    return false;
  }
}
