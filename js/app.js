(function () {
  'use strict';

  const setupView = document.querySelector('#view-setup');
  if (!setupView) return;

  const $ = window.KanjiUtils.$;
  const $$ = window.KanjiUtils.$$;
  const normalizeAnswer = window.KanjiUtils.normalizeAnswer;
  const parseVocabularyCsv = window.KanjiUtils.parseVocabularyCsv;
  const shuffled = window.KanjiUtils.shuffled;
  const toHiragana = window.KanjiUtils.toHiragana;
  const activityStore = window.KanjiStorage.activity;
  const reviewStore = window.KanjiStorage.review;
  const preferences = window.KanjiPreferences;
  const icons = window.KanjiIcons;
  function t(source, variables) {
    return preferences.t(source, variables);
  }
  /* Bộ từ mặc định nếu chưa nạp file. */
  const SAMPLE_WORDS = [
    { kanji: '水', hiragana: 'みず' },
    { kanji: '山', hiragana: 'やま' },
    { kanji: '学校', hiragana: 'がっこう' },
    { kanji: '時間', hiragana: 'じかん' },
    { kanji: '先生', hiragana: 'せんせい' },
    { kanji: '日本', hiragana: 'にほん' },
    { kanji: '約束', hiragana: 'やくそく' },
    { kanji: '勉強', hiragana: 'べんきょう' },
    { kanji: '友達', hiragana: 'ともだち' },
    { kanji: '電車', hiragana: 'でんしゃ' },
    { kanji: '天気', hiragana: 'てんき' },
    { kanji: '図書館', hiragana: 'としょかん' },
  ];

  const DIFFICULTIES = {
    easy: { label: 'Dễ', fallSeconds: 24 },
    normal: { label: 'Vừa', fallSeconds: 16 },
    hard: { label: 'Khó', fallSeconds: 11 },
  };
  const BASE_SHORT_SIDE = 1080;
  const BASE_LONG_SIDE = 1920;
  const MIN_OBJECT_SCALE = .7;

  const MODES = {
    study: { label: 'Study' },
    challenge: { label: 'Challenge' },
    endless: { label: 'Endless' },
  };

  /* Gom trạng thái màn hình với điểm số ở đây cho dễ tìm. */
  const state = {
    view: 'setup',
    words: SAMPLE_WORDS.slice(),
    difficulty: 'normal',
    mode: 'study',
    challengeHp: 3,
    endlessHasHp: false,
    endlessHp: 3,
    status: 'ready',
    hp: null,
    score: 0,
    combo: 0,
    remaining: SAMPLE_WORDS.length,
    activeCount: 0,
    answerState: 'idle',
    feedbackTimer: null,
    composing: false,
    review: reviewStore.load(),
  };

  /* Trạng thái Canvas: mục tiêu, hàng đợi sinh từ, hiệu ứng và thời gian khung hình. */
  const game = {
    enemies: [],
    queue: [],
    particles: [],
    lasers: [],
    targetId: null,
    nextId: 1,
    spawnTimer: 0,
    config: { mode: 'study', hasHp: false, maxHp: 3, source: SAMPLE_WORDS.slice() },
    size: { width: 0, height: 0 },
    objectScale: 1,
    previousTime: performance.now(),
  };

  /* Lấy sẵn các phần tử cần dùng. */
  const elements = {
    fileInput: $('#csv-input'),
    sourceLabel: $('#source-label'),
    sourceNotice: $('#source-notice'),
    hpCard: $('#hp-card'),
    hpNote: $('#hp-note'),
    hpToggle: $('#hp-toggle'),
    hpCounter: $('#hp-counter'),
    hpValue: $('#hp-value'),
    summaryWords: $('#summary-words'),
    summaryMode: $('#summary-mode'),
    summarySpeed: $('#summary-speed'),
    summaryHp: $('#summary-hp'),
    navPlay: $('#nav-play'),
    reviewBadge: $('#review-badge'),
    gameMode: $('#game-mode'),
    gameHp: $('#game-hp'),
    gameScore: $('#game-score'),
    gameCombo: $('#game-combo'),
    gameRemaining: $('#game-remaining'),
    sectorLabel: $('#sector-label'),
    canvas: $('#game-canvas'),
    overlay: $('#game-overlay'),
    overlayIcon: $('#overlay-icon'),
    overlayEyebrow: $('#overlay-eyebrow'),
    overlayTitle: $('#overlay-title'),
    overlayCopy: $('#overlay-copy'),
    overlayPrimary: $('#overlay-primary'),
    overlayReview: $('#overlay-review'),
    pauseButton: $('#pause-button'),
    targetLabel: $('#target-label'),
    feedback: $('#feedback'),
    inputDock: $('#answer-form'),
    answerInput: $('#answer-input'),
    answerPreview: $('#answer-preview'),
    answerSubmit: $('#answer-submit'),
    cycleButton: $('#cycle-button'),
    reviewContent: $('#review-content'),
    reviewActions: $('#review-actions'),
  };

  const context = elements.canvas.getContext('2d');

  /* Tiện ích dựng icon và nhãn bằng DOM để dùng thống nhất trên các nút. */
  function createIcon(name) {
    return icons.create(name);
  }

  function setIconName(icon, name) {
    icons.setName(icon, name);
  }

  function setIconText(element, iconName, text) {
    const label = document.createElement('span');
    label.textContent = text;
    element.replaceChildren(createIcon(iconName), label);
  }

  function setButtonContent(button, iconName, text, iconAfter) {
    const icon = createIcon(iconName);
    const label = document.createElement('span');
    label.textContent = text;
    if (iconAfter) button.replaceChildren(label, icon);
    else button.replaceChildren(icon, label);
  }

  /* Cho con trỏ vào ô nhập, điện thoại bị bật bàn phím hơi sớm, để xem lại. */
  function focusAnswerOnDesktop(delay) {
    // Trên điện thoại còn tự bật bàn phím khi chuyển màn, cần xem lại.
    setTimeout(function () { elements.answerInput.focus(); }, delay);
  }

  /* Ghi danh sách cần ôn qua lớp lưu trữ đang gắn với người dùng hiện tại. */
  function saveReview() {
    reviewStore.save(state.review);
  }

  /* Đồng bộ lựa chọn chế độ, HP và phần tóm tắt trước khi bắt đầu nhiệm vụ. */
  function updateSetup() {
    const showHp = state.mode === 'challenge' || state.mode === 'endless';
    elements.hpCard.classList.toggle('setup-card--hidden', !showHp);
    elements.hpToggle.classList.toggle('hp-toggle--hidden', state.mode !== 'endless');
    elements.hpToggle.classList.toggle('hp-toggle--active', state.endlessHasHp);
    elements.hpToggle.setAttribute('aria-pressed', String(state.endlessHasHp));
    elements.hpToggle.querySelector('b').textContent = t(state.endlessHasHp ? 'Có HP' : 'Không HP');
    elements.hpNote.textContent = t(state.mode === 'challenge' ? 'Challenge luôn sử dụng HP.' : 'Endless có thể chơi tự do hoặc dùng HP.');
    elements.hpCounter.classList.toggle('hp-counter--hidden', state.mode === 'endless' && !state.endlessHasHp);
    const hpValue = state.mode === 'challenge' ? state.challengeHp : state.endlessHp;
    elements.hpValue.textContent = hpValue;
    elements.summaryWords.textContent = t('{count} từ', { count: state.words.length });
    elements.summaryMode.textContent = MODES[state.mode].label;
    const difficulty = DIFFICULTIES[state.difficulty];
    elements.summarySpeed.textContent = t(difficulty.label) + ' · ' + t('{seconds} giây', { seconds: difficulty.fallSeconds });
    elements.summaryHp.textContent = state.mode === 'study' || (state.mode === 'endless' && !state.endlessHasHp) ? t('Không giới hạn') : String(hpValue);
  }

  /* Cập nhật HUD, trạng thái ô nhập và lớp phủ theo tiến độ phiên chơi. */
  function updateGameStatus() {
    const modeLabel = MODES[game.config.mode].label;
    elements.gameMode.textContent = modeLabel;
    elements.sectorLabel.textContent = 'Airspace 01 · ' + modeLabel + ' sector';
    elements.gameHp.classList.toggle('game-status__hp--unlimited', state.hp === null);
    setIconText(elements.gameHp, state.hp === null ? 'infinity' : 'heart', state.hp === null ? t('Không HP') : String(state.hp));
    elements.gameScore.textContent = state.score.toLocaleString(preferences.locale());
    setIconText(elements.gameCombo, 'combo', String(state.combo));
    elements.gameRemaining.textContent = game.config.mode === 'endless'
      ? t('{count} mục tiêu đang rơi', { count: state.activeCount })
      : t('{count} từ còn lại', { count: state.remaining });
    const playable = state.status === 'playing';
    const hasTarget = game.targetId !== null;
    elements.answerInput.disabled = !playable || !hasTarget;
    elements.answerInput.placeholder = t(playable ? 'gakkou hoặc がっこう' : 'Tạm dừng…');
    elements.answerSubmit.disabled = !playable || !elements.answerInput.value.trim();
    elements.cycleButton.disabled = !playable || state.activeCount < 2;
    elements.pauseButton.classList.toggle('button--hidden', state.status !== 'playing' && state.status !== 'paused');
    setIconName(elements.pauseButton.querySelector('.icon'), state.status === 'paused' ? 'play' : 'pause');
    elements.pauseButton.querySelector('b').textContent = t(state.status === 'paused' ? 'Tiếp tục' : 'Tạm dừng');
    updateOverlay();
  }

  /* Chọn nội dung và hành động cho màn tạm dừng, hoàn thành hoặc hết HP. */
  function updateOverlay() {
    const visible = state.status !== 'playing' && state.status !== 'ready';
    elements.overlay.classList.toggle('game-overlay--hidden', !visible);
    if (!visible) return;
    const content = {
      paused: ['pause', t('Đã tạm dừng'), t('Nhiệm vụ tạm nghỉ'), t('Tiếp tục khi bạn đã sẵn sàng.'), 'play', t('Tiếp tục')],
      over: ['close', t('Phòng tuyến thất thủ'), t('Thử lại nhé'), t('Các từ bỏ lỡ đã được lưu vào Học lại.'), 'refresh', t('Chơi lại')],
      won: ['check', t('Wave hoàn tất'), t('Bầu trời an toàn'), t('Bạn đạt {score} điểm.', { score: state.score.toLocaleString(preferences.locale()) }), 'refresh', t('Chơi lại')],
    }[state.status];
    setIconName(elements.overlayIcon.querySelector('.icon'), content[0]);
    elements.overlayEyebrow.textContent = content[1];
    elements.overlayTitle.textContent = content[2];
    elements.overlayCopy.textContent = content[3];
    setButtonContent(elements.overlayPrimary, content[4], content[5]);
    elements.overlayPrimary.classList.toggle('button--accent', state.status === 'paused');
    elements.overlayPrimary.classList.toggle('button--primary', state.status !== 'paused');
    elements.overlayReview.classList.toggle('button--hidden', state.status === 'paused');
  }

  /* Chuyển giữa thiết lập, chơi và học lại; tạm dừng nếu rời màn chơi. */
  function setView(next) {
    if (state.view === 'play' && state.status === 'playing' && next !== 'play') {
      state.status = 'paused';
    }
    state.view = next;
    document.body.classList.toggle('page--play-active', next === 'play');
    const views = $$('.view');
    for (let index = 0; index < views.length; index += 1) {
      views[index].classList.toggle('view--hidden', views[index].id !== 'view-' + next);
    }
    const tabs = $$('.nav-tabs__button');
    for (let index = 0; index < tabs.length; index += 1) {
      tabs[index].classList.toggle('nav-tabs__button--active', tabs[index].dataset.view === next);
    }
    updateGameStatus();
    if (next === 'play') resizeCanvas();
    if (next === 'review') renderReview();
    if (next === 'play' && state.status === 'paused') focusAnswerOnDesktop(50);
  }

  /* Xóa câu trả lời và bản xem trước trước khi chuyển mục tiêu. */
  function resetAnswer() {
    elements.answerInput.value = '';
    elements.answerPreview.textContent = '';
    elements.answerPreview.classList.add('answer-form__preview--hidden');
  }

  /* Tìm và đổi mục tiêu; ưu tiên mục tiêu gần vạch phòng thủ nhất. */
  function findEnemy(id) {
    for (let index = 0; index < game.enemies.length; index += 1) {
      if (game.enemies[index].id === id) return game.enemies[index];
    }
    return null;
  }

  function selectTarget(id, shouldReset) {
    if (shouldReset === undefined) shouldReset = true;
    game.targetId = id;
    const enemy = findEnemy(id);
    elements.targetLabel.textContent = enemy ? t('Mục tiêu · {word}', { word: enemy.kanji }) : t('Đang tìm mục tiêu');
    if (shouldReset) resetAnswer();
    updateGameStatus();
  }

  function selectMostDangerous() {
    let next = null;
    for (let index = 0; index < game.enemies.length; index += 1) {
      if (!next || game.enemies[index].y > next.y) next = game.enemies[index];
    }
    selectTarget(next ? next.id : null);
  }

  function cycleTarget() {
    if (!game.enemies.length) return;
    const ordered = game.enemies.slice().sort(function (a, b) { return b.y - a.y; });
    let currentIndex = -1;
    for (let index = 0; index < ordered.length; index += 1) {
      if (ordered[index].id === game.targetId) {
        currentIndex = index;
        break;
      }
    }
    selectTarget(ordered[(currentIndex + 1) % ordered.length].id);
    setTimeout(function () { elements.answerInput.focus(); }, 0);
  }

  /* Cùng một từ thì tăng số lần sai, không thêm dòng mới. */
  function saveFailedWord(word) {
    let existing = null;
    for (let index = 0; index < state.review.length; index += 1) {
      if (state.review[index].kanji === word.kanji && state.review[index].hiragana === word.hiragana) {
        existing = state.review[index];
        break;
      }
    }
    if (existing) existing.mistakeCount += 1;
    else state.review.push({ kanji: word.kanji, hiragana: word.hiragana, mistakeCount: 1 });
    saveReview();
    updateReviewBadge();
  }

  /* Hiển thị số từ cần ôn trên thanh điều hướng. */
  function updateReviewBadge() {
    elements.reviewBadge.textContent = String(state.review.length);
    elements.reviewBadge.classList.toggle('nav-tabs__badge--hidden', state.review.length === 0);
  }

  /* Hiện phản hồi đúng/sai trong thời gian ngắn rồi trả ô nhập về trạng thái chờ. */
  function showFeedback(message, answerState) {
    if (state.feedbackTimer) clearTimeout(state.feedbackTimer);
    state.answerState = answerState;
    elements.feedback.textContent = message;
    elements.inputDock.classList.remove('answer-form--wrong', 'answer-form--correct');
    if (answerState !== 'idle') elements.inputDock.classList.add('answer-form--' + answerState);
    state.feedbackTimer = setTimeout(function () {
      state.answerState = 'idle';
      elements.feedback.textContent = t('Nhập Hiragana hoặc Romaji, rồi nhấn Enter.');
      elements.inputDock.classList.remove('answer-form--wrong', 'answer-form--correct');
    }, 1200);
  }

  /* Reset trạng thái rồi lấy bộ từ để bắt đầu. */
  function startGame(source, modeOverride) {
    if (source === undefined) source = state.words;
    const selectedMode = modeOverride || state.mode;
    const hasHp = selectedMode === 'challenge' || (selectedMode === 'endless' && state.endlessHasHp);
    const maxHp = selectedMode === 'challenge' ? state.challengeHp : state.endlessHp;
    game.config = { mode: selectedMode, hasHp: hasHp, maxHp: maxHp, source: source.slice() };
    game.enemies = [];
    game.queue = shuffled(source);
    game.particles = [];
    game.lasers = [];
    game.targetId = null;
    game.spawnTimer = 0;
    state.status = 'playing';
    state.hp = hasHp ? maxHp : null;
    state.score = 0;
    state.combo = 0;
    state.remaining = selectedMode === 'endless' ? 0 : source.length;
    state.activeCount = 0;
    elements.navPlay.disabled = false;
    elements.targetLabel.textContent = t('Đang tìm mục tiêu');
    activityStore.recordSession(selectedMode);
    resetAnswer();
    showFeedback(t('Nhập Hiragana hoặc Romaji, rồi nhấn Enter.'), 'idle');
    setView('play');
    updateGameStatus();
    focusAnswerOnDesktop(100);
  }

  /* Đổi giữa đang chơi và tạm dừng. */
  function togglePause() {
    if (state.status === 'playing') state.status = 'paused';
    else if (state.status === 'paused') state.status = 'playing';
    updateGameStatus();
    if (state.status === 'playing') focusAnswerOnDesktop(0);
  }

  /* Xử lý đáp án đúng: xóa mục tiêu, cộng điểm/combo và tạo hiệu ứng bắn. */
  function destroyCurrentTarget() {
    const enemy = findEnemy(game.targetId);
    if (!enemy) return;
    game.lasers.push({ x1: game.size.width / 2, y1: game.size.height - 55 * game.objectScale, x2: enemy.x, y2: enemy.y, life: .22 });
    const colors = ['#67e8f9', '#e0f2fe', '#fb7185'];
    for (let index = 0; index < 22; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 36 + Math.random() * 90;
      game.particles.push({ x: enemy.x, y: enemy.y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: .55 + Math.random() * .45, color: colors[index % colors.length] });
    }
    const remainingEnemies = [];
    for (let index = 0; index < game.enemies.length; index += 1) {
      if (game.enemies[index].id !== enemy.id) remainingEnemies.push(game.enemies[index]);
    }
    game.enemies = remainingEnemies;
    state.combo += 1;
    state.score += enemy.hiragana.length * 100 + Math.min(state.combo, 10) * 20;
    state.activeCount = game.enemies.length;
    if (game.config.mode !== 'endless') state.remaining = game.queue.length + game.enemies.length;
    game.targetId = null;
    selectMostDangerous();
    updateGameStatus();
  }

  /* Đang ghép chữ thì đừng chấm, chờ nhập xong. */
  function submitAnswer() {
    if (state.status !== 'playing' || state.composing) return;
    const enemy = findEnemy(game.targetId);
    const answerRaw = elements.answerInput.value;
    if (!enemy || !answerRaw.trim()) return;
    const converted = normalizeAnswer(toHiragana(answerRaw));
    const expected = normalizeAnswer(enemy.hiragana);
    if (converted === expected) {
      destroyCurrentTarget();
      activityStore.recordAttempt(true);
      showFeedback(t('Chính xác! Phòng tuyến được giữ vững.'), 'correct');
    } else {
      state.combo = 0;
      saveFailedWord(enemy);
      activityStore.recordAttempt(false);
      showFeedback(t('Chưa đúng. Đáp án {answer} đã vào Học lại.', { answer: enemy.hiragana }), 'wrong');
      updateGameStatus();
    }
    resetAnswer();
    setTimeout(function () { elements.answerInput.focus(); }, 0);
  }

  /* Dựng danh sách học lại hoặc trạng thái trống bằng các phần tử DOM. */
  function renderReview() {
    elements.reviewContent.replaceChildren();
    elements.reviewActions.classList.toggle('review-panel__actions--hidden', state.review.length === 0);
    if (!state.review.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const inner = document.createElement('div');
      const iconBox = document.createElement('div');
      iconBox.className = 'empty-state__icon';
      iconBox.setAttribute('aria-hidden', 'true');
      iconBox.append(createIcon('check'));
      const title = document.createElement('h2');
      title.className = 'empty-state__title';
      title.textContent = t('Chưa có từ cần học lại');
      const description = document.createElement('p');
      description.className = 'empty-state__description';
      description.textContent = t('Bắt đầu một nhiệm vụ để luyện tập.');
      inner.append(iconBox, title, description);
      const button = document.createElement('button');
      button.className = 'button button--accent empty-state__action';
      button.type = 'button';
      setButtonContent(button, 'arrow-right', t('Đi tới thiết lập'), true);
      button.addEventListener('click', function () { setView('setup'); });
      inner.append(button);
      empty.append(inner);
      elements.reviewContent.append(empty);
      return;
    }
    const box = document.createElement('div');
    box.className = 'review-list';
    const header = document.createElement('div');
    header.className = 'review-list__header';
    const wordHeading = document.createElement('span');
    wordHeading.textContent = t('Từ vựng');
    const countHeading = document.createElement('span');
    countHeading.textContent = t('Số lần cần ôn');
    header.append(wordHeading, countHeading);
    box.append(header);
    const reviewWords = state.review.slice().sort(function (a, b) { return b.mistakeCount - a.mistakeCount; });
    for (let index = 0; index < reviewWords.length; index += 1) {
      const item = reviewWords[index];
      const row = document.createElement('div');
      row.className = 'review-list__item';
      const pair = document.createElement('div');
      pair.className = 'review-list__word';
      const kanji = document.createElement('span');
      kanji.className = 'review-list__kanji';
      kanji.textContent = item.kanji;
      const reading = document.createElement('span');
      reading.className = 'review-list__reading';
      reading.textContent = item.hiragana;
      const count = document.createElement('span');
      count.className = 'review-list__count';
      count.textContent = t('{count} lần', { count: item.mistakeCount });
      pair.append(kanji, reading);
      row.append(pair, count);
      box.append(row);
    }
    elements.reviewContent.append(box);
  }

  /* Tính kích thước và khoảng cách thẻ theo chữ Kanji và vùng chơi. */
  function getEnemySize(word, objectScale, canvasWidth) {
    const normalWidth = Math.min(158, Math.max(92, 62 + word.kanji.length * 30));
    return {
      width: Math.min(normalWidth * objectScale, Math.max(1, canvasWidth - 20 * objectScale)),
      height: 78 * objectScale,
    };
  }

  function getEnemyMargin(canvasWidth, enemyWidth, objectScale) {
    return Math.min(canvasWidth / 2, enemyWidth / 2 + 20 * objectScale);
  }

  /* Chỉnh lại Canvas theo khung đang hiển thị. */
  function resizeCanvas() {
    const bounds = elements.canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    // Màn hình chuẩn là 1080 x 1920; xoay ngang thì đổi chỗ hai cạnh.
    const isLandscape = window.screen ? window.screen.width >= window.screen.height : bounds.width >= bounds.height;
    const baseWidth = isLandscape ? BASE_LONG_SIDE : BASE_SHORT_SIDE;
    const baseHeight = isLandscape ? BASE_SHORT_SIDE : BASE_LONG_SIDE;
    const scale = Math.min(1, bounds.width / baseWidth, bounds.height / baseHeight);
    // Trên màn hình nhỏ, giữ chữ và thẻ đủ lớn để đọc được.
    const visibleObjectScale = Math.max(MIN_OBJECT_SCALE, Math.min(1, bounds.width / 900));
    const objectScale = Math.max(1, visibleObjectScale / scale);
    const width = bounds.width / scale;
    const height = bounds.height / scale;
    const oldWidth = game.size.width;
    const oldHeight = game.size.height;
    const oldObjectScale = game.objectScale;
    if (oldWidth > 0 && oldHeight > 0 && (oldWidth !== width || oldHeight !== height || oldObjectScale !== objectScale)) {
      for (let index = 0; index < game.enemies.length; index += 1) {
        const enemy = game.enemies[index];
        const progress = (enemy.y + 58 * oldObjectScale) / Math.max(1, oldHeight - 73 * oldObjectScale);
        const newSize = getEnemySize(enemy, objectScale, width);
        const margin = getEnemyMargin(width, newSize.width, objectScale);
        enemy.x = Math.max(margin, Math.min(width - margin, enemy.x * width / oldWidth));
        enemy.width = newSize.width;
        enemy.height = newSize.height;
        enemy.y = -58 * objectScale + progress * Math.max(1, height - 73 * objectScale);
      }
      for (let index = 0; index < game.particles.length; index += 1) {
        game.particles[index].x *= width / oldWidth;
        game.particles[index].y *= height / oldHeight;
      }
      for (let index = 0; index < game.lasers.length; index += 1) {
        game.lasers[index].x1 *= width / oldWidth;
        game.lasers[index].x2 *= width / oldWidth;
        game.lasers[index].y1 *= height / oldHeight;
        game.lasers[index].y2 *= height / oldHeight;
      }
    }
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    elements.canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
    elements.canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
    context.setTransform(ratio * scale, 0, 0, ratio * scale, 0, 0);
    game.size = { width: width, height: height };
    game.objectScale = objectScale;
  }

  /* Cập nhật sinh mục tiêu, chuyển động, va chạm phòng tuyến và điều kiện kết thúc. */
  function updateWorld(delta) {
    const width = game.size.width;
    const height = game.size.height;
    const defenseY = height - 92 * game.objectScale;
    const fallSpeed = Math.max(1, height - 73 * game.objectScale) / DIFFICULTIES[state.difficulty].fallSeconds;
    if (state.status === 'playing' && state.view === 'play') {
      if (game.config.mode === 'endless' && !game.queue.length) game.queue = shuffled(game.config.source);
      game.spawnTimer -= delta;
      if (game.spawnTimer <= 0 && game.queue.length && game.enemies.length < 5) {
        const word = game.queue.shift();
        const enemySize = getEnemySize(word, game.objectScale, width);
        const margin = getEnemyMargin(width, enemySize.width, game.objectScale);
        game.enemies.push({ kanji: word.kanji, hiragana: word.hiragana, id: game.nextId++, x: margin + Math.random() * (width - margin * 2), y: -58 * game.objectScale, width: enemySize.width, height: enemySize.height });
        game.spawnTimer = 1.65;
        state.activeCount = game.enemies.length;
        if (game.config.mode !== 'endless') state.remaining = game.queue.length + game.enemies.length;
        if (game.targetId === null) selectMostDangerous();
        updateGameStatus();
      }
      const missed = [];
      const safeEnemies = [];
      for (let index = 0; index < game.enemies.length; index += 1) {
        const enemy = game.enemies[index];
        enemy.y += fallSpeed * delta;
        if (enemy.y + enemy.height / 2 >= defenseY) missed.push(enemy);
        else safeEnemies.push(enemy);
      }
      if (missed.length) {
        game.enemies = safeEnemies;
        let targetWasMissed = false;
        for (let index = 0; index < missed.length; index += 1) {
          if (missed[index].id === game.targetId) targetWasMissed = true;
          saveFailedWord(missed[index]);
          activityStore.recordAttempt(false);
        }
        state.combo = 0;
        state.activeCount = game.enemies.length;
        if (game.config.mode !== 'endless') state.remaining = game.queue.length + game.enemies.length;
        showFeedback(t('{count} từ đã được lưu vào Học lại.', { count: missed.length }), 'wrong');
        if (game.targetId !== null && targetWasMissed) {
          game.targetId = null;
          selectMostDangerous();
        }
        if (game.config.hasHp) {
          state.hp = Math.max(0, state.hp - missed.length);
          if (state.hp === 0) {
            state.status = 'over';
            selectTarget(null);
          }
        }
        updateGameStatus();
      }
      if (game.targetId === null && game.enemies.length) selectMostDangerous();
      if (game.config.mode !== 'endless' && !game.queue.length && !game.enemies.length && state.status === 'playing') {
        state.status = 'won';
        selectTarget(null);
        updateGameStatus();
      }
    }
    for (let index = 0; index < game.particles.length; index += 1) {
      const particle = game.particles[index];
      particle.life -= delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 45 * delta;
    }
    const livingParticles = [];
    for (let index = 0; index < game.particles.length; index += 1) {
      if (game.particles[index].life > 0) livingParticles.push(game.particles[index]);
    }
    game.particles = livingParticles;
    const livingLasers = [];
    for (let index = 0; index < game.lasers.length; index += 1) {
      game.lasers[index].life -= delta;
      if (game.lasers[index].life > 0) livingLasers.push(game.lasers[index]);
    }
    game.lasers = livingLasers;
  }

  /* Vẽ nền và các từ; mới đổi màu để nhận ra mục tiêu đang chọn. */
  function drawWorld() {
    const {width,height}=game.size;
    context.clearRect(0,0,width,height);
    context.fillStyle='#0c0e17'; context.fillRect(0,0,width,height);
    context.strokeStyle='#ff8a3d'; context.beginPath(); context.moveTo(0,height-92*game.objectScale); context.lineTo(width,height-92*game.objectScale); context.stroke();
    for(const enemy of game.enemies) {
      context.fillStyle=enemy.id===game.targetId?'#ff8a3d':'#f2ede2';
      context.font=(28*game.objectScale)+'px sans-serif'; context.fillText(enemy.kanji,enemy.x,enemy.y);
    }
  }

  /* Đang lấy mỗi frame là 0.016 giây, máy chạy nhanh có thể rơi nhanh hơn. */
  function animationLoop(time) {
    const delta = .016;
    game.previousTime = time;
    updateWorld(delta);
    drawWorld(time);
    requestAnimationFrame(animationLoop);
  }

  /* Gắn sự kiện điều hướng và lựa chọn cấu hình vào trạng thái dùng chung. */
  const viewButtons = $$('.brand[data-view], [data-view]:not(.nav-tabs__button):not(.brand)');
  for (let index = 0; index < viewButtons.length; index += 1) {
    viewButtons[index].addEventListener('click', function () { setView(this.dataset.view); });
  }
  const navButtons = $$('.nav-tabs__button');
  for (let index = 0; index < navButtons.length; index += 1) {
    navButtons[index].addEventListener('click', function () { setView(this.dataset.view); });
  }
  const modeButtons = $$('.mode-card');
  for (let index = 0; index < modeButtons.length; index += 1) {
    modeButtons[index].addEventListener('click', function () {
      state.mode = this.dataset.mode;
      for (let itemIndex = 0; itemIndex < modeButtons.length; itemIndex += 1) {
        const active = modeButtons[itemIndex] === this;
        modeButtons[itemIndex].classList.toggle('mode-card--active', active);
        modeButtons[itemIndex].setAttribute('aria-checked', String(active));
      }
      updateSetup();
    });
  }
  const speedButtons = $$('.speed-selector__option');
  for (let index = 0; index < speedButtons.length; index += 1) {
    speedButtons[index].addEventListener('click', function () {
      state.difficulty = this.dataset.difficulty;
      for (let itemIndex = 0; itemIndex < speedButtons.length; itemIndex += 1) {
        const active = speedButtons[itemIndex] === this;
        speedButtons[itemIndex].classList.toggle('speed-selector__option--active', active);
        speedButtons[itemIndex].setAttribute('aria-checked', String(active));
      }
      updateSetup();
    });
  }

  /* Đọc CSV bất đồng bộ, kiểm tra dung lượng và báo lỗi ngay ở khu vực nguồn từ. */
  $('#upload-button').addEventListener('click', function () { elements.fileInput.click(); });
  elements.fileInput.addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      elements.sourceNotice.textContent = t('File quá lớn. Hãy dùng CSV dưới 2 MB.');
      event.target.value = '';
      return;
    }
    try {
      const parsed = parseVocabularyCsv(await file.text());
      state.words = parsed;
      state.remaining = parsed.length;
      elements.sourceLabel.textContent = file.name + ' · ' + t('{count} từ', { count: parsed.length });
      elements.sourceLabel.title = elements.sourceLabel.textContent;
      elements.sourceNotice.textContent = t('Đã đọc {count} từ hợp lệ.', { count: parsed.length });
      updateSetup();
    } catch (error) {
      elements.sourceNotice.textContent = t(error instanceof Error ? error.message : 'Không thể đọc file CSV.');
    } finally {
      event.target.value = '';
    }
  });

  /* Tạo CSV mẫu tại trình duyệt và giải phóng URL tạm sau khi tải. */
  $('#download-button').addEventListener('click', function () {
    const rows = ['kanji,hiragana'];
    for (let index = 0; index < SAMPLE_WORDS.length; index += 1) {
      rows.push(SAMPLE_WORDS[index].kanji + ',' + SAMPLE_WORDS[index].hiragana);
    }
    const content = rows.join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'kanji-sample.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  });

  /* Điều chỉnh HP trong giới hạn cho phép và điều khiển vòng đời phiên chơi. */
  elements.hpToggle.addEventListener('click', function () {
    state.endlessHasHp = !state.endlessHasHp;
    updateSetup();
  });
  $('#hp-minus').addEventListener('click', function () {
    if (state.mode === 'challenge') state.challengeHp = Math.max(1, state.challengeHp - 1);
    else state.endlessHp = Math.max(1, state.endlessHp - 1);
    updateSetup();
  });
  $('#hp-plus').addEventListener('click', function () {
    if (state.mode === 'challenge') state.challengeHp = Math.min(20, state.challengeHp + 1);
    else state.endlessHp = Math.min(20, state.endlessHp + 1);
    updateSetup();
  });
  $('#start-button').addEventListener('click', function () { startGame(); });
  $('#restart-button').addEventListener('click', function () { startGame(game.config.source, game.config.mode); });
  elements.pauseButton.addEventListener('click', togglePause);
  elements.overlayPrimary.addEventListener('click', function () {
    if (state.status === 'paused') togglePause();
    else startGame(game.config.source, game.config.mode);
  });
  elements.overlayReview.addEventListener('click', function () { setView('review'); });
  elements.cycleButton.addEventListener('click', cycleTarget);
  /* Nhận đáp án qua form, theo dõi IME và cập nhật bản xem trước Hiragana. */
  elements.inputDock.addEventListener('submit', function (event) {
    event.preventDefault();
    submitAnswer();
  });
  elements.answerInput.addEventListener('compositionstart', function () { state.composing = true; });
  elements.answerInput.addEventListener('compositionend', function () {
    state.composing = false;
    elements.answerInput.dispatchEvent(new Event('input'));
  });
  elements.answerInput.addEventListener('input', function () {
    const preview = toHiragana(elements.answerInput.value);
    if (preview) setIconText(elements.answerPreview, 'arrow-right', preview);
    else elements.answerPreview.replaceChildren();
    elements.answerPreview.classList.toggle('answer-form__preview--hidden', !preview);
    elements.answerSubmit.disabled = state.status !== 'playing' || !elements.answerInput.value.trim();
    elements.inputDock.classList.remove('answer-form--wrong', 'answer-form--correct');
  });
  /* Xóa hoặc tạo phiên Study từ danh sách cần ôn theo tùy chọn xác nhận. */
  $('#clear-review').addEventListener('click', function () {
    if (preferences.get().confirmBeforeDelete && !window.confirm(t('Xóa toàn bộ danh sách Học lại?'))) return;
    state.review = [];
    reviewStore.clear();
    updateReviewBadge();
    renderReview();
  });
  function getReviewWords() {
    const source = [];
    for (let index = 0; index < state.review.length; index += 1) {
      source.push({ kanji: state.review[index].kanji, hiragana: state.review[index].hiragana });
    }
    return source;
  }

  $('#study-review').addEventListener('click', function () {
    const source = getReviewWords();
    if (source.length) startGame(source, 'study');
  });
  /* Xử lý phím đổi mục tiêu và tạm dừng khi đang ở màn chơi. */
  window.addEventListener('keydown', function (event) {
    if (state.view !== 'play') return;
    if (event.key === 'Tab' && state.status === 'playing') {
      event.preventDefault();
      cycleTarget();
    }
    if (event.key === 'Escape' && state.status === 'playing') {
      state.status = 'paused';
      updateGameStatus();
    }
  });

  /* Khởi động giao diện, theo dõi đổi kích thước và mở học lại nếu URL yêu cầu. */
  resizeCanvas();
  new ResizeObserver(resizeCanvas).observe(elements.canvas);
  updateSetup();
  updateReviewBadge();
  renderReview();
  window.addEventListener('kanji-preferences-change', function () {
    updateSetup();
    updateGameStatus();
    renderReview();
  });
  requestAnimationFrame(animationLoop);
  if (new URLSearchParams(window.location.search).get('review') === '1' && state.review.length) {
    startGame(getReviewWords(), 'study');
  }
})();
