/* ============================================
   RIE IWAMOTO — admin.js
   管理画面ロジック・Chart.js・サンプルデータ
   ============================================ */

// ============================================
// 設定
// ============================================
const CONFIG = {
  PASSWORD: 'rie1024',          // ← パスワードを変更する場合はここを編集
  STORAGE_KEY: 'rie_reservations',
  CUSTOMER_KEY: 'rie_customers',
};

// GAS エンドポイント（main.js と同じ URL）
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwe3FBKjbzUPzcLlioAszyR7s_TMv3fm1uDDWEGf3ZpuX0WlZyggJYzYyQeFd7cE-6ZjA/exec';

// ステータス 日本語 ↔ 英語 マッピング
const STATUS_JA = { unconfirmed: '未確認', confirmed: '確認済', completed: '完了', cancelled: 'キャンセル' };
const STATUS_EN = { '未確認': 'unconfirmed', '確認済': 'confirmed', '完了': 'completed', 'キャンセル': 'cancelled' };

// ============================================
// サンプルデータ（初回起動時に使用）
// ============================================
const SAMPLE_RESERVATIONS = [
  {
    id: 'r001', submittedAt: '2026-04-14T09:00:00',
    name: '田中 美咲', phone: '090-1111-2222', email: 'tanaka@example.com',
    menu: '小顔カット + 髪質改善ケアinカラー', options: 'ヘッドスパ（+¥2,200）',
    totalPrice: 11100, desiredDate: '2026-04-17', desiredTime: '10:00',
    notes: 'カラーは明るめにしてください', status: 'confirmed',
  },
  {
    id: 'r002', submittedAt: '2026-04-14T14:30:00',
    name: '佐藤 瑞穂', phone: '080-3333-4444', email: 'sato@example.com',
    menu: '新プレミアム髪質改善TR + カラー + カット', options: 'なし',
    totalPrice: 17900, desiredDate: '2026-04-17', desiredTime: '14:00',
    notes: 'なし', status: 'unconfirmed',
  },
  {
    id: 'r003', submittedAt: '2026-04-13T11:00:00',
    name: '山本 葵', phone: '070-5555-6666', email: 'yamamoto@example.com',
    menu: 'ウェーブパーマ + 小顔カット', options: '眉カット（+¥1,100）',
    totalPrice: 12100, desiredDate: '2026-04-18', desiredTime: '11:00',
    notes: 'ゆるめのウェーブにしてほしい', status: 'confirmed',
  },
  {
    id: 'r004', submittedAt: '2026-04-12T10:00:00',
    name: '中村 咲良', phone: '090-7777-8888', email: 'nakamura@example.com',
    menu: '小顔カット + アイロン仕上げ&レクチャー', options: 'なし',
    totalPrice: 5500, desiredDate: '2026-04-15', desiredTime: '13:00',
    notes: 'なし', status: 'completed',
  },
  {
    id: 'r005', submittedAt: '2026-04-11T09:30:00',
    name: '鈴木 花奈', phone: '080-9999-0000', email: 'suzuki@example.com',
    menu: '艶髪ストレート（縮毛矯正）+ 小顔カット', options: '炭酸スパ（+¥1,650）',
    totalPrice: 17650, desiredDate: '2026-04-19', desiredTime: '10:00',
    notes: 'リタッチのみ希望', status: 'confirmed',
  },
  {
    id: 'r006', submittedAt: '2026-04-10T16:00:00',
    name: '伊藤 菜々', phone: '090-1234-5678', email: 'ito@example.com',
    menu: '髪質改善カラー + 小顔カット + 新システムTR', options: 'なし',
    totalPrice: 13900, desiredDate: '2026-04-20', desiredTime: '15:00',
    notes: 'なし', status: 'unconfirmed',
  },
  {
    id: 'r007', submittedAt: '2026-04-08T13:00:00',
    name: '高橋 彩', phone: '080-2345-6789', email: 'takahashi@example.com',
    menu: 'メンズカット（シャンプー・スタイリング込み）', options: 'なし',
    totalPrice: 4400, desiredDate: '2026-04-16', desiredTime: '16:00',
    notes: 'なし', status: 'cancelled',
  },
];

const SAMPLE_CUSTOMERS = [
  {
    id: 'c001', name: '田中 美咲', phone: '090-1111-2222',
    visitCount: 8, totalSpent: 78400,
    lastMenu: '小顔カット + 髪質改善ケアinカラー',
    lastVisit: '2026-04-17', memo: 'ブリーチ履歴あり。ダメージケア重視。',
  },
  {
    id: 'c002', name: '佐藤 瑞穂', phone: '080-3333-4444',
    visitCount: 3, totalSpent: 52700,
    lastMenu: '新プレミアム髪質改善TR + カラー + カット',
    lastVisit: '2026-04-17', memo: 'くせ毛。縮毛矯正も検討中。',
  },
  {
    id: 'c003', name: '山本 葵', phone: '070-5555-6666',
    visitCount: 5, totalSpent: 58000,
    lastMenu: 'ウェーブパーマ + 小顔カット',
    lastVisit: '2026-04-18', memo: 'パーマ好み。毎回ゆるふわに。',
  },
  {
    id: 'c004', name: '中村 咲良', phone: '090-7777-8888',
    visitCount: 12, totalSpent: 87600,
    lastMenu: '小顔カット + アイロン仕上げ&レクチャー',
    lastVisit: '2026-04-15', memo: '毎月通ってくれるリピーター。スタイリング上手。',
  },
  {
    id: 'c005', name: '鈴木 花奈', phone: '080-9999-0000',
    visitCount: 6, totalSpent: 102300,
    lastMenu: '艶髪ストレート（縮毛矯正）+ 小顔カット',
    lastVisit: '2026-04-19', memo: '縮毛矯正は3ヶ月に一度。炭酸スパお気に入り。',
  },
  {
    id: 'c006', name: '伊藤 菜々', phone: '090-1234-5678',
    visitCount: 2, totalSpent: 22900,
    lastMenu: '髪質改善カラー + 小顔カット + 新システムTR',
    lastVisit: '2026-04-20', memo: '初めて髪質改善。ダメージが少なめ。',
  },
];

// ============================================
// データ管理
// ============================================
function loadReservations() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  saveReservations(SAMPLE_RESERVATIONS);
  return SAMPLE_RESERVATIONS;
}
function saveReservations(data) {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
}
function loadCustomers() {
  const stored = localStorage.getItem(CONFIG.CUSTOMER_KEY);
  if (stored) return JSON.parse(stored);
  saveCustomers(SAMPLE_CUSTOMERS);
  return SAMPLE_CUSTOMERS;
}
function saveCustomers(data) {
  localStorage.setItem(CONFIG.CUSTOMER_KEY, JSON.stringify(data));
}

// ============================================
// ライブデータ取得（スプレッドシート連携）
// ============================================
async function fetchLiveReservations() {
  try {
    const res = await fetch(`${GAS_URL}?action=reservations`);
    const json = await res.json();
    if (json.reservations && Array.isArray(json.reservations)) {
      saveReservations(json.reservations);
      // 顧客データも自動生成（来店実績から集計）
      buildCustomersFromReservations(json.reservations);
      return json.reservations;
    }
  } catch (e) {
    console.warn('スプレッドシート取得エラー（サンプルデータを使用）:', e);
  }
  return null;
}

// 予約データから顧客マスタを生成/更新
function buildCustomersFromReservations(reservations) {
  const existing = loadCustomers();
  const map = {};
  // 既存の顧客メモを保持
  existing.forEach(c => { map[c.phone] = c.memo || ''; });

  const custMap = {};
  reservations.filter(r => r.status !== 'cancelled').forEach(r => {
    if (!custMap[r.phone]) {
      custMap[r.phone] = {
        id: 'c_' + r.phone.replace(/-/g, ''),
        name: r.name,
        phone: r.phone,
        visitCount: 0,
        totalSpent: 0,
        lastMenu: '',
        lastVisit: '',
        memo: map[r.phone] || '',
      };
    }
    const c = custMap[r.phone];
    c.visitCount++;
    c.totalSpent += r.totalPrice || 0;
    if (!c.lastVisit || r.desiredDate > c.lastVisit) {
      c.lastVisit = r.desiredDate;
      c.lastMenu = r.menu;
    }
  });

  const customers = Object.values(custMap).sort((a, b) => b.visitCount - a.visitCount);
  if (customers.length > 0) saveCustomers(customers);
}

// ステータスをスプレッドシートに反映（非同期・fire-and-forget）
function syncStatusToSheet(rowIndex, newStatusEn) {
  const statusJa = STATUS_JA[newStatusEn] || '未確認';
  fetch(GAS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateStatus', rowIndex: rowIndex, status: statusJa }),
  }).catch(e => console.warn('ステータス更新エラー:', e));
}

// ============================================
// 認証
// ============================================
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

function checkAuth() {
  if (sessionStorage.getItem('rie_admin_auth') === '1') {
    showDashboard();
  }
}
function showDashboard() {
  loginScreen.style.display = 'none';
  dashboard.style.display = 'flex';
  initDashboard();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const pw = document.getElementById('login-password').value;
  if (pw === CONFIG.PASSWORD) {
    sessionStorage.setItem('rie_admin_auth', '1');
    loginError.style.display = 'none';
    showDashboard();
  } else {
    loginError.style.display = 'block';
    document.getElementById('login-password').value = '';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('rie_admin_auth');
  dashboard.style.display = 'none';
  loginScreen.style.display = 'flex';
});

// ============================================
// Dashboard Init
// ============================================
async function initDashboard() {
  updateTopbarDate();
  initTabs();
  initSidebarToggle();
  addRefreshButton();

  // まずローカルデータで表示（即時表示）
  initSchedule();
  initReservations();
  initCustomers();
  initAnalytics();

  // バックグラウンドでスプレッドシートからライブデータ取得
  setRefreshStatus('読込中…');
  const live = await fetchLiveReservations();
  if (live) {
    // ライブデータで再描画
    renderSchedule();
    renderReservationsTable();
    renderCustomers();
    refreshAnalytics();
    setRefreshStatus('最新データ ✓');
  } else {
    setRefreshStatus('オフライン');
  }
}

function addRefreshButton() {
  const topbar = document.querySelector('.topbar');
  if (!topbar || document.getElementById('refresh-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'refresh-btn';
  btn.title = 'スプレッドシートから最新データを取得';
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> <span id="refresh-status">更新</span>';
  btn.style.cssText = 'display:flex;align-items:center;gap:0.3rem;padding:0.35rem 0.8rem;border:1px solid var(--ivory-deep,#e8ddd0);background:var(--ivory,#fafaf5);border-radius:1rem;font-size:0.78rem;color:var(--text,#2c2520);cursor:pointer;margin-left:auto;white-space:nowrap;';
  btn.addEventListener('click', async () => {
    setRefreshStatus('読込中…');
    btn.disabled = true;
    const live = await fetchLiveReservations();
    btn.disabled = false;
    if (live) {
      renderSchedule();
      renderReservationsTable();
      renderCustomers();
      refreshAnalytics();
      setRefreshStatus('最新データ ✓');
    } else {
      setRefreshStatus('エラー');
    }
  });
  topbar.appendChild(btn);
}

function setRefreshStatus(msg) {
  const el = document.getElementById('refresh-status');
  if (el) el.textContent = msg;
}

function refreshAnalytics() {
  // Chart を再描画（既存の initAnalytics を再呼び出し）
  initAnalytics();
}

function updateTopbarDate() {
  const now = new Date();
  const w = ['日', '月', '火', '水', '木', '金', '土'];
  document.getElementById('topbar-date').textContent =
    `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日（${w[now.getDay()]}）`;
}

// ============================================
// Tab Navigation
// ============================================
const tabTitles = {
  schedule: 'スケジュール',
  reservations: '予約管理',
  customers: '顧客管理',
  analytics: '売上分析',
};

function initTabs() {
  document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
      document.getElementById('topbar-title').textContent = tabTitles[tab];
      // モバイル：タブ切替時にサイドバーを閉じる
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  document.getElementById('topbar-menu').addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

// ============================================
// Schedule Tab
// ============================================
let scheduleWeekOffset = 0;
const HOUR_HEIGHT = 64;   // px per 1 hour
const START_HOUR  = 9;
const END_HOUR    = 19;
const TOTAL_HOURS = END_HOUR - START_HOUR;

// 時刻文字列 "HH:MM" を小数時間に変換（例: "9:30" → 9.5）
function parseTimeToDecimal(timeStr) {
  const parts = (timeStr || '9:00').split(':').map(Number);
  return parts[0] + (parts[1] || 0) / 60;
}

// メニュー名から施術時間（時間）を返す
function getMenuDuration(menu) {
  if (!menu) return 1;
  if (menu.includes('縮毛') || menu.includes('ストレート')) return 3;
  if (menu.includes('パーマ')) return 2.5;
  if ((menu.includes('TR') || menu.includes('トリートメント') || menu.includes('髪質改善')) && menu.includes('カラー')) return 2.5;
  if (menu.includes('カラー') && menu.includes('カット')) return 2;
  if (menu.includes('カラー')) return 1.5;
  if (menu.includes('メンズ') || menu.includes('キッズ') || menu.includes('子ども')) return 0.75;
  return 1;
}

function getWeekDates(offset) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1 + offset * 7);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function initSchedule() {
  document.getElementById('week-prev').addEventListener('click', () => {
    scheduleWeekOffset--;
    renderSchedule();
  });
  document.getElementById('week-next').addEventListener('click', () => {
    scheduleWeekOffset++;
    renderSchedule();
  });
  renderSchedule();
}

function renderSchedule() {
  const dates = getWeekDates(scheduleWeekOffset);
  const reservations = loadReservations();
  const now = new Date(); now.setHours(0,0,0,0);
  const TOTAL_PX = TOTAL_HOURS * HOUR_HEIGHT;

  // 週ラベル更新
  const first = dates[0], last = dates[dates.length - 1];
  document.getElementById('week-label').textContent =
    `${first.getMonth() + 1}/${first.getDate()} 〜 ${last.getMonth() + 1}/${last.getDate()}`;

  // ヘッダー
  const weekDays = ['月', '火', '水', '木', '金', '土'];
  const headerEl = document.getElementById('schedule-header');
  headerEl.style.gridTemplateColumns = `52px repeat(6, 1fr)`;
  headerEl.innerHTML = '<div class="schedule-col-head" style="background:var(--ivory);border-right:1px solid var(--ivory-mid)"></div>';
  dates.forEach(d => {
    const isToday = d.toDateString() === now.toDateString();
    const isSat   = d.getDay() === 6;
    const cls = ['schedule-col-head', isToday ? 'today' : '', isSat ? 'saturday' : ''].filter(Boolean).join(' ');
    headerEl.innerHTML += `<div class="${cls}">${weekDays[d.getDay() - 1] || '土'}<br><strong>${d.getDate()}</strong></div>`;
  });

  // グリッド本体
  const gridEl = document.getElementById('schedule-grid');
  gridEl.innerHTML = '';

  // ── 時間軸ガター ──
  const gutter = document.createElement('div');
  gutter.className = 'schedule-time-gutter';
  gutter.style.height = TOTAL_PX + 'px';
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    const lbl = document.createElement('div');
    lbl.className = 'schedule-time-label';
    lbl.style.top = ((h - START_HOUR) * HOUR_HEIGHT - 8) + 'px';
    lbl.textContent = `${h}:00`;
    gutter.appendChild(lbl);
  }
  gridEl.appendChild(gutter);

  // ── 各日列 ──
  dates.forEach((d, di) => {
    const dayCol = document.createElement('div');
    dayCol.className = 'schedule-day-timeline';
    dayCol.dataset.date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    dayCol.style.height = TOTAL_PX + 'px';

    // 時間グリッド線（30分刻み）
    for (let i = 0; i <= TOTAL_HOURS * 2; i++) {
      const line = document.createElement('div');
      line.className = 'schedule-hour-line';
      line.style.top = (i * HOUR_HEIGHT / 2) + 'px';
      const isHour = i % 2 === 0;
      line.style.borderTop = isHour
        ? `1px solid ${i === 0 ? 'var(--ivory-deep)' : 'rgba(232,221,208,0.55)'}`
        : '1px dashed rgba(232,221,208,0.28)';
      dayCol.appendChild(line);
    }

    // この日の予約イベント
    const dayRes = reservations.filter(r => {
      const rd = new Date(r.desiredDate);
      return rd.getFullYear() === d.getFullYear() &&
             rd.getMonth()    === d.getMonth()    &&
             rd.getDate()     === d.getDate();
    });

    dayRes.forEach(r => {
      const startH   = parseTimeToDecimal(r.desiredTime);   // "9:30" → 9.5
      const duration = r.customDuration || getMenuDuration(r.menu); // カスタム時間優先
      const top      = (startH - START_HOUR) * HOUR_HEIGHT + 2;
      const height   = Math.max(duration * HOUR_HEIGHT - 4, 28);

      // 終了時刻を表示用に計算
      const endDecimal = startH + duration;
      const endH = Math.floor(endDecimal);
      const endM = Math.round((endDecimal % 1) * 60);
      const endTimeStr = `${endH}:${String(endM).padStart(2, '0')}`;

      const ev = document.createElement('div');
      ev.className = `schedule-event ${r.status}`;
      ev.dataset.id  = r.id;
      ev.style.top   = top + 'px';
      ev.style.height = height + 'px';
      ev.innerHTML = `
        <div class="sch-ev-time">${r.desiredTime}〜${endTimeStr}</div>
        <div class="sch-ev-name">${r.name}</div>
        <div class="sch-ev-menu">${r.menu}</div>
        <div class="sch-ev-resize" title="ドラッグで施術時間を調整"></div>
      `;

      // クリックで詳細モーダル（ドラッグ判定後）
      ev.addEventListener('click', (e) => {
        if (!dragMoved && !resizeMoved) openModal(r.id);
      });
      // ドラッグ開始（リサイズハンドル以外）
      ev.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('sch-ev-resize')) return;
        startDrag(e, r, ev, dayCol);
      });
      // リサイズ開始
      ev.querySelector('.sch-ev-resize').addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startResize(e, r, ev);
      });
      dayCol.appendChild(ev);
    });

    gridEl.appendChild(dayCol);
  });
}

// ============================================
// ドラッグ＆ドロップ（スケジュール時間変更）
// ============================================
let dragMoved   = false;
let dragData    = null; // { reservation, origEl, origCol, startX, startY, ghost }

function startDrag(e, reservation, origEl, origCol) {
  if (e.button !== 0) return;
  dragMoved = false;

  const rect = origEl.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = `schedule-event-ghost ${reservation.status}`;
  ghost.style.width  = rect.width + 'px';
  ghost.style.height = rect.height + 'px';
  ghost.style.left   = rect.left + 'px';
  ghost.style.top    = rect.top  + 'px';
  ghost.innerHTML    = origEl.innerHTML;
  document.body.appendChild(ghost);

  origEl.classList.add('dragging');

  dragData = {
    reservation,
    origEl,
    origCol,
    startX: e.clientX,
    startY: e.clientY,
    ghost,
    offsetY: e.clientY - rect.top,
  };

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup',   endDrag);
  e.preventDefault();
}

function onDrag(e) {
  if (!dragData) return;
  const dx = Math.abs(e.clientX - dragData.startX);
  const dy = Math.abs(e.clientY - dragData.startY);
  if (dx > 3 || dy > 3) dragMoved = true;
  if (!dragMoved) return;

  // ゴースト移動
  dragData.ghost.style.left = (e.clientX - dragData.ghost.offsetWidth / 2) + 'px';
  dragData.ghost.style.top  = (e.clientY - dragData.offsetY) + 'px';

  // ドロップ先ハイライト
  document.querySelectorAll('.schedule-day-timeline').forEach(col => {
    const r = col.getBoundingClientRect();
    col.classList.toggle('drag-over', e.clientX >= r.left && e.clientX <= r.right);
  });
}

function endDrag(e) {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup',   endDrag);
  if (!dragData) return;

  const { reservation, origEl, ghost } = dragData;
  origEl.classList.remove('dragging');
  ghost.remove();
  document.querySelectorAll('.drag-over').forEach(c => c.classList.remove('drag-over'));

  if (dragMoved) {
    // どの日列にドロップしたか
    let targetDate = null;
    let targetCol  = null;
    document.querySelectorAll('.schedule-day-timeline').forEach(col => {
      const r = col.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right) {
        targetDate = col.dataset.date;
        targetCol  = col;
      }
    });

    if (targetDate && targetCol) {
      // Y 座標から時間を計算して30分スナップ
      const colRect  = targetCol.getBoundingClientRect();
      const rawY     = e.clientY - colRect.top;
      const SLOT_PX  = HOUR_HEIGHT / 2;  // 1スロット = 30分 = 32px
      const maxSlots = TOTAL_HOURS * 2 - 1;
      const snappedSlot = Math.max(0, Math.min(Math.round(rawY / SLOT_PX), maxSlots));
      const slotHour = START_HOUR + Math.floor(snappedSlot / 2);
      const slotMin  = (snappedSlot % 2) * 30;
      const newTime  = `${slotHour}:${String(slotMin).padStart(2, '0')}`;

      // localStorage 更新
      const reservations = loadReservations();
      const idx = reservations.findIndex(r => r.id === reservation.id);
      if (idx !== -1) {
        const oldDate = reservations[idx].desiredDate;
        const oldTime = reservations[idx].desiredTime;
        reservations[idx].desiredDate = targetDate;
        reservations[idx].desiredTime = newTime;
        saveReservations(reservations);

        // GAS に反映
        if (reservations[idx].rowIndex) {
          syncDateTimeToSheet(reservations[idx].rowIndex, targetDate, newTime);
        }

        // 確認トースト
        showToast(`${reservation.name} → ${targetDate.slice(5).replace('-','/')} ${newTime} に変更しました`);
      }

      renderSchedule();
      renderReservationsTable();
    }
  }

  dragData  = null;
  dragMoved = false;
}

// ============================================
// リサイズ（予約バーの下端ドラッグで施術時間を変更）
// ============================================
let resizeMoved = false;
let resizeData  = null;

function startResize(e, reservation, el) {
  if (e.button !== 0) return;
  resizeMoved = false;

  resizeData = {
    reservation,
    el,
    startY:      e.clientY,
    startHeight: el.getBoundingClientRect().height,
  };

  el.classList.add('resizing');
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup',   endResize);
  e.preventDefault();
}

function onResize(e) {
  if (!resizeData) return;
  const { el, startY, startHeight } = resizeData;
  const dy = e.clientY - startY;
  if (Math.abs(dy) > 3) resizeMoved = true;
  if (!resizeMoved) return;

  // 30分グリッドにスナップ
  const SLOT_PX     = HOUR_HEIGHT / 2;
  const rawHeight   = Math.max(startHeight + dy, SLOT_PX);
  const snappedH    = Math.round(rawHeight / SLOT_PX) * SLOT_PX;
  el.style.height   = snappedH + 'px';

  // 終了時刻をリアルタイム更新
  const startH      = parseTimeToDecimal(resizeData.reservation.desiredTime);
  const newDuration = snappedH / HOUR_HEIGHT;
  const endDecimal  = startH + newDuration;
  const endH        = Math.floor(endDecimal);
  const endM        = Math.round((endDecimal % 1) * 60);
  const timeEl      = el.querySelector('.sch-ev-time');
  if (timeEl) timeEl.textContent = `${resizeData.reservation.desiredTime}〜${endH}:${String(endM).padStart(2,'0')}`;
}

function endResize(e) {
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup',   endResize);
  if (!resizeData) return;

  const { reservation, el } = resizeData;
  el.classList.remove('resizing');

  if (resizeMoved) {
    const SLOT_PX     = HOUR_HEIGHT / 2;
    const newHeight   = parseFloat(el.style.height);
    const newDuration = Math.max(0.5, Math.round(newHeight / SLOT_PX) * 0.5);

    // localStorage に保存
    const reservations = loadReservations();
    const idx = reservations.findIndex(r => r.id === reservation.id);
    if (idx !== -1) {
      reservations[idx].customDuration = newDuration;
      saveReservations(reservations);

      // 時間表示用テキスト
      const hours = Math.floor(newDuration);
      const mins  = Math.round((newDuration % 1) * 60);
      const durationText = hours > 0
        ? `${hours}時間${mins > 0 ? mins + '分' : ''}`
        : `${mins}分`;
      showToast(`${reservation.name} の施術時間を ${durationText} に変更しました`);
    }
    renderSchedule();
  }

  resizeData  = null;
  resizeMoved = false;
}

// 日時変更をスプレッドシートに反映
function syncDateTimeToSheet(rowIndex, newDate, newTime) {
  const dateForSheet = newDate.replace(/-/g, '/');
  fetch(GAS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateDateTime', rowIndex, newDate: dateForSheet, newTime }),
  }).catch(e => console.warn('日時更新エラー:', e));
}

// トースト通知
function showToast(msg) {
  let toast = document.getElementById('drag-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'drag-toast';
    toast.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--sage-dark,#4a6b4d);color:#fff;padding:0.6rem 1.4rem;border-radius:2rem;font-size:0.82rem;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.18);transition:opacity 0.3s;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ============================================
// Reservations Tab
// ============================================
let currentFilter = 'all';
let currentModalId = null;

function initReservations() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderReservationsTable();
    });
  });
  renderReservationsTable();
}

function renderReservationsTable() {
  const reservations = loadReservations();
  const filtered = currentFilter === 'all'
    ? reservations
    : reservations.filter(r => r.status === currentFilter);

  const tbody = document.getElementById('res-tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-light)">データがありません</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td style="white-space:nowrap">${formatDateDisplay(r.desiredDate)} ${r.desiredTime}</td>
      <td>${r.name}</td>
      <td style="font-size:0.8rem;max-width:200px">${r.menu}</td>
      <td style="font-family:'Cormorant Garamond',serif;font-size:1rem">¥${r.totalPrice.toLocaleString()}</td>
      <td>${r.phone}</td>
      <td><span class="status-badge ${r.status}">${statusLabel(r.status)}</span></td>
      <td><button class="btn-detail" data-id="${r.id}">詳細</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
}

function statusLabel(status) {
  const map = { unconfirmed: '未確認', confirmed: '確認済', completed: '完了', cancelled: 'キャンセル' };
  return map[status] || status;
}
function formatDateDisplay(dateStr) {
  const d = new Date(dateStr);
  const w = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}/${d.getDate()}（${w[d.getDay()]}）`;
}

// ============================================
// Modal
// ============================================
function openModal(id) {
  const reservations = loadReservations();
  const r = reservations.find(x => x.id === id);
  if (!r) return;
  currentModalId = id;

  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <div class="modal-row"><span class="modal-label">お名前</span><span class="modal-value">${r.name}</span></div>
    <div class="modal-row"><span class="modal-label">電話</span><span class="modal-value">${r.phone}</span></div>
    <div class="modal-row"><span class="modal-label">メール</span><span class="modal-value">${r.email}</span></div>
    <div class="modal-row"><span class="modal-label">希望日時</span><span class="modal-value">${formatDateDisplay(r.desiredDate)} ${r.desiredTime}</span></div>
    <div class="modal-row"><span class="modal-label">メニュー</span><span class="modal-value">${r.menu}</span></div>
    <div class="modal-row"><span class="modal-label">オプション</span><span class="modal-value">${r.options || 'なし'}</span></div>
    <div class="modal-row"><span class="modal-label">合計金額</span><span class="modal-value" style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--sage-dark)">¥${r.totalPrice.toLocaleString()}</span></div>
    <div class="modal-row"><span class="modal-label">備考</span><span class="modal-value">${r.notes || 'なし'}</span></div>
    <div class="modal-row"><span class="modal-label">受付日時</span><span class="modal-value" style="font-size:0.8rem;color:var(--text-light)">${new Date(r.submittedAt).toLocaleString('ja-JP')}</span></div>
  `;

  document.getElementById('modal-status-select').value = r.status;
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  currentModalId = null;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

document.getElementById('modal-save').addEventListener('click', () => {
  if (!currentModalId) return;
  const newStatus = document.getElementById('modal-status-select').value;
  const reservations = loadReservations();
  const idx = reservations.findIndex(r => r.id === currentModalId);
  if (idx !== -1) {
    reservations[idx].status = newStatus;
    saveReservations(reservations);
    // スプレッドシートにも反映（rowIndex がある場合）
    if (reservations[idx].rowIndex) {
      syncStatusToSheet(reservations[idx].rowIndex, newStatus);
    }
    renderReservationsTable();
    renderSchedule();
  }
  closeModal();
});

// ============================================
// Customers Tab
// ============================================
function initCustomers() {
  renderCustomers();
  document.getElementById('customer-search').addEventListener('input', (e) => {
    renderCustomers(e.target.value.trim());
  });
}

function renderCustomers(query = '') {
  let customers = loadCustomers();
  if (query) {
    customers = customers.filter(c => c.name.includes(query));
  }
  const grid = document.getElementById('customer-grid');
  if (customers.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-light);font-size:0.9rem">該当する顧客が見つかりません</p>';
    return;
  }
  grid.innerHTML = customers.map(c => `
    <div class="customer-card">
      <div class="cust-head">
        <div class="cust-avatar">${c.name.charAt(0)}</div>
        <div>
          <p class="cust-name">${c.name}</p>
          <p class="cust-phone">${c.phone}</p>
        </div>
      </div>
      <div class="cust-stats">
        <div class="cust-stat">
          <span class="cust-stat-label">来店回数</span>
          <span class="cust-stat-value">${c.visitCount}回</span>
        </div>
        <div class="cust-stat">
          <span class="cust-stat-label">累計金額</span>
          <span class="cust-stat-value">¥${Math.round(c.totalSpent / 1000)}k</span>
        </div>
      </div>
      <p class="cust-last-menu">
        <strong style="color:var(--text-light);font-size:0.72rem">最終施術：</strong>${c.lastMenu}
        <span style="font-size:0.72rem;color:var(--text-light);margin-left:0.3em">(${formatDateDisplay(c.lastVisit)})</span>
      </p>
      <textarea class="cust-memo" data-id="${c.id}" placeholder="メモ…">${c.memo || ''}</textarea>
      <button class="cust-memo-save" data-id="${c.id}">保存</button>
    </div>
  `).join('');

  grid.querySelectorAll('.cust-memo-save').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const memo = grid.querySelector(`.cust-memo[data-id="${id}"]`).value;
      const customers = loadCustomers();
      const idx = customers.findIndex(c => c.id === id);
      if (idx !== -1) {
        customers[idx].memo = memo;
        saveCustomers(customers);
        btn.textContent = '✓ 保存済';
        setTimeout(() => { btn.textContent = '保存'; }, 1500);
      }
    });
  });
}

// ============================================
// Analytics Tab
// ============================================
let chartMonthly = null;
let chartMenu = null;

function initAnalytics() {
  const reservations = loadReservations();
  const customers = loadCustomers();

  // KPI
  const now = new Date();
  const thisMonth = reservations.filter(r => {
    const d = new Date(r.desiredDate);
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           r.status !== 'cancelled';
  });
  const monthSales = thisMonth.reduce((s, r) => s + r.totalPrice, 0);
  const avgPrice = thisMonth.length > 0 ? Math.round(monthSales / thisMonth.length) : 0;

  document.getElementById('kpi-month').textContent = `¥${monthSales.toLocaleString()}`;
  document.getElementById('kpi-count').textContent = `${thisMonth.length}件`;
  document.getElementById('kpi-avg').textContent = `¥${avgPrice.toLocaleString()}`;
  document.getElementById('kpi-customers').textContent = `${customers.length}名`;

  // 月別売上チャート（過去6ヶ月）
  const monthLabels = [];
  const monthData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(`${d.getMonth() + 1}月`);
    const sales = reservations
      .filter(r => {
        const rd = new Date(r.desiredDate);
        return rd.getFullYear() === d.getFullYear() &&
               rd.getMonth() === d.getMonth() &&
               r.status !== 'cancelled';
      })
      .reduce((s, r) => s + r.totalPrice, 0);
    // サンプル用にデータを少し水増し（デモ表示改善）
    monthData.push(sales || Math.floor(Math.random() * 80000) + 40000);
  }

  const ctxMonthly = document.getElementById('chart-monthly').getContext('2d');
  if (chartMonthly) chartMonthly.destroy();
  chartMonthly = new Chart(ctxMonthly, {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [{
        label: '売上（円）',
        data: monthData,
        backgroundColor: 'rgba(123,158,128,.7)',
        borderColor: 'rgba(74,107,77,1)',
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `¥${ctx.raw.toLocaleString()}`,
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => `¥${(v / 1000).toFixed(0)}k`,
            font: { size: 11 },
          },
          grid: { color: 'rgba(237,227,213,.6)' },
        },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } },
      },
    },
  });

  // メニュー別売上（円グラフ）
  const menuGroups = {
    'カット': 0,
    'カット+カラー': 0,
    'カット+カラー+TR': 0,
    '縮毛矯正・パーマ': 0,
  };
  reservations.filter(r => r.status !== 'cancelled').forEach(r => {
    if (r.menu.includes('縮毛') || r.menu.includes('パーマ')) {
      menuGroups['縮毛矯正・パーマ'] += r.totalPrice;
    } else if (r.menu.includes('TR') || r.menu.includes('トリートメント')) {
      menuGroups['カット+カラー+TR'] += r.totalPrice;
    } else if (r.menu.includes('カラー') || r.menu.includes('フルカラー')) {
      menuGroups['カット+カラー'] += r.totalPrice;
    } else {
      menuGroups['カット'] += r.totalPrice;
    }
  });

  // デモ用に値を補完
  if (Object.values(menuGroups).every(v => v === 0)) {
    menuGroups['カット'] = 25000;
    menuGroups['カット+カラー'] = 45000;
    menuGroups['カット+カラー+TR'] = 68000;
    menuGroups['縮毛矯正・パーマ'] = 34000;
  }

  const ctxMenu = document.getElementById('chart-menu').getContext('2d');
  if (chartMenu) chartMenu.destroy();
  chartMenu = new Chart(ctxMenu, {
    type: 'doughnut',
    data: {
      labels: Object.keys(menuGroups),
      datasets: [{
        data: Object.values(menuGroups),
        backgroundColor: [
          'rgba(184,208,186,.8)',
          'rgba(123,158,128,.8)',
          'rgba(74,107,77,.8)',
          'rgba(196,168,130,.8)',
        ],
        borderColor: '#FAFAF5',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, padding: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `¥${ctx.raw.toLocaleString()}`,
          },
        },
      },
    },
  });
}

// ============================================
// Boot
// ============================================
checkAuth();
