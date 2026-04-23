/* ============================================
   RIE IWAMOTO — main.js
   予約フォーム・ナビゲーション・カレンダー
   ============================================ */

// ── 設定 ──────────────────────────────────────
// GAS デプロイ後にここに URL を貼り付けてください
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwe3FBKjbzUPzcLlioAszyR7s_TMv3fm1uDDWEGf3ZpuX0WlZyggJYzYyQeFd7cE-6ZjA/exec';

// ============================================
// Menu Tabs（メニューセクション）
// ============================================
document.querySelectorAll('.menu-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.menu-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ============================================
// Form Menu Tabs（予約フォーム内タブ）
// ============================================
document.querySelectorAll('.form-menu-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.form-menu-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-menu-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.ftab).classList.add('active');
  });
});

// ============================================
// Navigation
// ============================================
const header = document.getElementById('site-header');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// スクロール時にヘッダーにシャドウ追加
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ハンバーガーメニュー
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// ナビリンククリックでメニュー閉じる
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// アクティブナビ（スクロール連動）
const sections = document.querySelectorAll('section[id]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));

// ============================================
// Reservation Form State
// ============================================
const state = {
  step: 1,
  menuName: '',
  menuPrice: 0,
  options: [],       // [{name, price}]
  date: null,        // Date object
  time: '',
  name: '',
  phone: '',
  notes: '',
};

function totalPrice() {
  return state.menuPrice + state.options.reduce((s, o) => s + o.price, 0);
}
function formatPrice(n) {
  return '¥' + n.toLocaleString('ja-JP');
}

// ============================================
// Step 1 — Menu & Options
// ============================================
const totalPriceEl = document.getElementById('total-price');
const step1Next = document.getElementById('step1-next');

function updatePriceDisplay() {
  totalPriceEl.textContent = formatPrice(totalPrice());
}

// Base menu radio
document.querySelectorAll('input[name="base-menu"]').forEach(radio => {
  radio.addEventListener('change', () => {
    state.menuName = radio.value;
    state.menuPrice = parseInt(radio.dataset.price, 10);
    updatePriceDisplay();
    step1Next.disabled = false;
  });
});

// Option checkboxes
document.querySelectorAll('input[name="option"]').forEach(cb => {
  cb.addEventListener('change', () => {
    const { value, dataset, checked } = cb;
    const price = parseInt(dataset.price, 10);
    if (checked) {
      state.options.push({ name: value, price });
    } else {
      state.options = state.options.filter(o => o.name !== value);
    }
    updatePriceDisplay();
  });
});

// ============================================
// Step 2 — Calendar
// ============================================
let calYear, calMonth;

function initCalendar() {
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
}

function renderCalendar() {
  const monthLabel = document.getElementById('cal-month-label');
  const grid = document.getElementById('cal-grid');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  monthLabel.textContent = `${calYear}年 ${calMonth + 1}月`;
  grid.innerHTML = '';

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // 空白セル
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'cal-day empty';
    grid.appendChild(blank);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calYear, calMonth, d);
    const dayEl = document.createElement('button');
    dayEl.type = 'button';
    dayEl.className = 'cal-day';
    dayEl.textContent = d;

    const dow = date.getDay();
    const isPast = date < now;
    const isSunday = dow === 0;

    if (dow === 6) dayEl.classList.add('saturday');
    if (isSunday) dayEl.classList.add('sunday');
    if (date.toDateString() === now.toDateString()) dayEl.classList.add('today');

    if (isPast || isSunday) {
      dayEl.classList.add('disabled');
      dayEl.disabled = true;
    } else {
      // 選択済み
      if (
        state.date &&
        state.date.getFullYear() === calYear &&
        state.date.getMonth() === calMonth &&
        state.date.getDate() === d
      ) {
        dayEl.classList.add('selected');
      }
      dayEl.addEventListener('click', () => selectDate(date, dayEl));
    }
    grid.appendChild(dayEl);
  }
}

async function selectDate(date, el) {
  state.date = date;
  state.time = '';
  // 選択スタイルリセット
  document.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');

  // 予約済み時間をGASから取得
  const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  const note = document.getElementById('timeslot-note');
  note.style.display = 'block';
  note.textContent = '空き時間を確認中…';
  document.getElementById('timeslot-grid').innerHTML = '';

  let bookedSlots = [];
  let bookings    = [];
  try {
    const res = await fetch(`${GAS_URL}?date=${encodeURIComponent(dateStr)}`);
    const json = await res.json();
    bookedSlots = json.booked    || [];
    bookings    = json.bookings  || [];
  } catch (e) {
    bookedSlots = [];
    bookings    = [];
  }

  renderTimeSlots(bookedSlots, bookings);
  updateDatetimeDisplay();
  checkStep2();
}

// ── 選択済みメニューの施術時間を返す ──
function getNewBookingDuration() {
  const menu = state.menuName;
  if (!menu) return 1;
  if (menu.includes('縮毛') || menu.includes('ストレート')) return 3;
  if (menu.includes('パーマ')) return 2.5;
  if ((menu.includes('TR') || menu.includes('トリートメント') || menu.includes('髪質改善')) && menu.includes('カラー')) return 2.5;
  if (menu.includes('カラー') && menu.includes('カット')) return 2;
  if (menu.includes('カラー')) return 1.5;
  if (menu.includes('メンズ') || menu.includes('キッズ') || menu.includes('子ども')) return 0.75;
  return 1;
}

// ── スケジュールの空きを分析しておすすめスロットを返す ──
function calcRecommendedSlots(bookings, newDuration) {
  if (!bookings || bookings.length === 0) return new Set();

  const recommended = new Set();

  // 既存予約のブロック範囲
  function isHourBlocked(h) {
    return bookings.some(b => h >= b.startHour && h < b.endHour);
  }
  function isRangeFree(startH, duration) {
    for (let h = startH; h < startH + duration; h += 0.5) {
      if (isHourBlocked(h)) return false;
    }
    return true;
  }

  timeSlots.forEach(t => {
    const h = timeToHour(t);               // "9:30" → 9.5 など小数時間に変換
    if (isHourBlocked(h)) return;          // すでに予約済み
    if (!isRangeFree(h, newDuration)) return; // 施術時間が収まらない

    const newEnd = h + newDuration;
    let score = 0;

    // ★ 直前に予約が終わる → 連続で入れられる
    const prevEnds = bookings.find(b => Math.abs(b.endHour - h) < 0.1);
    if (prevEnds) score += 5;

    // ★ 直後に予約が始まる → ぴったり埋まる
    const nextStarts = bookings.find(b => Math.abs(b.startHour - newEnd) < 0.1);
    if (nextStarts) score += 5;

    // ★ 前後どちらもぴったり → 完璧に穴埋め
    if (prevEnds && nextStarts) score += 3;

    // ✗ 中途半端な隙間が生まれる（30分未満）
    const nextAfter = bookings
      .filter(b => b.startHour > h)
      .sort((a, b) => a.startHour - b.startHour)[0];
    if (nextAfter) {
      const gap = nextAfter.startHour - newEnd;
      if (gap > 0 && gap < 0.5) score -= 5; // 30分未満の隙間は避ける
    }
    const prevBefore = bookings
      .filter(b => b.endHour <= h)
      .sort((a, b) => b.endHour - a.endHour)[0];
    if (prevBefore) {
      const gap = h - prevBefore.endHour;
      if (gap > 0 && gap < 0.5) score -= 5;
    }

    if (score >= 4) recommended.add(t);
  });

  return recommended;
}

document.getElementById('cal-prev').addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

// ── 時間帯（30分刻み）──
const timeSlots = [
  '9:00','9:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30',
];

// 時刻文字列 "HH:MM" を小数時間に変換（例: "9:30" → 9.5）
function timeToHour(t) {
  const [h, m] = t.split(':').map(Number);
  return h + (m || 0) / 60;
}

function renderTimeSlots(bookedSlots = [], bookings = []) {
  const grid = document.getElementById('timeslot-grid');
  const note = document.getElementById('timeslot-note');
  note.style.display = 'none';
  grid.innerHTML = '';

  const newDuration     = getNewBookingDuration();
  const recommendedSet  = calcRecommendedSlots(bookings, newDuration);
  const hasRecommended  = recommendedSet.size > 0;

  // おすすめがある場合はヒント表示
  if (hasRecommended) {
    const hint = document.createElement('p');
    hint.className = 'timeslot-hint';
    hint.textContent = '★ のついた時間帯はスケジュールの空きを埋めるのに最適です';
    grid.appendChild(hint);
  }

  timeSlots.forEach(t => {
    const btn           = document.createElement('button');
    btn.type            = 'button';
    const isBooked      = bookedSlots.includes(t);
    const isRecommended = !isBooked && recommendedSet.has(t);

    btn.className = 'timeslot-btn' +
      (isBooked      ? ' booked'      : '') +
      (isRecommended ? ' recommended' : '');

    if (isBooked) {
      btn.textContent = `${t} 予約済`;
    } else if (isRecommended) {
      btn.innerHTML = `★ ${t} <span class="recommend-label">おすすめ</span>`;
    } else {
      btn.textContent = t;
    }
    btn.disabled = isBooked;

    if (t === state.time) btn.classList.add('selected');

    if (!isBooked) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timeslot-btn.selected').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.time = t;
        updateDatetimeDisplay();
        checkStep2();
      });
    }
    grid.appendChild(btn);
  });
}

function updateDatetimeDisplay() {
  const el = document.getElementById('selected-datetime');
  const text = document.getElementById('selected-datetime-text');
  if (state.date && state.time) {
    const d = state.date;
    const weeks = ['日', '月', '火', '水', '木', '金', '土'];
    text.textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weeks[d.getDay()]}） ${state.time}`;
    el.style.display = 'flex';
  } else {
    el.style.display = 'none';
  }
}

function checkStep2() {
  document.getElementById('step2-next').disabled = !(state.date && state.time);
}

// ============================================
// Step 3 — Customer Info
// ============================================
const step3Inputs = ['cust-name', 'cust-phone'];
const step3Next = document.getElementById('step3-next');

function validateStep3() {
  const name  = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  step3Next.disabled = !(name && phone);
}

step3Inputs.forEach(id => {
  document.getElementById(id).addEventListener('input', validateStep3);
});

// ============================================
// Step Navigation
// ============================================
function showStep(n) {
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.progress-step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i + 1 < n) el.classList.add('done');
    if (i + 1 === n) el.classList.add('active');
  });
  const target = document.getElementById(n === 5 ? 'step-complete' : `step-${n}`);
  if (target) target.classList.add('active');
  state.step = n;

  // スクロール
  document.getElementById('reservation').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Step 1 → 2
document.getElementById('step1-next').addEventListener('click', () => {
  initCalendar();
  showStep(2);
});

// Step 2 → 3
document.getElementById('step2-next').addEventListener('click', () => showStep(3));
document.getElementById('step2-back').addEventListener('click', () => showStep(1));

// Step 3 → 4
document.getElementById('step3-next').addEventListener('click', () => {
  state.name  = document.getElementById('cust-name').value.trim();
  state.phone = document.getElementById('cust-phone').value.trim();
  state.notes = document.getElementById('cust-notes').value.trim();
  renderConfirmation();
  showStep(4);
});
document.getElementById('step3-back').addEventListener('click', () => showStep(2));
document.getElementById('step4-back').addEventListener('click', () => showStep(3));

// ============================================
// Confirmation Render
// ============================================
function renderConfirmation() {
  document.getElementById('conf-menu').textContent = state.menuName;

  if (state.options.length > 0) {
    document.getElementById('conf-options-row').style.display = 'flex';
    document.getElementById('conf-options').textContent =
      state.options.map(o => `${o.name}（+${formatPrice(o.price)}）`).join('、');
  } else {
    document.getElementById('conf-options-row').style.display = 'none';
  }

  document.getElementById('conf-total').textContent = formatPrice(totalPrice());

  const d = state.date;
  const weeks = ['日', '月', '火', '水', '木', '金', '土'];
  document.getElementById('conf-datetime').textContent =
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weeks[d.getDay()]}） ${state.time}`;

  document.getElementById('conf-name').textContent  = state.name;
  document.getElementById('conf-phone').textContent = state.phone;

  if (state.notes) {
    document.getElementById('conf-notes-row').style.display = 'flex';
    document.getElementById('conf-notes').textContent = state.notes;
  } else {
    document.getElementById('conf-notes-row').style.display = 'none';
  }
}

// ============================================
// Form Submission
// ============================================
document.getElementById('btn-submit').addEventListener('click', async () => {
  const btn = document.getElementById('btn-submit');
  btn.textContent = '送信中...';
  btn.classList.add('loading');
  btn.disabled = true;

  const d = state.date;
  const payload = {
    submittedAt: new Date().toISOString(),
    menu: state.menuName,
    options: state.options.map(o => o.name).join('、') || 'なし',
    optionsDetail: state.options,
    totalPrice: totalPrice(),
    desiredDate: `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`,
    desiredTime: state.time,
    name: state.name,
    phone: state.phone,
    notes: state.notes || 'なし',
  };

  try {
    // mode: 'no-cors' は GAS の CORS 制限を回避するため必要
    // レスポンスは読めないが、GAS 側では正常に処理される
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // no-cors では fetch が常に type: 'opaque' を返すため catch には入らない
    console.warn('GAS 送信エラー（GAS_URL が未設定の場合は正常）:', e);
  }

  // GAS_URL が未設定のデモ用フォールバック
  showStep(5);
});

// ============================================
// Scroll Reveal (軽量 IntersectionObserver)
// ============================================
const revealEls = document.querySelectorAll('.menu-category, .concept-grid, .access-grid, .menu-option-block');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  revealObs.observe(el);
});
