// Constants & Initial Data
const DEFAULT_SLOTS = ['08.00–10.00', '11.00–13.00', '14.00–16.00', '17.00–19.00'];
const LEGACY_SLOTS = ['08.00–10.00', '10.00–12.00', '13.00–15.00', '15.00–17.00'];
let SLOTS = DEFAULT_SLOTS.slice();

let ROOMS = []; 
let ADMINS = []; 

const LBL = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak'
};

// Kumpulan Ikon Vektor (SVG) Modern
const IC = {
  home: `<svg class="ico" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  door: `<svg class="ico" viewBox="0 0 24 24"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><path d="M14 12v.01"/></svg>`,
  cal: `<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  clock: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  users: `<svg class="ico" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  shield: `<svg class="ico" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  login: `<svg class="ico" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
  userPlus: `<svg class="ico" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
  print: `<svg class="ico" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  spark: `<svg class="ico" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  grid: `<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  search: `<svg class="ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  info: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
};

// Helper Functions
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const JAKARTA_TZ = 'Asia/Jakarta';
const jakartaParts = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: JAKARTA_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  return Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
};
const today = () => {
  const p = jakartaParts();
  return `${p.year}-${p.month}-${p.day}`;
};
const isPastSlot = (dateValue, slotValue) => {
  if (!dateValue || !slotValue) return false;
  if (dateValue < today()) return true;
  if (dateValue > today()) return false;
  const now = jakartaParts();
  const start = slotValue.split('–')[0];
  const startMinutes = toMinutes(start);
  const currentMinutes = Number(now.hour) * 60 + Number(now.minute);
  return startMinutes <= currentMinutes;
};
const fmt = d => new Date(d + 'T00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatSubmittedAt = value => {
  if (!value) return 'Waktu pengajuan tidak tersedia.';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Waktu pengajuan tidak tersedia.';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: JAKARTA_TZ,
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(date) + ' WIB';
};
const room = id => ROOMS.find(r => r.id === id) || { name: 'Ruangan dihapus', cap: 0, fac: '-', slots: [] };
const roomSlots = id => (room(id).slots || DEFAULT_SLOTS).slice().sort((a,b) => toMinutes(a.split('–')[0]) - toMinutes(b.split('–')[0]));
const toMinutes = t => { const [h,m] = t.replace('.', ':').split(':').map(Number); return h * 60 + m; };
const bookingSlot = b => b.slotTime || (typeof b.slot === 'string' ? b.slot : (LEGACY_SLOTS[b.slot] || 'Jadwal lama'));
function hasOneHourBreak(slots) {
  const ranges = slots.map(label => { const [a,z] = label.split('–'); return [toMinutes(a), toMinutes(z), label]; }).sort((a,b) => a[0]-b[0]);
  for (let i=0; i<ranges.length; i++) {
    if (ranges[i][0] >= ranges[i][1]) return false;
    if (i && ranges[i][0] - ranges[i-1][1] < 60) return false;
  }
  return true;
}

// Application State
let editingRoomId = null;

const S = {
  user: null,
  showHome: true,
  authMode: 'login',
  b: [],
  tab: 'rooms',
  room: null,
  date: today(),
  homeDate: today(),
  searchQuery: '',
  minCap: 0,
  slot: null,
  purpose: '',
  unavail: false,
  sel: null,
  historySel: null,
  toast: '',
  err: '',
  okMsg: ''
};

// State Helper Calculations
const taken = (r, d, s) => S.b.some(b => b.room === r && b.date === d && bookingSlot(b) === s && b.status !== 'rejected');
const mine = () => S.b.filter(b => b.nim === S.user.u).sort((a, b) => b.id - a.id);
const pend = () => S.b.filter(b => b.status === 'pending');

function say(t) {
  S.toast = t;
  render();
  setTimeout(() => { S.toast = ''; render(); }, 2600);
}

// ==== FUNGSI NAVIGASI BERANDA & FILTER SIMIRA / IPB ====
function goHome() {
  S.err = '';
  S.okMsg = '';
  S.showHome = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function goDashboard() {
  S.showHome = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function openAuth(mode = 'login') {
  S.err = '';
  S.okMsg = '';
  S.authMode = mode;
  S.showHome = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function updateHomeFilter(q, cap, dt) {
  if (q !== undefined) S.searchQuery = q;
  if (cap !== undefined) S.minCap = Number(cap);
  if (dt !== undefined) S.homeDate = dt || today();
  render();
}

function bookFromMatrix(roomId, dateVal, slotVal) {
  S.room = roomId;
  S.date = dateVal;
  S.slot = slotVal;
  S.unavail = false;
  if (!S.user) {
    openAuth('login');
    say('Silakan login untuk melanjutkan peminjaman ruangan & sesi tersebut.');
  } else {
    S.showHome = false;
    if (S.user.role !== 'admin') S.tab = 'rooms';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
  }
}

function pickRoomFromHome(roomId) {
  S.room = roomId;
  S.date = S.homeDate || today();
  S.slot = null;
  if (!S.user) {
    openAuth('login');
    say('Silakan masuk terlebih dahulu untuk meminjam ruangan ini.');
  } else {
    S.showHome = false;
    if (S.user.role !== 'admin') S.tab = 'rooms';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
  }
}

// ==== FUNGSI FETCH DATA DARI DATABASE (MySQL) ====
async function fetchRooms() {
  try {
    const response = await fetch('get_rooms.php');
    const result = await response.json();
    if (result.status === 'success') {
      ROOMS = result.data;
      render();
    }
  } catch (error) { console.error("Gagal ambil ruangan."); }
}

async function fetchBookings() {
  try {
    const response = await fetch('get_bookings.php');
    const result = await response.json();
    if (result.status === 'success') {
      S.b = result.data;
      render();
    }
  } catch (error) { console.error("Gagal ambil riwayat peminjaman."); }
}

async function fetchAdmins() {
  try {
    const response = await fetch('manage_admin.php?action=list');
    const result = await response.json();
    if (result.status === 'success') {
      ADMINS = result.data;
      render();
    }
  } catch (error) { console.error("Gagal ambil daftar admin."); }
}

// ==== FUNGSI LOGIN, REGISTER 1 KAMPUS, & LUPA SANDI ====
async function login(e) {
  e.preventDefault();
  S.err = ''; S.okMsg = '';
  const formData = new FormData();
  formData.append('username', $('#u').value.trim());
  formData.append('password', $('#p').value);

  try {
    const response = await fetch('login.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.status === 'success') {
      S.user = result.data;
      S.tab = S.user.role === 'admin' ? 'queue' : 'rooms';
      S.authMode = 'login';
      S.showHome = false;
      S.sel = null;
      render();
      fetchRooms(); 
      fetchBookings();
      if (S.user.role === 'admin') fetchAdmins();
    } else {
      S.err = result.message; render();
    }
  } catch (error) { S.err = 'Gagal menghubungi server.'; render(); }
}

async function register(e) {
  e.preventDefault();
  S.err = ''; S.okMsg = '';
  const nim = $('#regNim').value.trim();
  const name = $('#regName').value.trim();
  const email = $('#regEmail').value.trim().toLowerCase();
  const pass = $('#regPass').value;

  if (nim.toLowerCase().includes('admin')) {
    S.err = 'Tidak dapat mendaftar menggunakan ID Admin melalui form publik.';
    render();
    return;
  }

  const isStudent = email.endsWith('@student.uksw.edu');
  const isStaff = email.endsWith('@uksw.edu');

  if (!isStudent && !isStaff) {
    S.err = 'Gunakan email resmi kampus (@student.uksw.edu untuk Mahasiswa atau @uksw.edu untuk Dosen/Staf).';
    render();
    return;
  }

  const formData = new FormData();
  formData.append('nim', nim);
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', pass);

  try {
    const response = await fetch('register.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.status === 'success') {
      S.user = result.data; 
      S.tab = 'rooms'; 
      S.authMode = 'login';
      S.showHome = false;
      render(); 
      say('Registrasi sivitas akademika berhasil!');
      fetchRooms(); 
      fetchBookings();
    } else {
      S.err = result.message; render();
    }
  } catch (error) { S.err = 'Gagal menghubungi server.'; render(); }
}

async function resetPassword(e) {
  e.preventDefault();
  S.err = ''; S.okMsg = '';
  const formData = new FormData();
  formData.append('nim', $('#rstNim').value.trim());
  formData.append('email', $('#rstEmail').value.trim());
  formData.append('new_password', $('#rstPass').value);

  try {
    const response = await fetch('reset_password.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.status === 'success') {
      S.authMode = 'login';
      S.okMsg = result.message;
      render();
    } else {
      S.err = result.message; render();
    }
  } catch (error) { S.err = 'Gagal menghubungi server.'; render(); }
}

function setAuthMode(mode) {
  S.err = '';
  S.okMsg = '';
  S.authMode = mode;
  S.showHome = false;
  render();
}

function logout() {
  S.user = null;
  S.room = null;
  S.slot = null;
  S.unavail = false;
  S.purpose = '';
  S.showHome = true;
  render();
}

function pickRoom(id) { S.room = id; S.slot = null; S.unavail = false; render(); }
function pickDate(v) { S.date = v || today(); S.slot = null; S.unavail = false; render(); }
function pickSlot(i) {
  if (isPastSlot(S.date, i)) { S.slot = i; S.unavail = true; render(); return; }
  S.slot = i; S.unavail = taken(S.room, S.date, i); render();
}

// ==== FUNGSI KIRIM PENGAJUAN (MySQL) ====
async function kirim(e) {
  e.preventDefault();
  const purpose = S.purpose.trim();
  if (!purpose) return;

  if (isPastSlot(S.date, S.slot)) { S.unavail = true; render(); say('Tidak bisa mengajukan jadwal yang sudah lewat.'); return; }
  if (taken(S.room, S.date, S.slot)) { S.unavail = true; render(); return; }
  
  const formData = new FormData();
  formData.append('nim', S.user.u);
  formData.append('room', S.room);
  formData.append('date', S.date);
  formData.append('slot', S.slot);
  formData.append('purpose', purpose);
  formData.append('participants', $('#participantCount') ? $('#participantCount').value : 1);
  formData.append('extraFac', $('#extraFac') ? $('#extraFac').value.trim() : '');
  formData.append('extraReason', $('#extraReason') ? $('#extraReason').value.trim() : '');

  try {
    const response = await fetch('add_booking.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.status === 'success') {
      S.room = null; S.slot = null; S.purpose = ''; S.unavail = false; S.tab = 'status';
      say('Pengajuan terkirim! Menunggu verifikasi admin.');
      fetchBookings();
    } else { say(result.message); }
  } catch (error) { say('Gagal mengirim pengajuan.'); }
}

// ==== FUNGSI ADMIN PUTUSKAN JADWAL (MySQL) ====
async function decide(id, st) {
  const n = $('#nt');
  const noteText = n ? n.value.trim() : '';

  const formData = new FormData();
  formData.append('id', id);
  formData.append('status', st);
  formData.append('note', noteText);

  try {
    const response = await fetch('decide_booking.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.status === 'success') {
      S.sel = null;
      say(st === 'approved' ? 'Peminjaman disetujui.' : 'Peminjaman ditolak.');
      fetchBookings();
    } else { say(result.message); }
  } catch (error) { say('Gagal memperbarui status.'); }
}

// ==== FUNGSI CRUD RUANGAN ====
async function saveRoom(e) {
  e.preventDefault();
  const name = $('#roomName').value.trim();
  const cap = Number($('#roomCap').value);
  const facilities = $('#roomFacilities').value.trim();
  const schedule = editingRoomId ? room(editingRoomId).slots.slice() : DEFAULT_SLOTS.slice();
  
  if (!name || !facilities || cap < 1) return;
  if (!schedule.length || !hasOneHourBreak(schedule)) { say('Jadwal harus memiliki jeda minimal 1 jam.'); return; }
  
  const formData = new FormData();
  formData.append('action', editingRoomId ? 'edit' : 'add');
  if (editingRoomId) formData.append('id', editingRoomId);
  formData.append('name', name);
  formData.append('cap', cap);
  formData.append('fac', facilities);
  formData.append('slots', JSON.stringify(schedule));

  try {
    const response = await fetch('manage_room.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.status === 'success') {
      editingRoomId = null; say('Data ruangan berhasil disimpan.'); fetchRooms();
    } else { say(result.message); }
  } catch (error) { say('Gagal menyimpan ruangan.'); }
}

function editRoom(id) { editingRoomId = id; render(); }
function cancelEditRoom() { editingRoomId = null; render(); }

async function deleteRoom(id) {
  const used = S.b.some(b => b.room === id && b.status !== 'rejected');
  if (used) { say('Ruangan tidak dapat dihapus karena masih digunakan.'); return; }
  if (!confirm('Hapus ruangan ini dari database?')) return;
  
  const formData = new FormData();
  formData.append('action', 'delete'); formData.append('id', id);

  try {
    const response = await fetch('manage_room.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.status === 'success') {
      say('Ruangan dihapus.'); fetchRooms();
    } else { say(result.message); }
  } catch (error) { say('Gagal menghapus ruangan.'); }
}

function addRoomSlot(roomId) {
  const start = $('#roomSlotStart').value; const end = $('#roomSlotEnd').value;
  if (!start || !end) { say('Isi jam mulai dan jam selesai terlebih dahulu.'); return; }
  const label = start.replace(':','.') + '–' + end.replace(':','.');
  const r = room(roomId); const proposed = [...r.slots, label];
  if (toMinutes(start) >= toMinutes(end)) { say('Jam selesai harus setelah jam mulai.'); return; }
  if (r.slots.includes(label)) { say('Rentang waktu sudah ada.'); return; }
  if (!hasOneHourBreak(proposed)) { say('Jadwal bertabrakan / jeda < 1 jam.'); return; }
  r.slots = proposed; render(); say('Jam ditambahkan (Jangan lupa klik Simpan perubahan).');
}

function removeRoomSlot(roomId, label) {
  const used = S.b.some(b => b.room === roomId && bookingSlot(b) === label && b.status !== 'rejected');
  if (used) { say('Jam tidak dapat dihapus (sedang digunakan).'); return; }
  room(roomId).slots = room(roomId).slots.filter(s => s !== label);
  render(); say('Jam dihapus (Jangan lupa klik Simpan perubahan).');
}

// ==== FUNGSI KELOLA ADMIN BARU (MULTI-ADMIN TU) ====
async function addAdmin(e) {
  e.preventDefault();
  const u = $('#admUser').value.trim();
  const name = $('#admName').value.trim();
  const email = $('#admEmail').value.trim().toLowerCase();
  const pass = $('#admPass').value;

  if (!u || !name || !email || !pass) return;

  const formData = new FormData();
  formData.append('action', 'add');
  formData.append('username', u);
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', pass);

  try {
    const response = await fetch('manage_admin.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.status === 'success') {
      say(result.message);
      fetchAdmins();
    } else {
      say(result.message);
    }
  } catch (error) {
    say('Gagal menambahkan admin.');
  }
}

async function deleteAdmin(u) {
  if (u.toLowerCase() === 'admin') {
    say('Super Admin utama tidak dapat dihapus.');
    return;
  }
  if (!confirm(`Hapus akses admin untuk "${u}"?`)) return;

  const formData = new FormData();
  formData.append('action', 'delete');
  formData.append('username', u);

  try {
    const response = await fetch('manage_admin.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.status === 'success') {
      say('Akses admin dihapus.');
      fetchAdmins();
    } else {
      say(result.message);
    }
  } catch (error) {
    say('Gagal menghapus admin.');
  }
}

function checkNew() {
  fetchBookings().then(() => {
    say(pend().length ? pend().length + ' permohonan menunggu.' : 'Belum ada permohonan baru.');
  });
}

function tab(t) {
  S.tab = t;
  S.sel = null;
  if (t === 'manageAdmins') fetchAdmins();
  render();
}

// ==== HEADER GLOBAL (LOGO P / PINJAMRUANG BISA DIKLIK KE BERANDA) ====
function head() {
  if (!S.user) {
    return `
      <header class="top">
        <button type="button" class="logo-btn" onclick="goHome()" title="Kembali ke Beranda Utama">
          <i>P</i>
          <div>
            <span>PinjamRuang</span>
            <span class="logo-sub">Portal Sarana Akademik</span>
          </div>
        </button>
        <div class="sp"></div>
        <nav class="nav-links">
          <button type="button" class="nav-item ${S.showHome ? 'active' : ''}" onclick="goHome()">${IC.home}Beranda</button>
          ${S.showHome ? `
            <a class="nav-item" href="#cek-jadwal">${IC.cal}Cek Jadwal</a>
            <a class="nav-item" href="#katalog-ruang">${IC.door}Daftar Ruangan</a>
            <a class="nav-item" href="#sop-aturan">${IC.info}Alur & SOP</a>
          ` : ''}
        </nav>
        <div class="live-clock" aria-live="off">
          <span class="clock-label">Waktu Server</span>
          <b id="liveClock">--:--:--</b>
          <small id="liveDate"></small>
        </div>
        <button class="btn" onclick="openAuth('register')">${IC.userPlus}Daftar</button>
        <button class="btn p" onclick="openAuth('login')">${IC.login}Masuk</button>
      </header>
    `;
  }

  const a = S.user.role === 'admin';
  return `
    <header class="top">
      <button type="button" class="logo-btn" onclick="goHome()" title="Lihat Halaman Beranda">
        <i>P</i>
        <div>
          <span>PinjamRuang</span>
          <span class="logo-sub">Portal Sarana Akademik</span>
        </div>
      </button>
      <div class="sp"></div>
      <nav class="nav-links">
        <button type="button" class="nav-item ${S.showHome ? 'active' : ''}" onclick="goHome()">${IC.home}Beranda</button>
        <button type="button" class="nav-item ${!S.showHome ? 'active' : ''}" onclick="goDashboard()">${IC.grid}${a ? 'Dasbor Admin' : 'Form Pengajuan'}</button>
      </nav>
      <div class="live-clock" aria-live="off">
        <span class="clock-label">Waktu Server</span>
        <b id="liveClock">--:--:--</b>
        <small id="liveDate"></small>
      </div>
      <div class="who">
        <b>${esc(S.user.name)}</b>
        ${a ? 'Administrator TU · ' + esc(S.user.u) : 'Sivitas Akademika · ' + esc(S.user.u)}
      </div>
      <button class="btn" onclick="logout()">Keluar</button>
    </header>
  `;
}

function footerView() {
  return `
    <footer style="text-align:center; padding:32px 20px; color:var(--mute); font-size:13px; border-top:1px solid var(--line); margin-top:56px; background:var(--sf);">
      <b>Sistem Informasi Manajemen & Reservasi Ruangan (PinjamRuang)</b><br>
      Direktorat Sarana & Prasarana Akademik Kampus · Terintegrasi Akun SSO Email Kampus © ${new Date().getFullYear()}
    </footer>
  `;
}

// ==== HALAMAN BERANDA (GAYA SIMIRA & IPB RESERVASI) ====
function landingView() {
  const totalCap = ROOMS.reduce((acc, r) => acc + Number(r.cap || 0), 0);
  const approvedCount = S.b.filter(b => b.status === 'approved').length;

  // Filter Ruangan berdasarkan input pencarian & kapasitas
  const filteredRooms = ROOMS.filter(r => {
    const matchText = !S.searchQuery || 
      r.name.toLowerCase().includes(S.searchQuery.toLowerCase()) || 
      r.fac.toLowerCase().includes(S.searchQuery.toLowerCase());
    const matchCap = !S.minCap || Number(r.cap) >= S.minCap;
    return matchText && matchCap;
  });

  return `
    ${head()}
    <!-- HERO BANNER GAYA PORTAL KAMPUS -->
    <div class="hero-banner">
      <section class="landing-hero">
        <div>
          <div class="hero-badge">${IC.spark} Sistem Informasi Peminjaman Ruangan Terpadu</div>
          <h1>Layanan Reservasi Ruang Kelas, Lab & Auditorium Kampus</h1>
          <p>Selamat datang di portal resmi peminjaman fasilitas ruangan akademik. Mahasiswa, Dosen, dan Staf dapat memeriksa matriks ketersediaan ruangan secara <i>real-time</i> dan mengajukan reservasi secara daring.</p>
          <div class="hero-actions">
            ${S.user 
              ? `<button class="btn-hero-light" onclick="goDashboard()">${IC.grid}Buka Panel Reservasi Saya</button>`
              : `<button class="btn-hero-light" onclick="openAuth('login')">${IC.login}Ajukan Peminjaman Sekarang</button>
                 <button class="btn-hero-outline" onclick="openAuth('register')">${IC.userPlus}Daftar Akun Kampus</button>`
            }
            <a class="btn-hero-outline" href="#cek-jadwal" style="text-decoration:none; display:inline-flex; align-items:center;">${IC.cal}Lihat Matriks Jadwal</a>
          </div>
        </div>
        <div class="hero-card">
          <b style="font-size:16px; display:block; margin-bottom:4px;">${IC.door} Statistik Layanan Sarana</b>
          <span style="font-size:12.5px; color:rgba(255,255,255,0.8);">Data langsung dari pangkalan data akademik kampus</span>
          <div class="hero-stat-grid">
            <div class="hero-stat">
              <b>${ROOMS.length || 4}</b>
              <span>Ruang & Lab Aktif</span>
            </div>
            <div class="hero-stat">
              <b>${totalCap || 266}</b>
              <span>Kapasitas Kursi</span>
            </div>
            <div class="hero-stat">
              <b>${approvedCount}</b>
              <span>Jadwal Terverifikasi</span>
            </div>
            <div class="hero-stat">
              <b>SSO</b>
              <span>Email Resmi UKSW</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- FILTER PENCARIAN CEPAT (GAYA SIMIRA) -->
    <div class="quick-search-wrap">
      <div class="quick-search-bar">
        <div>
          <label for="qSearch">${IC.search}Cari Nama Ruangan / Fasilitas</label>
          <input id="qSearch" type="text" placeholder="Ketik: Lab, Seminar, Proyektor, Smart TV..." value="${esc(S.searchQuery)}" oninput="updateHomeFilter(this.value, undefined, undefined)">
        </div>
        <div>
          <label for="qCap">${IC.users}Kapasitas Minimal</label>
          <select id="qCap" onchange="updateHomeFilter(undefined, this.value, undefined)">
            <option value="0" ${S.minCap === 0 ? 'selected' : ''}>Semua Kapasitas</option>
            <option value="20" ${S.minCap === 20 ? 'selected' : ''}>Minimal 20 Kursi (Diskusi)</option>
            <option value="35" ${S.minCap === 35 ? 'selected' : ''}>Minimal 35 Kursi (Kelas/Lab)</option>
            <option value="100" ${S.minCap === 100 ? 'selected' : ''}>Minimal 100 Kursi (Aula/Seminar)</option>
          </select>
        </div>
        <div>
          <label for="qDate">${IC.cal}Tanggal Cek Jadwal</label>
          <input id="qDate" type="date" min="${today()}" value="${S.homeDate}" onchange="updateHomeFilter(undefined, undefined, this.value)">
        </div>
        <div>
          <button type="button" class="btn" style="height:44px" onclick="updateHomeFilter('', 0, today())">Reset Filter</button>
        </div>
      </div>
    </div>

    <!-- MATRIKS KETERSEDIAAN JADWAL HARIAN (GAYA IPB RESERVASI) -->
    <section id="cek-jadwal" class="section-wrap">
      <div class="matrix-card">
        <div class="matrix-header">
          <div>
            <h2 style="margin:0 0 4px">${IC.cal}Matriks Ketersediaan Ruangan Harian</h2>
            <p class="hint" style="margin:0">Menampilkan status sesi untuk <b>${fmt(S.homeDate)}</b>. Klik pada jam berlabel hijau untuk langsung meminjam.</p>
          </div>
          <div class="matrix-legend">
            <span><i class="legend-dot" style="background:var(--ok)"></i>Tersedia (Klik untuk Pinjam)</span>
            <span><i class="legend-dot" style="background:var(--bd)"></i>Sudah Terisi / Diajukan</span>
            <span><i class="legend-dot" style="background:var(--mute)"></i>Waktu Lewat</span>
          </div>
        </div>

        <table class="matrix-table">
          <thead>
            <tr>
              <th style="width:26%">Nama Ruangan</th>
              <th style="width:14%">Kapasitas</th>
              <th>Status Sesi Jam Operasional (${fmt(S.homeDate)})</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRooms.length ? filteredRooms.map(r => `
              <tr>
                <td>
                  <b>${esc(r.name)}</b>
                  <small style="display:block; color:var(--mute); font-size:12px;">${esc(r.fac)}</small>
                </td>
                <td><span class="st approved">${r.cap} Kursi</span></td>
                <td>
                  ${roomSlots(r.id).map(s => {
                    const isBusy = taken(r.id, S.homeDate, s);
                    const isPast = isPastSlot(S.homeDate, s);
                    if (isBusy) {
                      return `<span class="matrix-slot-pill busy" title="Sudah dipinjam pada sesi ini">✕ ${esc(s)} (Terisi)</span>`;
                    }
                    if (isPast) {
                      return `<span class="matrix-slot-pill past" title="Sesi waktu telah berlalu">− ${esc(s)} (Lewat)</span>`;
                    }
                    return `<button type="button" class="matrix-slot-pill avail" onclick="bookFromMatrix('${r.id}', '${S.homeDate}', '${s}')" title="Klik untuk meminjam sesi ini">✓ ${esc(s)} (Kosong)</button>`;
                  }).join('')}
                </td>
              </tr>
            `).join('') : `<tr><td colspan="3" style="text-align:center; padding:24px; color:var(--mute);">Tidak ada ruangan yang cocok dengan filter pencarian Anda.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>

    <!-- KATALOG DIREKTORI RUANGAN (GAYA SIMIRA) -->
    <section id="katalog-ruang" class="section-wrap">
      <div class="section-head">
        <div>
          <h2>${IC.door}Direktori Ruangan & Spesifikasi Fasilitas</h2>
          <p>Menampilkan ${filteredRooms.length} ruangan akademik yang dapat dipinjam oleh sivitas akademika.</p>
        </div>
      </div>
      <div class="catalog-grid">
        ${filteredRooms.length ? filteredRooms.map(r => `
          <div class="catalog-card">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px;">
                <b style="font-size:17px">${esc(r.name)}</b>
                <span class="st approved">${r.cap} Kursi</span>
              </div>
              <div class="facility-list" style="margin:10px 0 14px">
                ${r.fac.split(',').map(x => `<span class="facility-chip">${esc(x.trim())}</span>`).join('')}
              </div>
              <p class="hint" style="margin-bottom:16px">${IC.clock} Sesi Harian: ${roomSlots(r.id).map(esc).join(', ')}</p>
            </div>
            <button class="btn p" style="width:100%" onclick="pickRoomFromHome('${r.id}')">Pilih Ruangan Ini</button>
          </div>
        `).join('') : `<div class="empty" style="grid-column:1/-1">Tidak ditemukan ruangan yang sesuai kriteria filter.</div>`}
      </div>
    </section>

    <!-- ALUR & SOP TATA TERTIB PEMINJAMAN -->
    <section id="sop-aturan" class="section-wrap">
      <div class="section-head">
        <div>
          <h2>${IC.shield}Alur Prosedur & Ketentuan Peminjaman (SOP)</h2>
          <p>Panduan resmi penggunaan fasilitas ruangan di lingkungan kampus.</p>
        </div>
      </div>
      <div class="feature-grid" style="margin-bottom:24px">
        <div class="feature-card">
          <div class="feature-icon">${IC.userPlus}</div>
          <h3>1. Autentikasi Kampus</h3>
          <p>Masuk menggunakan NIM/NIP atau email resmi kampus (<code>@student.uksw.edu</code> atau <code>@uksw.edu</code>).</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">${IC.cal}</div>
          <h3>2. Cek Matriks & Pilih Sesi</h3>
          <p>Pastikan ruangan dan sesi jam yang diinginkan berstatus <b>Kosong</b> pada tabel matriks jadwal harian.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">${IC.users}</div>
          <h3>3. Pengajuan & Alat</h3>
          <p>Isi nama kegiatan akademik, estimasi peserta, dan rincian alat tambahan (seperti HDMI atau mikrofon).</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">${IC.shield}</div>
          <h3>4. Persetujuan TU & Kunci</h3>
          <p>Staf TU memverifikasi pengajuan. Tunjukkan status <b>Disetujui</b> di loket TU saat mengambil kunci ruangan.</p>
        </div>
      </div>

      <div class="sop-grid">
        <div class="sop-card">
          <h3 style="margin:0 0 8px">${IC.info}Tata Tertib & Ketentuan Penggunaan Ruangan</h3>
          <ol class="sop-list">
            <li>Pengajuan peminjaman ruangan dilakukan paling lambat sebelum sesi jam dimulai pada hari kegiatan.</li>
            <li>Peminjam wajib menjaga kebersihan, kerapian kursi, serta keamanan perangkat elektronik di dalam ruangan.</li>
            <li>Setiap sesi dipisahkan jeda 1 jam untuk pengecekan dan sterilisasi fasilitas oleh staf kerumahtanggaan kampus.</li>
            <li>Setelah selesai digunakan, pastikan proyektor, AC, dan lampu telah dimatikan sebelum mengembalikan kunci ke loket TU.</li>
          </ol>
        </div>
        <div class="sop-card">
          <h3 style="margin:0 0 8px">${IC.clock}Jam Layanan Loket Tata Usaha (TU)</h3>
          <p class="hint" style="margin:0 0 14px">Verifikasi daring dan pengambilan kunci fisik dilayani pada jam operasional berikut:</p>
          <div class="list">
            <div class="item" style="padding:12px 14px">
              <span><b>Senin – Jumat (Sif Pagi & Sore)</b><small>07.30 – 19.00 WIB</small></span>
              <span class="st approved">Aktif</span>
            </div>
            <div class="item" style="padding:12px 14px">
              <span><b>Sabtu (Layanan Terbatas)</b><small>08.00 – 13.00 WIB</small></span>
              <span class="st pending">Terbatas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    ${footerView()}
  `;
}

// ==== TAMPILAN PORTAL LOGIN / REGISTER 1 KAMPUS / RESET PASSWORD ====
function loginView() {
  if (S.authMode === 'register') {
    return `
      ${head()}
      <main class="auth-wrapper">
        <form class="auth-card" onsubmit="register(event)">
          <div class="auth-header">
            <button type="button" class="logo-btn" onclick="goHome()" title="Kembali ke Beranda">
              <i>P</i><span>PinjamRuang</span>
            </button>
            <h1>Registrasi Sivitas Akademika</h1>
            <p>Terbuka untuk Mahasiswa, Dosen, dan Staf menggunakan email resmi kampus.</p>
          </div>
          ${S.err ? `<div class="note bad" role="alert">${esc(S.err)}</div>` : ''}
          <label for="regNim">NIM / NIP / Kode Dosen</label>
          <input id="regNim" required autocomplete="username" placeholder="Contoh: 672024001 atau NIP">
          
          <label for="regName">Nama Lengkap & Gelar (Jika Dosen/Staf)</label>
          <input id="regName" required placeholder="Masukkan nama lengkap">
          
          <label for="regEmail">Email Resmi Kampus (UKSW)</label>
          <input id="regEmail" type="email" required autocomplete="email" placeholder="nama@student.uksw.edu atau nama@uksw.edu">
          
          <label for="regPass">Kata Sandi</label>
          <input id="regPass" type="password" minlength="4" required autocomplete="new-password" placeholder="Minimal 4 karakter">
          
          <div class="row" style="margin-top:20px">
            <button class="btn p" style="width:100%">${IC.userPlus}Daftar Akun Kampus</button>
          </div>
          <div class="auth-links" style="justify-content:center; gap:6px;">
            <span>Sudah memiliki akun?</span>
            <button type="button" class="link-btn" onclick="setAuthMode('login')">Masuk ke Portal</button>
          </div>
        </form>
      </main>`;
  }

  if (S.authMode === 'reset') {
    return `
      ${head()}
      <main class="auth-wrapper">
        <form class="auth-card" onsubmit="resetPassword(event)">
          <div class="auth-header">
            <button type="button" class="logo-btn" onclick="goHome()" title="Kembali ke Beranda">
              <i>P</i><span>PinjamRuang</span>
            </button>
            <h1>Pemulihan Kata Sandi</h1>
            <p>Masukkan NIM/NIP dan alamat email kampus yang terdaftar pada akun Anda.</p>
          </div>
          ${S.err ? `<div class="note bad" role="alert">${esc(S.err)}</div>` : ''}
          <label for="rstNim">NIM / NIP Terdaftar</label>
          <input id="rstNim" required placeholder="Masukkan NIM atau NIP Anda">
          
          <label for="rstEmail">Email Kampus Terdaftar</label>
          <input id="rstEmail" type="email" required placeholder="contoh: nama@student.uksw.edu">
          
          <label for="rstPass">Kata Sandi Baru</label>
          <input id="rstPass" type="password" minlength="4" required placeholder="Masukkan kata sandi baru">
          
          <div class="row" style="margin-top:20px">
            <button class="btn p" style="width:100%">Simpan Kata Sandi Baru</button>
          </div>
          <div class="auth-links" style="justify-content:center; gap:6px;">
            <span>Batal mengatur ulang?</span>
            <button type="button" class="link-btn" onclick="setAuthMode('login')">Kembali ke Login</button>
          </div>
        </form>
      </main>`;
  }

  return `
    ${head()}
    <main class="auth-wrapper">
      <form class="auth-card" onsubmit="login(event)">
        <div class="auth-header">
          <button type="button" class="logo-btn" onclick="goHome()" title="Kembali ke Beranda">
            <i>P</i><span>PinjamRuang</span>
          </button>
          <h1>Portal Reservasi Ruangan</h1>
          <p>Layanan Terpadu Peminjaman Fasilitas Kelas, Lab & Aula Kampus</p>
        </div>
        ${S.err ? `<div class="note bad" role="alert">${esc(S.err)}</div>` : ''}
        ${S.okMsg ? `<div class="note good" role="status">${esc(S.okMsg)}</div>` : ''}
        
        <label for="u">NIM / NIP / Email Kampus</label>
        <input id="u" autocomplete="username" required placeholder="Masukkan NIM, NIP, atau Email UKSW">
        
        <label for="p">Kata Sandi</label>
        <input id="p" type="password" autocomplete="current-password" required placeholder="Masukkan kata sandi">
        
        <div class="row" style="margin-top:20px">
          <button class="btn p" style="width:100%">${IC.login}Masuk ke Portal</button>
        </div>
        
        <div class="auth-links">
          <button type="button" class="link-btn" onclick="setAuthMode('reset')">Lupa kata sandi?</button>
          <span>Belum punya akun? <button type="button" class="link-btn" onclick="setAuthMode('register')">Registrasi Kampus</button></span>
        </div>
      </form>
    </main>`;
}

function studentView() {
  const m = mine();
  let h = `
    <div class="wrap">
      <h1>Halo, ${esc(S.user.name.split(' ')[0])}</h1>
      <p class="sub">Pilih ruangan akademik dan jadwal sesi yang ingin digunakan untuk kegiatan kuliah, rapat, atau praktikum.</p>
      
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" aria-selected="${S.tab === 'rooms'}" onclick="tab('rooms')">${IC.door}Daftar Ruangan</button>
        <button class="tab" role="tab" aria-selected="${S.tab === 'status'}" onclick="tab('status')">
          ${IC.clock}Status Pengajuan Saya<span class="badge">${m.length}</span>
        </button>
      </div>
  `;

  if (S.tab === 'rooms') {
    h += `
      <div class="grid">
        <div>
          <h2>Pilih Ruangan Kampus</h2>
          <div class="rooms">
            ${ROOMS.map(r => `
              <button class="room" aria-pressed="${S.room === r.id}" onclick="pickRoom('${r.id}')">
                <span>
                  <b>${r.name}</b>
                  <small>${r.fac}</small>
                </span>
                <span class="cap">${r.cap}<small>kursi</small></span>
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="panel">
          <h2>${IC.cal}Formulir Jadwal & Pengajuan</h2>
    `;

    if (!S.room) {
      h += `<div class="empty">Silakan pilih salah satu ruangan di sebelah kiri untuk memeriksa ketersediaan jadwal.</div>`;
    } else {
      h += `
        <p style="margin:0;font-weight:800;font-size:17px">${room(S.room).name}</p>
        <p class="hint">Fasilitas standar ruangan:</p>
        <div class="facility-list">${room(S.room).fac.split(',').map(x => `<span class="facility-chip">${esc(x.trim())}</span>`).join('')}</div>
        <label for="dt">Tanggal Peminjaman</label>
        <input id="dt" type="date" min="${today()}" value="${S.date}" onchange="pickDate(this.value)">
        
        <label>Pilih Sesi Waktu</label>
        <div class="slots">
          ${roomSlots(S.room).map((s, i) => {
            const t = taken(S.room, S.date, s);
            const past = isPastSlot(S.date, s);
            const unavailable = t || past;
            return `
              <button class="slot${unavailable ? ' x' : ''}" aria-pressed="${S.slot === s}" ${unavailable ? 'disabled' : ''} onclick="pickSlot('${s}')">
                ${s}<small>${past ? 'Waktu sudah lewat' : t ? 'Sudah terisi' : 'Tersedia'}</small>
              </button>
            `;
          }).join('')}
        </div>
      `;

      if (S.slot !== null && S.unavail) {
        h += `<div class="note bad" role="alert">Sesi ini sudah lewat atau sedang digunakan. Silakan pilih jam lain.</div>`;
      }

      if (S.slot !== null && !S.unavail) {
        h += `
          <form onsubmit="kirim(event)">
            <div class="note good">Jadwal dipilih: ${fmt(S.date)}, Sesi ${S.slot}</div>
            <label for="extraFac">Peminjaman Alat / Fasilitas Tambahan (Opsional)</label>
            <input id="extraFac" placeholder="Contoh: Kabel HDMI, Mikrofon Wireless, Pointer">
            <label for="extraReason">Keterangan Penggunaan Alat Tambahan</label>
            <textarea id="extraReason" placeholder="Jelaskan keperluan alat tambahan tersebut"></textarea>
            <label for="participantCount">Estimasi Jumlah Peserta</label>
            <input id="participantCount" type="number" min="1" max="${room(S.room).cap}" required placeholder="Maksimal ${room(S.room).cap} orang">
            <label for="pp">Keperluan / Nama Kegiatan Akademik</label>
            <textarea id="pp" required placeholder="Contoh: Kelas Pengganti Basis Data / Rapat Himpunan Mahasiswa" oninput="S.purpose=this.value">${esc(S.purpose)}</textarea>
            <div class="row">
              <button class="btn p" style="width:100%">Ajukan Peminjaman Ruangan</button>
            </div>
          </form>
        `;
      }
    }
    h += `</div></div>`;
  } else {
    h += m.length 
      ? `<div class="list">
          ${m.map(b => `
            <div class="item">
              <span>
                <b>${room(b.room).name}</b>
                <small>${fmt(b.date)} · Sesi ${bookingSlot(b)}</small>
                <small class="submission-time">Waktu pengajuan: ${formatSubmittedAt(b.submittedAt)}</small>
                <small>Kegiatan: ${esc(b.purpose)}</small>
                ${b.participants ? `<small>Peserta: ${b.participants} orang</small>` : ''}
                ${b.extraFac ? `<small>Alat tambahan: ${esc(b.extraFac)}${b.extraReason ? ' (' + esc(b.extraReason) + ')' : ''}</small>` : ''}
                ${b.note ? `<small><b>Catatan Admin TU:</b> ${esc(b.note)}</small>` : ''}
              </span>
              <span class="st ${b.status}">${b.status === 'approved' ? 'Disetujui' : b.status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}</span>
            </div>
          `).join('')}
        </div>`
      : `<div class="empty">Belum ada riwayat pengajuan peminjaman ruangan pada akun Anda.</div>`;
  }
  return h + footerView() + '</div>';
}

function adminTabs() {
  return `
    <div class="tabs" role="tablist">
      <button class="tab" aria-selected="${S.tab === 'queue'}" onclick="tab('queue')">${IC.cal}Antrean & Laporan</button>
      <button class="tab" aria-selected="${S.tab === 'manageRooms'}" onclick="tab('manageRooms')">${IC.door}Kelola Ruangan</button>
      <button class="tab" aria-selected="${S.tab === 'manageAdmins'}" onclick="tab('manageAdmins')">${IC.shield}Kelola Admin TU</button>
    </div>
  `;
}

function adminView() {
  if (S.tab === 'manageRooms') {
    return `<div class="wrap">
      <h1>Manajemen Fasilitas Ruangan</h1>
      <p class="sub">Tambah, perbarui kapasitas, fasilitas, serta sesi jam operasional ruangan kampus.</p>
      ${adminTabs()}
      ${roomManagementView()}
      ${footerView()}
    </div>`;
  }

  if (S.tab === 'manageAdmins') {
    return `<div class="wrap">
      <h1>Manajemen Administrator & Staf TU</h1>
      <p class="sub">Tambahkan akun untuk staf Tata Usaha (TU) atau pengelola ruangan sif lainnya agar dapat memverifikasi permohonan.</p>
      ${adminTabs()}
      ${adminManagementView()}
      ${footerView()}
    </div>`;
  }

  const p = pend();
  const done = S.b.filter(b => b.status !== 'pending').sort((a, b) => b.id - a.id);
  const cnt = s => S.b.filter(b => b.status === s).length;
  let h = `<div class="wrap">
    <h1>Dasbor Administrator Akademik</h1>
    <p class="sub">Verifikasi permohonan ruangan dari Dosen, Staf, dan Mahasiswa serta cetak laporan berkala.</p>
    ${adminTabs()}
    <div class="stats">
      <div class="stat"><b>${cnt('pending')}</b><span>Menunggu Verifikasi</span></div>
      <div class="stat"><b>${cnt('approved')}</b><span>Peminjaman Disetujui</span></div>
      <div class="stat"><b>${cnt('rejected')}</b><span>Peminjaman Ditolak</span></div>
    </div>
    <div class="grid"><div><h2>Antrean Permohonan Masuk</h2>`;
  
  h += p.length ? `<div class="list">${p.map(b => `
    <button class="item" aria-pressed="${S.sel === b.id}" onclick="S.sel=${b.id};S.historySel=null;render()"><span><b>${esc(b.name)}</b> <small style="display:inline">(${esc(b.nim)})</small><small>${room(b.room).name} · ${bookingSlot(b)}</small><small>${fmt(b.date)}</small></span><span class="st pending">Menunggu</span></button>
  `).join('')}</div>` : `<div class="empty">Seluruh permohonan telah diverifikasi.<div class="row" style="justify-content:center"><button class="btn" onclick="checkNew()">Segarkan Data</button></div></div>`;
  if (p.length) h += `<div class="row"><button class="btn" onclick="checkNew()">Segarkan Antrean</button></div>`;
  
  if (done.length) {
    h += `<div style="display:flex; justify-content:space-between; align-items:center; margin-top:36px; margin-bottom:12px;">
            <h2 style="margin:0;">Riwayat Keputusan</h2>
            <button class="btn ok" onclick="window.print()" style="padding: 8px 14px;">${IC.print}Cetak Laporan PDF</button>
          </div>
          <div class="list">${done.map(b => `
            <button type="button" class="item history-item" aria-pressed="${S.historySel === b.id}" onclick="S.historySel=${b.id};S.sel=null;render()">
              <span>
                <b>${esc(b.name)}</b> <small style="display:inline">(${esc(b.nim)})</small>
                <small>${room(b.room).name} · ${bookingSlot(b)}</small>
                <small>${fmt(b.date)}</small>
                <span class="print-only">Kegiatan: ${esc(b.purpose)} | Alat Tambahan: ${b.extraFac ? esc(b.extraFac) : '-'}</span>
              </span>
              <span class="st ${b.status}">${LBL[b.status]}</span>
            </button>`).join('')}
          </div>`;
  }
  
  h += `</div><div class="panel"><h2>${S.historySel ? 'Rincian Riwayat Peminjaman' : 'Verifikasi Permohonan'}</h2>`;
  const historyBooking = S.b.find(x => x.id === S.historySel && x.status !== 'pending');
  const b = S.b.find(x => x.id === S.sel && x.status === 'pending');
  if (historyBooking) {
    h += `<div class="history-detail">
      <p class="sub" style="margin:0 0 12px">Arsip keputusan peminjaman ruangan akademik.</p>
      <label>Nama Pemohon (NIM/NIP)</label>
      <div><b>${esc(historyBooking.name || 'Tidak tersedia')}</b> (${esc(historyBooking.nim || '-')})</div>
      <label>Ruangan & Jadwal</label>
      <div>${esc(room(historyBooking.room).name)}<br>${fmt(historyBooking.date)}, Sesi ${bookingSlot(historyBooking)}</div>
      <label>Waktu Pengajuan</label>
      <div>${formatSubmittedAt(historyBooking.submittedAt)}</div>
      <label>Alat / Fasilitas Tambahan</label>
      <div>${historyBooking.extraFac ? esc(historyBooking.extraFac) : 'Tidak ada'}</div>
      ${historyBooking.extraReason ? `<label>Keterangan Alat Tambahan</label><div>${esc(historyBooking.extraReason)}</div>` : ''}
      <label>Nama Kegiatan / Tujuan</label>
      <div>${historyBooking.purpose ? esc(historyBooking.purpose) : '-'}</div>
      <label>Jumlah Peserta</label>
      <div>${historyBooking.participants ? esc(historyBooking.participants) + ' orang' : '-'}</div>
      <label>Status Keputusan</label>
      <div><span class="st ${historyBooking.status}">${LBL[historyBooking.status]}</span></div>
      ${historyBooking.note ? `<label>Catatan Admin TU</label><div>${esc(historyBooking.note)}</div>` : ''}
    </div>`;
  } else if (!b) h += `<div class="empty">Pilih salah satu item pada antrean atau riwayat di sebelah kiri untuk meninjau rincian pengajuan.</div>`;
  else {
    const bentrok = S.b.some(x => x.id !== b.id && x.room === b.room && x.date === b.date && bookingSlot(x) === bookingSlot(b) && x.status === 'approved');
    const ok1 = !bentrok, ok2 = b.date >= today(), ok3 = b.purpose.length >= 10;
    h += `<p style="margin:0"><b>${esc(b.name)}</b> (${esc(b.nim)})</p><p class="sub" style="margin:4px 0 0">${room(b.room).name}<br>${fmt(b.date)}, Sesi ${bookingSlot(b)}</p>
      <label>Waktu Pengajuan</label><div>${formatSubmittedAt(b.submittedAt)}</div>
      <label>Kegiatan / Tujuan</label><div>${esc(b.purpose)}</div><label>Jumlah Peserta</label><div>${b.participants || '-'} orang</div>
      <label>Alat Tambahan Diminta</label><div>${b.extraFac ? esc(b.extraFac) : 'Tidak ada'}${b.extraReason ? '<br>' + esc(b.extraReason) : ''}</div>
      <ul class="chk"><li class="${ok1 ? '' : 'f'}">${ok1 ? 'Jadwal tidak bentrok' : 'Jadwal bentrok dengan peminjaman lain'}</li><li class="${ok2 ? '' : 'f'}">${ok2 ? 'Tanggal sesuai kebijakan' : 'Tanggal sudah lewat'}</li><li class="${ok3 ? '' : 'f'}">${ok3 ? 'Rincian kegiatan jelas' : 'Keterangan tujuan terlalu singkat'}</li></ul>
      <label for="nt">Catatan untuk Pemohon (Opsional)</label><input id="nt" placeholder="Contoh: Kunci diambil di loket TU Gedung A"><div class="row"><button class="btn ok" onclick="decide(${b.id},'approved')">Setujui Permohonan</button><button class="btn no" onclick="decide(${b.id},'rejected')">Tolak</button></div>`;
  }
  return h + `</div></div>${footerView()}</div>`;
}

function roomManagementView() {
  const current = editingRoomId ? room(editingRoomId) : null;
  return `<div class="grid">
    <section>
      <h2>Daftar Ruangan Aktif</h2>
      ${ROOMS.map(r => `<div class="admin-room"><div><b>${esc(r.name)}</b><p>Kapasitas ${r.cap} kursi · ${esc(r.fac)}</p><p>Sesi tersedia: ${roomSlots(r.id).map(esc).join(', ')}</p></div>
        <div class="row" style="margin-top:0"><button class="btn" onclick="editRoom('${r.id}')">Edit</button><button class="btn no" onclick="deleteRoom('${r.id}')">Hapus</button></div></div>`).join('')}
    </section>
    <div class="panel">
      <form onsubmit="saveRoom(event)">
        <h2>${current ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}</h2>
        <label for="roomName">Nama Ruangan</label><input id="roomName" required placeholder="Contoh: Ruang Seminar GX 301" value="${current ? esc(current.name) : ''}">
        <label for="roomCap">Kapasitas Maksimal (Kursi)</label><input id="roomCap" type="number" min="1" required value="${current ? current.cap : ''}">
        <label for="roomFacilities">Fasilitas Standar (Pisahkan dengan koma)</label><textarea id="roomFacilities" required placeholder="AC, Proyektor LCD, Smart TV, Papan Tulis">${current ? esc(current.fac) : ''}</textarea>
        <div class="row"><button class="btn p">${current ? 'Simpan Perubahan' : 'Tambahkan Ruangan'}</button>${current ? '<button type="button" class="btn" onclick="cancelEditRoom()">Batal</button>' : ''}</div>
      </form>
      ${current ? `<div class="schedule-editor"><h2 style="margin-top:24px">Pengaturan Sesi: ${esc(current.name)}</h2>
        <p class="hint">Setiap sesi wajib memiliki jeda minimal 1 jam untuk pergantian & pembersihan ruangan.</p>
        ${roomSlots(current.id).map(label => `<div class="slot-admin"><b>${esc(label)}</b><button type="button" class="btn no" onclick="removeRoomSlot('${current.id}','${label}')">Hapus</button></div>`).join('')}
        <div class="form-grid" style="margin-top:14px"><div><label for="roomSlotStart">Jam Mulai</label><input id="roomSlotStart" type="time" required></div><div><label for="roomSlotEnd">Jam Selesai</label><input id="roomSlotEnd" type="time" required></div></div>
        <div class="row"><button type="button" class="btn p" onclick="addRoomSlot('${current.id}')">Tambah Sesi Jam</button></div>
      </div>` : `<div class="note good">Klik tombol <b>Edit</b> pada salah satu ruangan di sebelah kiri untuk menyesuaikan sesi jam ketersediaannya.</div>`}
    </div>
  </div>`;
}

function adminManagementView() {
  return `<div class="grid">
    <section>
      <h2>Daftar Akun Administrator TU</h2>
      ${ADMINS.length ? ADMINS.map(a => `
        <div class="admin-room">
          <div>
            <b>${esc(a.nama)}</b>
            <p>ID Login / NIP: <b>${esc(a.nim)}</b></p>
            <p>Email: ${esc(a.email || '-')}</p>
          </div>
          <div>
            ${a.nim.toLowerCase() === 'admin' 
              ? `<span class="st approved">Super Admin</span>` 
              : `<button class="btn no" onclick="deleteAdmin('${esc(a.nim)}')">Cabut Akses</button>`}
          </div>
        </div>
      `).join('') : `<div class="empty">Memuat daftar administrator...</div>`}
    </section>
    <div class="panel">
      <form onsubmit="addAdmin(event)">
        <h2>${IC.userPlus}Tambah Admin / Staf TU Baru</h2>
        <p class="hint" style="margin-bottom:14px">Akun yang dibuat di sini memiliki hak akses penuh untuk menyetujui peminjaman dan mengelola ruangan.</p>
        
        <label for="admUser">Username / NIP Staf</label>
        <input id="admUser" required placeholder="Contoh: admin_sore atau NIP">
        
        <label for="admName">Nama Lengkap Staf TU</label>
        <input id="admName" required placeholder="Contoh: Budi Santoso (Staf TU Sif Sore)">
        
        <label for="admEmail">Email Resmi Staf (@uksw.edu)</label>
        <input id="admEmail" type="email" required placeholder="nama.staf@uksw.edu">
        
        <label for="admPass">Kata Sandi Login</label>
        <input id="admPass" type="password" minlength="4" required placeholder="Minimal 4 karakter">
        
        <div class="row" style="margin-top:20px">
          <button class="btn p" style="width:100%">Tambahkan Sebagai Admin</button>
        </div>
      </form>
    </div>
  </div>`;
}

// Main Render Loop
function render() {
  const ae = document.activeElement;
  const id = ae && ae.id;
  const v = ae && ae.value;
  const selStart = ae && ae.selectionStart;

  let viewHtml = '';
  if (S.showHome) {
    viewHtml = landingView();
  } else if (!S.user) {
    viewHtml = loginView();
  } else {
    viewHtml = head() + (S.user.role === 'admin' ? adminView() : studentView());
  }

  $('#app').innerHTML = viewHtml + (S.toast ? `<div class="toast" role="status">${S.toast}</div>` : '');

  if (id && $('#' + id) && ['nt', 'pp', 'qSearch'].includes(id)) {
    const el = $('#' + id);
    el.value = v;
    el.focus();
    if (typeof selStart === 'number') el.setSelectionRange(selStart, selStart);
  }
}

function updateLiveClock() {
  const now = new Date();
  const clock = document.getElementById('liveClock');
  const date = document.getElementById('liveDate');
  if (clock) clock.textContent = now.toLocaleTimeString('id-ID', {
    timeZone: JAKARTA_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  if (date) date.textContent = now.toLocaleDateString('id-ID', {
    timeZone: JAKARTA_TZ, weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });
}

// Muat ruangan & peminjaman di awal agar matriks jadwal di Landing Page langsung hidup (Real-Time)
fetchRooms();
fetchBookings();
render();
updateLiveClock();
setInterval(updateLiveClock, 1000);