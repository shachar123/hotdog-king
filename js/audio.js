/* ============ hotdog-hustle — audio module ============ */
"use strict";

/* ---------- WebAudio context (lazy, created on first gesture) ---------- */
var _actx = null;
function _getAC() {
  if (!_actx) {
    _actx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _actx;
}

/* ---------- helpers ---------- */
function _tone(freq, dur, type, vol, when) {
  try {
    var c = _getAC();
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || "square";
    o.frequency.value = freq;
    var t = c.currentTime + (when || 0);
    g.gain.setValueAtTime(vol || 0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch (e) {}
}

function _noise(dur, vol, when) {
  try {
    var c = _getAC();
    var bufLen = Math.ceil(c.sampleRate * dur);
    var buf = c.createBuffer(1, bufLen, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < bufLen; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    var src = c.createBufferSource();
    src.buffer = buf;
    var g = c.createGain();
    var t = c.currentTime + (when || 0);
    g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(g);
    g.connect(c.destination);
    src.start(t);
    src.stop(t + dur + 0.05);
  } catch (e) {}
}

/* ---------- SFX definitions ---------- */
var _sfxMap = {
  click: function () {
    _tone(1200, 0.04, "sine", 0.15, 0);
  },

  sizzle: function () {
    _noise(0.18, 0.25, 0);
    // high-pass feel: layer a quiet noise burst fading fast
    _noise(0.08, 0.12, 0.06);
  },

  ding: function () {
    _tone(1760, 0.5, "sine", 0.22, 0);
    _tone(2640, 0.3, "sine", 0.10, 0.02);
  },

  serve: function () {
    // cha-ching two notes
    _tone(880,  0.1, "triangle", 0.2, 0);
    _tone(1320, 0.15, "triangle", 0.2, 0.1);
  },

  coin: function () {
    // quick rising blip
    try {
      var c = _getAC();
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(600, c.currentTime);
      o.frequency.linearRampToValueAtTime(1400, c.currentTime + 0.1);
      g.gain.setValueAtTime(0.2, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.15);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime);
      o.stop(c.currentTime + 0.18);
    } catch (e) {}
  },

  angry: function () {
    // descending buzz
    try {
      var c = _getAC();
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(300, c.currentTime);
      o.frequency.linearRampToValueAtTime(80, c.currentTime + 0.3);
      g.gain.setValueAtTime(0.2, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.32);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime);
      o.stop(c.currentTime + 0.35);
    } catch (e) {}
  },

  trash: function () {
    // thud: low sine + noise
    _tone(60, 0.18, "sine", 0.3, 0);
    _noise(0.12, 0.15, 0);
  },

  siren: function () {
    // two-tone rush-hour alarm ~1.5s alternating
    var freqs = [880, 660];
    var step = 0.25;
    for (var i = 0; i < 6; i++) {
      _tone(freqs[i % 2], step, "square", 0.18, i * step);
    }
  },

  fail: function () {
    // sad trombone-ish: descending notes
    var notes = [466, 415, 370, 311];
    notes.forEach(function (f, i) {
      _tone(f, 0.22, "sawtooth", 0.18, i * 0.2);
    });
  },

  goal: function () {
    // short victory fanfare: 3 ascending notes
    var notes = [523, 659, 784];
    notes.forEach(function (f, i) {
      _tone(f, 0.18, "triangle", 0.22, i * 0.15);
    });
    // sparkle on top
    _tone(1568, 0.3, "sine", 0.1, 0.45);
  }
};

/* ---------- public sfx(name) ---------- */
function sfx(name) {
  try {
    if (typeof persist !== "undefined" && persist.muted) return;
  } catch (e) {}
  var fn = _sfxMap[name];
  if (fn) fn();
}

/* ============ YouTube music ============ */
var _ytPlayer = null;
var _ytReady  = false;
var _ytPlayQueued = false;

function initMusic() {
  if (document.getElementById("yt-api-script")) return;

  // Create hidden player container
  var div = document.createElement("div");
  div.id = "yt-player";
  div.style.cssText = "position:fixed;width:1px;height:1px;top:-9999px;left:-9999px;pointer-events:none;";
  document.body.appendChild(div);

  window.onYouTubeIframeAPIReady = function () {
    _ytReady = true;
    _ytPlayer = new YT.Player("yt-player", {
      videoId: "BXGsBopP-Ds",
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: "BXGsBopP-Ds",
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1
      },
      events: {
        onReady: function (e) {
          try { e.target.setVolume(30); } catch (err) {}
          if (_ytPlayQueued) {
            _ytPlayQueued = false;
            try { e.target.playVideo(); } catch (err) {}
          }
        }
      }
    });
  };

  var s = document.createElement("script");
  s.id = "yt-api-script";
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
}

function playMusic() {
  try {
    if (typeof persist !== "undefined" && persist.muted) return;
  } catch (e) {}
  if (!_ytReady || !_ytPlayer) {
    _ytPlayQueued = true;
    return;
  }
  try { _ytPlayer.playVideo(); } catch (e) {}
}

function pauseMusic() {
  _ytPlayQueued = false;
  if (!_ytReady || !_ytPlayer) return;
  try { _ytPlayer.pauseVideo(); } catch (e) {}
}

function toggleMute() {
  try {
    persist.muted = !persist.muted;
    if (typeof saveGame === "function") saveGame();
    if (persist.muted) {
      pauseMusic();
    } else {
      playMusic();
    }
    return persist.muted;
  } catch (e) {
    return false;
  }
}
