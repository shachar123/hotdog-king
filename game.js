/* ============ מלך הנקניקיה — לוגיקת המשחק (בהשראת מכניקת מלך הפלאפל) ============ */
"use strict";

const $ = (s) => document.querySelector(s);
const SVGNS = "http://www.w3.org/2000/svg";

/* ---------- מצב ---------- */
const SLOT_X = [370, 520, 670, 820]; // מרכזי עמדות הלקוחות (מימין לגריל, כדי שלא יסתירו אותו)
const state = {
  running: false,
  musicOn: true,
  score: 0,
  // ההזמנה הנוכחית (שלטים משותפים, כמו במקור)
  order: { sausage: 0, kraut: 0, mustard: 0, ketchup: 0, drink: null, drinkQty: 0 },
  holdingBun: false,
  bun: {},          // מה שכבר בלחמנייה
  drinksOnTray: 0,  // שתייה שהונחה ליד
  serving: false,
  customers: [null, null, null, null],
  usedVariants: [],
  spawnTimer: null,
  meterTimers: [],
  blinkTimers: [],
  stock: {},
};

const HS_KEY = "hotdogKingHighScore";
const highScore = () => Number(localStorage.getItem(HS_KEY) || 0);

/* -------- ליידרבורד אונליין (JSONBlob — ללא שרת) -------- */
const BLOB_URL = "https://jsonblob.com/api/jsonBlob/019eb5a6-e4c0-7b9f-9466-39466d232267";

/* -------- מלאי תחנות -------- */
const MAX_STOCK = { sausage: 12, kraut: 18, mustard: 10, ketchup: 10, cola: 6, sprite: 6, water: 6, vodka: 3 };
const STATION_GID = { sausage: "st_sausage", kraut: "st_kraut", mustard: "st_mustard", ketchup: "st_ketchup",
                      cola: "st_cola", sprite: "st_sprite", water: "st_water", vodka: "st_vodka" };

/* ---------- סאונד: אפקטים + מוזיקת רקע מסונתזת ---------- */
let actx = null;
function ac() {
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  return actx;
}
function tone(freq, dur, type = "square", vol = 0.1, when = 0) {
  try {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + when); o.stop(c.currentTime + when + dur + 0.05);
  } catch (e) {}
}
const sfx = {
  bun:   () => tone(220, 0.1, "triangle", 0.14),
  add:   () => { tone(740, 0.05, "square", 0.08); tone(990, 0.07, "square", 0.07, 0.05); },
  wrong: () => tone(140, 0.22, "sawtooth", 0.12),
  serve: () => { tone(1047, 0.09, "square", 0.1); tone(1319, 0.09, "square", 0.1, 0.09); tone(1568, 0.18, "square", 0.1, 0.18); },
  vodka: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.1, "triangle", 0.1, i * 0.07)); },
  grumble: () => { tone(110, 0.16, "sawtooth", 0.1); tone(92, 0.2, "sawtooth", 0.1, 0.12); },
  over:  () => { tone(392, 0.3, "square", 0.12); tone(330, 0.3, "square", 0.12, 0.3); tone(262, 0.6, "square", 0.12, 0.6); },
};

/* מוזיקת רקע: לופ מזרחי קצבי (פריגיש), מסונתז — מופעל מהרדיו-טייפ */
let musicTimer = null, musicStep = 0;
const MELODY = [0, 4, 5, 4, 7, 5, 4, 0, 0, 4, 5, 7, 8, 7, 5, 4]; // חצאי טונים מעל D
const BASS = [0, 0, 7, 0, 5, 0, 7, 0];
function musicTick() {
  if (!state.musicOn || !state.running) return;
  const base = 294; // D4
  const m = MELODY[musicStep % 16];
  if (m !== null) tone(base * Math.pow(2, m / 12), 0.14, "square", 0.045);
  if (musicStep % 2 === 0) {
    const b = BASS[(musicStep / 2) % 8];
    tone((base / 2) * Math.pow(2, b / 12), 0.2, "triangle", 0.075);
  }
  if (musicStep % 4 === 0) tone(2200, 0.03, "square", 0.025); // "מצילה"
  musicStep++;
}
function startMusic() {
  stopMusic();
  musicTimer = setInterval(musicTick, 170);
  $("#musicNote") && $("#musicNote").setAttribute("opacity", "1");
}
function stopMusic() {
  clearInterval(musicTimer); musicTimer = null;
  $("#musicNote") && $("#musicNote").setAttribute("opacity", "0");
}

/* ---------- בניית הבמה ---------- */
function buildStage() {
  $("#stage").innerHTML = sceneArt();
  $("#vendorFace").innerHTML = vendorFaceArt(false);
  // מצמוץ של המוכר במראה
  setInterval(() => {
    if (!state.running) return;
    $("#vendorFace").innerHTML = vendorFaceArt(true);
    setTimeout(() => { $("#vendorFace").innerHTML = vendorFaceArt(false); }, 180);
  }, 3400);

  // מאזיני תחנות
  bindStation("st_sausage", "sausage");
  bindStation("st_kraut", "kraut");
  bindStation("st_mustard", "mustard");
  bindStation("st_ketchup", "ketchup");
  ["cola", "sprite", "water", "vodka"].forEach((d) => bindDrink(d));
  $("#bunStack").addEventListener("click", takeBun);

  // פועל המטבח
  const workerEl = $("#workerChar");
  if (workerEl) workerEl.innerHTML = workerArt(false);
  $("#workerWindow").addEventListener("click", handleWorkerClick);

  $("#boombox").addEventListener("click", () => {
    state.musicOn = !state.musicOn;
    state.musicOn ? startMusic() : stopMusic();
  });
}

/* ---------- מלאי תחנות ---------- */
function updateStationVisual(key) {
  const gid = STATION_GID[key];
  const el = $(`#${gid}`);
  if (!el) return;
  const n = state.stock[key];
  const lbl = $(`#mtStock_${key}`);
  if (n <= 0) {
    el.classList.add("station-empty");
    el.classList.remove("station-low");
    if (lbl) lbl.setAttribute("visibility", "visible");
  } else if (n <= 2) {
    el.classList.remove("station-empty");
    el.classList.add("station-low");
    if (lbl) lbl.setAttribute("visibility", "hidden");
    triggerWorkerWave();
  } else {
    el.classList.remove("station-empty", "station-low");
    if (lbl) lbl.setAttribute("visibility", "hidden");
  }
}

function triggerWorkerWave() {
  const w = $("#workerChar");
  if (w && !w.dataset.waving) {
    w.dataset.waving = "1";
    w.innerHTML = workerArt(true);
  }
}

function handleWorkerClick() {
  if (!state.running) return;
  const needsRestock = Object.keys(MAX_STOCK).some((k) => state.stock[k] < MAX_STOCK[k]);
  if (needsRestock) {
    Object.keys(MAX_STOCK).forEach((k) => { state.stock[k] = MAX_STOCK[k]; });
    Object.keys(STATION_GID).forEach((k) => updateStationVisual(k));
    sfx.serve();
    scorePop(84, 188, "🚚 מלא!", "#1d8a2e");
  }
  const w = $("#workerChar");
  if (w) {
    delete w.dataset.waving;
    w.innerHTML = workerArt(true);
    setTimeout(() => { w.innerHTML = workerArt(false); }, 1200);
  }
}

/* ---------- הזמנה (שלטים) ---------- */
function newOrder() {
  const o = state.order;
  o.sausage = 1 + Math.floor(Math.random() * 2);          // 1-2
  o.kraut = Math.floor(Math.random() * 4);                // 0-3
  o.mustard = Math.floor(Math.random() * 2);              // 0-1
  o.ketchup = Math.floor(Math.random() * 2);              // 0-1
  const r = Math.random();
  if (r < 0.08) { o.drink = "vodka"; o.drinkQty = 1; }
  else if (r < 0.48) { o.drink = ["cola", "sprite", "water"][Math.floor(Math.random() * 3)]; o.drinkQty = 1; }
  else { o.drink = null; o.drinkQty = 0; }
  renderSigns();
}

const DRINK_NAME = { cola: "קולה", sprite: "ספרייט", water: "מים", vodka: "וודקה XL" };
function renderSigns() {
  const o = state.order;
  setSign("sgn_sausage", o.sausage);
  setSign("sgn_kraut", o.kraut);
  setSign("sgn_mustard", o.mustard);
  setSign("sgn_ketchup", o.ketchup);
  const ds = $("#sgn_drink");
  const num = ds.querySelector(".sgnNum");
  const lbl = ds.querySelector("text");
  if (o.drink) {
    lbl.textContent = DRINK_NAME[o.drink];
    num.textContent = o.drinkQty;
    if (o.drink === "vodka") { ds.classList.add("vodkaSign"); lbl.setAttribute("fill", "#7b2ff7"); }
    else { ds.classList.remove("vodkaSign"); lbl.setAttribute("fill", "#555"); }
  } else {
    lbl.textContent = "שתייה";
    lbl.setAttribute("fill", "#555");
    num.textContent = "—";
    ds.classList.remove("vodkaSign");
  }
}
function setSign(id, n) {
  $(`#${id} .sgnNum`).textContent = n;
}

function orderDone() {
  const o = state.order;
  return state.holdingBun && o.sausage <= 0 && o.kraut <= 0 && o.mustard <= 0 && o.ketchup <= 0 && o.drinkQty <= 0;
}

/* ---------- לחמנייה ויד ---------- */
function takeBun() {
  if (!state.running || state.serving || state.holdingBun) return;
  state.holdingBun = true;
  state.bun = {};
  sfx.bun();
  renderHand();
  flashGroup("#bunStack");
}

function renderHand() {
  const layer = $("#handLayer");
  if (!state.holdingBun) { layer.innerHTML = ""; return; }
  layer.innerHTML = `<g id="rightHand" transform="translate(480 600)">${handBunArt(state.bun)}</g>`;
}

function reachAnim(x, y) {
  const fx = $("#fxLayer");
  const g = document.createElementNS(SVGNS, "g");
  g.setAttribute("transform", `translate(${x} ${y + 220})`);
  g.innerHTML = reachHandArt();
  fx.appendChild(g);
  requestAnimationFrame(() => {
    g.style.transition = "transform .14s ease-out";
    g.setAttribute("transform", `translate(${x} ${y})`);
    setTimeout(() => {
      g.setAttribute("transform", `translate(${x} ${y + 240})`);
      setTimeout(() => g.remove(), 180);
    }, 170);
  });
}

/* ---------- הוספת רכיבים ---------- */
function bindStation(gid, key) {
  $(`#${gid}`).addEventListener("click", () => addIngredient(key, gid));
}
function addIngredient(key, gid) {
  if (!state.running || state.serving) return;
  if (!state.holdingBun) { hintBun(); return; }
  if ((state.bun[key] || 0) >= 4) { sfx.wrong(); return; }

  if (state.stock[key] <= 0) {
    sfx.wrong();
    const box = $(`#${gid}`).getBBox();
    scorePop(box.x + box.width / 2, box.y - 10, "ריק! לחץ על הפועל 👆", "#cc1f10");
    triggerWorkerWave();
    return;
  }
  state.stock[key]--;
  updateStationVisual(key);

  state.bun[key] = (state.bun[key] || 0) + 1;
  const box = $(`#${gid}`).getBBox();
  reachAnim(box.x + box.width / 2, box.y - 60);

  if (state.order[key] > 0) {
    state.order[key]--;
    addScore(1);
    sfx.add();
  } else {
    addScore(-1);
    sfx.wrong();
    scorePop(box.x + box.width / 2, box.y - 20, "-1", "#cc1f10");
  }
  renderSigns();
  renderHand();
  checkReady();
}

function bindDrink(drink) {
  $(`#st_${drink}`).addEventListener("click", () => {
    if (!state.running || state.serving) return;
    const o = state.order;
    const box = $(`#st_${drink}`).getBBox();

    if (state.stock[drink] <= 0) {
      sfx.wrong();
      scorePop(box.x + box.width / 2, box.y - 10, "ריק! לחץ על הפועל 👆", "#cc1f10");
      triggerWorkerWave();
      return;
    }
    state.stock[drink]--;
    updateStationVisual(drink);

    reachAnim(box.x + box.width / 2, box.y - 60);
    if (o.drink === drink && o.drinkQty > 0) {
      o.drinkQty--;
      state.drinksOnTray++;
      addScore(drink === "vodka" ? 10 : 1);
      drink === "vodka" ? sfx.vodka() : sfx.add();
      if (drink === "vodka") scorePop(box.x + box.width / 2, box.y - 20, "+10", "#7b2ff7");
      placeDrink(drink);
    } else {
      addScore(-1);
      sfx.wrong();
      scorePop(box.x + box.width / 2, box.y - 20, "-1", "#cc1f10");
    }
    renderSigns();
    checkReady();
  });
}

function placeDrink(drink) {
  const g = document.createElementNS(SVGNS, "g");
  const x = 330 + state.drinksOnTray * 44;
  if (drink === "vodka")
    g.innerHTML = `<g transform="translate(${x} 568)">
      <path d="M-14 0 h28 l-5 40 a6 6 0 0 1 -6 6 h-6 a6 6 0 0 1 -6 -6z" fill="#e8f4fb" stroke="${OUT}" stroke-width="3"/>
      <path d="M-10 8 h20 l-3 30 h-14z" fill="#cfeafa"/>
      <text x="0" y="30" font-size="11" text-anchor="middle" fill="#5e8c12" font-weight="bold">XL</text></g>`;
  else {
    const col = drink === "cola" ? "#c8102e" : drink === "sprite" ? "#1f9d49" : "#7db9dd";
    g.innerHTML = `<g transform="translate(${x} 566)">
      <rect x="-15" y="0" width="30" height="48" rx="5" fill="${col}" stroke="${OUT}" stroke-width="3"/>
      <ellipse cx="0" cy="1" rx="15" ry="4" fill="#ddd" stroke="${OUT}" stroke-width="2"/></g>`;
  }
  $("#drinksPlaced").appendChild(g);
}

function hintBun() {
  sfx.wrong();
  scorePop(886, 430, "קח לחמנייה!", "#1c5c9c");
  flashGroup("#bunStack");
}

function flashGroup(sel) {
  const el = $(sel);
  el.style.filter = "brightness(1.45)";
  setTimeout(() => (el.style.filter = ""), 140);
}

/* כשההזמנה הושלמה — הלקוחות זוהרים וניתנים ללחיצה */
function checkReady() {
  const ready = orderDone();
  state.customers.forEach((c) => {
    if (!c || c.leaving) return;
    const el = document.getElementById(`cust${c.slot}`);
    if (el) el.classList.toggle("ready", ready);
  });
}

/* ---------- ניקוד ---------- */
function addScore(n) {
  state.score += n;
  $("#scoreText").textContent = state.score;
}
function scorePop(x, y, txt, color) {
  const t = document.createElementNS(SVGNS, "text");
  t.setAttribute("x", x); t.setAttribute("y", y);
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("font-size", "26");
  t.setAttribute("font-weight", "bold");
  t.setAttribute("fill", color);
  t.setAttribute("stroke", "#fff"); t.setAttribute("stroke-width", "0.8");
  t.textContent = txt;
  t.classList.add("scorePop");
  $("#fxLayer").appendChild(t);
  setTimeout(() => t.remove(), 950);
}

/* ---------- לקוחות ---------- */
function freeSlots() { return state.customers.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0); }

function spawnLoop() {
  clearTimeout(state.spawnTimer);
  const delay = 4000 + Math.random() * 4000;
  state.spawnTimer = setTimeout(() => {
    if (state.running && freeSlots().length) spawnCustomer();
    spawnLoop();
  }, delay);
}

function spawnCustomer() {
  const slots = freeSlots();
  if (!slots.length || !state.running) return;
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const avail = [0, 1, 2, 3, 4, 5].filter((v) => !state.usedVariants.includes(v));
  const variant = avail[Math.floor(Math.random() * avail.length)];
  state.usedVariants.push(variant);

  const c = { slot, variant, stage: 0, leaving: false, expr: "normal" };
  state.customers[slot] = c;

  const g = document.createElementNS(SVGNS, "g");
  g.setAttribute("id", `cust${slot}`);
  g.classList.add("customer");
  g.setAttribute("transform", `translate(${1060} ${250}) scale(1.05)`);
  g.innerHTML = customerArt(variant, "normal");
  g.addEventListener("click", () => serveTo(slot));
  $("#custLayer").appendChild(g);
  g.getBoundingClientRect(); // reflow — כדי שהמעבר יתחיל ממיקום הכניסה גם כשהטאב ברקע
  g.style.transition = "transform 1.6s ease-out";
  g.setAttribute("transform", `translate(${SLOT_X[slot] - 100} ${250}) scale(1.05)`);

  // מצמוץ
  const blink = setInterval(() => {
    if (!state.customers[slot] || state.customers[slot] !== c || c.leaving) { clearInterval(blink); return; }
    setExpr(c, c.stage >= 3 ? "angryblink" : "blink");
    setTimeout(() => { if (!c.leaving) setExpr(c, c.stage >= 3 ? "angry" : "normal"); }, 160);
  }, 2600 + Math.random() * 900);
  state.blinkTimers.push(blink);

  // מד עצבים: 6 שלבים לאורך 45-75 שניות
  const total = 45000 + Math.random() * 30000;
  const step = total / 6;
  const mt = setInterval(() => {
    if (!state.customers[slot] || state.customers[slot] !== c || c.leaving) { clearInterval(mt); return; }
    c.stage++;
    if (c.stage <= 5) fillMeterCell(slot, c.stage - 1);
    if (c.stage === 3) { setExpr(c, "angry"); sfx.grumble(); }
    if (c.stage >= 6) { clearInterval(mt); gameOver(slot); }
  }, step);
  state.meterTimers.push(mt);

  checkReady();
}

const NERV_COLORS = ["#339900", "#448800", "#715A00", "#933800", "#B51600"];
function fillMeterCell(slot, cell) {
  const el = document.querySelector(`.nervCell[data-meter="${slot}"][data-cell="${cell}"]`);
  if (el) el.setAttribute("fill", NERV_COLORS[cell]);
}
function clearMeter(slot) {
  document.querySelectorAll(`.nervCell[data-meter="${slot}"]`).forEach((el) => el.setAttribute("fill", "#ffffff"));
}

function setExpr(c, expr) {
  c.expr = expr;
  const g = document.getElementById(`cust${c.slot}`);
  if (g) {
    const ready = g.classList.contains("ready");
    g.innerHTML = customerArt(c.variant, expr);
    g.classList.toggle("ready", ready);
  }
}

/* ---------- הגשה ---------- */
function serveTo(slot) {
  const c = state.customers[slot];
  if (!c || c.leaving || !state.running || state.serving) return;
  if (!orderDone()) {
    if (state.holdingBun) { sfx.wrong(); scorePop(SLOT_X[slot], 230, "ההזמנה לא מוכנה!", "#cc1f10"); }
    else hintBun();
    return;
  }
  state.serving = true;

  // יד מגישה — הלחמנייה עפה ללקוח
  const hand = $("#rightHand");
  if (hand) {
    hand.style.transition = "transform .35s ease-in";
    hand.setAttribute("transform", `translate(${SLOT_X[slot]} 330) scale(.6)`);
  }
  const hadVodka = state.order.drink === "vodka";

  setTimeout(() => {
    state.holdingBun = false;
    state.bun = {};
    state.drinksOnTray = 0;
    $("#drinksPlaced").innerHTML = "";
    renderHand();

    addScore(5);
    hadVodka ? sfx.vodka() : sfx.serve();
    scorePop(SLOT_X[slot], 220, hadVodka ? "+5 🍸" : "+5", "#1d8a2e");

    // הלקוח מרוצה והולך
    c.leaving = true;
    setExpr(c, "happy");
    clearMeter(slot);
    const g = document.getElementById(`cust${slot}`);
    if (g) {
      g.classList.remove("ready");
      g.style.transition = "transform 1.3s ease-in";
      g.setAttribute("transform", `translate(1080 250) scale(1.05)`);
      setTimeout(() => g.remove(), 1350);
    }
    setTimeout(() => {
      state.usedVariants = state.usedVariants.filter((v) => v !== c.variant);
      if (state.customers[slot] === c) state.customers[slot] = null;
    }, 1300);

    newOrder();
    state.serving = false;
    checkReady();
  }, 360);
}

/* ---------- ניהול משחק ---------- */
function clearAllTimers() {
  clearTimeout(state.spawnTimer);
  state.meterTimers.forEach(clearInterval);
  state.blinkTimers.forEach(clearInterval);
  state.meterTimers = [];
  state.blinkTimers = [];
}

function startGame() {
  ac(); // פתיחת אודיו במחוות משתמש
  clearAllTimers();
  state.running = true;
  state.score = 0;
  state.holdingBun = false;
  state.bun = {};
  state.drinksOnTray = 0;
  state.serving = false;
  state.customers = [null, null, null, null];
  state.usedVariants = [];
  state.stock = { ...MAX_STOCK };
  const ns = $("#nameSection"); if (ns) ns.style.display = "";

  buildStage();
  addScore(0);
  newOrder();
  renderHand();
  $("#splash").classList.remove("active");
  $("#gameover").classList.remove("active");
  $("#gamewrap").classList.add("active");

  spawnCustomer();        // לקוח ראשון מיד
  spawnLoop();
  if (state.musicOn) { musicStep = 0; startMusic(); }
}

function gameOver(slot) {
  if (!state.running) return;
  state.running = false;
  clearAllTimers();
  stopMusic();
  sfx.over();

  // הלקוח שפוצץ את המשחק רועד
  const g = document.getElementById(`cust${slot}`);
  if (g) g.classList.add("explode");

  const hs = highScore();
  const isRecord = state.score > hs;
  if (isRecord) localStorage.setItem(HS_KEY, state.score);

  setTimeout(async () => {
    $("#finalScore").textContent = state.score;
    $("#finalRecord").textContent = isRecord
      ? "🏆 שיא חדש! אתה מלך הנקניקיה האמיתי!"
      : `השיא שלך: ${Math.max(hs, state.score)}`;

    const savedName = localStorage.getItem("hotdogPlayerName") || "";
    const nameInput = $("#playerName");
    if (nameInput) nameInput.value = savedName;

    const lbOver = $("#leaderboardOver");
    const entries = await fetchLeaderboard();
    if (lbOver) renderLeaderboard(entries, lbOver, savedName);

    $("#gameover").classList.add("active");

    $("#submitNameBtn").onclick = async () => {
      const name = (nameInput ? nameInput.value.trim() : "") || "אנונימי";
      localStorage.setItem("hotdogPlayerName", name);
      const ns = $("#nameSection"); if (ns) ns.style.display = "none";
      await submitScore(name, state.score);
      const updated = await fetchLeaderboard();
      if (lbOver) renderLeaderboard(updated, lbOver, name);
    };
  }, 1200);
}

/* ---------- ליידרבורד אונליין ---------- */
async function fetchLeaderboard() {
  try {
    const res = await fetch(BLOB_URL, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return (data.scores || []).sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (_) {
    return getLocalLeaderboard();
  }
}

function getLocalLeaderboard() {
  try { return JSON.parse(localStorage.getItem("hotdogLeaderboard") || "[]").sort((a, b) => b.score - a.score).slice(0, 10); }
  catch (_) { return []; }
}

async function submitScore(name, score) {
  const entry = { name, score, date: Date.now() };
  // שמירה מקומית
  const local = JSON.parse(localStorage.getItem("hotdogLeaderboard") || "[]");
  local.push(entry);
  localStorage.setItem("hotdogLeaderboard", JSON.stringify(local.sort((a,b)=>b.score-a.score).slice(0,100)));
  // שמירה אונליין
  try {
    const res = await fetch(BLOB_URL, { headers: { "Accept": "application/json" } });
    const data = await res.json();
    const scores = (data.scores || []);
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 100) scores.splice(100);
    await fetch(BLOB_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores })
    });
  } catch (_) {}
}

function renderLeaderboard(entries, container, myName) {
  if (!entries || !entries.length) {
    container.innerHTML = '<p class="lb-loading">אין ניקודים עדיין — שחקו!</p>';
    return;
  }
  const medals = ["🥇", "🥈", "🥉"];
  const rows = entries.map((e, i) =>
    `<tr class="lb-rank-${i + 1}${e.name === myName ? " lb-me" : ""}">
       <td>${medals[i] || i + 1}</td><td>${e.name || "??"}</td><td>${e.score}</td></tr>`
  ).join("");
  container.innerHTML = `<table class="lb-table"><tr><th>מקום</th><th>שם</th><th>ניקוד</th></tr>${rows}</table>`;
}

/* ---------- אתחול ---------- */
function init() {
  $("#splashPortrait").innerHTML = `<img src="golan.png" alt="גולן — מלך הנקניקיה">`;
  const hs = highScore();
  $("#splashHigh").textContent = hs ? `🏆 השיא שלך: ${hs}` : "";

  // ליידרבורד בדף הפתיחה
  const lbContent = $("#lbContent");
  if (lbContent) fetchLeaderboard().then(e => renderLeaderboard(e, lbContent, localStorage.getItem("hotdogPlayerName") || ""));

  $("#startBtn").addEventListener("click", startGame);
  $("#restartBtn").addEventListener("click", startGame);
}
init();
