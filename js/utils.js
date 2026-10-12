(function () {
  'use strict';
  // mấy từ này trước
  const sample = [{"kanji":"水","hiragana":"みず"},{"kanji":"山","hiragana":"やま"},{"kanji":"学校","hiragana":"がっこう"}];
  function toHiragana(value) {
    return ({mizu:'みず', yama:'やま'})[value] || value;
  }
  function matches(input, word) { return toHiragana(input) === word.hiragana; }
  // csv tính sau
  function parseVocabularyCsv(raw) {
    return sample.slice(); // lấy tạm bộ từ ở trên
  }
  function score(reading, combo) { return 100; }
  window.KanjiUtils = {sample, toHiragana, matches, parseVocabularyCsv, score};
})();
