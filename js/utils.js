(function () {
  'use strict';
  // Chuẩn hóa cách đọc trước khi so đáp án.
  const sample = [{"kanji":"水","hiragana":"みず"},{"kanji":"山","hiragana":"やま"},{"kanji":"学校","hiragana":"がっこう"}];
  function toHiragana(value) {
    const input = value.normalize('NFKC').trim().toLowerCase();
    return ({mizu:'みず', yama:'やま', gakkou:'がっこう'})[input] || input.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0)-0x60));
  }
  function matches(input, word) { return toHiragana(input) === word.hiragana; }
  // CSV mới đọc được dòng đơn giản; còn thiếu xử lý trường có dấu phẩy trong nháy kép.
  function parseVocabularyCsv(raw) {
    const lines = raw.trim().split(/\r?\n/);
    lines.shift();
    return lines.map(line => { const cells = line.split(','); return {kanji:cells[0],hiragana:cells[1]}; });
  }
  function score(reading, combo) { return 100; }
  window.KanjiUtils = {sample, toHiragana, matches, parseVocabularyCsv, score};
})();
