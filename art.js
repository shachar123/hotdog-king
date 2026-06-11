/* ============ מלך הנקניקיה — גרפיקה משופרת (גרדיאנטים + תלת-מימד) ============ */
"use strict";

const OUT = "#1c1c1c";

/* ---------- עזרי צבע ---------- */
function lighterShade(hex, pct = 0.3) {
  const n = parseInt(hex.replace('#',''), 16);
  const lerp = (c) => Math.min(255, Math.round(c + (255 - c) * pct));
  const r = lerp(n >> 16), g = lerp((n >> 8) & 255), b = lerp(n & 255);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2,'0')).join('');
}
function darkerShade(hex, pct = 0.25) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.round((n >> 16) * (1-pct)), g = Math.round(((n>>8)&255)*(1-pct)), b = Math.round((n&255)*(1-pct));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2,'0')).join('');
}

/* ---------- דמויות לקוחות: 6 וריאנטים ---------- */
const CUSTOMER_VARIANTS = [
  { skin: "#f0c08c", shirt: "#f5e642", hair: "blackSide" },
  { skin: "#ffd9a8", shirt: "#3f7de0", hair: "spikyBlond" },
  { skin: "#e8b078", shirt: "#cc2b2b", hair: "curlyBrown" },
  { skin: "#d99c66", shirt: "#2e9e4f", hair: "greenCap" },
  { skin: "#f3c9a0", shirt: "#9b3fd6", hair: "womanCurls" },
  { skin: "#e0a877", shirt: "#e07820", hair: "baldMustache" },
];

/* ---------- גרדיאנטים לדמויות (מוגדרים בדפס הראשי) ---------- */
function customerGradDefs() {
  return CUSTOMER_VARIANTS.map((v, i) => {
    const sl = lighterShade(v.skin, 0.34), sd = darkerShade(v.skin, 0.14);
    const shtl = lighterShade(v.shirt, 0.38), shtd = darkerShade(v.shirt, 0.24);
    return `
    <radialGradient id="sk${i}" cx="0.42" cy="0.34" r="0.72" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${sl}"/>
      <stop offset="52%" stop-color="${v.skin}"/>
      <stop offset="100%" stop-color="${sd}"/>
    </radialGradient>
    <linearGradient id="sh${i}" x1="0.22" y1="0" x2="0.78" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="${shtl}"/>
      <stop offset="100%" stop-color="${shtd}"/>
    </linearGradient>`;
  }).join('');
}

/* ---------- שיער ---------- */
function hairArt(style, skin) {
  switch (style) {
    case "blackSide":
      return `
        <path d="M40 78 Q34 22 100 18 Q166 22 160 78 L150 60 Q140 34 100 36 Q70 36 58 52 L52 84 Z" fill="#181818" stroke="${OUT}" stroke-width="3"/>
        <path d="M86 24 L96 40" stroke="#d0d0d0" stroke-width="4" stroke-linecap="round"/>
        <path d="M58 50 Q78 28 114 26" stroke="rgba(70,70,70,0.7)" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M60 48 Q80 27 112 26" stroke="rgba(255,255,255,0.2)" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case "spikyBlond":
      return `
        <path d="M42 78 Q38 34 100 30 Q162 34 158 78 L150 64 Q140 42 100 44 Q60 42 50 64 Z" fill="#f2d030" stroke="${OUT}" stroke-width="3"/>
        <path d="M52 46 L46 28 L64 38 L66 18 L82 34 L92 12 L104 32 L118 14 L126 34 L142 22 L144 42 L156 36 L152 56 Q126 38 100 40 Q72 38 50 58 Z" fill="#f2d030" stroke="${OUT}" stroke-width="3"/>
        <path d="M88 14 L92 30 M104 30 L100 14 M118 16 L115 32 M68 22 L65 36" stroke="rgba(255,255,200,0.65)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M68 44 Q90 36 118 40" stroke="rgba(255,255,160,0.45)" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case "curlyBrown":
      return `
        <g stroke="${OUT}" stroke-width="3" fill="#6b3f1d">
          <circle cx="58" cy="56" r="18"/><circle cx="82" cy="40" r="20"/>
          <circle cx="110" cy="34" r="20"/><circle cx="138" cy="44" r="18"/>
          <circle cx="154" cy="64" r="14"/><circle cx="44" cy="78" r="13"/>
        </g>
        <g fill="rgba(150,84,28,0.6)" stroke="none">
          <circle cx="62" cy="50" r="9"/><circle cx="86" cy="34" r="10"/>
          <circle cx="112" cy="28" r="9"/><circle cx="140" cy="38" r="8"/>
        </g>`;
    case "greenCap":
      return `
        <path d="M42 70 Q40 26 100 24 Q160 26 158 70 L158 78 Q100 60 42 78 Z" fill="#2c8c3c" stroke="${OUT}" stroke-width="3"/>
        <path d="M36 76 Q100 56 164 76 L160 88 Q100 70 40 88 Z" fill="#1f6b2c" stroke="${OUT}" stroke-width="3"/>
        <path d="M50 58 Q80 46 132 50" stroke="rgba(255,255,255,0.22)" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M52 56 Q82 44 130 49" stroke="rgba(255,255,255,0.1)" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case "womanCurls":
      return `
        <g stroke="${OUT}" stroke-width="3" fill="#7a3a10">
          <circle cx="46" cy="70" r="17"/><circle cx="40" cy="100" r="15"/><circle cx="44" cy="128" r="14"/>
          <circle cx="154" cy="70" r="17"/><circle cx="160" cy="100" r="15"/><circle cx="156" cy="128" r="14"/>
          <circle cx="64" cy="44" r="19"/><circle cx="96" cy="32" r="21"/><circle cx="130" cy="40" r="19"/>
        </g>
        <g fill="rgba(165,74,22,0.55)" stroke="none">
          <circle cx="50" cy="65" r="8"/><circle cx="68" cy="38" r="10"/>
          <circle cx="98" cy="26" r="10"/><circle cx="133" cy="34" r="8"/>
        </g>`;
    case "baldMustache":
      return `
        <path d="M44 64 Q48 30 100 28 Q152 30 156 64 Q128 46 100 46 Q72 46 44 64Z" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
        <ellipse cx="100" cy="30" rx="28" ry="8" fill="rgba(255,255,255,0.28)"/>`;
    default: return "";
  }
}

/* expr: normal | blink | angry | angryblink | happy */
function customerArt(variantIdx, expr) {
  const v = CUSTOMER_VARIANTS[variantIdx];
  const angry = expr === "angry" || expr === "angryblink";
  const blink = expr === "blink" || expr === "angryblink";
  const happy = expr === "happy";
  const i = variantIdx;
  const sd = darkerShade(v.skin, 0.16);
  const sd2 = darkerShade(v.skin, 0.1);

  let eyes;
  if (blink) {
    eyes = `<path d="M62 96 q12 ${angry ? 8 : 4} 24 0 M114 96 q12 ${angry ? 8 : 4} 24 0"
            stroke="${OUT}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  } else {
    const ry = angry ? 7 : 10;
    const lx = angry ? 78 : 74, rx2 = angry ? 122 : 126;
    const irs = angry ? 6 : 8.5;
    eyes = `
      <ellipse cx="74" cy="96" rx="13" ry="${ry}" fill="url(#eyeW)" stroke="${OUT}" stroke-width="2.6"/>
      <circle cx="${lx}" cy="97" r="${irs}" fill="#4a280c"/>
      <circle cx="${lx}" cy="97" r="${angry ? 3.5 : 5.5}" fill="#0a0806"/>
      <ellipse cx="${lx - 2.5}" cy="93.5" rx="2.6" ry="1.8" fill="rgba(255,255,255,0.92)"/>
      <ellipse cx="126" cy="96" rx="13" ry="${ry}" fill="url(#eyeW)" stroke="${OUT}" stroke-width="2.6"/>
      <circle cx="${rx2}" cy="97" r="${irs}" fill="#4a280c"/>
      <circle cx="${rx2}" cy="97" r="${angry ? 3.5 : 5.5}" fill="#0a0806"/>
      <ellipse cx="${rx2 - 2.5}" cy="93.5" rx="2.6" ry="1.8" fill="rgba(255,255,255,0.92)"/>`;
  }

  const brows = angry
    ? `<path d="M56 80 L92 92 M144 80 L108 92" stroke="${OUT}" stroke-width="7.5" stroke-linecap="round"/>
       <path d="M57 81 L90 92 M143 81 L110 92" stroke="#2c1c10" stroke-width="4" stroke-linecap="round"/>`
    : `<path d="M58 80 q16 -10 32 -2 M110 78 q16 -8 32 2" stroke="${OUT}" stroke-width="6.5" fill="none" stroke-linecap="round"/>
       <path d="M59 81 q15 -9 30 -2 M111 79.5 q15 -7.5 30 1.5" stroke="#2c1c10" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;

  let mouth;
  if (happy)
    mouth = `
      <path d="M68 138 Q100 172 132 138 Q100 157 68 138Z" fill="#c23428" stroke="${OUT}" stroke-width="3.5"/>
      <path d="M74 142 Q100 157 126 142 L123 150 Q100 163 77 150Z" fill="#e8e8e0"/>
      <path d="M70 140 Q100 162 130 140" stroke="#e05050" stroke-width="1.8" fill="none"/>`;
  else if (angry)
    mouth = `
      <path d="M70 150 Q100 132 130 150 Q100 144 70 150Z" fill="#c23428" stroke="${OUT}" stroke-width="3.5"/>
      <path d="M78 144 L122 144 L120 149 L80 149Z" fill="#e8e8e0"/>
      <path d="M72 148 Q100 135 128 148" stroke="#d04848" stroke-width="1.6" fill="none"/>`;
  else
    mouth = `
      <path d="M80 146 Q100 155 120 146" stroke="${OUT}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M81 147.5 Q100 154 119 147.5" stroke="#d08888" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

  const angryMarks = angry
    ? `<g stroke="#cc1f10" stroke-width="5" stroke-linecap="round">
         <path d="M34 50 l14 14 M48 46 l6 18 M28 68 l18 8"/>
         <path d="M166 50 l-14 14 M152 46 l-6 18 M172 68 l-18 8"/>
       </g>
       <path d="M158 108 q6 12 -2 16 q-8 -2 -4 -14z" fill="#7fd4f0" stroke="${OUT}" stroke-width="2"/>`
    : "";

  const cheeks = `
    <circle cx="56" cy="118" r="15" fill="${angry ? '#e04030' : '#ffb8a8'}" opacity="${angry ? .62 : .32}"/>
    <circle cx="144" cy="118" r="15" fill="${angry ? '#e04030' : '#ffb8a8'}" opacity="${angry ? .62 : .32}"/>`;

  const mustache = v.hair === "baldMustache"
    ? `<path d="M66 132 Q100 116 134 132 Q118 140 100 134 Q82 140 66 132Z" fill="#4a300e" stroke="${OUT}" stroke-width="3"/>
       <path d="M76 127 Q100 120 124 127" stroke="rgba(100,60,10,0.45)" stroke-width="2.5" fill="none"/>`
    : "";

  const nose = `
    <path d="M94 108 q-4 16 2 20 q6 4 12 0" fill="none" stroke="${sd}" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="90" cy="128" rx="5.5" ry="3.2" fill="${sd2}" opacity=".45"/>
    <ellipse cx="110" cy="128" rx="5.5" ry="3.2" fill="${sd2}" opacity=".45"/>`;

  const forehead = `<ellipse cx="100" cy="59" rx="40" ry="26" fill="rgba(255,255,255,0.16)" transform="rotate(-4 100 59)"/>`;
  const jawShadow = `<path d="M68 166 Q100 183 132 166 Q100 190 68 166Z" fill="${sd}" opacity=".22"/>`;

  return `<g>
    <path d="M14 240 Q20 184 62 176 L138 176 Q180 184 186 240 Z" fill="url(#sh${i})" stroke="${OUT}" stroke-width="4"/>
    <path d="M84 158 h32 v26 q-16 8 -32 0 Z" fill="url(#sk${i})" stroke="${OUT}" stroke-width="3"/>
    <ellipse cx="42" cy="104" rx="11" ry="14" fill="url(#sk${i})" stroke="${OUT}" stroke-width="3"/>
    <ellipse cx="158" cy="104" rx="11" ry="14" fill="url(#sk${i})" stroke="${OUT}" stroke-width="3"/>
    <path d="M38 98 q5 8 5 14 q-4 0 -5 -6" fill="${sd2}" opacity=".38"/>
    <path d="M154 98 q5 8 5 14 q-4 0 -5 -6" fill="${sd2}" opacity=".38"/>
    <path d="M44 96 Q40 30 100 28 Q160 30 156 96 Q158 150 132 166 Q100 180 68 166 Q42 150 44 96Z"
          fill="url(#sk${i})" stroke="${OUT}" stroke-width="4"/>
    ${jawShadow}${cheeks}${nose}${forehead}
    ${eyes}${brows}${mouth}${mustache}
    ${hairArt(v.hair, v.skin)}
    ${angryMarks}
  </g>`;
}

function shadeArt(hex) { return darkerShade(hex, 0.34); }

/* ---------- פרצוף המוכר (מראה) ---------- */
function vendorFaceArt(blink) {
  const eyes = blink
    ? `<path d="M50 84 q9 5 18 0 M92 84 q9 5 18 0" stroke="${OUT}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="59" cy="84" rx="9" ry="7" fill="url(#eyeW)" stroke="${OUT}" stroke-width="2.4"/>
       <ellipse cx="101" cy="84" rx="9" ry="7" fill="url(#eyeW)" stroke="${OUT}" stroke-width="2.4"/>
       <circle cx="60" cy="85" r="5.5" fill="#3c2415"/>
       <circle cx="100" cy="85" r="5.5" fill="#3c2415"/>
       <circle cx="60" cy="85" r="3" fill="#0a0806"/>
       <circle cx="100" cy="85" r="3" fill="#0a0806"/>
       <ellipse cx="57.5" cy="82.5" rx="2" ry="1.4" fill="rgba(255,255,255,0.9)"/>
       <ellipse cx="97.5" cy="82.5" rx="2" ry="1.4" fill="rgba(255,255,255,0.9)"/>`;
  return `<g>
    <rect x="28" y="44" width="104" height="118" rx="42" fill="url(#vendorSkin)" stroke="${OUT}" stroke-width="3.6"/>
    <path d="M28 104 q-4 54 52 56 q56 -2 52 -56 q-8 30 -20 34 l-4 10 q-28 12 -56 0 l-4 -10 q-12 -4 -20 -34z"
          fill="#3a2a1c" stroke="${OUT}" stroke-width="3"/>
    <path d="M52 124 q28 14 56 0 -6 16 -28 16 t-28 -16z" fill="#7c3b2c" stroke="${OUT}" stroke-width="2.6"/>
    <path d="M56 126 q24 10 48 0 l-2 6 q-22 8 -44 0z" fill="#e8e0d8"/>
    <path d="M50 120 q30 -11 60 0 -8 8 -30 8 t-30 -8z" fill="#33241a"/>
    <path d="M74 92 q-4 13 2 16 t9 -3" fill="none" stroke="#b5774a" stroke-width="3.6" stroke-linecap="round"/>
    <ellipse cx="80" cy="56" rx="30" ry="18" fill="rgba(255,255,255,0.14)" transform="rotate(-8 80 56)"/>
    ${eyes}
    <path d="M44 72 q12 -8 26 -3 M90 69 q14 -5 26 3" stroke="#2c1f13" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M44 73 q12 -7 25 -3 M90 70 q13 -4 25 3" stroke="#4a3828" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <g fill="#3a2a1c" stroke="${OUT}" stroke-width="2.4">
      <circle cx="44" cy="48" r="13"/><circle cx="64" cy="38" r="14"/>
      <circle cx="86" cy="34" r="14"/><circle cx="108" cy="38" r="13"/>
      <circle cx="124" cy="50" r="11"/><circle cx="34" cy="62" r="9"/>
    </g>
    <g fill="rgba(80,60,30,0.5)" stroke="none">
      <circle cx="66" cy="36" r="7"/><circle cx="88" cy="32" r="7"/><circle cx="110" cy="36" r="6"/>
    </g>
    <g transform="rotate(10 120 22)">
      <path d="M96 30 l5 -16 8 9 7 -12 7 12 8 -9 5 16z" fill="#f2b21d" stroke="#9c7100" stroke-width="2.4"/>
      <rect x="96" y="28" width="40" height="6" rx="3" fill="#f2b21d" stroke="#9c7100" stroke-width="2"/>
    </g>
  </g>`;
}

/* ---------- תוכן הלחמנייה ביד ---------- */
function bunContentsArt(c) {
  let s = "";
  for (let i = 0; i < Math.min(c.sausage || 0, 2); i++) {
    const y = -10 - i * 17;
    s += `
      <path d="M-92 ${y} Q0 ${y - 26} 92 ${y}" stroke="${OUT}" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M-91 ${y} Q0 ${y - 26} 91 ${y}" stroke="#7a2c18" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="M-88 ${y - 1} Q0 ${y - 26} 88 ${y - 1}" stroke="#b84e2c" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M-80 ${y - 3} Q0 ${y - 26} 80 ${y - 3}" stroke="#d07040" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M-54 ${y - 8} Q0 ${y - 24} 54 ${y - 8}" stroke="rgba(220,150,100,0.52)" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M-60 ${y} Q-55 ${y - 18} -50 ${y}" stroke="#5a200e" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M-20 ${y + 1} Q-15 ${y - 20} -10 ${y + 1}" stroke="#5a200e" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M20 ${y + 1} Q25 ${y - 20} 30 ${y + 1}" stroke="#5a200e" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M62 ${y} Q67 ${y - 18} 72 ${y}" stroke="#5a200e" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".8"/>`;
  }
  const kr = Math.min(c.kraut || 0, 4);
  for (let i = 0; i < kr; i++) {
    const x = -62 + i * 42, y = -38 - (i % 2) * 8;
    s += `
      <path d="M${x-20} ${y} q10 -12 20 0 t20 0 t18 0" stroke="#b8b848" stroke-width="8.5" fill="none" stroke-linecap="round"/>
      <path d="M${x-17} ${y + 6} q9 -10 18 0 t18 0 t16 0" stroke="#d0cc60" stroke-width="6.5" fill="none" stroke-linecap="round"/>
      <path d="M${x-19} ${y + 2} q10 -10 20 0 t18 0 t18 0" stroke="#e8e888" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`;
  }
  if (c.mustard) s += `
    <path d="M-84 -26 q14 -17 28 0 t28 0 28 0 28 0 28 0" stroke="#f0c419" stroke-width="8.5" fill="none" stroke-linecap="round"/>
    <path d="M-82 -28 q14 -14 26 0 t26 0 26 0 26 0 26 0" stroke="#fde648" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`;
  if (c.ketchup) s += `
    <path d="M-84 -14 q14 -17 28 0 t28 0 28 0 28 0 28 0" stroke="#d63b2f" stroke-width="8.5" fill="none" stroke-linecap="round"/>
    <path d="M-82 -16 q14 -14 26 0 t26 0 26 0 26 0 26 0" stroke="#f25040" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`;
  return s;
}

/* ---------- יד ימין מחזיקה לחמנייה ---------- */
function handBunArt(contents) {
  const seeds = [
    [-85,-22],[-62,-30],[-35,-35],[0,-37],[35,-35],[62,-30],[85,-22],
    [-48,-28],[20,-36],[48,-29],[-18,-34]
  ].map(([sx, sy]) =>
    `<ellipse cx="${sx}" cy="${sy}" rx="4.8" ry="2.3" fill="#c8a050" stroke="#9a7028" stroke-width="0.8"
     transform="rotate(${sx > 30 ? 14 : sx < -30 ? -14 : 5} ${sx} ${sy})"/>`
  ).join("");

  return `<g>
    <path d="M60 150 L150 320 L-40 320 L-20 160 Z" fill="url(#handGrad)" stroke="${OUT}" stroke-width="4"/>
    <path d="M-110 16 Q-118 -18 -86 -24 L86 -24 Q118 -18 110 16 Q60 34 0 34 Q-60 34 -110 16Z"
          fill="url(#bunBotGrad)" stroke="${OUT}" stroke-width="4"/>
    <path d="M-98 -16 Q0 -38 98 -16" stroke="#c8903a" stroke-width="4" fill="none" opacity=".55"/>
    <path d="M-95 -18 Q0 -40 95 -18" stroke="rgba(255,230,160,0.28)" stroke-width="3" fill="none"/>
    ${bunContentsArt(contents)}
    <path d="M-104 10 Q-112 -20 -84 -26 L-30 -26 Q-10 -10 -16 12 Q-60 30 -104 10Z"
          fill="url(#bunBotGrad)" stroke="${OUT}" stroke-width="4" opacity="0"/>
    <g>
      <path d="M30 26 q10 -34 26 -10 q4 18 -6 26z" fill="url(#handGrad)" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M58 22 q12 -30 26 -8 q2 16 -8 24z" fill="url(#handGrad)" stroke="${OUT}" stroke-width="3.6"/>
      <path d="M86 18 q12 -26 24 -6 q0 14 -8 22z" fill="url(#handGrad)" stroke="${OUT}" stroke-width="3.6"/>
      <ellipse cx="44" cy="14" rx="7" ry="5" fill="#f6d9b8" opacity=".75"/>
    </g>
    <!-- top bun -->
    <path d="M-110 16 Q-118 -50 -60 -72 Q0 -84 60 -72 Q118 -50 110 16 Q60 -2 0 -2 Q-60 -2 -110 16Z"
          fill="url(#bunTopGrad)" stroke="${OUT}" stroke-width="4"/>
    ${seeds}
    <path d="M-65 -68 Q0 -80 65 -68" stroke="rgba(255,250,220,0.48)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-35 -76 Q0 -82 35 -76" stroke="rgba(255,255,240,0.32)" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>`;
}

/* ---------- יד שמאל מושטת ---------- */
function reachHandArt() {
  return `<g>
    <path d="M-30 160 L-90 320 L90 320 L40 150 Z" fill="url(#handGrad)" stroke="${OUT}" stroke-width="4"/>
    <ellipse cx="0" cy="120" rx="58" ry="64" fill="url(#handGrad)" stroke="${OUT}" stroke-width="4"/>
    <path d="M-44 76 q-6 -34 12 -36 q14 2 10 38 M-12 66 q-4 -40 14 -40 q16 2 10 42 M24 70 q0 -34 16 -32 q14 4 6 38"
          fill="url(#handGrad)" stroke="${OUT}" stroke-width="3.6"/>
  </g>`;
}

/* ---------- פועל מטבח ---------- */
function workerArt(waving) {
  const wave = waving
    ? `<path d="M20 6 Q28 -12 20 -28 Q28 -30 32 -10 Q30 2 24 12Z" fill="#d8a273" stroke="${OUT}" stroke-width="1.6"/>`
    : ``;
  return `<g>
    <path d="M-36 46 Q-24 26 0 24 Q24 26 36 46Z" fill="#3a6ed6" stroke="${OUT}" stroke-width="2"/>
    <rect x="-12" y="26" width="24" height="26" rx="4" fill="#f0f0e4" stroke="${OUT}" stroke-width="1.4"/>
    <rect x="-9" y="16" width="18" height="14" rx="4" fill="#e8b06c" stroke="${OUT}" stroke-width="1.8"/>
    <ellipse cx="0" cy="0" rx="24" ry="26" fill="url(#vendorSkin)" stroke="${OUT}" stroke-width="2.4"/>
    <ellipse cx="-4" cy="-8" rx="16" ry="10" fill="rgba(255,255,255,0.15)"/>
    <path d="M-22 -8 Q-18 -34 0 -36 Q18 -34 22 -8 Q10 -20 0 -20 Q-10 -20 -22 -8Z" fill="#3a6ed6" stroke="${OUT}" stroke-width="1.8"/>
    <path d="M-26 -6 Q0 -16 26 -6 L24 -2 Q0 -12 -24 -2Z" fill="#2a5cb8" stroke="${OUT}" stroke-width="1.2"/>
    <ellipse cx="-9" cy="-2" rx="4.5" ry="5.5" fill="url(#eyeW)" stroke="${OUT}" stroke-width="1.4"/>
    <ellipse cx="9" cy="-2" rx="4.5" ry="5.5" fill="url(#eyeW)" stroke="${OUT}" stroke-width="1.4"/>
    <circle cx="-9" cy="-1" r="2.8" fill="#2a1a08"/>
    <circle cx="9" cy="-1" r="2.8" fill="#2a1a08"/>
    <ellipse cx="-10.5" cy="-3.5" rx="1.4" ry="1" fill="rgba(255,255,255,0.9)"/>
    <ellipse cx="7.5" cy="-3.5" rx="1.4" ry="1" fill="rgba(255,255,255,0.9)"/>
    <path d="M-8 12 Q0 ${waving ? 20 : 17} 8 12" stroke="${OUT}" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${wave}
  </g>`;
}

/* ---------- הרקע המלא: רחוב, קיר, דוכן ---------- */
function sceneArt() {
  let buildings = "";
  const bcolors = ["#d9c9a8", "#c9b4d4", "#b8cfd9", "#d9b8a8"];
  for (let i = 0; i < 4; i++) {
    const x = 180 + i * 215;
    buildings += `<rect x="${x}" y="0" width="200" height="78" fill="${bcolors[i]}" stroke="${OUT}" stroke-width="3"/>`;
    for (let w = 0; w < 4; w++)
      buildings += `<rect x="${x + 16 + w * 46}" y="14" width="28" height="20" fill="#7fa8c9" stroke="${OUT}" stroke-width="2"/>
                    <rect x="${x + 16 + w * 46}" y="46" width="28" height="20" fill="#6890b0" stroke="${OUT}" stroke-width="2"/>`;
  }

  let meters = "";
  for (let i = 0; i < 4; i++) {
    const x = [370, 520, 670, 820][i];
    meters += `<g id="meter${i}">
      <rect x="${x - 3}" y="228" width="6" height="44" fill="#777" stroke="${OUT}" stroke-width="2"/>
      <rect x="${x - 16}" y="144" width="32" height="88" rx="4" fill="#f4f4f4" stroke="${OUT}" stroke-width="3"/>
      ${[0,1,2,3,4].map((j) =>
        `<rect class="nervCell" data-meter="${i}" data-cell="${j}" x="${x - 11}" y="${149 + (4 - j) * 16}" width="22" height="13" fill="#ffffff" stroke="#999" stroke-width="1.5"/>`).join("")}
    </g>`;
  }

  return `
  <defs>
    <clipPath id="wClip"><rect x="16" y="196" width="136" height="58"/></clipPath>
    <!-- עיניים -->
    <linearGradient id="eyeW" x1="0.3" y1="0.2" x2="0.8" y2="0.9" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#eee8e2"/>
    </linearGradient>
    <!-- עור המוכר והפועל -->
    <radialGradient id="vendorSkin" cx="0.42" cy="0.35" r="0.72" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#f4c490"/>
      <stop offset="55%" stop-color="#d8a273"/>
      <stop offset="100%" stop-color="#b8824e"/>
    </radialGradient>
    <!-- יד -->
    <radialGradient id="handGrad" cx="0.38" cy="0.3" r="0.72" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#f4b87e"/>
      <stop offset="60%" stop-color="#e8a86c"/>
      <stop offset="100%" stop-color="#c88848"/>
    </radialGradient>
    <!-- לחמניה עליונה -->
    <linearGradient id="bunTopGrad" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#f8d078"/>
      <stop offset="45%" stop-color="#e8b258"/>
      <stop offset="100%" stop-color="#c07828"/>
    </linearGradient>
    <!-- לחמניה תחתונה -->
    <linearGradient id="bunBotGrad" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#f0c468"/>
      <stop offset="100%" stop-color="#c88838"/>
    </linearGradient>
    <!-- נקניקייה (גריל + יד) -->
    <linearGradient id="sausGrad" x1="0" y1="0.5" x2="1" y2="0.5" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#6a2410"/>
      <stop offset="28%" stop-color="#c05030"/>
      <stop offset="50%" stop-color="#d87040"/>
      <stop offset="72%" stop-color="#c05030"/>
      <stop offset="100%" stop-color="#6a2410"/>
    </linearGradient>
    <!-- חרדל -->
    <linearGradient id="mustGrad" x1="0" y1="0.5" x2="1" y2="0.5" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#c89000"/>
      <stop offset="35%" stop-color="#f8d020"/>
      <stop offset="100%" stop-color="#b88000"/>
    </linearGradient>
    <!-- קטשופ -->
    <linearGradient id="ketchGrad" x1="0" y1="0.5" x2="1" y2="0.5" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#a01e18"/>
      <stop offset="35%" stop-color="#e84030"/>
      <stop offset="100%" stop-color="#901818"/>
    </linearGradient>
    <!-- כרוב מגש -->
    <linearGradient id="krautGrad" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#f4f0c4"/>
      <stop offset="100%" stop-color="#d0cc7a"/>
    </linearGradient>
    <!-- גרדיאנטי דמויות -->
    ${customerGradDefs()}
  </defs>

  <!-- שמיים/כביש -->
  <rect x="0" y="0" width="1000" height="660" fill="#9c9c9c"/>
  ${buildings}
  <rect x="160" y="78" width="840" height="68" fill="#5c5c5c" stroke="${OUT}" stroke-width="3"/>
  <g stroke="#e8e8e8" stroke-width="4" stroke-dasharray="26 20"><line x1="160" y1="112" x2="1000" y2="112"/></g>

  <!-- מכונית נוסעת -->
  <g id="car">
    <path d="M0 -26 q10 -18 44 -18 l40 0 q30 2 40 20 l16 4 q10 2 10 12 l0 8 -160 0 q-8 -26 10 -26z" fill="#cc2b2b" stroke="${OUT}" stroke-width="3"/>
    <path d="M14 -24 q8 -14 32 -14 l14 0 0 14z M68 -38 l30 0 q22 2 30 16 l-60 0z" fill="#bfe3f2" stroke="${OUT}" stroke-width="2.4"/>
    <path d="M14 -24 q8 -12 28 -13" stroke="rgba(255,255,255,0.35)" stroke-width="3" fill="none"/>
    <circle cx="34" cy="2" r="13" fill="#222" stroke="${OUT}" stroke-width="3"/><circle cx="34" cy="2" r="5" fill="#bbb"/>
    <circle cx="116" cy="2" r="13" fill="#222" stroke="${OUT}" stroke-width="3"/><circle cx="116" cy="2" r="5" fill="#bbb"/>
  </g>

  <!-- שלט "הבאסטה של גולן" -->
  <g id="bastaSign">
    <line x1="470" y1="0" x2="478" y2="16" stroke="#555" stroke-width="4"/>
    <line x1="760" y1="0" x2="752" y2="16" stroke="#555" stroke-width="4"/>
    <g transform="rotate(-1.5 615 60)">
      <rect x="410" y="14" width="410" height="94" rx="10" fill="#8a5a33" stroke="${OUT}" stroke-width="4"/>
      <rect x="418" y="22" width="394" height="78" rx="7" fill="#f2b21d" stroke="#9c7100" stroke-width="3"/>
      <g transform="translate(434 26)">
        <rect x="-6" y="-2" width="80" height="74" rx="5" fill="#6e4525" stroke="${OUT}" stroke-width="3.4"/>
        <rect x="0" y="4" width="68" height="62" fill="#fff" stroke="#c8a040" stroke-width="3"/>
        <image href="golan.png" x="3" y="7" width="62" height="56" preserveAspectRatio="xMidYMin slice"/>
        <circle cx="-2" cy="2" r="2.4" fill="#d8b860"/>
        <circle cx="70" cy="2" r="2.4" fill="#d8b860"/>
        <circle cx="-2" cy="68" r="2.4" fill="#d8b860"/>
        <circle cx="70" cy="68" r="2.4" fill="#d8b860"/>
      </g>
      <text x="652" y="72" font-size="32" text-anchor="middle" fill="#b02418" font-weight="bold"
            style="paint-order:stroke" stroke="#fff" stroke-width="1">הבאסטה של גולן</text>
      <text x="790" y="50" font-size="22" text-anchor="middle">👑</text>
      <text x="790" y="92" font-size="20" text-anchor="middle">🌭</text>
    </g>
  </g>

  <!-- מדרכה ומעקה -->
  <rect x="160" y="146" width="840" height="34" fill="#bdbdb4" stroke="${OUT}" stroke-width="3"/>
  <rect x="160" y="196" width="840" height="290" fill="#8f8f86"/>
  <g id="barrier">
    <rect x="172" y="158" width="828" height="14" fill="#fff" stroke="${OUT}" stroke-width="3"/>
    ${Array.from({length: 14}, (_, i) => `<rect x="${180 + i * 60}" y="158" width="30" height="14" fill="#d63b2f"/>`).join("")}
    <rect x="186" y="172" width="10" height="50" fill="#888" stroke="${OUT}" stroke-width="2"/>
    <rect x="960" y="172" width="10" height="50" fill="#888" stroke="${OUT}" stroke-width="2"/>
  </g>

  <!-- לקוחות -->
  <g id="custLayer"></g>

  ${meters}

  <!-- קיר שמאל -->
  <g id="wall">
    <rect x="0" y="0" width="168" height="660" fill="#cfcfc6" stroke="${OUT}" stroke-width="3"/>
    <g stroke="#aaa49a" stroke-width="2">
      <line x1="0" y1="40" x2="168" y2="40"/><line x1="0" y1="84" x2="168" y2="84"/>
      <line x1="0" y1="128" x2="168" y2="128"/><line x1="0" y1="172" x2="168" y2="172"/>
      <line x1="0" y1="216" x2="168" y2="216"/><line x1="0" y1="260" x2="168" y2="260"/>
      <line x1="84" y1="0" x2="84" y2="40"/><line x1="42" y1="40" x2="42" y2="84"/>
      <line x1="126" y1="40" x2="126" y2="84"/><line x1="84" y1="84" x2="84" y2="128"/>
      <line x1="42" y1="128" x2="42" y2="172"/><line x1="126" y1="128" x2="126" y2="172"/>
    </g>
  </g>

  <!-- רדיו-טייפ -->
  <g id="boombox" style="cursor:pointer">
    <rect x="28" y="186" width="116" height="20" fill="#9a9a92" stroke="${OUT}" stroke-width="3"/>
    <rect x="22" y="120" width="128" height="70" rx="8" fill="#d63b2f" stroke="${OUT}" stroke-width="4"/>
    <path d="M22 120 Q86 110 150 120" stroke="rgba(255,100,80,0.3)" stroke-width="6" fill="none"/>
    <circle cx="52" cy="156" r="22" fill="#2a2a2a" stroke="${OUT}" stroke-width="3"/>
    <circle cx="52" cy="156" r="9" fill="#888"/>
    <circle cx="52" cy="149" r="4" fill="rgba(255,255,255,0.18)"/>
    <circle cx="120" cy="156" r="22" fill="#2a2a2a" stroke="${OUT}" stroke-width="3"/>
    <circle cx="120" cy="156" r="9" fill="#888"/>
    <circle cx="120" cy="149" r="4" fill="rgba(255,255,255,0.18)"/>
    <rect x="74" y="128" width="24" height="14" rx="3" fill="#f4f4f4" stroke="${OUT}" stroke-width="2"/>
    <path d="M30 120 L60 96 M142 120 L112 96" stroke="${OUT}" stroke-width="4"/>
    <text id="musicNote" x="86" y="100" font-size="30" text-anchor="middle" opacity="0">🎵</text>
  </g>

  <!-- חלון מטבח: הפועל ממלא המלאי -->
  <g id="workerWindow">
    <rect x="10" y="192" width="148" height="68" rx="7" fill="#6888a8" stroke="${OUT}" stroke-width="3.4"/>
    <rect x="16" y="198" width="136" height="56" rx="4" fill="#aac8e0" stroke="${OUT}" stroke-width="2.4"/>
    <g clip-path="url(#wClip)">
      <g id="workerChar" transform="translate(84 238)"></g>
    </g>
    <line x1="84" y1="198" x2="84" y2="254" stroke="${OUT}" stroke-width="2" opacity=".35"/>
    <line x1="16" y1="226" x2="152" y2="226" stroke="${OUT}" stroke-width="2" opacity=".35"/>
    <rect x="10" y="192" width="148" height="68" rx="7" fill="none" stroke="${OUT}" stroke-width="3.4"/>
  </g>

  <!-- מראה עם המוכר — תמונה -->
  <g id="mirror">
    <clipPath id="mirrorClip"><ellipse cx="84" cy="360" rx="64" ry="82"/></clipPath>
    <ellipse cx="84" cy="360" rx="74" ry="92" fill="#8c98a0" stroke="${OUT}" stroke-width="5"/>
    <ellipse cx="84" cy="360" rx="64" ry="82" fill="#dce8ee" stroke="${OUT}" stroke-width="3"/>
    <g clip-path="url(#mirrorClip)">
      <image href="img_vendor.png" x="22" y="282" width="124" height="156"
             preserveAspectRatio="xMidYMin meet"/>
      <g id="vendorFace" transform="translate(8 272)"></g>
    </g>
    <path d="M40 300 q-14 40 6 92" stroke="#fff" stroke-width="7" opacity=".5" fill="none"/>
  </g>

  <!-- שלט ניקוד -->
  <g id="scoreCard">
    <rect x="18" y="14" width="132" height="64" rx="6" fill="#fffdf2" stroke="${OUT}" stroke-width="4"/>
    <rect x="26" y="22" width="116" height="48" rx="4" fill="none" stroke="#c8b88a" stroke-width="2"/>
    <text id="scoreText" x="84" y="58" font-size="34" font-weight="bold" text-anchor="middle" fill="#1c1c1c" font-family="Arial">0</text>
  </g>

  <!-- ===== הדוכן ===== -->
  <g id="stand">
    <rect x="0" y="470" width="1000" height="50" fill="#b8b8b0" stroke="${OUT}" stroke-width="4"/>
    <rect x="0" y="516" width="1000" height="144" fill="#8a5a33" stroke="${OUT}" stroke-width="4"/>
    <rect x="0" y="516" width="1000" height="16" fill="#a06b3d"/>

    <!-- גריל נקניקיות — תמונה -->
    <g id="st_sausage" style="cursor:pointer">
      <rect x="40" y="470" width="220" height="82" rx="8" fill="#2e2e2e" stroke="${OUT}" stroke-width="4"/>
      <clipPath id="clipGrill"><rect x="40" y="470" width="220" height="82" rx="8"/></clipPath>
      <image href="img_sausage_beef.png" x="30" y="452" width="240" height="110"
             clip-path="url(#clipGrill)" preserveAspectRatio="xMidYMid meet"/>
      <path d="M90 470 q4 -16 -4 -24 M150 470 q4 -16 -4 -24 M210 470 q4 -16 -4 -24"
            stroke="#ccc" stroke-width="4" fill="none" opacity=".75"/>
    </g>

    <!-- מגש כרוב כבוש — תמונה -->
    <g id="st_kraut" style="cursor:pointer">
      <rect x="290" y="482" width="180" height="70" rx="8" fill="#e8e4d0" stroke="${OUT}" stroke-width="4"/>
      <clipPath id="clipKraut"><rect x="290" y="482" width="180" height="70" rx="8"/></clipPath>
      <image href="img_kraut.png" x="300" y="462" width="160" height="98"
             clip-path="url(#clipKraut)" preserveAspectRatio="xMidYMid meet"/>
    </g>

    <!-- בקבוק חרדל — תמונה -->
    <g id="st_mustard" style="cursor:pointer">
      <image href="img_mustard.png" x="478" y="446" width="68" height="128"
             preserveAspectRatio="xMidYMid meet"/>
      <text x="512" y="583" font-size="12" text-anchor="middle" fill="#8a6800" font-weight="bold" font-family="Arial">חרדל</text>
    </g>

    <!-- בקבוק קטשופ — תמונה -->
    <g id="st_ketchup" style="cursor:pointer">
      <image href="img_ketchup.png" x="550" y="446" width="68" height="128"
             preserveAspectRatio="xMidYMid meet"/>
      <text x="584" y="583" font-size="12" text-anchor="middle" fill="#8a0000" font-weight="bold" font-family="Arial">קטשופ</text>
    </g>

    <!-- מקרר שתייה -->
    <g id="fridge">
      <rect x="606" y="442" width="180" height="112" rx="10" fill="#3f7de0" stroke="${OUT}" stroke-width="4"/>
      <path d="M606 442 Q696 434 786 442" stroke="rgba(120,180,255,0.35)" stroke-width="8" fill="none"/>
      <rect x="614" y="450" width="164" height="74" rx="6" fill="#bfe3f2" stroke="${OUT}" stroke-width="3"/>
      <text x="696" y="546" font-size="17" text-anchor="middle" fill="#fff" font-weight="bold">שתייה קרה</text>
      <g id="st_cola" style="cursor:pointer">
        <rect x="622" y="462" width="30" height="54" rx="5" fill="#c8102e" stroke="${OUT}" stroke-width="3"/>
        <ellipse cx="637" cy="463" rx="15" ry="4" fill="#ddd" stroke="${OUT}" stroke-width="2"/>
        <path d="M626 468 L626 510" stroke="rgba(255,255,255,0.28)" stroke-width="4" stroke-linecap="round"/>
        <text x="637" y="498" font-size="10" text-anchor="middle" fill="#fff" font-weight="bold">קולה</text>
      </g>
      <g id="st_sprite" style="cursor:pointer">
        <rect x="660" y="462" width="30" height="54" rx="5" fill="#1f9d49" stroke="${OUT}" stroke-width="3"/>
        <ellipse cx="675" cy="463" rx="15" ry="4" fill="#ddd" stroke="${OUT}" stroke-width="2"/>
        <path d="M664 468 L664 510" stroke="rgba(255,255,255,0.28)" stroke-width="4" stroke-linecap="round"/>
        <text x="675" y="498" font-size="8.6" text-anchor="middle" fill="#fff" font-weight="bold">ספרייט</text>
      </g>
      <g id="st_water" style="cursor:pointer">
        <rect x="700" y="456" width="10" height="8" fill="#2b7fc2" stroke="${OUT}" stroke-width="2"/>
        <path d="M696 464 h18 l3 8 v38 a6 6 0 0 1 -6 6 h-12 a6 6 0 0 1 -6 -6 v-38z" fill="#bfe3f7" stroke="${OUT}" stroke-width="3"/>
        <path d="M699 468 L699 508" stroke="rgba(255,255,255,0.35)" stroke-width="3" stroke-linecap="round"/>
        <text x="705" y="498" font-size="10" text-anchor="middle" fill="#2b5fa0" font-weight="bold">מים</text>
      </g>
      <g id="st_vodka" style="cursor:pointer">
        <rect x="726" y="450" width="20" height="66" rx="6" fill="#e8f4fb" stroke="${OUT}" stroke-width="3"/>
        <rect x="730" y="442" width="12" height="12" fill="#b8c8d0" stroke="${OUT}" stroke-width="2"/>
        <path d="M730 456 L730 510" stroke="rgba(255,255,255,0.35)" stroke-width="3" stroke-linecap="round"/>
        <rect x="750" y="462" width="24" height="54" rx="5" fill="#9bcd2e" stroke="${OUT}" stroke-width="3"/>
        <path d="M754 468 L754 510" stroke="rgba(255,255,255,0.28)" stroke-width="3" stroke-linecap="round"/>
        <text x="762" y="496" font-size="11" text-anchor="middle" fill="#23410a" font-weight="bold">XL</text>
        <text x="736" y="488" font-size="9" text-anchor="middle" fill="#5a7886" font-weight="bold" transform="rotate(-90 736 488)">וודקה</text>
      </g>
    </g>

    <!-- ערימת לחמניות — תמונה -->
    <g id="bunStack" style="cursor:pointer">
      <image href="img_bun.png" x="820" y="425" width="160" height="130"
             preserveAspectRatio="xMidYMid meet"/>
      <text x="900" y="570" font-size="13" text-anchor="middle" fill="#8a5a00" font-weight="bold" font-family="Arial">לחמניות</text>
    </g>

    <!-- קופה רושמת -->
    <g id="register">
      <rect x="806" y="470" width="56" height="46" rx="5" fill="#e8d44a" stroke="${OUT}" stroke-width="3.6"/>
      <rect x="812" y="476" width="44" height="14" rx="2" fill="#cfe8d8" stroke="${OUT}" stroke-width="2"/>
      <g fill="#b8a428">
        ${[0,1,2].map((r) => [0,1,2].map((c) => `<rect x="${814 + c * 15}" y="${494 + r * 8}" width="11" height="5.4" rx="1.4" stroke="${OUT}" stroke-width="1"/>`).join("")).join("")}
      </g>
    </g>
  </g>

  <!-- כוס וודקה XL דקורטיבית — תמונה -->
  <image id="decVodkaGlass" href="img_vodka_cup.png" x="78" y="428" width="70" height="88"
         preserveAspectRatio="xMidYMid meet"/>

  <!-- תוויות ריק -->
  <g id="stockLabels" font-size="20" font-weight="bold" text-anchor="middle" font-family="Arial"
     fill="#d63b2f" stroke="#fff" stroke-width="1.2" paint-order="stroke">
    <text id="mtStock_sausage"  x="150" y="510" visibility="hidden">ריק!</text>
    <text id="mtStock_kraut"    x="380" y="520" visibility="hidden">ריק!</text>
    <text id="mtStock_mustard"  x="512" y="508" visibility="hidden" font-size="16">ריק!</text>
    <text id="mtStock_ketchup"  x="562" y="508" visibility="hidden" font-size="16">ריק!</text>
    <text id="mtStock_cola"     x="637" y="500" visibility="hidden" font-size="14">ריק!</text>
    <text id="mtStock_sprite"   x="675" y="500" visibility="hidden" font-size="14">ריק!</text>
    <text id="mtStock_water"    x="705" y="500" visibility="hidden" font-size="13">ריק!</text>
    <text id="mtStock_vodka"    x="745" y="488" visibility="hidden" font-size="13">ריק!</text>
  </g>

  <!-- פח אשפה — השלך לחמנייה -->
  <g id="trashBin" style="cursor:pointer" transform="translate(696 517)">
    <!-- מכסה -->
    <rect x="-26" y="-16" width="52" height="12" rx="4" fill="#555" stroke="${OUT}" stroke-width="2.4"/>
    <path d="M-10 -28 h20 l2 12 h-24z" fill="#555" stroke="${OUT}" stroke-width="2.2"/>
    <line x1="-2" y1="-28" x2="-2" y2="-16" stroke="${OUT}" stroke-width="2"/>
    <!-- גוף הפח -->
    <path d="M-24 -4 l5 58 a6 6 0 0 0 6 6 h26 a6 6 0 0 0 6 -6 l5 -58z"
          fill="#cc3333" stroke="${OUT}" stroke-width="3"/>
    <!-- קווים אנכיים -->
    <line x1="-8" y1="0" x2="-6" y2="52" stroke="rgba(255,255,255,0.28)" stroke-width="2.2"/>
    <line x1="4"  y1="0" x2="6"  y2="52" stroke="rgba(255,255,255,0.28)" stroke-width="2.2"/>
    <line x1="16" y1="0" x2="14" y2="52" stroke="rgba(255,255,255,0.28)" stroke-width="2.2"/>
    <!-- כיתוב -->
    <text x="2" y="34" font-size="11" text-anchor="middle" fill="#ffcccc"
          font-weight="bold" font-family="Arial">זרוק</text>
    <!-- תווית -->
    <text x="2" y="80" font-size="11" text-anchor="middle" fill="#cc3333"
          font-weight="bold" font-family="Arial" stroke="#fff" stroke-width="0.8" paint-order="stroke">🗑️ פח</text>
  </g>

  <!-- פאנל תוכן לחמנייה -->
  <g id="bunHUD" visibility="hidden">
    <rect x="270" y="438" width="400" height="28" rx="7"
          fill="rgba(255,248,220,0.96)" stroke="#c8a840" stroke-width="2"/>
    <text id="bunHudText" x="470" y="457" font-size="13.5" text-anchor="middle"
          fill="#4a2a00" font-family="Arial" font-weight="bold">בלחמנייה: ריק</text>
  </g>

  <!-- שכבות דינמיות -->
  <g id="drinksPlaced"></g>
  <g id="handLayer"></g>
  <g id="fxLayer"></g>
  `;
}

/* ---------- בון/פתק הזמנה מעל לקוח ---------- */
const BON_DRINK_NAMES = { cola: "קולה", sprite: "ספרייט", water: "מים", vodka: "וודקה XL" };

function bonArt(order, name, bun, drinkSatisfied) {
  const lines = [];
  if (order.sausage > 0) {
    lines.push({ text: `נקניקייה x${order.sausage}`, done: (bun.sausage||0) >= order.sausage });
  }
  if (order.kraut > 0) {
    lines.push({ text: `כרוב כבוש x${order.kraut}`, done: (bun.kraut||0) >= order.kraut });
  }
  if (order.mustard > 0) {
    lines.push({ text: `חרדל x${order.mustard}`, done: (bun.mustard||0) >= order.mustard });
  }
  if (order.ketchup > 0) {
    lines.push({ text: `קטשופ x${order.ketchup}`, done: (bun.ketchup||0) >= order.ketchup });
  }
  if (order.drink) {
    lines.push({ text: BON_DRINK_NAMES[order.drink] || order.drink, done: drinkSatisfied });
  }

  const LH = 17;
  const h = 28 + lines.length * LH + 6;
  const lineItems = lines.map((l, idx) => {
    const y = 30 + idx * LH;
    const col = l.done ? "#1e7a1e" : "#2a2a2a";
    const strike = l.done
      ? `<line x1="-46" y1="${y - 4}" x2="46" y2="${y - 4}" stroke="#1e7a1e" stroke-width="1.4" opacity="0.65"/>`
      : "";
    return `<text x="46" y="${y}" font-size="12" fill="${col}" text-anchor="end" font-family="Arial" font-weight="${l.done ? 'normal' : 'bold'}">${l.text}</text>${strike}`;
  }).join("");

  const pinY = h + 10;
  const vodkaGlow = order.drink === "vodka"
    ? `<rect x="-54" y="0" width="108" height="${h}" rx="5" fill="rgba(160,80,255,0.08)"/>`
    : "";

  return `<g class="bon-note" transform="translate(100 ${-(h + 52)})">
    <line x1="0" y1="${pinY}" x2="0" y2="${h + 2}" stroke="#bbb" stroke-width="1.4"/>
    <circle cx="0" cy="${pinY}" r="5.5" fill="#d63b2f" stroke="#8a1818" stroke-width="1.6"/>
    <rect x="-56" y="3" width="112" height="${h}" rx="5" fill="rgba(0,0,0,0.12)" transform="translate(2 3)"/>
    <rect x="-56" y="0" width="112" height="${h}" rx="5" fill="#fffdf0" stroke="#c8b87a" stroke-width="2"/>
    ${vodkaGlow}
    <rect x="-56" y="0" width="112" height="22" rx="5" fill="${order.drink === 'vodka' ? '#9340d6' : '#f2b21d'}"/>
    <rect x="-56" y="14" width="112" height="8" fill="${order.drink === 'vodka' ? '#9340d6' : '#f2b21d'}"/>
    <text x="0" y="16" font-size="13" text-anchor="middle" font-weight="bold"
          fill="${order.drink === 'vodka' ? '#f0e0ff' : '#5a3500'}" font-family="Arial">${name}</text>
    <line x1="-48" y1="24" x2="48" y2="24" stroke="#c8b87a" stroke-width="1" stroke-dasharray="3 2"/>
    ${lineItems}
  </g>`;
}
