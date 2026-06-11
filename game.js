/* ============ מלך הנקניקיה — לוגיקת המשחק (בהשראת מכניקת מלך הפלאפל) ============ */
"use strict";

const $ = (s) => document.querySelector(s);
const SVGNS = "http://www.w3.org/2000/svg";

/* ---------- מצב ---------- */
const SLOT_X = [370, 520, 670, 820];
const state = {
  running: false,
  musicOn: true,
  score: 0,
  holdingBun: false,
  bun: {},
  lastDrink: null,
  drinksOnTray: 0,
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

/* -------- ליידרבורד אונליין -------- */
const BLOB_URL = "https://jsonblob.com/api/jsonBlob/019eb5a6-e4c0-7b9f-9466-39466d232267";

/* -------- מלאי תחנות -------- */
const MAX_STOCK = { sausage: 12, kraut: 18, mustard: 10, ketchup: 10, cola: 6, sprite: 6, water: 6, vodka: 3 };
const STATION_GID = { sausage: "st_sausage", kraut: "st_kraut", mustard: "st_mustard", ketchup: "st_ketchup",
                      cola: "st_cola", sprite: "st_sprite", water: "st_water", vodka: "st_vodka" };

/* -------- שמות לקוחות -------- */
const CUSTOMER_NAMES = ["אורי","מיכל","דן","שרה","יוסי","רחל","נועם","הילה","ברק","ליאור",
                        "טל","רוני","שחר","מאיה","עידו","ורד","עמית","ירון","נטע","גלעד",
                        "בועז","רותם","אלון","יעל","ניר","גל","ענת","עוז","ריי","שיר"];

/* ---------- סאונד ---------- */
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
  bun:     () => tone(220, 0.1, "triangle", 0.14),
  add:     () => { tone(740, 0.05, "square", 0.08); tone(990, 0.07, "square", 0.07, 0.05); },
  wrong:   () => tone(140, 0.22, "sawtooth", 0.12),
  serve:   () => { tone(1047, 0.09, "square", 0.1); tone(1319, 0.09, "square", 0.1, 0.09); tone(1568, 0.18, "square", 0.1, 0.18); },
  vodka:   () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.1, "triangle", 0.1, i * 0.07)); },
  grumble: () => { tone(110, 0.16, "sawtooth", 0.1); tone(92, 0.2, "sawtooth", 0.1, 0.12); },
  over:    () => { tone(392, 0.3, "square", 0.12); tone(330, 0.3, "square", 0.12, 0.3); tone(262, 0.6, "square", 0.12, 0.6); },
};

/* מוזיקת רקע — YouTube IFrame */
let ytPlayer = null;
let ytReady = false;

function loadYouTubeAPI() {
  if (document.getElementById("yt-api-script")) return;
  window.onYouTubeIframeAPIReady = function () {
    ytReady = true;
    const div = document.createElement("div");
    div.id = "yt-player-container";
    div.style.cssText = "position:fixed;width:1px;height:1px;top:-9999px;left:-9999px;";
    document.body.appendChild(div);
    ytPlayer = new YT.Player("yt-player-container", {
      videoId: "BXGsBopP-Ds",
      playerVars: { autoplay: 0, loop: 1, playlist: "BXGsBopP-Ds" },
      events: {
        onReady: () => { if (state.running && state.musicOn) ytPlayer.playVideo(); }
      }
    });
  };
  const s = document.createElement("script");
  s.id = "yt-api-script";
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
}

function startMusic() {
  $("#musicNote") && $("#musicNote").setAttribute("opacity", "1");
  if (!ytReady) { loadYouTubeAPI(); return; }
  try { ytPlayer && ytPlayer.playVideo(); } catch(e) {}
}
function stopMusic() {
  $("#musicNote") && $("#musicNote").setAttribute("opacity", "0");
  try { ytPlayer && ytPlayer.pauseVideo(); } catch(e) {}
}

/* ---------- בניית הבמה ---------- */
function buildStage() {
  $("#stage").innerHTML = sceneArt();
  $("#vendorFace").innerHTML = vendorFaceArt(false);
  setInterval(() => {
    if (!state.running) return;
    $("#vendorFace").innerHTML = vendorFaceArt(true);
    setTimeout(() => { $("#vendorFace").innerHTML = vendorFaceArt(false); }, 180);
  }, 3400);

  bindStation("st_sausage", "sausage");
  bindStation("st_kraut",   "kraut");
  bindStation("st_mustard", "mustard");
  bindStation("st_ketchup", "ketchup");
  ["cola", "sprite", "water", "vodka"].forEach((d) => bindDrink(d));
  $("#bunStack").addEventListener("click", takeBun);
  $("#trashBin").addEventListener("click", discardBun);

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
  const el = $(`#${STATION_GID[key]}`);
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

/* ---------- יצירת הזמנה לכל לקוח ---------- */
function generateOrder() {
  const sausage = 1 + Math.floor(Math.random() * 2);
  const kraut   = Math.floor(Math.random() * 4);
  const mustard = Math.floor(Math.random() * 2);
  const ketchup = Math.floor(Math.random() * 2);
  let drink = null, drinkQty = 0;
  const r = Math.random();
  if (r < 0.08)      { drink = "vodka"; drinkQty = 1; }
  else if (r < 0.48) { drink = ["cola","sprite","water"][Math.floor(Math.random()*3)]; drinkQty = 1; }
  return { sausage, kraut, mustard, ketchup, drink, drinkQty };
}

/* ---------- בדיקת התאמת מגש ללקוח ---------- */
function matchesBun(c) {
  if (!state.holdingBun) return false;
  const o = c.order, b = state.bun;
  return (b.sausage||0) >= o.sausage &&
         (b.kraut||0)   >= o.kraut   &&
         (b.mustard||0) >= o.mustard &&
         (b.ketchup||0) >= o.ketchup &&
         (!o.drink || state.lastDrink === o.drink);
}

/* ---------- עדכון בונות ---------- */
function renderBons() {
  state.customers.forEach((c) => {
    if (!c || c.leaving) return;
    const g = document.getElementById(`cust${c.slot}`);
    if (!g) return;
    const ready = g.classList.contains("ready");
    const drinkOk = !!c.order.drink && state.lastDrink === c.order.drink;
    g.innerHTML = customerArt(c.variant, c.expr) + bonArt(c.order, c.name, state.bun, drinkOk);
    g.classList.toggle("ready", ready);
  });
}

/* ---------- לחמנייה ויד ---------- */
function takeBun() {
  if (!state.running || state.serving || state.holdingBun) return;
  state.holdingBun  = true;
  state.bun         = {};
  state.lastDrink   = null;
  state.drinksOnTray = 0;
  $("#drinksPlaced").innerHTML = "";
  sfx.bun();
  renderHand();     // calls renderBunHUD internally
  flashGroup("#bunStack");
  renderBons();
  checkReady();
}
function renderHand() {
  const layer = $("#handLayer");
  if (!state.holdingBun) { layer.innerHTML = ""; renderBunHUD(); return; }
  layer.innerHTML = `<g id="rightHand" transform="translate(480 520)">${handBunArt(state.bun)}</g>`;
  renderBunHUD();
}

const BUN_ICONS = { sausage: "🌭", kraut: "🥗", mustard: "💛", ketchup: "❤️" };
function renderBunHUD() {
  const hud = document.getElementById("bunHUD");
  const txt = document.getElementById("bunHudText");
  if (!hud || !txt) return;
  if (!state.holdingBun) { hud.setAttribute("visibility", "hidden"); return; }
  hud.setAttribute("visibility", "visible");
  const parts = Object.entries(state.bun)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${BUN_ICONS[k] || k}×${v}`);
  if (state.lastDrink) parts.push("🥤×1");
  txt.textContent = parts.length
    ? `בלחמנייה: ${parts.join("  ")}`
    : "בלחמנייה: לחמנייה ריקה — הוסף מרכיבים";
}

function discardBun() {
  if (!state.running) return;
  if (!state.holdingBun) { sfx.wrong(); return; }
  state.holdingBun   = false;
  state.bun          = {};
  state.lastDrink    = null;
  state.drinksOnTray = 0;
  if ($("#drinksPlaced")) $("#drinksPlaced").innerHTML = "";
  renderHand();
  renderBons();
  checkReady();
  addScore(-1);
  scorePop(696, 460, "🗑️ -1", "#cc1f10");
}
function reachAnim(x, y) {
  const fx = $("#fxLayer");
  const g  = document.createElementNS(SVGNS, "g");
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
  sfx.add();
  renderHand();     // calls renderBunHUD internally
  renderBons();
  checkReady();
}

function bindDrink(drink) {
  $(`#st_${drink}`).addEventListener("click", () => {
    if (!state.running || state.serving) return;
    const box = $(`#st_${drink}`).getBBox();

    if (state.stock[drink] <= 0) {
      sfx.wrong();
      scorePop(box.x + box.width / 2, box.y - 10, "ריק! לחץ על הפועל 👆", "#cc1f10");
      triggerWorkerWave();
      return;
    }

    const wantsDrink = state.customers.some(c => c && !c.leaving && c.order.drink === drink);
    if (!wantsDrink) {
      sfx.wrong();
      scorePop(box.x + box.width / 2, box.y - 20, "אף אחד לא רוצה!", "#cc1f10");
      return;
    }

    state.stock[drink]--;
    updateStationVisual(drink);
    reachAnim(box.x + box.width / 2, box.y - 60);
    state.lastDrink = drink;
    state.drinksOnTray++;
    drink === "vodka" ? sfx.vodka() : sfx.add();
    placeDrink(drink);
    renderBons();
    renderBunHUD();
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
function checkReady() {
  state.customers.forEach((c) => {
    if (!c || c.leaving) return;
    const el = document.getElementById(`cust${c.slot}`);
    if (el) el.classList.toggle("ready", matchesBun(c));
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
function freeSlots() { return state.customers.map((c, i) => (c ? -1 : i)).filter(i => i >= 0); }

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
  const slot    = slots[Math.floor(Math.random() * slots.length)];
  const avail   = [0,1,2,3,4,5].filter(v => !state.usedVariants.includes(v));
  const variant = avail[Math.floor(Math.random() * avail.length)];
  state.usedVariants.push(variant);

  const name  = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
  const order = generateOrder();
  const c     = { slot, variant, stage: 0, leaving: false, expr: "normal", name, order };
  state.customers[slot] = c;

  const g = document.createElementNS(SVGNS, "g");
  g.setAttribute("id", `cust${slot}`);
  g.classList.add("customer");
  g.setAttribute("transform", `translate(1060 250) scale(1.05)`);
  const drinkOk = !!order.drink && state.lastDrink === order.drink;
  g.innerHTML = customerArt(variant, "normal") + bonArt(order, name, {}, drinkOk);
  g.addEventListener("click", () => serveTo(slot));
  $("#custLayer").appendChild(g);
  g.getBoundingClientRect();
  g.style.transition = "transform 1.6s ease-out";
  g.setAttribute("transform", `translate(${SLOT_X[slot] - 100} 250) scale(1.05)`);

  const blink = setInterval(() => {
    if (!state.customers[slot] || state.customers[slot] !== c || c.leaving) { clearInterval(blink); return; }
    setExpr(c, c.stage >= 3 ? "angryblink" : "blink");
    setTimeout(() => { if (!c.leaving) setExpr(c, c.stage >= 3 ? "angry" : "normal"); }, 160);
  }, 2600 + Math.random() * 900);
  state.blinkTimers.push(blink);

  const total = 45000 + Math.random() * 30000;
  const step  = total / 6;
  const mt = setInterval(() => {
    if (!state.customers[slot] || state.customers[slot] !== c || c.leaving) { clearInterval(mt); return; }
    c.stage++;
    if (c.stage <= 5) fillMeterCell(slot, c.stage - 1);
    if (c.stage === 3) { setExpr(c, "angry"); sfx.grumble(); }
    if (c.stage >= 6)  { clearInterval(mt); gameOver(slot); }
  }, step);
  state.meterTimers.push(mt);

  checkReady();
}

const NERV_COLORS = ["#339900","#448800","#715A00","#933800","#B51600"];
function fillMeterCell(slot, cell) {
  const el = document.querySelector(`.nervCell[data-meter="${slot}"][data-cell="${cell}"]`);
  if (el) el.setAttribute("fill", NERV_COLORS[cell]);
}
function clearMeter(slot) {
  document.querySelectorAll(`.nervCell[data-meter="${slot}"]`).forEach(el => el.setAttribute("fill", "#ffffff"));
}
function setExpr(c, expr) {
  c.expr = expr;
  const g = document.getElementById(`cust${c.slot}`);
  if (g && !c.leaving) {
    const ready = g.classList.contains("ready");
    const drinkOk = !!c.order.drink && state.lastDrink === c.order.drink;
    g.innerHTML = customerArt(c.variant, expr) + bonArt(c.order, c.name, state.bun, drinkOk);
    g.classList.toggle("ready", ready);
  }
}

/* ---------- הגשה ---------- */
function serveTo(slot) {
  const c = state.customers[slot];
  if (!c || c.leaving || !state.running || state.serving) return;

  if (!matchesBun(c)) {
    if (!state.holdingBun) hintBun();
    else { sfx.wrong(); scorePop(SLOT_X[slot], 230, "לא מתאים!", "#cc1f10"); }
    return;
  }
  state.serving = true;

  const hand = $("#rightHand");
  if (hand) {
    hand.style.transition = "transform .35s ease-in";
    hand.setAttribute("transform", `translate(${SLOT_X[slot]} 330) scale(.6)`);
  }

  const o = c.order, b = state.bun;
  let pts = 5;
  ["sausage","kraut","mustard","ketchup"].forEach((k) => {
    pts += Math.min(b[k]||0, o[k]) * (k === "sausage" ? 2 : 1);
    pts -= Math.max(0, (b[k]||0) - o[k]);
  });
  if (o.drink === "vodka") pts += 10;
  pts = Math.max(1, pts);
  const hadVodka = o.drink === "vodka";

  setTimeout(() => {
    state.holdingBun   = false;
    state.bun          = {};
    state.lastDrink    = null;
    state.drinksOnTray = 0;
    $("#drinksPlaced").innerHTML = "";
    renderHand();

    addScore(pts);
    hadVodka ? sfx.vodka() : sfx.serve();
    scorePop(SLOT_X[slot], 220, hadVodka ? `+${pts} 🍸` : `+${pts}`, "#1d8a2e");

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
      state.usedVariants = state.usedVariants.filter(v => v !== c.variant);
      if (state.customers[slot] === c) state.customers[slot] = null;
    }, 1300);

    renderBons();
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
  ac();
  clearAllTimers();
  state.running      = true;
  state.score        = 0;
  state.holdingBun   = false;
  state.bun          = {};
  state.lastDrink    = null;
  state.drinksOnTray = 0;
  state.serving      = false;
  state.customers    = [null, null, null, null];
  state.usedVariants = [];
  state.stock        = { ...MAX_STOCK };
  const ns = $("#nameSection"); if (ns) ns.style.display = "";

  buildStage();
  addScore(0);
  renderHand();
  $("#splash").classList.remove("active");
  $("#gameover").classList.remove("active");
  $("#gamewrap").classList.add("active");

  spawnCustomer();
  spawnLoop();
  if (state.musicOn) { startMusic(); }
}

async function gameOver(slot) {
  if (!state.running) return;
  state.running = false;
  clearAllTimers();
  stopMusic();
  sfx.over();

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

    const lbOver   = $("#leaderboardOver");
    const entries  = await fetchLeaderboard();
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
  } catch (_) { return getLocalLeaderboard(); }
}
function getLocalLeaderboard() {
  try { return JSON.parse(localStorage.getItem("hotdogLeaderboard") || "[]").sort((a,b)=>b.score-a.score).slice(0,10); }
  catch (_) { return []; }
}
async function submitScore(name, score) {
  const entry = { name, score, date: Date.now() };
  const local = JSON.parse(localStorage.getItem("hotdogLeaderboard") || "[]");
  local.push(entry);
  localStorage.setItem("hotdogLeaderboard", JSON.stringify(local.sort((a,b)=>b.score-a.score).slice(0,100)));
  try {
    const res   = await fetch(BLOB_URL, { headers: { "Accept": "application/json" } });
    const data  = await res.json();
    const scores = (data.scores || []);
    scores.push(entry);
    scores.sort((a,b)=>b.score-a.score);
    if (scores.length > 100) scores.splice(100);
    await fetch(BLOB_URL, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scores }) });
  } catch (_) {}
}
function renderLeaderboard(entries, container, myName) {
  if (!entries || !entries.length) {
    container.innerHTML = '<p class="lb-loading">אין ניקודים עדיין — שחקו!</p>';
    return;
  }
  const medals = ["🥇","🥈","🥉"];
  const rows = entries.map((e, i) =>
    `<tr class="lb-rank-${i+1}${e.name===myName?" lb-me":""}">
       <td>${medals[i]||i+1}</td><td>${e.name||"??"}</td><td>${e.score}</td></tr>`
  ).join("");
  container.innerHTML = `<table class="lb-table"><tr><th>מקום</th><th>שם</th><th>ניקוד</th></tr>${rows}</table>`;
}

/* ---------- אתחול ---------- */
function init() {
  $("#splashPortrait").innerHTML = `<img src="golan.png" alt="גולן — מלך הנקניקיה">`;
  const hs = highScore();
  $("#splashHigh").textContent = hs ? `🏆 השיא שלך: ${hs}` : "";
  const lbContent = $("#lbContent");
  if (lbContent) fetchLeaderboard().then(e => renderLeaderboard(e, lbContent, localStorage.getItem("hotdogPlayerName") || ""));
  $("#startBtn").addEventListener("click", startGame);
  $("#restartBtn").addEventListener("click", startGame);
}
init();
