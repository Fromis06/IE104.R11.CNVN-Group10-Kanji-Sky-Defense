(function () {
  'use strict';

  /* Chỉ chạy logic hồ sơ trên trang cá nhân và lấy các API dùng chung. */
  const page = document.querySelector('#user-page');
  if (!page) return;

  const auth = window.KanjiStorage.auth;
  const activity = window.KanjiStorage.activity;
  const review = window.KanjiStorage.review;
  const formatDate = window.KanjiUtils.formatDate;
  const rankBySimilarity = window.KanjiUtils.rankBySimilarity;
  const resizeImageFile = window.KanjiUtils.resizeImageFile;
  const preferences = window.KanjiPreferences;
  const gate = document.querySelector('#user-gate');
  const dashboard = document.querySelector('#user-dashboard');
  let user = auth.currentUser();
  let chartPeriod = 'week';

  /* Hiện lời mời đăng nhập khi chưa có tài khoản; dừng khởi tạo dashboard. */
  if (!user) {
    gate.classList.remove('user-gate--hidden');
    dashboard.classList.add('account-layout--hidden');
    return;
  }

  gate.classList.add('user-gate--hidden');
  dashboard.classList.remove('account-layout--hidden');

  /* Tiện ích dịch, định dạng số và cộng thống kê cho các phần của hồ sơ. */
  function t(source, variables) {
    return preferences.t(source, variables);
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString(preferences.locale());
  }

  function sum(items, field) {
    let total = 0;
    for (let index = 0; index < items.length; index += 1) total += Number(items[index][field] || 0);
    return total;
  }

  /* Đồng bộ thông báo lưu hồ sơ và trạng thái avatar. */
  function setStatus(selector, message, type) {
    const status = document.querySelector(selector);
    status.textContent = message ? t(message) : '';
    const componentClass = status.id === 'avatar-status' ? 'avatar-editor__status' : 'account-form__status';
    status.className = 'form-status ' + componentClass + (type ? ' form-status--' + type : '');
  }

  /* Hiện ảnh đại diện nếu có, nếu không dùng ký tự tên làm ảnh thay thế. */
  function setAvatar(image, fallback, avatar) {
    const hasImage = Boolean(avatar);
    image.classList.toggle(image.classList[0] + '--hidden', !hasImage);
    fallback.classList.toggle(fallback.classList[0] + '--hidden', hasImage);
    if (hasImage) image.src = avatar;
    else image.removeAttribute('src');
  }

  /* Điền dữ liệu tài khoản vào sidebar và biểu mẫu chỉnh sửa. */
  function renderAccount() {
    const initial = user.name.trim().charAt(0).toUpperCase() || 'U';
    document.querySelector('#sidebar-name').textContent = user.name;
    document.querySelector('#sidebar-email').textContent = user.email;
    document.querySelector('#sidebar-avatar-fallback').textContent = initial;
    document.querySelector('#profile-avatar-fallback').textContent = initial;
    setAvatar(document.querySelector('#sidebar-avatar-image'), document.querySelector('#sidebar-avatar-fallback'), user.avatar);
    setAvatar(document.querySelector('#profile-avatar-image'), document.querySelector('#profile-avatar-fallback'), user.avatar);
    document.querySelector('#account-name').value = user.name;
    document.querySelector('#account-email').value = user.email;
    document.querySelector('#account-birthday').value = user.birthday || '';
    document.querySelector('#account-birthday').max = activity.localDateKey(new Date());
    document.querySelector('#account-created').value = formatDate(user.createdAt);
    document.querySelector('#avatar-remove').classList.toggle('button--hidden', !user.avatar);
  }

  /* Tính chuỗi ngày học liên tiếp từ thống kê theo ngày. */
  function calculateStreak(days) {
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const day = days[activity.localDateKey(cursor)];
      if (!day || !(day.attempts > 0)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  /* Chuẩn bị các mốc ngày và số liệu trong khoảng tuần hoặc tháng. */
  function chartPoints(period) {
    const data = activity.get();
    const days = data.days || {};
    const now = new Date();
    const points = [];
    if (period === 'week') {
      for (let index = 0; index < 7; index += 1) {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - index));
        const key = activity.localDateKey(date);
        const day = days[key];
        points.push({
          label: new Intl.DateTimeFormat(preferences.locale(), { weekday: 'short' }).format(date),
          value: day ? day.attempts || 0 : 0,
        });
      }
      return points;
    }

    for (let index = 0; index < 6; index += 1) {
      const rangeStart = new Date(now);
      rangeStart.setDate(now.getDate() - 29 + index * 5);
      let value = 0;
      for (let offset = 0; offset < 5; offset += 1) {
        const date = new Date(rangeStart);
        date.setDate(rangeStart.getDate() + offset);
        const day = days[activity.localDateKey(date)];
        value += Number(day ? day.attempts || 0 : 0);
      }
      points.push({ label: new Intl.DateTimeFormat(preferences.locale(), { day: '2-digit', month: '2-digit' }).format(rangeStart), value: value });
    }
    return points;
  }

  /* Lấy màu theme hiện tại để biểu đồ Canvas đồng bộ với giao diện. */
  function cssVariable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* Tạm in tổng số từ, chưa vẽ biểu đồ. */
  function drawChart() {
    const canvas=document.querySelector('#learning-chart');
    const context=canvas.getContext('2d');
    canvas.width=600; canvas.height=240;
    context.clearRect(0,0,600,240); context.fillStyle=cssVariable('--accent');
    const points=chartPoints(chartPeriod);
    context.font='18px sans-serif'; context.fillText('Số từ luyện: '+points.reduce((n,p)=>n+p.value,0),20,80);
  }

  /* Tổng hợp lượt học, số từ, độ chính xác và chuỗi ngày lên các thẻ thống kê. */
  function renderStats() {
    const data = activity.get();
    const days = [];
    const dayMap = data.days || {};
    const dayKeys = Object.keys(dayMap);
    for (let index = 0; index < dayKeys.length; index += 1) days.push(dayMap[dayKeys[index]]);
    const attempts = sum(days, 'attempts');
    const correct = sum(days, 'correct');
    document.querySelector('#stat-sessions').textContent = formatNumber(data.sessions);
    document.querySelector('#stat-words').textContent = formatNumber(attempts);
    document.querySelector('#stat-accuracy').textContent = attempts ? Math.round(correct / attempts * 100) + '%' : '0%';
    document.querySelector('#stat-streak').textContent = t('{count} ngày', { count: calculateStreak(data.days || {}) });
  }

  /* Lọc/xếp hạng từ cần ôn và dựng các thẻ từ cùng nút xóa. */
  function renderLibrary() {
    const content = document.querySelector('#forgotten-library');
    const query = document.querySelector('#library-search').value.trim();
    const allWords = review.load().sort(function (left, right) {
      return right.mistakeCount - left.mistakeCount;
    });
    const ranked = rankBySimilarity(allWords, query, function (word) {
      return [word.kanji, word.hiragana];
    });
    let words = allWords;
    if (query) {
      words = [];
      for (let index = 0; index < ranked.length; index += 1) {
        if (ranked[index].score <= 1.65) words.push(ranked[index].item);
      }
    }
    document.querySelector('#library-count').textContent = t('{count} từ', { count: allWords.length });
    document.querySelector('#review-now').classList.toggle('button--hidden', allWords.length === 0);
    document.querySelector('#clear-library').classList.toggle('button--hidden', allWords.length === 0);
    content.replaceChildren();

    if (!words.length) {
      const empty = document.createElement('div');
      empty.className = 'word-library__empty';
      const message = document.createElement('strong');
      message.className = 'word-library__empty-message';
      message.textContent = t(query ? 'Không tìm thấy từ phù hợp' : 'Chưa có từ bị quên');
      empty.append(window.KanjiIcons.create('book-open', 'word-library__empty-icon'), message);
      content.append(empty);
      return;
    }

    for (let index = 0; index < words.length; index += 1) {
      const word = words[index];
      const item = document.createElement('article');
      item.className = 'word-library__item' + (query && index === 0 ? ' word-library__item--best-match' : '');
      const pair = document.createElement('div');
      pair.className = 'word-library__pair';
      const kanji = document.createElement('strong');
      kanji.className = 'word-library__kanji';
      kanji.textContent = word.kanji;
      const reading = document.createElement('span');
      reading.className = 'word-library__reading';
      reading.textContent = word.hiragana;
      pair.append(kanji, reading);
      const count = document.createElement('span');
      count.className = 'word-library__count-badge';
      count.textContent = t('{count} lần', { count: word.mistakeCount });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'word-library__remove';
      remove.setAttribute('aria-label', t('Xóa {word} khỏi thư viện', { word: word.kanji }));
      remove.append(window.KanjiIcons.create('close'));
      remove.addEventListener('click', function () {
        review.remove(word.kanji, word.hiragana);
        renderLibrary();
      });
      item.append(pair, count, remove);
      content.append(item);
    }
  }

  /* Chuyển giữa tài khoản và cài đặt, đồng bộ trạng thái menu sidebar. */
  function showPanel(name) {
    const buttons = document.querySelectorAll('[data-user-panel]');
    for (let index = 0; index < buttons.length; index += 1) {
      const button = buttons[index];
      const active = button.dataset.userPanel === name;
      button.classList.toggle('profile-sidebar__menu-item--active', active);
      button.setAttribute('aria-pressed', String(active));
    }
    const panels = document.querySelectorAll('[data-user-panel-content]');
    for (let index = 0; index < panels.length; index += 1) {
      panels[index].classList.toggle('user-panel--hidden', panels[index].dataset.userPanelContent !== name);
    }
    if (name === 'account') requestAnimationFrame(drawChart);
  }

  /* Phản ánh tùy chọn đã lưu vào các điều khiển theme, ngôn ngữ và trợ năng. */
  function renderSettings() {
    const settings = preferences.get();
    const buttons = document.querySelectorAll('[data-theme-option]');
    for (let index = 0; index < buttons.length; index += 1) {
      const button = buttons[index];
      const active = button.dataset.themeOption === settings.theme;
      button.classList.toggle('theme-selector__option--active', active);
      button.setAttribute('aria-pressed', String(active));
    }
    document.querySelector('#language-select').value = settings.language;
    document.querySelector('#reduce-motion').checked = settings.reduceMotion;
    document.querySelector('#show-shortcuts').checked = settings.showShortcuts;
    document.querySelector('#confirm-delete').checked = settings.confirmBeforeDelete;
  }

  const panelButtons = document.querySelectorAll('[data-user-panel]');
  for (let index = 0; index < panelButtons.length; index += 1) {
    panelButtons[index].addEventListener('click', function () {
      showPanel(this.dataset.userPanel);
    });
  }
  const periodButtons = document.querySelectorAll('[data-chart-period]');
  for (let index = 0; index < periodButtons.length; index += 1) {
    periodButtons[index].addEventListener('click', function () {
      chartPeriod = this.dataset.chartPeriod;
      for (let itemIndex = 0; itemIndex < periodButtons.length; itemIndex += 1) {
        periodButtons[itemIndex].classList.toggle('segmented-control__option--active', periodButtons[itemIndex] === this);
      }
      drawChart();
    });
  }

  document.querySelector('#account-form').addEventListener('submit', function (event) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const data = new FormData(event.currentTarget);
    try {
      user = auth.updateAccount({ name: data.get('name'), email: data.get('email'), birthday: data.get('birthday') });
      renderAccount();
      setStatus('#account-status', 'Đã cập nhật tài khoản.', 'success');
      window.dispatchEvent(new Event('kanji-auth-change'));
    } catch (error) {
      setStatus('#account-status', error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.', 'error');
    }
  });

  document.querySelector('#avatar-button').addEventListener('click', function () {
    document.querySelector('#avatar-input').click();
  });
  document.querySelector('#avatar-input').addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const avatar = await resizeImageFile(file);
      user = auth.updateAccount({ avatar: avatar });
      renderAccount();
      setStatus('#avatar-status', 'Đã cập nhật ảnh đại diện.', 'success');
      window.dispatchEvent(new Event('kanji-auth-change'));
    } catch (error) {
      setStatus('#avatar-status', error instanceof Error ? error.message : 'Không thể đọc ảnh này.', 'error');
    } finally {
      event.target.value = '';
    }
  });
  document.querySelector('#avatar-remove').addEventListener('click', function () {
    user = auth.updateAccount({ avatar: '' });
    renderAccount();
    setStatus('#avatar-status', 'Đã xóa ảnh đại diện.', 'success');
    window.dispatchEvent(new Event('kanji-auth-change'));
  });

  document.querySelector('#library-search').addEventListener('input', renderLibrary);
  document.querySelector('#review-now').addEventListener('click', function () {
    window.location.href = 'index.html?review=1';
  });
  document.querySelector('#clear-library').addEventListener('click', function () {
    if (preferences.get().confirmBeforeDelete && !window.confirm(t('Xóa toàn bộ thư viện từ đã quên?'))) return;
    review.clear();
    renderLibrary();
  });
  document.querySelector('#user-logout').addEventListener('click', function () {
    auth.logout();
    window.location.href = 'index.html';
  });

  const themeButtons = document.querySelectorAll('[data-theme-option]');
  for (let index = 0; index < themeButtons.length; index += 1) {
    themeButtons[index].addEventListener('click', function () {
      preferences.update({ theme: this.dataset.themeOption });
    });
  }
  document.querySelector('#language-select').addEventListener('change', function (event) {
    preferences.update({ language: event.target.value });
  });
  document.querySelector('#reduce-motion').addEventListener('change', function (event) {
    preferences.update({ reduceMotion: event.target.checked });
  });
  document.querySelector('#show-shortcuts').addEventListener('change', function (event) {
    preferences.update({ showShortcuts: event.target.checked });
  });
  document.querySelector('#confirm-delete').addEventListener('change', function (event) {
    preferences.update({ confirmBeforeDelete: event.target.checked });
  });
  /* Vẽ lại nội dung phụ thuộc theme hoặc ngôn ngữ khi tùy chọn thay đổi. */
  window.addEventListener('kanji-preferences-change', function () {
    renderSettings();
    renderAccount();
    renderStats();
    renderLibrary();
    requestAnimationFrame(drawChart);
  });

  renderAccount();
  renderSettings();
  renderStats();
  renderLibrary();
  drawChart();
  new ResizeObserver(drawChart).observe(document.querySelector('#learning-chart'));
})();
