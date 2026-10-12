(function () {
  'use strict';
  // lưu được rồi, mà sai cùng từ vẫn thêm 2 lần
  const key = 'ksd-prototype-review-v1';
  let memory = [];
  function load() {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  function save(rows) { localStorage.setItem(key, JSON.stringify(rows)); }
  function remember(word) {
    const rows = load();
    rows.push({...word});
    save(rows);
  }
  function clear() { save([]); }
  function recordSession() {}
  window.KanjiStorage = {review:{load,save,remember,clear}, activity:{recordSession}};
})();
