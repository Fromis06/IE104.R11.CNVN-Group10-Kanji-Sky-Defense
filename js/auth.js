(function () {
  'use strict';

  /* Chỉ khởi tạo giao diện tài khoản sau khi lớp lưu trữ đã được nạp. */
  const auth = window.KanjiStorage && window.KanjiStorage.auth;
  if (!auth) return;
  function t(source) {
    if (window.KanjiPreferences) return window.KanjiPreferences.t(source);
    return source;
  }

  /* Tạo liên kết tài khoản bằng DOM và bản dịch hiện tại. */
  function makeLink(href, text, className) {
    const link = document.createElement('a');
    link.href = href;
    link.className = className === undefined ? 'account-nav__link' : className;
    link.textContent = t(text);
    return link;
  }

  /* Hiện đăng nhập/đăng ký cho khách hoặc hồ sơ/đăng xuất cho người đã đăng nhập. */
  function renderNavigation() {
    const user = auth.currentUser();
    const containers = document.querySelectorAll('[data-auth-nav]');
    for (let index = 0; index < containers.length; index += 1) {
      const container = containers[index];
      container.replaceChildren();
      if (!user) {
        container.append(makeLink('login.html', 'Đăng nhập'), makeLink('register.html', 'Đăng ký', 'account-nav__link account-nav__link--primary'));
        continue;
      }

      const profile = makeLink('user.html', '', 'account-nav__profile');
      const avatar = document.createElement('span');
      avatar.className = 'account-nav__avatar';
      if (user.avatar) {
        avatar.classList.add('account-nav__avatar--has-image');
        avatar.style.backgroundImage = 'url(' + user.avatar + ')';
      } else {
        avatar.textContent = user.name.trim().charAt(0).toUpperCase() || 'U';
      }
      const label = document.createElement('span');
      label.className = 'account-nav__name';
      label.textContent = user.name;
      profile.append(avatar, label);

      const logout = document.createElement('button');
      logout.type = 'button';
      logout.className = 'account-nav__logout';
      logout.textContent = t('Đăng xuất');
      logout.addEventListener('click', function () {
        auth.logout();
        window.location.href = 'about.html';
      });
      container.append(profile);
      if (!document.body.hasAttribute('data-user-area')) container.append(logout);
    }
  }

  /* Hiển thị kết quả xử lý ngay tại biểu mẫu tài khoản và lưu khóa nguồn để đổi ngôn ngữ. */
  function setFormStatus(form, message, type) {
    const status = form.querySelector('[data-auth-status]');
    if (!status) return;
    status.dataset.statusKey = message || '';
    status.textContent = message ? t(message) : '';
    status.className = 'form-status' + (type ? ' form-status--' + type : '');
  }

  /* Đóng hoặc mở hộp thoại quên mật khẩu trên trang đăng nhập. */
  function bindForgotPasswordModal() {
    const trigger = document.querySelector('#forgot-password-trigger');
    const modal = document.querySelector('#forgot-modal');
    if (!trigger || !modal) return;
    const resetForm = modal.querySelector('[data-auth-form="reset"]');
    const resetEmail = modal.querySelector('#reset-email');
    const loginEmail = document.querySelector('#login-email');

    function openModal() {
      if (resetForm) {
        resetForm.reset();
        setFormStatus(resetForm, '');
      }
      if (resetEmail && loginEmail && loginEmail.value.trim()) {
        resetEmail.value = loginEmail.value.trim();
      }
      modal.classList.remove('modal--hidden');
      if (resetEmail) resetEmail.focus();
    }

    function closeModal() {
      modal.classList.add('modal--hidden');
      trigger.focus();
    }

    trigger.addEventListener('click', openModal);
    const closeTargets = modal.querySelectorAll('[data-modal-close]');
    for (let index = 0; index < closeTargets.length; index += 1) {
      closeTargets[index].addEventListener('click', closeModal);
    }
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.classList.contains('modal--hidden')) closeModal();
    });
  }

  /* Kiểm tra form, khóa nút khi đang xử lý và chuyển tới hồ sơ khi thành công. */
  function bindAuthForms() {
    const forms = document.querySelectorAll('[data-auth-form]');
    for (let index = 0; index < forms.length; index += 1) {
      const form = forms[index];
      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const submit = form.querySelector('button[type="submit"]');
        const data = new FormData(form);
        const formType = form.dataset.authForm;
        submit.disabled = true;
        setFormStatus(form, 'Đang xử lý…');

        try {
          if (formType === 'register') {
            if (data.get('password') !== data.get('confirmPassword')) throw new Error('Mật khẩu xác nhận chưa khớp.');
            await auth.register({ name: data.get('name'), email: data.get('email'), password: data.get('password') });
            setFormStatus(form, 'Thành công. Đang mở trang cá nhân…', 'success');
            window.setTimeout(function () { window.location.href = 'user.html'; }, 350);
          } else if (formType === 'reset') {
            if (data.get('password') !== data.get('confirmPassword')) throw new Error('Mật khẩu xác nhận chưa khớp.');
            const email = String(data.get('email') || '').trim();
            await auth.resetPassword(email, data.get('password'));
            setFormStatus(form, 'Đã đặt lại mật khẩu. Bạn có thể đăng nhập ngay.', 'success');
            const loginEmail = document.querySelector('#login-email');
            const loginPassword = document.querySelector('#login-password');
            if (loginEmail) loginEmail.value = email;
            if (loginPassword) loginPassword.value = '';
            submit.disabled = false;
            window.setTimeout(function () {
              const modal = document.querySelector('#forgot-modal');
              if (modal) modal.classList.add('modal--hidden');
              if (loginPassword) loginPassword.focus();
            }, 950);
          } else {
            await auth.login(data.get('email'), data.get('password'));
            setFormStatus(form, 'Thành công. Đang mở trang cá nhân…', 'success');
            window.setTimeout(function () { window.location.href = 'user.html'; }, 350);
          }
        } catch (error) {
          setFormStatus(form, error instanceof Error ? error.message : 'Không thể hoàn tất thao tác.', 'error');
          submit.disabled = false;
        }
      });
    }
  }

  /* Dịch lại các thông báo trạng thái đang hiển thị khi đổi ngôn ngữ. */
  function refreshStatuses() {
    const statuses = document.querySelectorAll('[data-auth-status]');
    for (let index = 0; index < statuses.length; index += 1) {
      const key = statuses[index].dataset.statusKey;
      if (key) statuses[index].textContent = t(key);
    }
  }

  /* Đồng bộ lần đầu và cập nhật lại khi tài khoản hoặc ngôn ngữ thay đổi. */
  renderNavigation();
  bindAuthForms();
  bindForgotPasswordModal();
  window.addEventListener('kanji-auth-change', renderNavigation);
  window.addEventListener('kanji-preferences-change', function () {
    renderNavigation();
    refreshStatuses();
  });
})();
