(function () {
  'use strict';

  /* Các khóa lưu dữ liệu trong trình duyệt. */
  const KEYS = Object.freeze({
    users: 'kanji-sky-defense-users-v1',
    session: 'kanji-sky-defense-session-v1',
    review: 'kanji-sky-defense-review-v1',
    activity: 'kanji-sky-defense-activity-v1',
  });

  /* Đọc JSON với giá trị dự phòng khi dữ liệu không tồn tại hoặc không hợp lệ. */
  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value === null || value === undefined ? fallback : value;
    } catch (error) {
      // Trả giá trị dự phòng; khóa bị lỗi vẫn còn trong localStorage.
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /* Sinh định danh tài khoản cục bộ và chuẩn hóa email trước khi đối chiếu. */
  function createId() {
    return crypto.randomUUID ? crypto.randomUUID() : 'user-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function normalizeEmail(email) {
    return String(email).trim().toLowerCase();
  }

  /* Băm mật khẩu trước khi lưu cục bộ; nhánh dự phòng không thay thế xác thực máy chủ. */
  async function hashPassword(password) {
    if (crypto.subtle && window.TextEncoder) {
      const bytes = new TextEncoder().encode(password);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      const numbers = new Uint8Array(digest);
      let result = '';
      for (let index = 0; index < numbers.length; index += 1) {
        let part = numbers[index].toString(16);
        if (part.length === 1) part = '0' + part;
        result += part;
      }
      return result;
    }
    let hash = 2166136261;
    for (const character of password) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return 'local-' + (hash >>> 0).toString(16);
  }

  /* Truy xuất danh sách tài khoản và khôi phục thông tin phiên đang đăng nhập. */
  function getUsers() {
    const users = readJson(KEYS.users, []);
    return Array.isArray(users) ? users : [];
  }

  function saveUsers(users) {
    writeJson(KEYS.users, users);
  }

  function getSessionId() {
    return localStorage.getItem(KEYS.session);
  }

  function currentUser() {
    const id = getSessionId();
    if (!id) return null;
    const users = getUsers();
    let index = -1;
    for (let position = 0; position < users.length; position += 1) {
      if (users[position].id === id) {
        index = position;
        break;
      }
    }
    if (index < 0) return null;
    if (!users[index].createdAt) {
      const updated = {};
      const keys = Object.keys(users[index]);
      for (let position = 0; position < keys.length; position += 1) updated[keys[position]] = users[index][keys[position]];
      updated.createdAt = new Date().toISOString();
      users[index] = updated;
      saveUsers(users);
    }
    return users[index];
  }

  /* Tạo tài khoản cục bộ, mở phiên và chuyển danh sách ôn của khách sang tài khoản mới. */
  async function register(details) {
    const users = getUsers();
    const normalizedEmail = normalizeEmail(details.email);
    for (let index = 0; index < users.length; index += 1) {
      if (users[index].email === normalizedEmail) throw new Error('Email này đã được đăng ký.');
    }
    const user = {
      id: createId(),
      name: String(details.name).trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(details.password),
      birthday: '',
      avatar: '',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    localStorage.setItem(KEYS.session, user.id);
    const guestReviewKey = KEYS.review + ':guest';
    const guestWords = readJson(guestReviewKey, []);
    if (Array.isArray(guestWords) && guestWords.length) {
      writeJson(KEYS.review + ':' + user.id, guestWords);
      localStorage.removeItem(guestReviewKey);
    }
    return user;
  }

  /* Đối chiếu email/mật khẩu và cập nhật định danh phiên cục bộ. */
  async function login(email, password) {
    const users = getUsers();
    let user = null;
    for (let index = 0; index < users.length; index += 1) {
      if (users[index].email === normalizeEmail(email)) {
        user = users[index];
        break;
      }
    }
    if (!user || user.passwordHash !== await hashPassword(password)) throw new Error('Email hoặc mật khẩu chưa đúng.');
    localStorage.setItem(KEYS.session, user.id);
    return user;
  }

  function logout() {
    localStorage.removeItem(KEYS.session);
  }

  /* Kiểm tra dữ liệu chỉnh sửa, email trùng và ngày sinh trước khi lưu hồ sơ. */
  function updateAccount(changes) {
    const id = getSessionId();
    if (!id) return null;
    const users = getUsers();
    let index = -1;
    for (let position = 0; position < users.length; position += 1) {
      if (users[position].id === id) {
        index = position;
        break;
      }
    }
    if (index < 0) return null;
    const current = users[index];
    const name = String(changes.name === null || changes.name === undefined ? current.name : changes.name).trim();
    const email = normalizeEmail(changes.email === null || changes.email === undefined ? current.email : changes.email);
    const birthdayValue = changes.birthday === null || changes.birthday === undefined ? current.birthday : changes.birthday;
    const birthday = String(birthdayValue === null || birthdayValue === undefined ? '' : birthdayValue);
    if (name.length < 2) throw new Error('Tên người dùng cần ít nhất 2 ký tự.');
    for (let position = 0; position < users.length; position += 1) {
      if (users[position].id !== id && users[position].email === email) throw new Error('Email này đã được đăng ký.');
    }
    if (birthday && (Number.isNaN(Date.parse(birthday)) || new Date(birthday + 'T00:00:00') > new Date())) {
      throw new Error('Ngày sinh chưa hợp lệ.');
    }
    const updated = {};
    const keys = Object.keys(current);
    for (let position = 0; position < keys.length; position += 1) updated[keys[position]] = current[keys[position]];
    updated.name = name;
    updated.email = email;
    updated.birthday = birthday;
    updated.avatar = changes.avatar === undefined ? current.avatar || '' : String(changes.avatar || '');
    users[index] = updated;
    saveUsers(users);
    return users[index];
  }

  /* Thêm id vào khóa để không lẫn từ của hai tài khoản. */
  function scopeId() {
    return getSessionId() || 'guest';
  }

  function reviewKey() {
    return KEYS.review + ':' + scopeId();
  }

  /* Đọc từ đã lưu, có hỗ trợ chuyển khóa cũ. */
  function loadReview() {
    const key = reviewKey();
    const current = localStorage.getItem(key);
    if (current === null && localStorage.getItem(KEYS.review) !== null) {
      localStorage.setItem(key, localStorage.getItem(KEYS.review));
      localStorage.removeItem(KEYS.review);
    }
    const words = readJson(key, []);
    return Array.isArray(words) ? words : [];
  }

  function saveReview(words) {
    writeJson(reviewKey(), words);
  }

  /* Xóa đúng cặp Kanji/cách đọc; hỗ trợ xóa riêng hoặc xóa toàn bộ vùng học lại. */
  function removeReviewWord(kanji, hiragana) {
    const words = loadReview();
    const remaining = [];
    for (let index = 0; index < words.length; index += 1) {
      if (words[index].kanji !== kanji || words[index].hiragana !== hiragana) remaining.push(words[index]);
    }
    saveReview(remaining);
    return remaining;
  }

  function clearReview() {
    localStorage.removeItem(reviewKey());
  }

  /* Dùng ngày theo giờ địa phương để thống kê khớp ngày học của người dùng. */
  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  /* Đọc thống kê từng tài khoản; phiên khách trả về bộ số liệu trống. */
  function getActivityMap() {
    const map = readJson(KEYS.activity, {});
    return map && typeof map === 'object' && !Array.isArray(map) ? map : {};
  }

  function currentActivity() {
    if (!getSessionId()) return { days: {}, sessions: 0 };
    const data = getActivityMap()[scopeId()];
    return data && typeof data === 'object' ? data : { days: {}, sessions: 0 };
  }

  /* Chỉ ghi thống kê khi có phiên đăng nhập và giữ riêng dữ liệu từng người. */
  function mutateActivity(mutator) {
    if (!getSessionId()) return;
    const map = getActivityMap();
    const id = scopeId();
    const data = map[id] || { days: {}, sessions: 0 };
    mutator(data);
    map[id] = data;
    writeJson(KEYS.activity, map);
  }

  /* Ghi lượt bắt đầu phiên, chế độ và thời điểm học gần nhất. */
  function recordSession(mode) {
    mutateActivity(function (data) {
      data.sessions = (data.sessions || 0) + 1;
      data.lastMode = mode;
      data.lastPlayedAt = new Date().toISOString();
    });
  }

  /* Cộng số lần trả lời và số câu đúng vào thống kê ngày hiện tại. */
  function recordAttempt(correct) {
    mutateActivity(function (data) {
      const day = localDateKey();
      const current = data.days[day] || { attempts: 0, correct: 0 };
      current.attempts += 1;
      if (correct) current.correct += 1;
      data.days[day] = current;
      data.lastPlayedAt = new Date().toISOString();
    });
  }

  /* API lưu trữ chia theo tài khoản, danh sách ôn và hoạt động học. */
  window.KanjiStorage = Object.freeze({
    auth: Object.freeze({ currentUser: currentUser, login: login, logout: logout, register: register, updateAccount: updateAccount }),
    review: Object.freeze({ clear: clearReview, load: loadReview, remove: removeReviewWord, save: saveReview }),
    activity: Object.freeze({ get: currentActivity, localDateKey: localDateKey, recordAttempt: recordAttempt, recordSession: recordSession }),
  });
})();
