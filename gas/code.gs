/**
 * ============================================================
 * RIE IWAMOTO — Google Apps Script (code.gs)
 * 予約フォーム → スプレッドシート記録 + LINE通知 + Googleカレンダー
 * ============================================================
 *
 * 【デプロイ前に変更が必要な箇所】
 *   CONFIG オブジェクトの4つの値を設定してください。
 *   詳しい取得方法は docs/setup-guide.md を参照。
 */

// ============================================================
// ★ 設定（ここを変更してください）
// ============================================================
const CONFIG = {
  // Google スプレッドシートのID（URLの /d/XXXXX/edit の XXXXX 部分）
  SHEET_ID: '1mxyq5gc7eLQoC0_-Gjqen5RnA1bUqGLWcIU3OFfJWj8',

  // LINE Messaging API のチャンネルアクセストークン
  LINE_TOKEN: 'YOUR_LINE_CHANNEL_ACCESS_TOKEN',

  // LINE通知を受け取るユーザーID（RIEさん自身のユーザーID）
  LINE_USER_ID: 'YOUR_LINE_USER_ID',

  // GoogleカレンダーのカレンダーID（例: xxxx@group.calendar.google.com）
  CALENDAR_ID: '5771d28e3cb2ed365eb30f5d5ca23a390ea6f79e101c33a9f9a92ff3f26056d4@group.calendar.google.com',
};


// ============================================================
// エントリーポイント：フォームからの POST を受け取る
// ============================================================
function doPost(e) {
  // エディタから直接実行された場合（e が undefined）は testWithSampleData() を使ってください
  if (!e || !e.postData) {
    return ContentService
      .createTextOutput('エラー: doPost はウェブ経由でのみ動作します。テストは testWithSampleData() を実行してください。')
      .setMimeType(ContentService.MimeType.TEXT);
  }
  try {
    const data = JSON.parse(e.postData.contents);

    writeToSpreadsheet(data);
    sendLineNotification(data);
    addCalendarEvent(data);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '予約を受け付けました' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('doPost error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// GET リクエスト（動作確認用）
// ============================================================
function doGet() {
  return ContentService
    .createTextOutput('RIE IWAMOTO 予約受付GAS — 正常に動作しています')
    .setMimeType(ContentService.MimeType.TEXT);
}


// ============================================================
// 1. Googleスプレッドシートに記録
// ============================================================
function writeToSpreadsheet(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  // シート「予約データ」がなければ作成
  let sheet = ss.getSheetByName('予約データ');
  if (!sheet) {
    sheet = ss.insertSheet('予約データ');
    // ヘッダー行を作成
    const headers = [
      '受付日時', 'お名前', '電話番号', 'メールアドレス',
      'ベースメニュー', '追加オプション', '合計金額',
      '希望日', '希望時間', 'ご要望・備考', 'ステータス'
    ];
    sheet.appendRow(headers);

    // ヘッダーのスタイル
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4A6B4D');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
  }

  // 日本時間で受付日時をフォーマット
  const submittedAt = new Date(data.submittedAt);
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstDate = new Date(submittedAt.getTime() + jstOffset);
  const formattedDate = Utilities.formatDate(jstDate, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

  const row = [
    formattedDate,
    data.name,
    data.phone,
    data.email,
    data.menu,
    data.options || 'なし',
    data.totalPrice,
    data.desiredDate,
    data.desiredTime,
    data.notes || 'なし',
    '未確認',
  ];

  sheet.appendRow(row);

  // 金額列を通貨形式にフォーマット
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 7).setNumberFormat('¥#,##0');
}


// ============================================================
// 2. LINE Messaging API で通知送信
// ============================================================
function sendLineNotification(data) {
  const message = buildLineMessage(data);

  const payload = {
    to: CONFIG.LINE_USER_ID,
    messages: [{
      type: 'text',
      text: message,
    }],
  };

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.LINE_TOKEN}`,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', options);
  console.log('LINE API response:', response.getContentText());
}

function buildLineMessage(data) {
  const optionsText = data.options && data.options !== 'なし'
    ? `\nオプション: ${data.options}`
    : '';

  return [
    '📋 新しい予約が入りました！',
    '─────────────────',
    `👤 ${data.name}`,
    `📞 ${data.phone}`,
    `📅 ${data.desiredDate} ${data.desiredTime}`,
    `✂️ ${data.menu}${optionsText}`,
    `💴 合計: ¥${Number(data.totalPrice).toLocaleString('ja-JP')}`,
    data.notes && data.notes !== 'なし' ? `📝 備考: ${data.notes}` : null,
    '─────────────────',
    '管理画面でご確認ください',
  ].filter(Boolean).join('\n');
}


// ============================================================
// 3. Googleカレンダーに予定追加
// ============================================================
function addCalendarEvent(data) {
  const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!calendar) {
    console.error('カレンダーが見つかりません:', CONFIG.CALENDAR_ID);
    return;
  }

  // 開始・終了時刻を構築
  const dateParts = data.desiredDate.replace(/\//g, '-').split('-');
  const timeParts = data.desiredTime.split(':');
  const startTime = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2]),
    parseInt(timeParts[0]),
    parseInt(timeParts[1] || 0)
  );

  // 施術時間は仮で2時間（必要に応じて変更）
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

  const title = `✂️ ${data.name}｜${data.menu}`;
  const description = [
    `【お客様情報】`,
    `氏名: ${data.name}`,
    `電話: ${data.phone}`,
    `メール: ${data.email}`,
    ``,
    `【施術内容】`,
    `メニュー: ${data.menu}`,
    `オプション: ${data.options || 'なし'}`,
    `合計金額: ¥${Number(data.totalPrice).toLocaleString('ja-JP')}`,
    ``,
    `【備考】`,
    data.notes || 'なし',
    ``,
    `受付日時: ${data.submittedAt}`,
  ].join('\n');

  calendar.createEvent(title, startTime, endTime, {
    description: description,
    location: 'Kraemer Paris 天神南 / 福岡市中央区今泉1-10-21 天神MACビル1F',
  });

  console.log('カレンダーに追加しました:', title);
}


// ============================================================
// テスト用関数（Apps Scriptエディタから直接実行して確認）
// ============================================================
function testWithSampleData() {
  const sampleData = {
    submittedAt: new Date().toISOString(),
    name: 'テスト 花子',
    phone: '090-0000-0000',
    email: 'test@example.com',
    menu: '小顔カット + 髪質改善ケアinカラー',
    options: 'ヘッドスパ（+¥2,200）',
    totalPrice: 11100,
    desiredDate: '2026/5/1',
    desiredTime: '10:00',
    notes: 'テスト送信です',
  };

  console.log('=== テスト開始 ===');
  try {
    writeToSpreadsheet(sampleData);
    console.log('✓ スプレッドシート書き込み成功');
  } catch (e) {
    console.error('✗ スプレッドシートエラー:', e);
  }
  try {
    sendLineNotification(sampleData);
    console.log('✓ LINE送信成功');
  } catch (e) {
    console.error('✗ LINEエラー:', e);
  }
  try {
    addCalendarEvent(sampleData);
    console.log('✓ カレンダー追加成功');
  } catch (e) {
    console.error('✗ カレンダーエラー:', e);
  }
  console.log('=== テスト終了 ===');
}
