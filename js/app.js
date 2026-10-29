/* ============================================================
 * 主框架:首页 / 统计 / 设置 / 底部导航路由
 * ============================================================ */
(function () {
  'use strict';
  var C = window.Core;

  var TABS = [
    { id: 'home',    ico: '🏠', name: '首页' },
    { id: 'words',   ico: '📖', name: '背单词' },
    { id: 'reading', ico: '📰', name: '时文' },
    { id: 'stats',   ico: '🏅', name: '成绩' },
    { id: 'me',      ico: '⚙️', name: '设置' }
  ];
  var current = 'home';
  var flowReturn = null; // 记录学习流程前的页面,返回时恢复

  /* ---------- 渲染底部导航 ---------- */
  function renderTabs() {
    var bar = C.$('#tabbar');
    bar.innerHTML = TABS.map(function (t) {
      return '<button class="tab-item' + (current === t.id ? ' active' : '') + '" data-tab="' + t.id + '">' +
        '<span class="tab-ico">' + t.ico + '</span><span>' + t.name + '</span></button>';
    }).join('');
    C.$$('[data-tab]', bar).forEach(function (el) {
      el.onclick = function () { go(el.getAttribute('data-tab')); };
    });
  }

  function go(tab) {
    current = tab;
    flowReturn = null;
    C.$('#backBtn').hidden = true;
    C.$('#topBadge').hidden = true;
    var titles = { home: '英语小学霸', words: '背单词', reading: '时文阅读', stats: '我的成绩', me: '设置' };
    C.$('#topTitle').textContent = titles[tab] || '英语小学霸';
    renderTabs();
    C.closeSheet();
    if (tab === 'home') viewHome();
    else if (tab === 'words') window.Words.viewWords();
    else if (tab === 'reading') window.Reading.viewArticles();
    else if (tab === 'stats') viewStats();
    else if (tab === 'me') viewSettings();
  }

  /* ---------- 首页 ---------- */
  function viewHome() {
    var s = C.state;
    var learnTotal = 0;
    window.WORD_BOOKS.forEach(function (b) {
      b.words.forEach(function (w) { if (s.learned[w.w]) learnTotal++; });
    });
    var wrongN = Object.keys(s.wrong).length;
    var t = s.today;
    var hour = new Date().getHours();
    var hello = hour < 6 ? '夜深啦' : hour < 9 ? '早上好' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

    C.$('#view').innerHTML =
      '<div class="hero">' +
        '<h2>' + hello + ' 👋</h2>' +
        '<div class="row row-wrap mt8">' +
          '<span class="streak">🔥 连续打卡 ' + s.streak.days + ' 天</span>' +
          '<span class="muted">' + C.todayStr() + '</span>' +
        '</div>' +
        '<div class="today-grid">' +
          '<div class="today-cell"><b style="color:#FF8A3D">' + (t.learn || 0) + '</b><span>学新词</span></div>' +
          '<div class="today-cell"><b style="color:#4EA8FF">' + (t.review || 0) + '</b><span>复习</span></div>' +
          '<div class="today-cell"><b style="color:#4CB880">' + (t.read || 0) + '</b><span>阅读</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="quick-grid">' +
        '<button class="quick-item" data-go="words" style="background:linear-gradient(135deg,#FFB25A,#FF8A3D)">' +
          '<span class="q-ico">📖</span><span class="q-t">背单词</span>' +
          '<span class="q-s">已掌握 ' + learnTotal + ' 词</span></button>' +
        '<button class="quick-item" data-go="reading" style="background:linear-gradient(135deg,#6FB9FF,#4EA8FF)">' +
          '<span class="q-ico">📰</span><span class="q-t">时文阅读</span>' +
          '<span class="q-s">8 篇分级小短文</span></button>' +
        '<button class="quick-item" id="goStudyNow" style="background:linear-gradient(135deg,#6FCE9B,#4CB880)">' +
          '<span class="q-ico">⚡</span><span class="q-t">开始今日学习</span>' +
          '<span class="q-s">学 10 个新词</span></button>' +
        '<button class="quick-item" id="goWrongBook" style="background:linear-gradient(135deg,#B39CFF,#9B7BFF)">' +
          '<span class="q-ico">⭐</span><span class="q-t">生词本</span>' +
          '<span class="q-s">' + wrongN + ' 个词待巩固</span></button>' +
      '</div>' +
      '<div class="card mt16">' +
        '<div class="sec-title" style="margin:0 0 10px">小贴士</div>' +
        '<p class="muted" style="margin:0;line-height:1.8">🌱 每天 15 分钟,先学新词,再复习,最后读一篇小短文。<br>🔊 点单词可以听发音,跟读三遍印象更深!</p>' +
      '</div>';

    C.$$('[data-go]').forEach(function (el) {
      el.onclick = function () { go(el.getAttribute('data-go')); };
    });
    $('#goStudyNow').onclick = function () { go('words'); window.Words.startStudy(); };
    $('#goWrongBook').onclick = function () { go('words'); window.Words.viewWrong(); };
  }

  /* ---------- 成绩页 ---------- */
  function viewStats() {
    var s = C.state;
    var learnTotal = 0;
    window.WORD_BOOKS.forEach(function (b) {
      b.words.forEach(function (w) { if (s.learned[w.w]) learnTotal++; });
    });
    var totalWords = 0;
    window.WORD_BOOKS.forEach(function (b) { totalWords += b.words.length; });
    var readDone = Object.keys(s.read).filter(function (k) { return s.read[k].quiz != null; }).length;
    var quizDays = Object.keys(s.daily).length;

    var booksHtml = window.WORD_BOOKS.map(function (b) {
      var n = window.Words.learnedCount(b), pct = Math.round(n / b.words.length * 100);
      return '<div class="bookline"><div class="row"><span>' + b.emoji + ' ' + C.esc(b.name) + '</span><span class="grow"></span><b>' + n + '/' + b.words.length + '</b></div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div></div>';
    }).join('');

    C.$('#view').innerHTML =
      '<div class="stat-grid">' +
        '<div class="stat-cell"><span class="s-ico">📚</span><b>' + learnTotal + '</b><span>累计掌握单词 / ' + totalWords + '</span></div>' +
        '<div class="stat-cell"><span class="s-ico">🔥</span><b>' + s.streak.days + '</b><span>连续打卡天数</span></div>' +
        '<div class="stat-cell"><span class="s-ico">📰</span><b>' + readDone + '</b><span>读完文章数</span></div>' +
        '<div class="stat-cell"><span class="s-ico">📅</span><b>' + quizDays + '</b><span>学习过的天数</span></div>' +
      '</div>' +
      '<div class="card mt16">' +
        '<div class="sec-title" style="margin:0 0 12px">各册进度</div>' + booksHtml +
      '</div>' +
      '<div class="card">' +
        '<div class="sec-title" style="margin:0 0 8px">今日表现</div>' +
        '<div class="settings-row"><span>📖 学新词</span><b>' + (s.today.learn || 0) + ' 个</b></div>' +
        '<div class="settings-row"><span>🔄 复习</span><b>' + (s.today.review || 0) + ' 次</b></div>' +
        '<div class="settings-row"><span>🎯 答题</span><b>' + (s.today.quiz || 0) + ' 题</b></div>' +
        '<div class="settings-row"><span>✍️ 拼写</span><b>' + (s.today.spell || 0) + ' 次</b></div>' +
        '<div class="settings-row"><span>📰 阅读</span><b>' + (s.today.read || 0) + ' 篇</b></div>' +
      '</div>';
  }

  /* ---------- 设置页 ---------- */
  function viewSettings() {
    var st = C.state.settings;
    C.$('#view').innerHTML =
      '<div class="card">' +
        '<div class="sec-title" style="margin:0 0 4px">发音设置</div>' +
        '<div class="settings-row"><span>语速</span>' +
          '<div class="seg" id="rateSeg">' +
            '<button data-r="0.6" class="' + (st.rate <= 0.6 ? 'on' : '') + '">慢</button>' +
            '<button data-r="0.85" class="' + (st.rate > 0.6 && st.rate < 1.1 ? 'on' : '') + '">正常</button>' +
            '<button data-r="1.1" class="' + (st.rate >= 1.1 ? 'on' : '') + '">快</button>' +
          '</div></div>' +
        '<div class="settings-row"><span>自动朗读单词</span><button class="switch ' + (st.autoSpeak ? 'on' : '') + '" id="autoSw"></button></div>' +
        '<div class="settings-row"><span>试听一下</span><button class="btn btn-ghost btn-sm" id="testSay">🔊 apple</button></div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="sec-title" style="margin:0 0 4px">学习管理</div>' +
        '<div class="settings-row"><span>清空学习记录</span><button class="btn btn-sm" style="background:#FDEEEA;color:#F4543E" id="resetBtn">重置</button></div>' +
        '<div class="settings-row"><span>导出/备份数据</span><button class="btn btn-ghost btn-sm" id="exportBtn">复制 JSON</button></div>' +
      '</div>' +
      '<div class="card"><p class="muted" style="margin:0;line-height:1.8">' +
        '🌟 数据保存在本设备浏览器中,不会上传。<br>词库参考人教版 PEP 教材,共 8 册 320+ 词;时文 8 篇持续分级。<br>' +
        '提示:建议用 Chrome / Edge / Safari 打开,发音功能更稳定。</p></div>';

    C.$$('#rateSeg button').forEach(function (b) {
      b.onclick = function () {
        st.rate = parseFloat(b.getAttribute('data-r'));
        C.save(); viewSettings(); C.speak('apple', st.rate);
      };
    });
    $('#autoSw').onclick = function () { st.autoSpeak = !st.autoSpeak; C.save(); viewSettings(); };
    $('#testSay').onclick = function () { C.speak('apple'); };
    $('#exportBtn').onclick = function () {
      var json = JSON.stringify(C.state);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json).then(function () { C.toast('已复制到剪贴板'); },
          function () { fallbackCopy(json); });
      } else fallbackCopy(json);
    };
    $('#resetBtn').onclick = function () {
      C.openSheet('<div class="center"><div style="font-size:40px">⚠️</div>' +
        '<h3 style="margin:10px 0">确定清空全部学习记录吗?</h3>' +
        '<p class="muted">单词进度、生词本、阅读记录都会被删除,无法恢复。</p>' +
        '<div class="row mt16">' +
        '<button class="btn btn-light grow" id="rCancel">取消</button>' +
        '<button class="btn btn-primary grow" id="rOk" style="background:linear-gradient(120deg,#FF7B5A,#F4543E)">确认清空</button></div></div>');
      $('#rCancel').onclick = C.closeSheet;
      $('#rOk').onclick = function () {
        localStorage.removeItem('kidEnglish');
        C.load();
        C.closeSheet();
        C.toast('已重置');
        viewSettings();
      };
    };
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); C.toast('已复制'); } catch (e) { C.toast('复制失败'); }
    document.body.removeChild(ta);
  }

  /* ---------- 返回按钮 ---------- */
  C.$('#backBtn').onclick = function () { go('home'); };

  /* ---------- 启动 ---------- */
  C.load();
  renderTabs();
  viewHome();
})();
