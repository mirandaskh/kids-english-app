/* ============================================================
 * 核心框架:本地存储 / 语音发音 / 弹窗 / 工具函数
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 本地存储 ---------- */
  var DEFAULT_STATE = {
    bookId: 'g3a',
    learned: {},          // word -> { fam: 0~5 熟悉度, ts: 最后学习时间 }
    wrong: {},            // 生词本 word -> ts
    read: {},             // artId -> { ts, quiz: 得分, total: 总数 }
    daily: {},            // '2026-10-28' -> { learn, review, quiz, spell, read }
    streak: { last: '', days: 0 },
    settings: { rate: 0.85, accent: 'US', autoSpeak: true },
    unitSel: {},          // bookId -> 当前选择的单元(0=全部)
    today: { date: '', learn: 0, review: 0, quiz: 0, spell: 0, read: 0 }
  };

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  var state;
  function load() {
    try {
      state = JSON.parse(localStorage.getItem('kidEnglish') || 'null') || {};
    } catch (e) { state = {}; }
    state = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_STATE)), state);
    state.settings = Object.assign({}, DEFAULT_STATE.settings, state.settings);
    // 跨天重置今日计数
    if (state.today.date !== todayStr()) {
      state.today = { date: todayStr(), learn: 0, review: 0, quiz: 0, spell: 0, read: 0 };
      // 连续打卡
      if (state.streak.last) {
        var diff = (new Date(todayStr()) - new Date(state.streak.last)) / 86400000;
        state.streak.days = (diff === 1) ? state.streak.days + 1 : (diff > 1 ? 0 : state.streak.days);
      }
    }
    save();
  }
  function save() {
    try { localStorage.setItem('kidEnglish', JSON.stringify(state)); } catch (e) {}
  }

  function bumpDaily(key, n) {
    if (state.today.date !== todayStr()) state.today = { date: todayStr(), learn: 0, review: 0, quiz: 0, spell: 0, read: 0 };
    state.today[key] = (state.today[key] || 0) + (n || 1);
    state.daily[state.today.date] = state.today;
    // 打卡
    if (state.streak.last !== todayStr()) {
      var yest = new Date(Date.now() - 86400000);
      var ys = yest.getFullYear() + '-' + String(yest.getMonth() + 1).padStart(2, '0') + '-' + String(yest.getDate()).padStart(2, '0');
      state.streak.days = (state.streak.last === ys) ? state.streak.days + 1 : 1;
      state.streak.last = todayStr();
    }
    save();
  }

  /* ---------- 语音发音 (Web Speech API) ---------- */
  var ttsReady = ('speechSynthesis' in window);
  function speak(text, rate) {
    if (!ttsReady || !text) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rate || state.settings.rate || 0.85;
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ---------- 工具 ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(arr, n, exclude) {
    var pool = shuffle(arr.filter(function (x) { return x !== exclude; }));
    return pool.slice(0, n);
  }
  function toast(msg, ms) {
    var el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.hidden = true; }, ms || 1600);
  }
  function openSheet(html) {
    var m = $('#modal');
    m.innerHTML = '<div class="modal-sheet">' + html + '</div>';
    m.hidden = false;
    m.onclick = function (e) { if (e.target === m) closeSheet(); };
  }
  function closeSheet() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }

  /* ---------- 查词典(用于阅读点词) ---------- */
  function lookupWord(raw) {
    var w = (raw || '').toLowerCase().replace(/[^a-z'’\- ]/g, '').trim();
    if (!w) return null;
    // 直接命中
    for (var b = 0; b < window.WORD_BOOKS.length; b++) {
      var words = window.WORD_BOOKS[b].words;
      for (var i = 0; i < words.length; i++) {
        if (words[i].w.toLowerCase() === w) return words[i];
      }
    }
    // 简单词形还原:s/es/ed/ing/d
    var stems = [];
    if (/ies$/.test(w)) stems.push(w.slice(0, -3) + 'y');
    if (/es$/.test(w)) stems.push(w.slice(0, -2), w.slice(0, -1));
    if (/ed$/.test(w)) stems.push(w.slice(0, -2), w.slice(0, -1));
    if (/ing$/.test(w)) stems.push(w.slice(0, -3), w.slice(0, -3) + 'e');
    if (/s$/.test(w)) stems.push(w.slice(0, -1));
    for (var s = 0; s < stems.length; s++) {
      var sw = stems[s];
      if (sw.length < 2) continue;
      for (var b2 = 0; b2 < window.WORD_BOOKS.length; b2++) {
        var ws = window.WORD_BOOKS[b2].words;
        for (var j = 0; j < ws.length; j++) {
          if (ws[j].w.toLowerCase() === sw) return ws[j];
        }
      }
    }
    return { w: w, p: '', m: '(词库中暂无释义,可点击发音跟读哦)', s: '' };
  }

  /* 对文章段落 HTML:为每个单词包 span,供点击查义 */
  function wrapWords(en) {
    var out = '';
    en.split(/([A-Za-z][A-Za-z'’\-]*)/).forEach(function (seg) {
      if (!seg) return;
      if (/^[A-Za-z]/.test(seg)) {
        out += '<span class="w" data-word="' + esc(seg) + '">' + esc(seg) + '</span>';
      } else {
        out += esc(seg);
      }
    });
    return out;
  }

  window.Core = {
    get state() { return state; },
    save: save, load: load,
    bumpDaily: bumpDaily, todayStr: todayStr,
    speak: speak, ttsReady: ttsReady,
    $: $, $$: $$, esc: esc, shuffle: shuffle, sample: sample,
    toast: toast, openSheet: openSheet, closeSheet: closeSheet,
    lookupWord: lookupWord, wrapWords: wrapWords
  };

  /* 全局快捷方式,供各模块直接使用 $ / $$ / esc */
  window.$ = $;
  window.$$ = $$;
  window.esc = esc;
})();
