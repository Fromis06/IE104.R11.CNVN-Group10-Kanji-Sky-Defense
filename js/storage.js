(function () {
  'use strict';
  // chỗ lưu từ sai
  const key = 'ksd-prototype-review-v1';
  let memory = [];
  function load() {
    return memory.slice();
  }
  function save(rows) { memory = rows.slice(); }
  function remember(word) {
    const rows = load();
    rows.push({...word});
    save(rows);
  }
  function clear() { save([]); }
  function recordSession() {}
  window.KanjiStorage = {review:{load,save,remember,clear}, activity:{recordSession}};
})();
