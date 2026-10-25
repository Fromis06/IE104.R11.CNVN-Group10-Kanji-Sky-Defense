(function () {
  'use strict';

  /* Bảng chuyển âm; thử âm dài trước để phân biệt các tổ hợp như kya và ka. */
  const ROMAJI = {
    kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
    sha: 'しゃ', shu: 'しゅ', sho: 'しょ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
    ja: 'じゃ', ju: 'じゅ', jo: 'じょ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ',
    cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', cya: 'ちゃ', cyu: 'ちゅ', cyo: 'ちょ',
    tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ', dya: 'ぢゃ', dyu: 'ぢゅ', dyo: 'ぢょ',
    nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ', hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
    bya: 'びゃ', byu: 'びゅ', byo: 'びょ', pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
    mya: 'みゃ', myu: 'みゅ', myo: 'みょ', rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
    she: 'しぇ', je: 'じぇ', che: 'ちぇ', tsa: 'つぁ', tsi: 'つぃ', tse: 'つぇ', tso: 'つぉ',
    fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', va: 'ゔぁ', vi: 'ゔぃ', vu: 'ゔ', ve: 'ゔぇ', vo: 'ゔぉ',
    shi: 'し', chi: 'ち', tsu: 'つ',
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
    ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
    sa: 'さ', si: 'し', su: 'す', se: 'せ', so: 'そ',
    za: 'ざ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
    ta: 'た', ti: 'ち', tu: 'つ', te: 'て', to: 'と',
    da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
    na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
    ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ',
    ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
    pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
    ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
    ya: 'や', yu: 'ゆ', yo: 'よ',
    ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
    wa: 'わ', wo: 'を', wi: 'うぃ', we: 'うぇ',
    ji: 'じ', a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お', '-': 'ー',
  };
  const ROMAJI_KEYS = Object.keys(ROMAJI).sort(function (a, b) {
    return b.length - a.length;
  });

  /* Tiện ích truy vấn DOM dùng chung; cho phép giới hạn trong một phần tử gốc. */
  function $(selector, root) {
    if (root === undefined) root = document;
    return root.querySelector(selector);
  }

  function $$(selector, root) {
    if (root === undefined) root = document;
    const found = root.querySelectorAll(selector);
    const result = [];
    for (let index = 0; index < found.length; index += 1) result.push(found[index]);
    return result;
  }

  /* Đưa Katakana về Hiragana để so sánh cách đọc trên cùng một hệ chữ. */
  function katakanaToHiragana(value) {
    return value.replace(/[ァ-ヶ]/g, function (character) {
      return String.fromCharCode(character.charCodeAt(0) - 0x60);
    });
  }

  /* Đọc Romaji tuần tự, xử lý phụ âm đôi và âm n theo ký tự kế tiếp. */
  function toHiragana(value) {
    const input = katakanaToHiragana(value.normalize('NFKC').toLowerCase()).replace(/\s+/g, '');
    let output = '';
    let index = 0;
    while (index < input.length) {
      const character = input[index];
      if (/[぀-ゟー]/.test(character)) {
        output += character;
        index += 1;
        continue;
      }
      if (/[^a-z'-]/.test(character)) {
        output += character;
        index += 1;
        continue;
      }
      const next = input[index + 1];
      if (character === next && /[bcdfghjklmpqrstvwxyz]/.test(character) && character !== 'n') {
        output += 'っ';
        index += 1;
        continue;
      }
      if (character === 'n') {
        if (next === "'") {
          output += 'ん';
          index += 2;
          continue;
        }
        if (next === 'n') {
          output += 'ん';
          index += 1;
          continue;
        }
        if (!next || !/[aiueoy]/.test(next)) {
          output += 'ん';
          index += 1;
          continue;
        }
      }
      let matched = '';
      for (let keyIndex = 0; keyIndex < ROMAJI_KEYS.length; keyIndex += 1) {
        if (input.startsWith(ROMAJI_KEYS[keyIndex], index)) {
          matched = ROMAJI_KEYS[keyIndex];
          break;
        }
      }
      if (matched) {
        output += ROMAJI[matched];
        index += matched.length;
      } else {
        output += character;
        index += 1;
      }
    }
    return output;
  }

  /* Chuẩn hóa Unicode và bỏ ký tự phân cách không ảnh hưởng đến đáp án. */
  function normalizeAnswer(value) {
    return katakanaToHiragana(value.normalize('NFKC')).replace(/[\s・]/g, '');
  }

  /* Tách trường CSV nhưng giữ dấu phẩy và dấu nháy nằm trong trường được bao nháy. */
  function parseCsvLine(line) {
    const fields = [];
    let current = '';
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"') {
        if (quoted && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (character === ',' && !quoted) {
        fields.push(current.trim());
        current = '';
      } else {
        current += character;
      }
    }
    fields.push(current.trim());
    return fields;
  }

  /* Kiểm tra tên cột và dòng trống; chưa xử lý nháy kép và từ trùng. */
  function parseVocabularyCsv(raw) {
    const lines=raw.trim().split(/\r?\n/);
    if(lines.shift().toLowerCase()!=='kanji,hiragana') throw new Error('Dòng đầu phải gồm đúng hai cột: kanji,hiragana');
    const result=lines.map(line=>line.split(',')).filter(cells=>cells.length===2&&cells[0]&&cells[1]).map(cells=>({kanji:cells[0].trim(),hiragana:normalizeAnswer(cells[1])}));
    if(!result.length) throw new Error('Không tìm thấy dòng từ vựng hợp lệ.');
    return result;
  }

  /* Đảo thứ tự bằng sort trước, chưa chắc cách này chia đều. */
  function shuffled(items) {
    // Sort ngẫu nhiên chưa cho phân phối đều; cần thay cách xáo trộn.
    return items.slice().sort(function () { return Math.random() - .5; });
  }

  /* Tính khoảng cách chỉnh sửa để xếp hạng các cách viết gần giống. */
  function editDistance(left, right) {
    let previous = [];
    for (let index = 0; index <= right.length; index += 1) previous.push(index);
    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
      const current = [leftIndex];
      for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
        current[rightIndex] = Math.min(
          current[rightIndex - 1] + 1,
          previous[rightIndex] + 1,
          previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
        );
      }
      previous = current;
    }
    return previous[right.length];
  }

  /* Chuẩn hóa truy vấn và ưu tiên khớp chính xác, tiền tố rồi độ gần giống. */
  function normalizeSearch(value) {
    return String(value).normalize('NFKC').trim().toLowerCase().replace(/\s+/g, '');
  }

  function similarityScore(value, query) {
    const target = normalizeSearch(value);
    const normalizedQuery = normalizeSearch(query);
    if (!target || !normalizedQuery) return Number.POSITIVE_INFINITY;
    if (target === normalizedQuery) return 0;
    if (target.startsWith(normalizedQuery)) return .15 + (target.length - normalizedQuery.length) / 100;
    const position = target.indexOf(normalizedQuery);
    if (position >= 0) return .45 + position / 100;
    return 1 + editDistance(target, normalizedQuery) / Math.max(target.length, normalizedQuery.length);
  }

  /* Tìm chữ có chứa phần nhập vào, gõ gần giống thì chưa ra. */
  function rankBySimilarity(items, query, getValues) {
    const needle=String(query).trim().toLowerCase();
    return items.filter(item=>!needle||[].concat(getValues(item)).some(value=>String(value).toLowerCase().includes(needle))).map(item=>({item,score:0}));
  }

  /* Kiểm tra ảnh, cắt vuông và thu nhỏ avatar trước khi lưu dữ liệu cục bộ. */
  async function resizeImageFile(file, size) {
    if (size === undefined) size = 320;
    if (!file || !file.type.startsWith('image/')) throw new Error('Vui lòng chọn một tệp ảnh.');
    if (file.size > 8 * 1024 * 1024) throw new Error('Ảnh phải nhỏ hơn 8 MB.');
    const source = URL.createObjectURL(file);
    try {
      const image = await new Promise(function (resolve, reject) {
        const element = new Image();
        element.onload = function () { resolve(element); };
        element.onerror = function () { reject(new Error('Không thể đọc ảnh này.')); };
        element.src = source;
      });
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      const crop = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - crop) / 2;
      const sourceY = (image.naturalHeight - crop) / 2;
      context.drawImage(image, sourceX, sourceY, crop, crop, 0, 0, size, size);
      return canvas.toDataURL('image/jpeg', .86);
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  /* Định dạng ngày theo ngôn ngữ đang dùng trên website. */
  function formatDate(value) {
    const locale = window.KanjiPreferences ? window.KanjiPreferences.locale() : 'vi-VN';
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
  }

  /* Công bố API tiện ích; các chi tiết xử lý vẫn nằm trong phạm vi mô-đun. */
  window.KanjiUtils = Object.freeze({
    $: $,
    $$: $$,
    formatDate: formatDate,
    normalizeAnswer: normalizeAnswer,
    parseVocabularyCsv: parseVocabularyCsv,
    rankBySimilarity: rankBySimilarity,
    resizeImageFile: resizeImageFile,
    shuffled: shuffled,
    toHiragana: toHiragana,
  });
})();
