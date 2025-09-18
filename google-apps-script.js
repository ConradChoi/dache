/**
 * Google Apps Script for Dache Contact Form
 * This script handles contact form submissions and adds them to a Google Spreadsheet
 */

// Replace this with your actual Google Spreadsheet ID
const SPREADSHEET_ID = '1HktmO1lwbhGghEOeg1MCYbZ3Q9G0weQn2FnKP7xzpMg';
const SHEET_NAME = 'Contact Submissions';

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Log the received data
    console.log('Received data:', data);
    
    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      createSheetWithHeaders(spreadsheet);
    }
    
    // Prepare the row data
    const rowData = [
      new Date(), // Timestamp
      data.name || '',
      data.birthdate || '',
      data.phone || '',
      data.email || '',
      data.gender || '',
      data.education || '',
      data.region || '',
      data.occupation || '',
      data.income || '',
      data.ip_address || '',
      data.user_agent || '',
      'New' // Status
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data successfully added to Google Sheets'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error processing request: ' + error.message
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
    'IP Address',
    'User Agent',
    'Status'
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
}

function doGet(e) {
  try {
    console.log('doGet 함수 호출됨');
    console.log('파라미터:', e.parameter);
    
    // JSONP 방식 지원
    const callback = e.parameter.callback;
    const dataParam = e.parameter.data;
    
    console.log('콜백 함수명:', callback);
    console.log('데이터 파라미터:', dataParam);
    
    if (callback && dataParam) {
      console.log('JSONP 요청 처리 시작');
      
      // JSONP 요청 처리
      const data = JSON.parse(dataParam);
      console.log('파싱된 데이터:', data);
      
      // Get the spreadsheet and sheet
      console.log('스프레드시트 접근 시도:', SPREADSHEET_ID);
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      console.log('스프레드시트 이름:', spreadsheet.getName());
      
      const sheet = spreadsheet.getSheetByName(SHEET_NAME);
      console.log('시트 존재 여부:', !!sheet);
      
      // If sheet doesn't exist, create it with headers
      if (!sheet) {
        console.log('시트 생성 시작');
        createSheetWithHeaders(spreadsheet);
        console.log('시트 생성 완료');
      }
      
      // Prepare the row data
      const rowData = [
        new Date(), // Timestamp
        data.name || '',
        data.birthdate || '',
        data.phone || '',
        data.email || '',
        data.gender || '',
        data.education || '',
        data.region || '',
        data.occupation || '',
        data.income || '',
        data.ip_address || '',
        data.user_agent || '',
        'New' // Status
      ];
      
      console.log('저장할 데이터:', rowData);
      
      // Add the row to the sheet
      sheet.appendRow(rowData);
      console.log('데이터 저장 완료');
      
      // Return JSONP response
      const response = {
        success: true,
        message: 'Data successfully added to Google Sheets'
      };
      
      console.log('JSONP 응답 전송:', response);
      
      return ContentService
        .createTextOutput(`${callback}(${JSON.stringify(response)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    console.log('일반 GET 요청 처리');
    // 일반 GET 요청
    return ContentService
      .createTextOutput('Dache Contact Form Handler is running')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    console.error('doGet 함수 에러:', error);
    console.error('에러 스택:', error.stack);
    
    const callback = e.parameter.callback;
    if (callback) {
      const errorResponse = {
        success: false,
        message: 'Error processing request: ' + error.message
      };
      
      console.log('JSONP 에러 응답 전송:', errorResponse);
      
      return ContentService
        .createTextOutput(`${callback}(${JSON.stringify(errorResponse)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return ContentService
      .createTextOutput('Error processing request: ' + error.message)
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
