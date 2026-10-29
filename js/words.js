/* ============================================================
 * 背单词模块:词书列表 / 学新词 / 复习 / 测试 / 拼写 / 生词本
 * ============================================================ */
(function () {
  'use strict';
  var C = window.Core;

  function currentBook() {
    return window.WORD_BOOKS.find(function (b) { return b.id === C.state.bookId; }) || window.WORD_BOOKS[0];
  }
  /* ---- 单元支持:词表带 u 字段(单元号)、k 字段(重点词) ---- */
  function unitMax(book) {
    var m = 0;
    book.words.forEach(function (x) { if (x.u && x.u > m) m = x.u; });
    return m;
  }
  function hasUnits(book) { return unitMax(book) > 0; }
  function getUnitSel(bookId) {
    return (C.state.unitSel || {})[bookId] || 0;
  }
  function setUnitSel(bookId, u) {
    C.state.unitSel = C.state.unitSel || {};
    C.state.unitSel[bookId] = u;
    C.save();
  }
  function filteredWords(book) {
    var sel = getUnitSel(book.id);
    if (!sel) return book.words;
    return book.words.filter(function (x) { return x.u === sel; });
  }
  function badgeHtml(item) {
    var b = '';
    if (item.u) b += '<span class="badge-u">Unit ' + item.u + '</span>';
    if (item.k) b += '<span class="badge-k">⭐重点</span>';
    return b ? '<div class="card-badges">' + b + '</div>' : '';
  }
  function isLearned(w) { return !!C.state.learned[w]; }
  function learnedCount(book) {
    return book.words.filter(function (x) { return isLearned(x.w); }).length;
  }
  function markLearned(word, fam) {
    C.state.learned[word] = { fam: fam, ts: Date.now() };
    if (fam <= 2) C.state.wrong[word] = Date.now();
    else delete C.state.wrong[word];
    C.bumpDaily('learn', 1);
  }
  function reviewPool() {
    var pool = [];
    window.WORD_BOOKS.forEach(function (b) {
      b.words.forEach(function (x) {
        var st = C.state.learned[x.w];
        if (st && st.fam < 5) pool.push(x);
        if (C.state.wrong[x.w]) pool.push(x);
      });
    });
    // 去重
    var seen = {}, out = [];
    pool.forEach(function (x) { if (!seen[x.w]) { seen[x.w] = 1; out.push(x); } });
    return out;
  }

  /* ---------- 词书列表 ---------- */
  function viewBooks() {
    var html = '<div class="sec-title">选择词书</div>';
    window.WORD_BOOKS.forEach(function (b) {
      var n = learnedCount(b), total = b.words.length, pct = total ? Math.round(n / total * 100) : 0;
      html += '<button class="book-item" data-book="' + b.id + '">' +
        '<div class="book-emoji" style="background:' + b.color + '">' + b.emoji + '</div>' +
        '<div class="grow">' +
          '<div class="b-name">' + esc(b.name) + (C.state.bookId === b.id ? ' <span class="badge read">使用中</span>' : '') + '</div>' +
          '<div class="b-sub">' + esc(b.desc) + ' · ' + total + ' 词</div>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '</div>' +
        '<div class="muted" style="font-weight:700">' + pct + '%</div>' +
      '</button>';
    });
    C.$('#view').innerHTML = html;
    C.$$('[data-book]').forEach(function (el) {
      el.onclick = function () {
        C.state.bookId = el.getAttribute('data-book');
        C.save();
        C.toast('已切换到「' + currentBook().name + '」');
        viewBooks();
      };
    });
  }

  /* ---------- 生词本 ---------- */
  function viewWrong() {
    var keys = Object.keys(C.state.wrong).sort(function (a, b) { return C.state.wrong[b] - C.state.wrong[a]; });
    var html = '<div class="sec-title">生词本 (' + keys.length + ')</div>';
    if (!keys.length) {
      html += '<div class="card center muted" style="padding:40px 20px">🎉 生词本是空的!<br>测试和拼写时答错的词会自动收进来。</div>';
    } else {
      html += '<div class="card">';
      keys.forEach(function (w) {
        var item = C.lookupWord(w) || {};
        html += '<div class="wrong-item">' +
          '<span class="w">' + esc(w) + '</span>' +
          '<span class="m">' + esc(item.m || '') + '</span>' +
          '<button class="mini-speak" data-say="' + esc(w) + '">🔊</button>' +
          '<button class="mini-speak" data-del="' + esc(w) + '" style="background:#FDEEEA">✕</button>' +
        '</div>';
      });
      html += '</div>';
    }
    html += '<button class="btn btn-primary btn-block" id="wrongQuiz">开始生词小测试</button>';
    C.$('#view').innerHTML = html;
    C.$$('[data-say]').forEach(function (el) { el.onclick = function () { C.speak(el.getAttribute('data-say')); }; });
    C.$$('[data-del]').forEach(function (el) {
      el.onclick = function () {
        delete C.state.wrong[el.getAttribute('data-del')];
        C.save(); C.toast('已移出生词本'); viewWrong();
      };
    });
    $('#wrongQuiz') && ($('#wrongQuiz').onclick = function () {
      var pool = keys.map(function (w) { return C.lookupWord(w); }).filter(Boolean);
      if (pool.length >= 2) startQuiz(pool, '生词测试');
      else C.toast('生词太少啦,至少要有 2 个');
    });
  }

  /* ---------- 学新词(卡片流) ---------- */
  var study = null;
  function startStudy() {
    var book = currentBook();
    var list = filteredWords(book).filter(function (x) { return !isLearned(x.w); });
    if (!list.length) {
      C.toast(hasUnits(book) && getUnitSel(book.id)
        ? '本单元单词已全部学完,换个单元试试!'
        : '本书单词已全部学完,去复习或测试吧!');
      return;
    }
    study = { list: C.shuffle(list).slice(0, 10), idx: 0 };
    renderStudyCard();
  }
  function renderStudyCard() {
    var book = currentBook();
    if (study.idx >= study.list.length) {
      C.$('#view').innerHTML =
        '<div class="card center" style="padding:40px 20px">' +
          '<div style="font-size:52px">🏆</div>' +
          '<h2>学完 ' + study.list.length + ' 个新词!</h2>' +
          '<p class="muted mt8">坚持每天学一点,你就是单词小学霸</p>' +
          '<button class="btn btn-primary btn-block mt16" id="again">再学 10 个</button>' +
          '<button class="btn btn-ghost btn-block mt8" id="toQuiz">马上测试一下</button>' +
        '</div>';
      $('#again').onclick = startStudy;
      $('#toQuiz').onclick = function () { startQuiz(currentBook().words, '新词测试'); };
      return;
    }
    var it = study.list[study.idx];
    var html = '<div class="card-stage">' +
      '<span class="card-count">' + book.name + (it.u ? ' · Unit ' + it.u : '') + ' · ' + (study.idx + 1) + '/' + study.list.length + '</span>' +
      badgeHtml(it) +
      '<div class="big-word">' + esc(it.w) + '</div>' +
      '<div class="big-phon">' + esc(it.p) + '</div>' +
      '<button class="speak-btn" id="sayWord">🔊 听发音</button>' +
      '<div class="big-mean">' + esc(it.m) + '</div>' +
      '<div class="example">' + esc(it.s) + '</div>' +
      '<div class="judge-row">' +
        '<button class="btn btn-light" id="knowNo">😵 有点难</button>' +
        '<button class="btn btn-green" id="knowYes">😀 记住了</button>' +
      '</div>' +
    '</div>' +
    '<button class="btn btn-ghost btn-block mt8" id="exitStudy">结束学习</button>';
    C.$('#view').innerHTML = html;
    if (C.state.settings.autoSpeak) C.speak(it.w);
    $('#sayWord').onclick = function () { C.speak(it.w); };
    $('#knowYes').onclick = function () { markLearned(it.w, 5); next(); };
    $('#knowNo').onclick = function () { markLearned(it.w, 1); next(); };
    $('#exitStudy').onclick = function () { study = null; viewBooks(); };
    function next() { study.idx++; C.save(); renderStudyCard(); }
  }

  /* ---------- 复习(以熟度驱动) ---------- */
  var review = null;
  function startReview() {
    var pool = reviewPool();
    if (!pool.length) { C.toast('暂时没有需要复习的词,先去学新词吧!'); return; }
    review = { list: C.shuffle(pool).slice(0, 12), idx: 0 };
    renderReviewCard();
  }
  function renderReviewCard() {
    if (review.idx >= review.list.length) {
      C.$('#view').innerHTML =
        '<div class="card center" style="padding:40px 20px">' +
          '<div style="font-size:52px">🌟</div>' +
          '<h2>复习完成!</h2>' +
          '<p class="muted mt8">本轮共复习 ' + review.list.length + ' 个单词</p>' +
          '<button class="btn btn-blue btn-block mt16" id="revAgain">再复习一轮</button>' +
        '</div>';
      $('#revAgain').onclick = startReview;
      return;
    }
    var it = review.list[review.idx];
    var html = '<div class="card-stage">' +
      '<span class="card-count">复习 · ' + (review.idx + 1) + '/' + review.list.length + '</span>' +
      badgeHtml(it) +
      '<div class="big-word">' + esc(it.w) + '</div>' +
      '<div class="big-phon">' + esc(it.p) + '</div>' +
      '<button class="speak-btn" id="sayWord">🔊 听发音</button>' +
      '<div class="big-mean">' + esc(it.m) + '</div>' +
      '<div class="example">' + esc(it.s) + '</div>' +
      '<div class="judge-row">' +
        '<button class="btn btn-light" id="fuzzy">🤔 模糊</button>' +
        '<button class="btn btn-green" id="solid">💪 记牢了</button>' +
      '</div>' +
    '</div>';
    C.$('#view').innerHTML = html;
    if (C.state.settings.autoSpeak) C.speak(it.w);
    $('#sayWord').onclick = function () { C.speak(it.w); };
    $('#solid').onclick = function () {
      var st = C.state.learned[it.w] || { fam: 3, ts: 0 };
      st.fam = Math.min(5, st.fam + 2); st.ts = Date.now();
      C.state.learned[it.w] = st; delete C.state.wrong[it.w];
      C.bumpDaily('review'); C.save(); review.idx++; renderReviewCard();
    };
    $('#fuzzy').onclick = function () {
      var st = C.state.learned[it.w] || { fam: 3, ts: 0 };
      st.fam = 1; st.ts = Date.now();
      C.state.learned[it.w] = st; C.state.wrong[it.w] = Date.now();
      C.bumpDaily('review'); C.save(); review.idx++; renderReviewCard();
    };
  }

  /* ---------- 选择测试 ---------- */
  var quiz = null;
  function startQuiz(pool, label) {
    var items = C.shuffle(pool).slice(0, 10);
    if (items.length < 2) { C.toast('单词太少,先去学新词吧'); return; }
    quiz = { label: label || '单词测试', list: items, idx: 0, right: 0, wrongWords: [] };
    renderQuiz();
  }
  function renderQuiz() {
    if (quiz.idx >= quiz.list.length) return renderQuizResult();
    var it = quiz.list[quiz.idx];
    var enToCn = Math.random() < 0.5;
    var allPool = [];
    window.WORD_BOOKS.forEach(function (b) { allPool = allPool.concat(b.words); });
    // 干扰项:随机抽 3 个,保证与答案不重复、显示文本不重复
    var shuffledPool = C.shuffle(allPool);
    var distractors = [];
    for (var k = 0; k < shuffledPool.length && distractors.length < 3; k++) {
      var cand = shuffledPool[k];
      var sameAsAnswer = (cand.w === it.w) || (!enToCn && cand.m === it.m) || (enToCn && cand.m === it.m);
      var dupInList = distractors.some(function (d) { return d.m === cand.m; });
      if (!sameAsAnswer && !dupInList) distractors.push(cand);
    }
    while (distractors.length < 3) distractors.push({ w: '—', p: '', m: '(无)' });
    var opts = C.shuffle([it].concat(distractors));
    quiz.answerIdx = opts.indexOf(it);
    quiz.enToCn = enToCn;

    var qHtml = enToCn
      ? '<span class="mini">选出正确的中文意思</span>' + esc(it.w) + ' <small class="muted">' + esc(it.p) + '</small>'
      : '<span class="mini">选出对应的英文单词</span>' + esc(it.m);
    var html = '<span class="card-count" style="position:static;display:inline-block;margin-bottom:10px">' + esc(quiz.label) + ' · ' + (quiz.idx + 1) + '/' + quiz.list.length + '</span>' +
      '<div class="card-stage" style="min-height:auto;padding:24px 18px">' +
        '<div class="quiz-q">' + qHtml + '</div>' +
        '<div class="opts">' +
          opts.map(function (o, i) {
            return '<button class="opt" data-i="' + i + '"><span class="opt-tag">' + 'ABCD'[i] + '</span>' +
              (enToCn ? esc(o.m) : '<b>' + esc(o.w) + '</b> <span class="muted">' + esc(o.p) + '</span>') + '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    C.$('#view').innerHTML = html;
    if (enToCn && C.state.settings.autoSpeak) C.speak(it.w);
    C.$$('.opt').forEach(function (el) {
      el.onclick = function () { answer(parseInt(el.getAttribute('data-i'), 10), opts); };
    });
  }
  function answer(i, opts) {
    var btns = C.$$('.opt');
    btns.forEach(function (b) { b.disabled = true; });
    var it = quiz.list[quiz.idx];
    if (i === quiz.answerIdx) {
      btns[i].classList.add('correct');
      quiz.right++;
      C.speak(it.w);
      var st = C.state.learned[it.w] || { fam: 0, ts: 0 };
      st.fam = Math.min(5, st.fam + 1); st.ts = Date.now(); C.state.learned[it.w] = st;
      delete C.state.wrong[it.w];
    } else {
      btns[i].classList.add('wrong');
      btns[quiz.answerIdx].classList.add('correct');
      C.state.wrong[it.w] = Date.now();
      if (C.state.learned[it.w]) C.state.learned[it.w].fam = 1;
      quiz.wrongWords.push(it.w);
    }
    C.bumpDaily('quiz'); C.save();
    setTimeout(function () { quiz.idx++; renderQuiz(); }, 750);
  }
  function renderQuizResult() {
    var n = quiz.list.length, r = quiz.right, pct = Math.round(r / n * 100);
    var face = pct >= 90 ? '🥇' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚';
    var ringColor = pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--primary)' : 'var(--red)';
    var html = '<div class="card center" style="padding:30px 20px">' +
      '<div style="font-size:44px">' + face + '</div>' +
      '<div class="result-ring" style="background:' + ringColor + '"><b>' + r + '/' + n + '</b><span>正确率 ' + pct + '%</span></div>' +
      (quiz.wrongWords.length
        ? '<div class="card mt16" style="box-shadow:none;background:#FBF5EC;text-align:left">' +
          '<b>答错的词已放入生词本:</b><br>' +
          quiz.wrongWords.map(function (w) { return '· ' + esc(w); }).join('<br>') + '</div>'
        : '<p class="muted mt8">全对!太厉害啦!</p>') +
      '<button class="btn btn-primary btn-block mt16" id="quizAgain">再来一轮</button>' +
      '<button class="btn btn-ghost btn-block mt8" id="quizBack">返回</button>' +
    '</div>';
    C.$('#view').innerHTML = html;
    $('#quizAgain').onclick = function () { startQuiz(currentBook().words, quiz.label); };
    $('#quizBack').onclick = function () { viewBooks(); };
    quiz = null;
  }

  /* ---------- 拼写模式 ---------- */
  var spell = null;
  function startSpell() {
    var book = currentBook();
    var list = filteredWords(book).filter(function (x) { return isLearned(x.w); });
    if (list.length < 3) { C.toast('先在卡片里学几个新词,再来拼写挑战!'); return; }
    spell = { list: C.shuffle(list).slice(0, 10), idx: 0, right: 0 };
    renderSpell();
  }
  function renderSpell() {
    if (spell.idx >= spell.list.length) {
      var n = spell.list.length, pct = Math.round(spell.right / n * 100);
      C.$('#view').innerHTML =
        '<div class="card center" style="padding:40px 20px">' +
          '<div style="font-size:52px">' + (pct >= 80 ? '✍️✨' : '✍️') + '</div>' +
          '<h2>拼写得分 ' + spell.right + '/' + n + '</h2>' +
          '<p class="muted mt8">多拼多写,单词记得更牢</p>' +
          '<button class="btn btn-purple btn-block mt16" id="spAgain">再来一轮</button>' +
        '</div>';
      $('#spAgain').onclick = startSpell;
      return;
    }
    var it = spell.list[spell.idx];
    C.$('#view').innerHTML =
      '<span class="card-count" style="position:static;display:inline-block;margin-bottom:10px">拼写挑战 · ' + (spell.idx + 1) + '/' + spell.list.length + '</span>' +
      '<div class="card-stage" style="min-height:auto;padding:26px 18px">' +
        '<div class="muted">听发音,拼出这个单词</div>' +
        '<div class="big-mean" style="margin-top:12px">' + esc(it.m) + '</div>' +
        '<button class="speak-btn" id="sayWord">🔊 再听一次</button>' +
        '<input id="spellInput" class="spell-input mt16" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="在这里拼写…">' +
        '<div id="spellFb" class="mt8" style="min-height:24px;font-weight:700"></div>' +
        '<button class="btn btn-purple btn-block mt8" id="spellCheck">检查答案</button>' +
      '</div>';
    $('#sayWord').onclick = function () { C.speak(it.w); };
    if (C.state.settings.autoSpeak) C.speak(it.w);
    var input = $('#spellInput');
    input.focus();
    input.onkeydown = function (e) { if (e.key === 'Enter') check(); };
    $('#spellCheck').onclick = check;
    function check() {
      var val = (input.value || '').trim().toLowerCase();
      if (!val) { C.toast('先拼一下再检查哦'); return; }
      var fb = $('#spellFb');
      C.bumpDaily('spell'); C.save();
      if (val === it.w.toLowerCase()) {
        fb.textContent = '✅ 拼对啦!'; fb.style.color = 'var(--green)';
        spell.right++;
        C.speak(it.w);
        var st = C.state.learned[it.w] || { fam: 3, ts: 0 };
        st.fam = Math.min(5, st.fam + 1); C.state.learned[it.w] = st;
        delete C.state.wrong[it.w]; C.save();
        setTimeout(function () { spell.idx++; renderSpell(); }, 700);
      } else {
        fb.innerHTML = '❌ 正确拼写:<b style="font-size:20px">' + esc(it.w) + '</b>';
        fb.style.color = 'var(--red)';
        C.state.wrong[it.w] = Date.now(); C.save();
        input.disabled = true; $('#spellCheck').disabled = true;
        var nxt = document.createElement('button');
        nxt.className = 'btn btn-primary btn-block mt8';
        nxt.textContent = '下一个 →';
        nxt.onclick = function () { spell.idx++; renderSpell(); };
        $('#spellCheck').after(nxt);
      }
    }
  }

  /* ---------- 背单词 Tab 入口 ---------- */
  function viewWords() {
    var book = currentBook();
    var n = learnedCount(book), total = book.words.length;
    var pct = total ? Math.round(n / total * 100) : 0;
    var reviewN = reviewPool().length;
    var sel = getUnitSel(book.id);
    var inScope = filteredWords(book);
    var newInScope = inScope.filter(function (x) { return !isLearned(x.w); }).length;

    var unitsHtml = '';
    if (hasUnits(book)) {
      var um = unitMax(book);
      unitsHtml = '<div class="unit-chips" id="unitChips"><button class="uchip' + (sel === 0 ? ' on' : '') + '" data-u="0">全部 ' + n + '/' + total + '</button>';
      for (var ui = 1; ui <= um; ui++) {
        var cntU = 0, learnedU = 0;
        book.words.forEach(function (x) { if (x.u === ui) { cntU++; if (isLearned(x.w)) learnedU++; } });
        unitsHtml += '<button class="uchip' + (sel === ui ? ' on' : '') + '" data-u="' + ui + '">Unit ' + ui + ' · ' + learnedU + '/' + cntU + '</button>';
      }
      unitsHtml += '</div>';
    }

    C.$('#view').innerHTML =
      '<div class="hero">' +
        '<h2>' + book.emoji + ' ' + esc(book.name) + '</h2>' +
        '<p class="muted">' + esc(book.desc) + '</p>' +
        '<div class="row mt8"><div class="bar grow"><i style="width:' + pct + '%"></i></div><b>' + n + '/' + total + '</b></div>' +
        '<p class="muted mt8">已掌握 ' + pct + '% · 待复习 ' + reviewN + ' 词 · <span class="badge-k">⭐重点</span>=教材黑体词</p>' +
      '</div>' +
      unitsHtml +
      '<div class="quick-grid">' +
        '<button class="quick-item" id="goStudy" style="background:linear-gradient(135deg,#FFB25A,#FF8A3D)">' +
          '<span class="q-ico">📖</span><span class="q-t">学新词</span><span class="q-s">' + (sel ? '本单元 ' : '') + '还有 ' + newInScope + ' 个</span></button>' +
        '<button class="quick-item" id="goReview" style="background:linear-gradient(135deg,#6FB9FF,#4EA8FF)">' +
          '<span class="q-ico">🔄</span><span class="q-t">去复习</span><span class="q-s">记住 ' + reviewN + ' 个待复习</span></button>' +
        '<button class="quick-item" id="goQuiz" style="background:linear-gradient(135deg,#6FCE9B,#4CB880)">' +
          '<span class="q-ico">🎯</span><span class="q-t">选一选</span><span class="q-s">' + (sel ? 'Unit ' + sel + ' ' : '') + '10 道选择题</span></button>' +
        '<button class="quick-item" id="goSpell" style="background:linear-gradient(135deg,#B39CFF,#9B7BFF)">' +
          '<span class="q-ico">✍️</span><span class="q-t">拼一拼</span><span class="q-s">听音拼写挑战</span></button>' +
      '</div>' +
      '<div class="mt16"></div>' +
      '<button class="book-item" id="goBooks"><div class="book-emoji" style="background:#F4A261">📚</div>' +
        '<div class="grow"><div class="b-name">切换词书 / 查看进度</div><div class="b-sub">人教版 PEP 3~6 年级共 8 册</div></div>' +
        '<span class="muted">›</span></button>' +
      '<button class="book-item" id="goWrong"><div class="book-emoji" style="background:#E76F51">⭐</div>' +
        '<div class="grow"><div class="b-name">我的生词本</div><div class="b-sub">' + Object.keys(C.state.wrong).length + ' 个词需要多看几眼</div></div>' +
        '<span class="muted">›</span></button>';
    C.$$('[data-u]').forEach(function (el) {
      el.onclick = function () {
        setUnitSel(book.id, parseInt(el.getAttribute('data-u'), 10) || 0);
        viewWords();
      };
    });
    $('#goStudy').onclick = startStudy;
    $('#goReview').onclick = startReview;
    $('#goQuiz').onclick = function () { startQuiz(inScope, '单词测试' + (sel ? ' · Unit ' + sel : '')); };
    $('#goSpell').onclick = startSpell;
    $('#goBooks').onclick = viewBooks;
    $('#goWrong').onclick = viewWrong;
  }

  window.Words = {
    viewWords: viewWords, viewBooks: viewBooks, viewWrong: viewWrong,
    startStudy: startStudy, startReview: startReview, startQuiz: startQuiz, startSpell: startSpell,
    currentBook: currentBook, learnedCount: learnedCount, reviewPool: reviewPool
  };
})();
