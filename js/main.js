/* ============================================
   RIE IWAMOTO — main.js
   予約フォーム・ナビゲーション・カレンダー
   ============================================ */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwe3FBKjbzUPzcLlioAszyR7s_TMv3fm1uDDWEGf3ZpuX0WlZyggJYzYyQeFd7cE-6ZjA/exec';

const header = document.getElementById('site-header');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

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

const state = {
  step: 1,
  menuName: '',
  menuPrice: 0,
  options: [],
  date: null,
  time: '',
  name: '',
  phone: '',
  email: '',
  notes: '',
};

function totalPrice() {
  return state.menuPrice + state.options.reduce((s, o) => s + o.price, 0);
}
function formatPrice(n) {
  return '¥' + n.toLocaleString('ja-JP');
}

const totalPriceEl = document.getElementById('total-price');
const step1Next = document.getElementById('step1-next');

function updatePriceDisplay() {
  totalPriceEl.textContent = formatPrice(totalPrice());
}

document.querySelectorAll('input[name="base-menu"]').forEach(radio => {
  radio.addEventListener('change', () => {
    state.menuName = radio.value;
    state.menuPrice = parseInt(radio.dataset.price, 10);
    updatePriceDisplay();
    step1Next.disabled = false;
  });
});

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
  document.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');

  const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  const note = document.getElementById('timeslot-note');
  note.style.display = 'block';
  note.textContent = '空き時間を確認中…';
  document.getElementById('timeslot-grid').innerHTML = '';

  let bookedSlots = [];
  try {
    const res = await fetch(`${GAS_URL}?date=${encodeURIComponent(dateStr)}`);
    const json = await res.json();
    bookedSlots = json.booked || [];
  } catch (e) {
    bookedSlots = [];
  }

  renderTimeSlots(bookedSlots);
  updateDatetimeDisplay();
  checkStep2();
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

const timeSlots = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function renderTimeSlots(bookedSlots = []) {
  const grid = document.getElementById('timeslot-grid');
  const note = document.getElementById('timeslot-note');
  note.style.display = 'none';
  grid.innerHTML = '';

  timeSlots.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isBooked = bookedSlots.includes(t);
    btn.className = 'timeslot-btn' + (isBooked ? ' booked' : '');
    btn.textContent = isBooked ? `${t} 予約済` : t;
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

const step3Inputs = ['cust-name', 'cust-phone', 'cust-email'];
const step3Next = document.getElementById('step3-next');

function validateStep3() {
  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  step3Next.disabled = !(name && phone && email && /\S+@\S+\.\S+/.test(email));
}

step3Inputs.forEach(id => {
  document.getElementById(id).addEventListener('input', validateStep3);
});

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

  document.getElementById('reservation').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('step1-next').addEventListener('click', () => {
  initCalendar();
  showStep(2);
});

document.getElementById('step2-next').addEventListener('click', () => showStep(3));
document.getElementById('step2-back').addEventListener('click', () => showStep(1));

document.getElementById('step3-next').addEventListener('click', () => {
  state.name = document.getElementById('cust-name').value.trim();
  state.phone = document.getElementById('cust-phone').value.trim();
  state.email = document.getElementById('cust-email').value.trim();
  state.notes = document.getElementById('cust-notes').value.trim();
  renderConfirmation();
  showStep(4);
});
document.getElementById('step3-back').addEventListener('click', () => showStep(2));
document.getElementById('step4-back').addEventListener('click', () => showStep(3));

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

  document.getElementById('conf-name').textContent = state.name;
  document.getElementById('conf-phone').textContent = state.phone;
  document.getElementById('conf-email').textContent = state.email;

  if (state.notes) {
    document.getElementById('conf-notes-row').style.display = 'flex';
    document.getElementById('conf-notes').textContent = state.notes;
  } else {
    document.getElementById('conf-notes-row').style.display = 'none';
  }
}

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
    email: state.email,
    notes: state.notes || 'なし',
  };

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn('GAS 送信エラー:', e);
  }

  showStep(5);
});

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
