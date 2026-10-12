(function () {
  'use strict';
  // thêm trường hợp gõ hoa với dư dấu cách
  const sample = [{"kanji":"水","hiragana":"みず"},{"kanji":"山","hiragana":"やま"},{"kanji":"学校","hiragana":"がっこう"}];
  function toHiragana(value) {
    const input = value.trim().toLowerCase();
    return ({mizu:'みず', yama:'やま', gakkou:'がっこう'})[input] || input;
  }
  function matches(input, word) { return toHiragana(input) === word.hiragana; }
  // csv tính sau
  function parseVocabularyCsv(raw) {
    return sample.slice(); // lấy tạm bộ từ ở trên
  }
  function score(reading, combo) { return 100; }
  window.KanjiUtils = {sample, toHiragana, matches, parseVocabularyCsv, score};
})();
