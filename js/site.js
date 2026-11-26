(function () {
  'use strict';
  /* Lấy bản dịch nếu module tùy chọn đã có. */
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

  /* Hiển thị trạng thái xác nhận khi người dùng gửi góp ý. */
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const status = document.querySelector('#contact-status');
    status.textContent = t('Đã gửi');
    status.className = 'form-status form-status--success';
  });
})();
