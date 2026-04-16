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
function initDashboard() {
  updateTopbarDate();
  initTabs();
  initSchedule();
  initReservations();
  initCustomers();
  initAnalytics();
  initSidebarToggle();
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

  // ラベル更新
  const weekDays = ['月', '火', '水', '木', '金', '土'];
  const first = dates[0], last = dates[dates.length - 1];
  document.getElementById('week-label').textContent =
    `${first.getMonth() + 1}/${first.getDate()} 〜 ${last.getMonth() + 1}/${last.getDate()}`;

  // ヘッダー
  const headerEl = document.getElementById('schedule-header');
  headerEl.style.gridTemplateColumns = `60px repeat(6, 1fr)`;
  headerEl.innerHTML = '<div class="schedule-col-head" style="background:var(--ivory)"></div>';
  dates.forEach(d => {
    const isToday = d.toDateString() === now.toDateString();
    const isSun = d.getDay() === 0;
    const isSat = d.getDay() === 6;
    const cls = ['schedule-col-head', isToday ? 'today' : '', isSun ? 'sunday' : '', isSat ? 'saturday' : ''].filter(Boolean).join(' ');
    headerEl.innerHTML += `<div class="${cls}">${weekDays[d.getDay() - 1] || '土'}<br><strong>${d.getDate()}</strong></div>`;
  });

  // グリッド
  const gridEl = document.getElementById('schedule-grid');
  gridEl.style.gridTemplateColumns = `60px repeat(6, 1fr)`;
  gridEl.innerHTML = '';

  // 時間列（9〜18時）
  const hours = Array.from({ length: 10 }, (_, i) => i + 9);

  hours.forEach(h => {
    // 時間ラベル
    const timeCell = document.createElement('div');
    timeCell.className = 'schedule-time-col';
    timeCell.textContent = `${h}:00`;
    gridEl.appendChild(timeCell);

    // 各日の枠
    dates.forEach(d => {
      const cell = document.createElement('div');
      cell.className = 'schedule-day-col';

      const matchingRes = reservations.filter(r => {
        const rDate = new Date(r.desiredDate);
        const rHour = parseInt(r.desiredTime);
        return rDate.getFullYear() === d.getFullYear() &&
               rDate.getMonth()    === d.getMonth()    &&
               rDate.getDate()     === d.getDate()     &&
               rHour === h;
      });

      matchingRes.forEach(r => {
        const ev = document.createElement('div');
        ev.className = `schedule-event ${r.status}`;
        ev.innerHTML = `<div class="schedule-event-time">${r.desiredTime}</div>
                        <div class="schedule-event-name">${r.name}</div>`;
        ev.addEventListener('click', () => openModal(r.id));
        cell.appendChild(ev);
      });
      gridEl.appendChild(cell);
    });
  });
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
