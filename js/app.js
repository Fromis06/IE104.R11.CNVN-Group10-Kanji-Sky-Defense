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

  /* Bộ từ mẫu và cấu hình mặc định để bắt đầu chơi khi chưa nạp CSV. */
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
    easy: { label: 'Dễ', fallSeconds: 24, spawnInterval: 2.05 },
    normal: { label: 'Vừa', fallSeconds: 16, spawnInterval: 1.65 },
    hard: { label: 'Khó', fallSeconds: 11, spawnInterval: 1.35 },
  };
  const BASE_SHORT_SIDE = 1080;
  const BASE_LONG_SIDE = 1920;
  const MIN_OBJECT_SCALE = .62;

  const MODES = {
    study: { label: 'Study' },
    challenge: { label: 'Challenge' },
    endless: { label: 'Endless' },
  };

  /* Nhóm âm thanh tia laser và nổ sử dụng nhiều kênh để phát mượt khi gõ nhanh. */
  function createSoundPool(src, size, volume) {
    const channels = [];
    for (let index = 0; index < size; index += 1) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = volume;
      channels.push(audio);
    }
    let cursor = 0;
    return {
      play: function () {
        if (!channels.length) return;
        const audio = channels[cursor];
        cursor = (cursor + 1) % channels.length;
        try {
          audio.currentTime = 0;
          const playback = audio.play();
          if (playback && typeof playback.catch === 'function') playback.catch(function () {});
        } catch (error) {
          /* Bỏ qua nếu trình duyệt chưa cho phép phát âm thanh. */
        }
      },
    };
  }

  const sounds = {
    laser: createSoundPool('assets/Sound%20effects/lazer_sound_effect.mp4', 8, .35),
    explosion: createSoundPool('assets/Sound%20effects/explosion_sound_effect.mp4', 4, .65),
  };

  /* Trạng thái giao diện và tiến độ phiên chơi; các hàm render đọc dữ liệu tại đây. */
  const state = {
    view: 'setup',
    words: SAMPLE_WORDS.slice(),
    sourceName: '',
    sourceNoticeKey: 'Bạn có thể chơi ngay hoặc nạp file CSV riêng.',
    sourceNoticeVars: null,
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
    feedbackKey: 'Nhập Hiragana hoặc Romaji, rồi nhấn Enter.',
    feedbackVars: null,
    feedbackTimer: null,
    lastInputValue: '',
    composing: false,
    review: reviewStore.load(),
  };

  /* Trạng thái Canvas: mục tiêu, hàng đợi sinh từ, hiệu ứng bắn và thời gian khung hình. */
  const game = {
    enemies: [],
    queue: [],
    particles: [],
    lasers: [],
    projectiles: [],
    explosions: [],
    ship: { angle: -Math.PI / 2, targetAngle: -Math.PI / 2, recoil: 0, flash: 0, flashKind: 'hit' },
    targetId: null,
    nextId: 1,
    spawnTimer: 0,
    lastSpawnX: null,
    config: { mode: 'study', hasHp: false, maxHp: 3, source: SAMPLE_WORDS.slice() },
    size: { width: 0, height: 0 },
    viewportWidth: 0,
    objectScale: 1,
    previousTime: performance.now(),
  };

  /* Lưu tham chiếu DOM dùng thường xuyên, tránh truy vấn lại trong vòng lặp game. */
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

  /* Bảng màu cho Canvas theo giao diện sáng hoặc tối. */
  function getCanvasPalette() {
    const isLight = document.documentElement.dataset.theme === 'light';
    if (isLight) {
      return {
        isLight: true,
        star: 'rgba(138, 128, 103, .28)',
        defenseLine: 'rgba(198, 45, 63, .78)',
        defenseText: '#b8283b',
        aimLine: 'rgba(200, 90, 23, .34)',
        enemyBg: 'rgba(255, 253, 248, .96)',
        enemyBorder: 'rgba(105, 95, 77, .42)',
        enemyShadow: 'rgba(35, 26, 12, .12)',
        enemyText: '#241b0f',
        targetBg: '#fffaf0',
        targetBorder: '#c85a17',
        targetGlow: 'rgba(200, 90, 23, .36)',
        targetText: '#120d06',
        targetTag: '#a3480f',
        hitBorder: '#ea580c',
        progressTrack: 'rgba(41, 31, 15, .14)',
        progressFill: '#c85a17',
        progressWrong: '#b8283b',
        previewOk: '#146b48',
        previewBad: '#b8283b',
        laserHit: '#c85a17',
        laserHitCore: '#fff7ed',
        laserHitGlow: 'rgba(234, 88, 12, .7)',
        laserMiss: '#c62d3f',
        laserMissCore: '#ffe4e6',
        laserMissGlow: 'rgba(198, 45, 63, .6)',
        explosionRing: '#c85a17',
        explosionFlash: 'rgba(255, 138, 61, .7)',
        explosionColors: ['#c85a17', '#ea580c', '#c62d3f', '#d97706'],
        sparkColors: ['#c85a17', '#f59e0b', '#a3480f'],
        shipBody: '#2b2218',
        shipStroke: '#c85a17',
        shipGlow: 'rgba(200, 90, 23, .28)',
        shipCore: '#e04836',
        muzzleHit: '#ea580c',
        muzzleMiss: '#c62d3f',
      };
    }
    return {
      isLight: false,
      star: 'rgba(148, 163, 184, .22)',
      defenseLine: 'rgba(251, 113, 133, .76)',
      defenseText: 'rgba(251, 113, 133, .82)',
      aimLine: 'rgba(103, 232, 249, .24)',
      enemyBg: 'rgba(12, 25, 39, .92)',
      enemyBorder: 'rgba(100, 116, 139, .55)',
      enemyShadow: 'rgba(0, 0, 0, .3)',
      enemyText: '#cbd5e1',
      targetBg: 'rgba(12, 31, 46, .97)',
      targetBorder: '#67e8f9',
      targetGlow: '#22d3ee',
      targetText: '#f8fafc',
      targetTag: '#67e8f9',
      hitBorder: '#fef08a',
      progressTrack: 'rgba(15, 23, 42, .95)',
      progressFill: '#67e8f9',
      progressWrong: '#fb7185',
      previewOk: '#a5f3fc',
      previewBad: '#fda4af',
      laserHit: '#67e8f9',
      laserHitCore: '#f0f9ff',
      laserHitGlow: '#22d3ee',
      laserMiss: '#fb7185',
      laserMissCore: '#ffe4e6',
      laserMissGlow: '#f43f5e',
      explosionRing: '#67e8f9',
      explosionFlash: 'rgba(254, 240, 138, .82)',
      explosionColors: ['#67e8f9', '#ffb06b', '#fb7185', '#fef08a'],
      sparkColors: ['#67e8f9', '#e0f2fe', '#ffb06b'],
      shipBody: '#e0f2fe',
      shipStroke: '#67e8f9',
      shipGlow: '#67e8f9',
      shipCore: '#fb7185',
      muzzleHit: '#67e8f9',
      muzzleMiss: '#fb7185',
    };
  }

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

  /* Chỉ tự lấy focus trên máy dùng chuột để tránh bật bàn phím ảo ngoài ý muốn. */
  function focusAnswerOnDesktop(delay) {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    setTimeout(function () { elements.answerInput.focus(); }, delay);
  }

  /* Ghi danh sách cần ôn qua lớp lưu trữ đang gắn với người dùng hiện tại. */
  function saveReview() {
    reviewStore.save(state.review);
  }

  /* Cập nhật nhãn nguồn dữ liệu và ghi chú CSV theo ngôn ngữ hiện tại. */
  function updateSourceDisplay() {
    const countText = t('{count} từ', { count: state.words.length });
    elements.sourceLabel.textContent = state.sourceName
      ? state.sourceName + ' · ' + countText
      : t('Bộ mẫu · {count} từ', { count: state.words.length });
    elements.sourceLabel.title = elements.sourceLabel.textContent;
    elements.sourceNotice.textContent = t(state.sourceNoticeKey, state.sourceNoticeVars || undefined);
  }

  /* Đồng bộ nhãn mục tiêu và dòng phản hồi theo trạng thái ngôn ngữ. */
  function updateTargetAndFeedback() {
    const enemy = findEnemy(game.targetId);
    elements.targetLabel.textContent = enemy ? t('Mục tiêu · {word}', { word: enemy.kanji }) : t('Đang tìm mục tiêu');
    elements.feedback.textContent = t(state.feedbackKey, state.feedbackVars || undefined);
  }

  /* Đồng bộ lựa chọn chế độ, HP và phần tóm tắt trước khi bắt đầu nhiệm vụ. */
  function updateSetup() {
    updateSourceDisplay();
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
    elements.sectorLabel.textContent = t('Khu vực 01 · Chế độ {mode}', { mode: modeLabel });
    elements.gameHp.classList.toggle('game-status__hp--unlimited', state.hp === null);
    setIconText(elements.gameHp, state.hp === null ? 'infinity' : 'heart', state.hp === null ? t('Không HP') : String(state.hp));
    elements.gameScore.textContent = state.score.toLocaleString(preferences.locale());
    setIconText(elements.gameCombo, 'flame', String(state.combo));
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
    updateTargetAndFeedback();
    updateOverlay();
  }

  /* Chọn nội dung và hành động cho màn tạm dừng, hoàn thành hoặc hết HP. */
  function updateOverlay() {
    const visible = state.status !== 'playing' && state.status !== 'ready';
    elements.overlay.classList.toggle('game-overlay--hidden', !visible);
    if (!visible) return;
    const content = {
      paused: ['pause', t('Đã tạm dừng'), t('Nhiệm vụ tạm nghỉ'), t('Tiếp tục khi bạn đã sẵn sàng.'), 'play', t('Tiếp tục')],
      over: ['shield-alert', t('Phòng tuyến thất thủ'), t('Thử lại nhé'), t('Các từ bỏ lỡ đã được lưu vào Học lại.'), 'rotate-ccw', t('Chơi lại')],
      won: ['trophy', t('Wave hoàn tất'), t('Bầu trời an toàn'), t('Bạn đạt {score} điểm.', { score: state.score.toLocaleString(preferences.locale()) }), 'rotate-ccw', t('Chơi lại')],
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
    state.lastInputValue = '';
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

  /* Gộp từ sai theo cặp Kanji/cách đọc và tăng số lần cần ôn. */
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
  function showFeedback(messageKey, answerState, variables) {
    if (state.feedbackTimer) clearTimeout(state.feedbackTimer);
    state.answerState = answerState;
    state.feedbackKey = messageKey;
    state.feedbackVars = variables || null;
    elements.feedback.textContent = t(messageKey, variables);
    elements.inputDock.classList.remove('answer-form--wrong', 'answer-form--correct');
    if (answerState !== 'idle') elements.inputDock.classList.add('answer-form--' + answerState);
    state.feedbackTimer = setTimeout(function () {
      state.answerState = 'idle';
      state.feedbackKey = 'Nhập Hiragana hoặc Romaji, rồi nhấn Enter.';
      state.feedbackVars = null;
      elements.feedback.textContent = t(state.feedbackKey);
      elements.inputDock.classList.remove('answer-form--wrong', 'answer-form--correct');
    }, 1200);
  }

  /* Tính tọa độ tâm và mũi phi thuyền theo góc ngắm hiện tại. */
  function getShipOrigin() {
    return { x: game.size.width / 2, y: game.size.height - 36 * game.objectScale };
  }

  function getShipNose(angleOverride) {
    const origin = getShipOrigin();
    const angle = angleOverride === undefined ? game.ship.angle : angleOverride;
    const offset = 24 * game.objectScale;
    return {
      x: origin.x + Math.cos(angle) * offset,
      y: origin.y + Math.sin(angle) * offset,
      angle: angle,
    };
  }

  /* Khởi tạo phiên chơi mới từ nguồn từ vựng và quy tắc chế độ được chọn. */
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
    game.projectiles = [];
    game.explosions = [];
    game.ship = { angle: -Math.PI / 2, targetAngle: -Math.PI / 2, recoil: 0, flash: 0, flashKind: 'hit' };
    game.targetId = null;
    game.spawnTimer = 0;
    game.lastSpawnX = null;
    state.status = 'playing';
    state.hp = hasHp ? maxHp : null;
    state.score = 0;
    state.combo = 0;
    state.remaining = selectedMode === 'endless' ? 0 : source.length;
    state.activeCount = 0;
    elements.navPlay.disabled = false;
    activityStore.recordSession(selectedMode);
    resetAnswer();
    showFeedback('Nhập Hiragana hoặc Romaji, rồi nhấn Enter.', 'idle');
    setView('play');
    updateGameStatus();
    focusAnswerOnDesktop(100);
  }

  /* Đổi trạng thái chạy/tạm dừng và đồng bộ các nút điều khiển. */
  function togglePause() {
    if (state.status === 'playing') state.status = 'paused';
    else if (state.status === 'paused') state.status = 'playing';
    updateGameStatus();
    if (state.status === 'playing') focusAnswerOnDesktop(0);
  }

  /* Bắn tia laser từ phi thuyền mỗi khi người chơi gõ ký tự. */
  function fireTypingLaser() {
    const enemy = findEnemy(game.targetId);
    if (!enemy) return;
    const origin = getShipOrigin();
    const hitX = enemy.x + (Math.random() - .5) * enemy.width * .42;
    const hitY = enemy.y + enemy.height * .26;
    const aimAngle = Math.atan2(hitY - origin.y, hitX - origin.x);
    game.ship.angle = aimAngle;
    game.ship.targetAngle = aimAngle;
    game.ship.recoil = 4;
    game.ship.flash = .09;
    game.ship.flashKind = 'hit';
    const nose = getShipNose(aimAngle);
    game.lasers.push({ x1: nose.x, y1: nose.y, x2: hitX, y2: hitY, life: .15, maxLife: .15, kind: 'typing' });
    enemy.hitFlash = .14;
    const palette = getCanvasPalette();
    for (let index = 0; index < 5; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (40 + Math.random() * 85) * game.objectScale;
      game.particles.push({
        x: hitX,
        y: hitY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: 2.2,
        life: .22 + Math.random() * .16,
        maxLife: .38,
        color: palette.sparkColors[index % palette.sparkColors.length],
      });
    }
    sounds.laser.play();
  }

  /* Bắn trượt theo góc ngẫu nhiên từ -45 đến 45 độ quanh kẻ địch khi gõ sai và nhấn Enter. */
  function fireMissedShot(enemy) {
    if (!enemy) return;
    const origin = getShipOrigin();
    const dx = enemy.x - origin.x;
    const dy = enemy.y - origin.y;
    const baseAngle = Math.atan2(dy, dx);
    const distance = Math.max(60, Math.hypot(dx, dy));
    const halfEnemyDeg = Math.atan2(enemy.width * .56, distance) * 180 / Math.PI;
    const minMissDeg = Math.min(34, Math.max(10, halfEnemyDeg + 4));
    const side = Math.random() < .5 ? -1 : 1;
    const offsetDeg = side * (minMissDeg + Math.random() * (45 - minMissDeg));
    const missAngle = baseAngle + offsetDeg * Math.PI / 180;
    game.ship.angle = missAngle;
    game.ship.recoil = 7;
    game.ship.flash = .12;
    game.ship.flashKind = 'miss';
    const nose = getShipNose(missAngle);
    const traceLength = Math.max(game.size.width, game.size.height) * 1.25;
    game.lasers.push({
      x1: nose.x,
      y1: nose.y,
      x2: nose.x + Math.cos(missAngle) * traceLength,
      y2: nose.y + Math.sin(missAngle) * traceLength,
      life: .2,
      maxLife: .2,
      kind: 'miss',
    });
    const speed = Math.max(1250, traceLength * 2.1);
    game.projectiles.push({
      x: nose.x,
      y: nose.y,
      vx: Math.cos(missAngle) * speed,
      vy: Math.sin(missAngle) * speed,
      angle: missAngle,
      life: .55,
      maxLife: .55,
    });
    sounds.laser.play();
  }

  /* Xử lý đáp án đúng: xóa mục tiêu, cộng điểm/combo và tạo hiệu ứng phát nổ. */
  function destroyCurrentTarget() {
    const enemy = findEnemy(game.targetId);
    if (!enemy) return;
    const origin = getShipOrigin();
    const aimAngle = Math.atan2(enemy.y - origin.y, enemy.x - origin.x);
    game.ship.angle = aimAngle;
    game.ship.targetAngle = aimAngle;
    game.ship.recoil = 8;
    game.ship.flash = .14;
    game.ship.flashKind = 'hit';
    const nose = getShipNose(aimAngle);
    game.lasers.push({ x1: nose.x, y1: nose.y, x2: enemy.x, y2: enemy.y, life: .24, maxLife: .24, kind: 'finish' });
    game.explosions.push({
      x: enemy.x,
      y: enemy.y,
      radius: 12 * game.objectScale,
      maxRadius: Math.max(enemy.width, enemy.height) * 1.15,
      life: .44,
      maxLife: .44,
    });
    const palette = getCanvasPalette();
    for (let index = 0; index < 32; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (48 + Math.random() * 145) * game.objectScale;
      const life = .42 + Math.random() * .48;
      game.particles.push({
        x: enemy.x + (Math.random() - .5) * enemy.width * .35,
        y: enemy.y + (Math.random() - .5) * enemy.height * .35,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: index % 4 === 0 ? 4.6 : 3,
        life: life,
        maxLife: life,
        color: palette.explosionColors[index % palette.explosionColors.length],
      });
    }
    sounds.explosion.play();
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

  /* Bỏ qua khi IME đang ghép chữ; chuẩn hóa cách đọc rồi chấm mục tiêu hiện tại. */
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
      showFeedback('Chính xác! Phòng tuyến được giữ vững.', 'correct');
    } else {
      fireMissedShot(enemy);
      state.combo = 0;
      saveFailedWord(enemy);
      activityStore.recordAttempt(false);
      showFeedback('Chưa đúng. Đáp án {answer} đã vào Học lại.', 'wrong', { answer: enemy.hiragana });
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
      iconBox.append(createIcon('circle-check'));
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

  /* Tính kích thước thẻ, vùng đệm chống đè và số mục tiêu tối ưu theo chiều rộng màn hình. */
  function getEnemySize(word, objectScale, canvasWidth) {
    const normalWidth = Math.min(156, Math.max(88, 56 + word.kanji.length * 28));
    return {
      width: Math.min(normalWidth * objectScale, Math.max(1, canvasWidth - 24 * objectScale)),
      height: 74 * objectScale,
    };
  }

  function getEnemyMargin(canvasWidth, enemyWidth, objectScale) {
    return Math.min(canvasWidth / 2, enemyWidth / 2 + 16 * objectScale);
  }

  function getEnemyPadding(objectScale) {
    return { x: 16 * objectScale, y: 38 * objectScale };
  }

  function getMaxActiveEnemies(canvasWidth, objectScale, viewportWidth) {
    const columns = Math.floor((canvasWidth - 20 * objectScale) / (128 * objectScale));
    let limit = columns <= 2 ? 3 : columns === 3 ? 4 : 5;
    if (viewportWidth && viewportWidth < 520) limit = Math.min(limit, 3);
    else if (viewportWidth && viewportWidth < 760) limit = Math.min(limit, 4);
    return limit;
  }

  /* Tìm vị trí X trống không chồng lấn với các thẻ đang ở gần vùng sinh từ. */
  function findSafeSpawnX(enemySize, spawnY, canvasWidth, objectScale, existingEnemies) {
    const margin = getEnemyMargin(canvasWidth, enemySize.width, objectScale);
    const minX = margin;
    const maxX = canvasWidth - margin;
    if (maxX < minX) return canvasWidth / 2;
    const pad = getEnemyPadding(objectScale);
    const blocked = [];
    for (let index = 0; index < existingEnemies.length; index += 1) {
      const other = existingEnemies[index];
      const verticalLimit = (other.height + enemySize.height) / 2 + pad.y;
      if (Math.abs(other.y - spawnY) < verticalLimit) {
        const halfGap = (other.width + enemySize.width) / 2 + pad.x;
        blocked.push({ lo: other.x - halfGap, hi: other.x + halfGap });
      }
    }
    blocked.sort(function (a, b) { return a.lo - b.lo; });
    const merged = [];
    for (let index = 0; index < blocked.length; index += 1) {
      const interval = blocked[index];
      if (!merged.length || interval.lo > merged[merged.length - 1].hi) {
        merged.push({ lo: interval.lo, hi: interval.hi });
      } else {
        merged[merged.length - 1].hi = Math.max(merged[merged.length - 1].hi, interval.hi);
      }
    }
    const free = [];
    let cursor = minX;
    for (let index = 0; index < merged.length; index += 1) {
      if (merged[index].lo > cursor) {
        free.push({ lo: cursor, hi: Math.min(maxX, merged[index].lo) });
      }
      cursor = Math.max(cursor, merged[index].hi);
      if (cursor > maxX) break;
    }
    if (cursor <= maxX) free.push({ lo: cursor, hi: maxX });
    if (!free.length) return null;

    let totalSpan = 0;
    for (let index = 0; index < free.length; index += 1) {
      totalSpan += Math.max(1, free[index].hi - free[index].lo);
    }
    let bestX = null;
    let bestScore = -1;
    const samples = 8;
    for (let attempt = 0; attempt < samples; attempt += 1) {
      let pick = Math.random() * totalSpan;
      let candidate = free[0].lo;
      for (let index = 0; index < free.length; index += 1) {
        const span = Math.max(1, free[index].hi - free[index].lo);
        if (pick <= span || index === free.length - 1) {
          const ratio = span <= 1 ? 0 : pick / span;
          candidate = free[index].lo + (free[index].hi - free[index].lo) * ratio;
          break;
        }
        pick -= span;
      }
      let score = canvasWidth;
      for (let index = 0; index < existingEnemies.length; index += 1) {
        const other = existingEnemies[index];
        const dist = Math.hypot(candidate - other.x, spawnY - other.y);
        if (dist < score) score = dist;
      }
      if (game.lastSpawnX !== null) {
        score += Math.min(Math.abs(candidate - game.lastSpawnX), canvasWidth * .45) * .35;
      }
      if (score > bestScore) {
        bestScore = score;
        bestX = candidate;
      }
    }
    return bestX;
  }

  /* Tách các thẻ nếu bị dồn sát sau khi đổi kích thước cửa sổ hoặc xoay màn hình điện thoại. */
  function resolveEnemyOverlaps() {
    if (game.enemies.length < 2) return;
    const width = game.size.width;
    const scale = game.objectScale;
    const pad = getEnemyPadding(scale);
    const ordered = game.enemies.slice().sort(function (a, b) { return b.y - a.y; });
    const placed = [];
    for (let index = 0; index < ordered.length; index += 1) {
      const enemy = ordered[index];
      let hasOverlap = false;
      for (let check = 0; check < placed.length; check += 1) {
        const other = placed[check];
        if (
          Math.abs(enemy.x - other.x) < (enemy.width + other.width) / 2 + pad.x &&
          Math.abs(enemy.y - other.y) < (enemy.height + other.height) / 2 + pad.y
        ) {
          hasOverlap = true;
          break;
        }
      }
      if (hasOverlap) {
        const safeX = findSafeSpawnX(enemy, enemy.y, width, scale, placed);
        if (safeX !== null) {
          enemy.x = safeX;
        } else {
          let highestConflictY = enemy.y;
          for (let check = 0; check < placed.length; check += 1) {
            const other = placed[check];
            if (Math.abs(enemy.x - other.x) < (enemy.width + other.width) / 2 + pad.x) {
              const targetY = other.y - (other.height + enemy.height) / 2 - pad.y;
              if (targetY < highestConflictY) highestConflictY = targetY;
            }
          }
          enemy.y = highestConflictY;
        }
      }
      placed.push(enemy);
    }
  }

  /* Đồng bộ kích thước Canvas với vùng hiển thị và tỉ lệ điểm ảnh thiết bị. */
  function resizeCanvas() {
    const bounds = elements.canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    const isLandscape = window.screen ? window.screen.width >= window.screen.height : bounds.width >= bounds.height;
    const baseWidth = isLandscape ? BASE_LONG_SIDE : BASE_SHORT_SIDE;
    const baseHeight = isLandscape ? BASE_SHORT_SIDE : BASE_LONG_SIDE;
    const scale = Math.min(1, bounds.width / baseWidth, bounds.height / baseHeight);
    const visibleObjectScale = Math.max(MIN_OBJECT_SCALE, Math.min(1, bounds.width / 820));
    const objectScale = Math.max(1, visibleObjectScale / scale);
    const width = bounds.width / scale;
    const height = bounds.height / scale;
    const oldWidth = game.size.width;
    const oldHeight = game.size.height;
    const oldObjectScale = game.objectScale;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    elements.canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
    elements.canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
    context.setTransform(ratio * scale, 0, 0, ratio * scale, 0, 0);
    game.size = { width: width, height: height };
    game.viewportWidth = bounds.width;
    game.objectScale = objectScale;
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
      resolveEnemyOverlaps();
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
      for (let index = 0; index < game.projectiles.length; index += 1) {
        game.projectiles[index].x *= width / oldWidth;
        game.projectiles[index].y *= height / oldHeight;
      }
      for (let index = 0; index < game.explosions.length; index += 1) {
        game.explosions[index].x *= width / oldWidth;
        game.explosions[index].y *= height / oldHeight;
      }
    }
  }

  /* Cập nhật sinh mục tiêu không chồng lấn, chuyển động, phi thuyền và hiệu ứng. */
  function updateWorld(delta) {
    const width = game.size.width;
    const height = game.size.height;
    const defenseY = height - 92 * game.objectScale;
    const difficulty = DIFFICULTIES[state.difficulty];
    const fallSpeed = Math.max(1, height - 73 * game.objectScale) / difficulty.fallSeconds;
    const maxEnemies = getMaxActiveEnemies(width, game.objectScale, game.viewportWidth);

    if (state.status === 'playing' && state.view === 'play') {
      if (game.config.mode === 'endless' && !game.queue.length) game.queue = shuffled(game.config.source);
      game.spawnTimer -= delta;
      if (game.enemies.length === 0 && game.spawnTimer > .25) game.spawnTimer = .25;
      if (game.spawnTimer <= 0 && game.queue.length && game.enemies.length < maxEnemies) {
        const nextWord = game.queue[0];
        const enemySize = getEnemySize(nextWord, game.objectScale, width);
        const spawnY = -enemySize.height / 2 - 12 * game.objectScale;
        const safeX = findSafeSpawnX(enemySize, spawnY, width, game.objectScale, game.enemies);
        if (safeX !== null) {
          const word = game.queue.shift();
          game.lastSpawnX = safeX;
          game.enemies.push({
            kanji: word.kanji,
            hiragana: word.hiragana,
            id: game.nextId++,
            x: safeX,
            y: spawnY,
            width: enemySize.width,
            height: enemySize.height,
            hitFlash: 0,
          });
          game.spawnTimer = difficulty.spawnInterval;
          state.activeCount = game.enemies.length;
          if (game.config.mode !== 'endless') state.remaining = game.queue.length + game.enemies.length;
          if (game.targetId === null) selectMostDangerous();
          updateGameStatus();
        } else {
          /* Chờ thẻ phía trên rơi qua vùng đệm để tuyệt đối không đè lên nhau. */
          game.spawnTimer = .2;
        }
      }
      const missed = [];
      const safeEnemies = [];
      for (let index = 0; index < game.enemies.length; index += 1) {
        const enemy = game.enemies[index];
        enemy.y += fallSpeed * delta;
        if (enemy.hitFlash > 0) enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
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
        showFeedback('{count} từ đã được lưu vào Học lại.', 'wrong', { count: missed.length });
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

    const lockedTarget = findEnemy(game.targetId);
    if (lockedTarget && width > 0 && height > 0) {
      const origin = getShipOrigin();
      game.ship.targetAngle = Math.atan2(lockedTarget.y - origin.y, lockedTarget.x - origin.x);
    } else {
      game.ship.targetAngle = -Math.PI / 2;
    }
    game.ship.angle += (game.ship.targetAngle - game.ship.angle) * Math.min(1, delta * 12);
    game.ship.recoil = Math.max(0, game.ship.recoil - delta * 34);
    game.ship.flash = Math.max(0, game.ship.flash - delta);

    const livingParticles = [];
    for (let index = 0; index < game.particles.length; index += 1) {
      const particle = game.particles[index];
      particle.life -= delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vx *= Math.max(0, 1 - delta * 1.4);
      particle.vy += 45 * game.objectScale * delta;
      if (particle.life > 0) livingParticles.push(particle);
    }
    game.particles = livingParticles;

    const livingLasers = [];
    for (let index = 0; index < game.lasers.length; index += 1) {
      game.lasers[index].life -= delta;
      if (game.lasers[index].life > 0) livingLasers.push(game.lasers[index]);
    }
    game.lasers = livingLasers;

    const livingProjectiles = [];
    for (let index = 0; index < game.projectiles.length; index += 1) {
      const projectile = game.projectiles[index];
      projectile.life -= delta;
      projectile.x += projectile.vx * delta;
      projectile.y += projectile.vy * delta;
      const inBounds = projectile.x >= -120 && projectile.x <= width + 120 && projectile.y >= -120 && projectile.y <= height + 120;
      if (projectile.life > 0 && inBounds) livingProjectiles.push(projectile);
    }
    game.projectiles = livingProjectiles;

    const livingExplosions = [];
    for (let index = 0; index < game.explosions.length; index += 1) {
      const explosion = game.explosions[index];
      explosion.life -= delta;
      const progress = 1 - Math.max(0, explosion.life) / explosion.maxLife;
      explosion.radius = explosion.maxRadius * (1 - Math.pow(1 - progress, 3));
      if (explosion.life > 0) livingExplosions.push(explosion);
    }
    game.explosions = livingExplosions;
  }

  /* Vẽ nền, phòng tuyến, mục tiêu, đường ngắm, hiệu ứng bắn và phi thuyền. */
  function drawWorld(time) {
    const width = game.size.width;
    const height = game.size.height;
    if (width < 1 || height < 1) return;
    const size = game.objectScale;
    const defenseY = height - 92 * size;
    const palette = getCanvasPalette();

    context.clearRect(0, 0, width, height);

    context.save();
    context.fillStyle = palette.star;
    for (let index = 0; index < 42; index += 1) {
      const x = (index * 137.5) % Math.max(width, 1);
      const y = (index * 83.7) % Math.max(height - 80 * size, 1);
      context.globalAlpha = .55 + Math.sin(time / 800 + index) * .35;
      const starSize = (index % 5 === 0 ? 2.2 : 1.2) * size;
      context.fillRect(x, y, starSize, starSize);
    }
    context.restore();

    context.save();
    context.strokeStyle = palette.defenseLine;
    context.lineWidth = 1.25 * size;
    context.setLineDash([9 * size, 9 * size]);
    context.beginPath();
    context.moveTo(0, defenseY);
    context.lineTo(width, defenseY);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = palette.defenseText;
    context.font = '800 ' + 9.5 * size + 'px system-ui';
    context.fillText(t('VẠCH PHÒNG THỦ'), 18 * size, defenseY + 20 * size);
    context.restore();

    const target = findEnemy(game.targetId);
    const shipOrigin = getShipOrigin();
    if (target) {
      context.save();
      context.strokeStyle = palette.aimLine;
      context.lineWidth = 1.2 * size;
      context.setLineDash([5 * size, 6 * size]);
      context.beginPath();
      context.moveTo(shipOrigin.x, shipOrigin.y);
      context.lineTo(target.x, target.y + target.height / 2);
      context.stroke();
      context.restore();
    }

    for (let index = 0; index < game.enemies.length; index += 1) {
      const enemy = game.enemies[index];
      const isTarget = enemy.id === game.targetId;
      const left = enemy.x - enemy.width / 2;
      const top = enemy.y - enemy.height / 2;
      const shakeX = enemy.hitFlash > 0 ? Math.sin(time * .09) * 3.5 * size : 0;
      context.save();
      if (isTarget) {
        context.shadowColor = palette.targetGlow;
        context.shadowBlur = palette.isLight ? 16 : 24;
      } else if (palette.isLight) {
        context.shadowColor = palette.enemyShadow;
        context.shadowBlur = 10;
        context.shadowOffsetY = 3;
      }
      context.fillStyle = isTarget ? palette.targetBg : palette.enemyBg;
      context.strokeStyle = enemy.hitFlash > 0 ? palette.hitBorder : (isTarget ? palette.targetBorder : palette.enemyBorder);
      context.lineWidth = (isTarget ? 2.2 : 1.2) * size;
      context.beginPath();
      context.roundRect(left + shakeX, top, enemy.width, enemy.height, 18 * size);
      context.fill();
      context.stroke();
      context.shadowBlur = 0;
      context.shadowOffsetY = 0;

      context.fillStyle = isTarget ? palette.targetText : palette.enemyText;
      const fontSize = (enemy.kanji.length > 4 ? 23 : enemy.kanji.length > 2 ? 28 : 33) * size;
      context.font = '800 ' + fontSize + 'px "Yu Gothic UI", "Noto Sans JP", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(enemy.kanji, enemy.x + shakeX, enemy.y - 3 * size, enemy.width - 12 * size);

      if (isTarget) {
        const preview = elements.answerPreview.textContent.trim();
        const isPrefix = normalizeAnswer(enemy.hiragana).startsWith(normalizeAnswer(preview));
        const progress = isPrefix ? Math.min(1, preview.length / Math.max(enemy.hiragana.length, 1)) : 0;
        context.fillStyle = palette.progressTrack;
        context.fillRect(left + 13 * size + shakeX, top + enemy.height - 11 * size, enemy.width - 26 * size, 3.2 * size);
        context.fillStyle = isPrefix ? palette.progressFill : palette.progressWrong;
        context.fillRect(left + 13 * size + shakeX, top + enemy.height - 11 * size, (enemy.width - 26 * size) * progress, 3.2 * size);
        context.fillStyle = palette.targetTag;
        context.font = '800 ' + 9.5 * size + 'px system-ui';
        context.fillText(t('MỤC TIÊU'), enemy.x + shakeX, top - 12 * size);
        if (preview) {
          context.fillStyle = isPrefix ? palette.previewOk : palette.previewBad;
          context.font = '700 ' + 14 * size + 'px "Yu Gothic UI", sans-serif';
          context.fillText(preview, enemy.x + shakeX, top + enemy.height + 16 * size, enemy.width + 24 * size);
        }
      }
      context.restore();
    }

    for (let index = 0; index < game.lasers.length; index += 1) {
      const laser = game.lasers[index];
      const alpha = Math.min(1, laser.life / laser.maxLife);
      const isMiss = laser.kind === 'miss';
      const isFinish = laser.kind === 'finish';
      context.save();
      context.globalAlpha = isMiss ? alpha * .75 : alpha;
      context.strokeStyle = isMiss ? palette.laserMiss : palette.laserHit;
      context.shadowColor = isMiss ? palette.laserMissGlow : palette.laserHitGlow;
      context.shadowBlur = (isFinish ? 20 : 12) * size;
      context.lineCap = 'round';
      context.lineWidth = (isFinish ? 4.2 : isMiss ? 2.6 : 2.8) * size;
      context.beginPath();
      context.moveTo(laser.x1, laser.y1);
      context.lineTo(laser.x2, laser.y2);
      context.stroke();
      if (!isMiss) {
        context.shadowBlur = 0;
        context.strokeStyle = palette.laserHitCore;
        context.lineWidth = (isFinish ? 1.8 : 1.1) * size;
        context.beginPath();
        context.moveTo(laser.x1, laser.y1);
        context.lineTo(laser.x2, laser.y2);
        context.stroke();
      }
      context.restore();
    }

    for (let index = 0; index < game.projectiles.length; index += 1) {
      const projectile = game.projectiles[index];
      const alpha = Math.min(1, projectile.life / projectile.maxLife);
      const tailLength = 42 * size;
      const tailX = projectile.x - Math.cos(projectile.angle) * tailLength;
      const tailY = projectile.y - Math.sin(projectile.angle) * tailLength;
      context.save();
      context.globalAlpha = alpha;
      context.strokeStyle = palette.laserMiss;
      context.shadowColor = palette.laserMissGlow;
      context.shadowBlur = 14 * size;
      context.lineCap = 'round';
      context.lineWidth = 4.5 * size;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(projectile.x, projectile.y);
      context.stroke();
      context.fillStyle = palette.laserMissCore;
      context.beginPath();
      context.arc(projectile.x, projectile.y, 3.2 * size, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    for (let index = 0; index < game.explosions.length; index += 1) {
      const explosion = game.explosions[index];
      const alpha = Math.max(0, explosion.life / explosion.maxLife);
      context.save();
      if (alpha > .45) {
        context.globalAlpha = (alpha - .45) * 1.4;
        context.fillStyle = palette.explosionFlash;
        context.beginPath();
        context.arc(explosion.x, explosion.y, explosion.radius * .55, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = alpha * .9;
      context.strokeStyle = palette.explosionRing;
      context.shadowColor = palette.explosionRing;
      context.shadowBlur = 16 * size;
      context.lineWidth = Math.max(1, 3.8 * alpha) * size;
      context.beginPath();
      context.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    for (let index = 0; index < game.particles.length; index += 1) {
      const particle = game.particles[index];
      context.save();
      context.globalAlpha = Math.min(1, particle.life / particle.maxLife);
      context.fillStyle = particle.color;
      context.shadowColor = particle.color;
      context.shadowBlur = palette.isLight ? 4 : 8;
      const dotSize = particle.size * size;
      context.fillRect(particle.x - dotSize / 2, particle.y - dotSize / 2, dotSize, dotSize);
      context.restore();
    }

    context.save();
    context.translate(shipOrigin.x, shipOrigin.y);
    context.rotate(game.ship.angle + Math.PI / 2);
    context.translate(0, game.ship.recoil * size);
    context.scale(size, size);
    context.fillStyle = palette.shipBody;
    context.strokeStyle = palette.shipStroke;
    context.lineWidth = 1.6;
    context.shadowColor = palette.shipGlow;
    context.shadowBlur = palette.isLight ? 10 : 18;
    context.beginPath();
    context.moveTo(0, -24);
    context.lineTo(34, 18);
    context.lineTo(12, 10);
    context.lineTo(0, 21);
    context.lineTo(-12, 10);
    context.lineTo(-34, 18);
    context.closePath();
    context.fill();
    context.stroke();
    context.shadowBlur = 0;
    context.fillStyle = palette.shipCore;
    context.fillRect(-3, -16, 6, 17);
    if (game.ship.flash > 0) {
      context.globalAlpha = Math.min(1, game.ship.flash * 11);
      context.fillStyle = game.ship.flashKind === 'miss' ? palette.muzzleMiss : palette.muzzleHit;
      context.beginPath();
      context.arc(0, -26, 7.5, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  /* Dùng thời gian thực và chặn bước thời gian lớn để chuyển động ổn định. */
  function animationLoop(time) {
    const delta = Math.min((time - game.previousTime) / 1000, .05);
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
      state.sourceNoticeKey = 'File quá lớn. Hãy dùng CSV dưới 2 MB.';
      state.sourceNoticeVars = null;
      updateSourceDisplay();
      event.target.value = '';
      return;
    }
    try {
      const parsed = parseVocabularyCsv(await file.text());
      state.words = parsed;
      state.sourceName = file.name;
      state.remaining = parsed.length;
      state.sourceNoticeKey = 'Đã đọc {count} từ hợp lệ.';
      state.sourceNoticeVars = { count: parsed.length };
      updateSetup();
    } catch (error) {
      state.sourceNoticeKey = error instanceof Error ? error.message : 'Không thể đọc file CSV.';
      state.sourceNoticeVars = null;
      updateSourceDisplay();
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

  /* Nhận đáp án qua form, bắn tia laser khi gõ ký tự và cập nhật bản xem trước Hiragana. */
  elements.inputDock.addEventListener('submit', function (event) {
    event.preventDefault();
    submitAnswer();
  });
  elements.answerInput.addEventListener('compositionstart', function () { state.composing = true; });
  elements.answerInput.addEventListener('compositionend', function () {
    state.composing = false;
    elements.answerInput.dispatchEvent(new Event('input'));
  });
  elements.answerInput.addEventListener('input', function (event) {
    const value = elements.answerInput.value;
    const isInsert = event.inputType ? event.inputType.startsWith('insert') : value.length > state.lastInputValue.length;
    state.lastInputValue = value;
    if (state.status === 'playing' && state.view === 'play' && isInsert && value.trim()) {
      fireTypingLaser();
    }
    const preview = toHiragana(value);
    if (preview) setIconText(elements.answerPreview, 'arrow-right', preview);
    else elements.answerPreview.replaceChildren();
    elements.answerPreview.classList.toggle('answer-form__preview--hidden', !preview);
    elements.answerSubmit.disabled = state.status !== 'playing' || !value.trim();
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
