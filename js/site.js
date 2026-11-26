(function () {
  'use strict';

  /* Điền năm hiện tại vào các vị trí đánh dấu ở chân trang. */
  const yearElements = document.querySelectorAll('[data-year]');
  for (let index = 0; index < yearElements.length; index += 1) {
    yearElements[index].textContent = String(new Date().getFullYear());
  }

  /* Chỉ gắn xử lý liên hệ ở trang có form tương ứng. */
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const modal = document.querySelector('#contact-modal');
  const status = document.querySelector('#contact-status');
  const doneButton = document.querySelector('#contact-modal-done');

  function openModal() {
    if (!modal) return;
    modal.classList.remove('modal--hidden');
    if (doneButton) doneButton.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('modal--hidden');
  }

  if (modal) {
    const closeTargets = modal.querySelectorAll('[data-modal-close]');
    for (let index = 0; index < closeTargets.length; index += 1) {
      closeTargets[index].addEventListener('click', closeModal);
    }
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.classList.contains('modal--hidden')) closeModal();
    });
  }

  /* Hiển thị hộp thoại cảm ơn gọn gàng khi người dùng gửi góp ý. */
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (status) {
      status.textContent = '';
      status.className = 'form-status';
    }
    form.reset();
    openModal();
  });
})();
