(function () {
  'use strict';
  /* Lấy bản dịch nếu mô-đun tùy chọn đã sẵn sàng. */
  function t(source) {
    if (window.KanjiPreferences) return window.KanjiPreferences.t(source);
    return source;
  }

  /* Điền năm hiện tại vào các vị trí đánh dấu ở chân trang. */
  const yearElements = document.querySelectorAll('[data-year]');
  for (let index = 0; index < yearElements.length; index += 1) {
    yearElements[index].textContent = String(new Date().getFullYear());
  }

  /* Chỉ gắn xử lý liên hệ ở trang có form tương ứng. */
  const form = document.querySelector('#contact-form');
  if (!form) return;

  /* Ghép nội dung góp ý và sao chép để người dùng tự gửi qua kênh liên hệ. */
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const message = [
      t('Tên của bạn') + ': ' + data.get('name'),
      t('Email') + ': ' + data.get('email'),
      '',
      String(data.get('message')),
    ].join('\n');
    const status = document.querySelector('#contact-status');

    try {
      await navigator.clipboard.writeText(message);
      status.textContent = t('Đã sao chép. Bạn có thể dán nội dung vào kênh liên hệ của mình.');
      status.className = 'form-status form-status--success';
    } catch (error) {
      status.textContent = t('Trình duyệt không cho phép sao chép tự động. Hãy chọn và sao chép nội dung thủ công.');
      status.className = 'form-status form-status--error';
    }
  });
})();
