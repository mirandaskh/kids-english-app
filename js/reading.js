/* ============================================================
 * 时文阅读模块:文章列表 / 点词查义阅读器 / 阅读理解
 * ============================================================ */
(function () {
  'use strict';
  var C = window.Core;
  var LEVELS = { 1: '入门', 2: '进阶', 3: '挑战' };
  var showTrans = false;

  /* ---------- 文章列表 ---------- */
  function viewArticles() {
    var done = 0;
    var html = '<div class="sec-title">今日时文 (' + window.ARTICLES.length + ' 篇)</div>';
    window.ARTICLES.forEach(function (a) {
      var rec = C.state.read[a.id];
      if (rec) done++;
      var badges = '<span class="badge" style="background:#EDF3FF;color:#4A7DFF">Lv.' + a.level + ' ' + LEVELS[a.level] + '</span>' +
        (rec ? '<span class="badge read">已读</span>' : '') +
        (rec && rec.quiz != null ? '<span class="badge done-score">答题 ' + rec.quiz + '/' + rec.total + '</span>' : '');
      html += '<button class="art-item" data-art="' + a.id + '">' +
        '<div class="art-cover" style="background:' + a.color + '">' + a.emoji + '</div>' +
        '<div class="grow">' +
          '<div class="a-title">' + esc(a.title) + '</div>' +
          '<div class="a-sub">' + esc(a.cn) + '</div>' +
          '<div class="mt8">' + badges + '</div>' +
        '</div>' +
      '</button>';
    });
    var total = window.ARTICLES.length;
    C.$('#view').innerHTML =
      '<div class="hero"><h2>📰 时文阅读</h2>' +
        '<p class="muted">点不认识的词,马上查意思、听发音;读完做 3 道小题,检验理解。</p>' +
        '<div class="row mt8"><div class="bar blue grow"><i style="width:' + (total ? done / total * 100 : 0) + '%"></i></div><b>' + done + '/' + total + ' 篇</b></div>' +
      '</div>' + html;
    C.$$('[data-art]').forEach(function (el) {
      el.onclick = function () { openArticle(el.getAttribute('data-art')); };
    });
  }

  /* ---------- 阅读页 ---------- */
  function openArticle(id) {
    var a = window.ARTICLES.find(function (x) { return x.id === id; });
    if (!a) return;
    renderArticle(a);
  }
  function renderArticle(a) {
    var parasHtml = a.paras.map(function (p, i) {
      return '<p class="para" data-p="' + i + '">' + C.wrapWords(p.en) + '</p>' +
        '<div class="para-trans" data-trans="' + i + '" ' + (showTrans ? '' : 'hidden') + '>' + esc(p.cn) + '</div>';
    }).join('');

    C.$('#view').innerHTML =
      '<div class="art-header">' +
        '<div style="font-size:40px">' + a.emoji + '</div>' +
        '<h2>' + esc(a.title) + '</h2>' +
        '<div class="cn">' + esc(a.cn) + ' · ' + LEVELS[a.level] + '级</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="sec-title" style="margin-top:0">生词预告</div>' +
        '<div class="word-chips">' +
          a.newWords.map(function (nw) {
            return '<button class="chip" data-nw="' + esc(nw.w) + '">🔊 ' + esc(nw.w) + ' <small>' + esc(nw.m) + '</small></button>';
          }).join('') +
        '</div>' +
        parasHtml +
        '<div class="row row-wrap mt16">' +
          '<button class="btn btn-ghost btn-sm grow" id="toggleTrans">🀄 ' + (showTrans ? '隐藏' : '显示') + '全文翻译</button>' +
          '<button class="btn btn-ghost btn-sm grow" id="readAloud">🔊 朗读全文</button>' +
        '</div>' +
      '</div>' +
      '<div class="sec-title">阅读理解</div>' +
      '<div class="card">' +
        a.quiz.map(function (q, qi) {
          return '<div class="quiz-q" style="text-align:left;font-size:16px;margin:14px 0 10px">' + (qi + 1) + '. ' + esc(q.q) + '</div>' +
            '<div class="opts" data-q="' + qi + '">' +
              q.opts.map(function (o, oi) {
                return '<button class="opt" data-oi="' + oi + '"><span class="opt-tag">' + 'ABC'[oi] + '</span>' + esc(o) + '</button>';
              }).join('') +
            '</div>';
        }).join('') +
        '<div id="quizDone" class="mt16" hidden></div>' +
      '</div>';

    // 生词 chips:发音 + 高亮
    C.$$('[data-nw]').forEach(function (el) {
      el.onclick = function () {
        var w = el.getAttribute('data-nw');
        C.speak(w);
        el.classList.add('hit');
      };
    });
    // 段落朗读
    C.$$('[data-p]').forEach(function (p) {
      p.ondblclick = function () { C.speak(a.paras[+p.getAttribute('data-p')].en); };
    });
    // 点词查义
    C.$$('.para .w').forEach(function (el) {
      el.onclick = function () {
        var word = el.getAttribute('data-word');
        var item = C.lookupWord(word);
        C.speak(item.w);
        var html = '<div class="center"><div class="lookup-word">' + esc(item.w) + '</div>' +
          '<div class="muted mt8">' + esc(item.p || '') + '</div>' +
          '<div class="lookup-mean">' + esc(item.m) + '</div>' +
          (item.s ? '<div class="example">' + esc(item.s) + '</div>' : '') +
          '<div class="row mt16">' +
            '<button class="btn btn-ghost grow" id="lkSay">🔊 再听一次</button>' +
            '<button class="btn btn-primary grow" id="lkClose">好的</button>' +
          '</div></div>';
        C.openSheet(html);
        $('#lkSay').onclick = function () { C.speak(item.w); };
        $('#lkClose').onclick = C.closeSheet;
      };
    });
    $('#toggleTrans').onclick = function () {
      showTrans = !showTrans;
      C.$$('[data-trans]').forEach(function (t) { t.hidden = !showTrans; });
      $('#toggleTrans').textContent = '🀄 ' + (showTrans ? '隐藏' : '显示') + '全文翻译';
    };
    $('#readAloud').onclick = function () {
      if (C.ttsReady) C.speak(a.paras.map(function (p) { return p.en; }).join(' '));
      else C.toast('当前浏览器不支持语音朗读');
    };

    // 阅读理解(每题即时判分)
    var answered = {};
    a.quiz.forEach(function (q, qi) {
      var wrap = C.$('[data-q="' + qi + '"]');
      C.$$('.opt', wrap).forEach(function (btn) {
        btn.onclick = function () {
          if (answered[qi] !== undefined) return;
          var pick = parseInt(btn.getAttribute('data-oi'), 10);
          answered[qi] = pick;
          C.$$('.opt', wrap).forEach(function (b) { b.disabled = true; });
          btn.classList.add(pick === q.a ? 'correct' : 'wrong');
          if (pick !== q.a) C.$$('.opt', wrap)[q.a].classList.add('correct');
          checkAllDone();
        };
      });
    });
    function checkAllDone() {
      var answeredCount = a.quiz.filter(function (q, qi) { return answered[qi] !== undefined; }).length;
      if (answeredCount < a.quiz.length) return;
      var right = a.quiz.filter(function (q, qi) { return answered[qi] === q.a; }).length;
      var rec = C.state.read[a.id] || { ts: 0 };
      var first = rec.quiz == null;
      if (first || right > rec.quiz) { rec.quiz = right; rec.total = a.quiz.length; }
      rec.ts = Date.now();
      C.state.read[a.id] = rec;
      if (first) C.bumpDaily('read', 1);
      C.save();
      var box = $('#quizDone');
      box.hidden = false;
      var msg = right === a.quiz.length ? '🎉 全对!阅读小达人!' : right >= a.quiz.length - 1 ? '👍 不错哦,再仔细读一读!' : '📖 建议再读一遍文章,点一点生词';
      box.innerHTML = '<div class="center" style="background:#FBF5EC;border-radius:14px;padding:14px">' +
        '<b style="font-size:18px">答题结果:' + right + '/' + a.quiz.length + '</b><div class="mt8 muted">' + msg + '</div>' +
        '<div class="row mt16"><button class="btn btn-blue btn-sm grow" id="againQuiz">再做一次</button>' +
        '<button class="btn btn-ghost btn-sm grow" id="backList">返回列表</button></div></div>';
      $('#backList').onclick = viewArticles;
      $('#againQuiz').onclick = function () {
        delete C.state.read[a.id].quiz;
        C.save();
        renderArticle(a);
      };
      C.toast('完成阅读 +' + (first ? 1 : 0) + ' 篇打卡!');
    }
  }

  window.Reading = { viewArticles: viewArticles, openArticle: openArticle };
})();
