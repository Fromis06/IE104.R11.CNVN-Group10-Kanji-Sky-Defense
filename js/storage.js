(function () {
  'use strict';
  // Đọc danh sách từ cần ôn; dữ liệu hỏng thì trả về danh sách trống.
  const key = 'ksd-prototype-review-v1';
  let memory = [];
  function load() {
    try { const rows=JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(rows) ? rows : []; } catch { return []; }
  }
  function save(rows) { localStorage.setItem(key, JSON.stringify(rows)); }
  function remember(word) {
    const rows = load();
    const found = rows.find(row => row.kanji===word.kanji && row.hiragana===word.hiragana);
    if (found) found.mistakeCount += 1;
    else rows.push({...word, mistakeCount:1});
    save(rows);
  }
  function clear() { save([]); }
  function recordSession() {}
  window.KanjiStorage = {review:{load,save,remember,clear}, activity:{recordSession}};
})();
