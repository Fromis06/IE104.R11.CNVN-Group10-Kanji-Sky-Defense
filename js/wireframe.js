/* Mẫu header và footer phục vụ bảng wireframe; không xử lý phiên đăng nhập thật. */
const header = (active = 'Thiết lập', signedIn = false) => `
  <header class="wf-header" aria-label="Header dùng chung">
    <div class="wf-brand"><span class="wf-brand__mark">漢</span><span><strong>KANJI SKY DEFENSE</strong><small>Typing defense station</small></span></div>
    <nav class="wf-header__nav" aria-label="Điều hướng chính">
      ${(active === 'Thiết lập' || active === 'Chơi' || active === 'Học lại' ? ['Thiết lập', 'Chơi', 'Học lại'] : ['Chơi', 'Giới thiệu', 'Liên hệ', 'Quyền riêng tư']).map(item => `<span class="wf-nav-item ${active === item ? 'is-active' : ''}">${item}</span>`).join('')}
    </nav>
    <div class="wf-header__account">${signedIn ? '<span class="wf-avatar">U</span><span>Tài khoản</span>' : '<span>Đăng nhập</span><span class="wf-button wf-button--small">Đăng ký</span>'}</div>
  </header>`;

const footer = () => `
  <footer class="wf-footer" aria-label="Footer dùng chung"><span>© Kanji Sky Defense</span><span>Giới thiệu</span><span>Liên hệ</span><span>Quyền riêng tư</span></footer>`;

/* Các mảnh giao diện nhỏ để ghép nhiều trạng thái màn hình mà không lặp markup. */
const button = (label, primary = false) => `<span class="wf-button ${primary ? 'wf-button--primary' : ''}">${label}</span>`;
const field = (label, value = '') => `<label class="wf-field"><span>${label}</span><span class="wf-field__box">${value || '________________________'}</span></label>`;
const box = (title, body, extra = '') => `<section class="wf-box ${extra}"><h3>${title}</h3>${body}</section>`;
const row = (label, value) => `<div class="wf-data-row"><span>${label}</span><strong>${value}</strong></div>`;
const heading = (eyebrow, title, desc = '') => `<div class="wf-page-heading"><small>${eyebrow}</small><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ''}</div>`;

/* Mô tả các biến thể thiết lập chế độ và HP trên bản phác thảo. */
function setup(mode, hp) {
  const modeLabel = mode === 'study' ? 'Study' : mode === 'challenge' ? 'Challenge' : 'Endless';
  const modeCards = [
    ['study', 'Study', 'Học không áp lực'],
    ['challenge', 'Challenge', 'Vượt qua một bộ từ'],
    ['endless', 'Endless', 'Chơi không giới hạn']
  ].map(([key, title, description]) => `<div class="wf-choice ${mode === key ? 'is-selected' : ''}"><span class="wf-choice__icon">□</span><strong>${title}</strong><small>${description}</small></div>`).join('');
  const hpCard = mode === 'study' ? '' : box('04 · Giới hạn HP', `<p>${mode === 'challenge' ? 'Challenge luôn sử dụng HP.' : 'Bật hoặc tắt giới hạn HP.'}</p><div class="wf-inline"><span class="wf-counter">− &nbsp; ${hp ? '♥ 3' : 'Không HP'} &nbsp; +</span>${mode === 'endless' ? '<span class="wf-toggle">HP: ' + (hp ? 'Bật' : 'Tắt') + '</span>' : ''}</div>`);
  return `${heading('THIẾT LẬP NHIỆM VỤ', 'Chọn cách bạn muốn học.', 'Nạp bộ từ, chọn chế độ và tốc độ trước khi bắt đầu.')}
    <div class="wf-two-col"><div class="wf-stack">
      ${box('01 · Dữ liệu từ vựng', `<div class="wf-split"><p><strong>Bộ mẫu · 12 từ</strong><br><small>Có thể nạp file CSV riêng</small></p><div class="wf-inline">${button('Nạp CSV')}${button('CSV mẫu')}</div></div><div class="wf-note">Định dạng: kanji,hiragana</div>`)}
      ${box('02 · Chế độ chơi', `<div class="wf-choice-grid">${modeCards}</div>`)}
      ${box('03 · Tốc độ rơi', `<div class="wf-choice-grid wf-choice-grid--speed"><div class="wf-choice"><strong>Dễ</strong><small>24 giây</small></div><div class="wf-choice is-selected"><strong>Vừa</strong><small>16 giây</small></div><div class="wf-choice"><strong>Khó</strong><small>11 giây</small></div></div>`)}
      ${hpCard}
    </div><aside class="wf-box wf-summary"><h3>Tóm tắt nhiệm vụ</h3>${row('Bộ từ', '12 từ')}${row('Chế độ', modeLabel)}${row('Tốc độ', 'Vừa')}${row('HP', hp ? '3 HP' : 'Không giới hạn')}<div class="wf-note">Nhập Hiragana hoặc Romaji, Enter để xác nhận.</div>${button('BẮT ĐẦU NHIỆM VỤ', true)}</aside></div>`;
}

/* Minh họa trạng thái chơi, tạm dừng và kết thúc để đối chiếu thiết kế. */
function play(state) {
  const overlays = {
    paused: ['ĐÃ TẠM DỪNG', 'Nhiệm vụ tạm nghỉ', 'Tiếp tục khi bạn đã sẵn sàng.', 'Tiếp tục'],
    won: ['HOÀN THÀNH', 'Nhiệm vụ hoàn thành!', 'Bạn đã bảo vệ phòng tuyến.', 'Chơi lại'],
    lost: ['THẤT BẠI', 'Phòng tuyến thất thủ', 'Hãy học lại các từ đã bỏ lỡ.', 'Thử lại']
  };
  const overlay = overlays[state];
  return `<div class="wf-play-toolbar">${button('← Thiết lập')}<div class="wf-inline">${button('Tạm dừng')}${button('Chơi lại')}</div></div>
    <div class="wf-game"><div class="wf-game__status"><strong>STUDY</strong><span>∞ Không HP</span><span>ĐIỂM&nbsp; 120</span><span>COMBO&nbsp; 3</span><span>9 từ còn lại</span></div>
      <div class="wf-game__field"><small>Airspace 01 · Study sector</small><span class="wf-target wf-target--one">学校</span><span class="wf-target wf-target--two">先生</span><span class="wf-target wf-target--three">日本</span><div class="wf-defense-line">VẠCH PHÒNG THỦ</div>${overlay ? `<div class="wf-overlay"><small>${overlay[0]}</small><h2>${overlay[1]}</h2><p>${overlay[2]}</p><div class="wf-inline">${button(overlay[3], true)}${button(state === 'paused' ? 'Về thiết lập' : 'Học lại')}</div></div>` : ''}</div>
      <div class="wf-game__answer"><div><small>ĐANG TÌM MỤC TIÊU</small><p>Nhập Hiragana hoặc Romaji, rồi nhấn Enter.</p></div><div class="wf-inline"><span class="wf-input">gakkou hoặc がっこう</span>${button('Xác nhận · Enter', true)}${button('Đổi mục tiêu · Tab')}</div></div>
    </div>`;
}

/* Mô tả học lại khi có dữ liệu và khi danh sách trống. */
function review(filled) {
  const content = filled
    ? `<div class="wf-review-actions">${button('Xóa lịch sử')}${button('Học ngay', true)}</div><div class="wf-review-list">${[['学校', 'がっこう', '2 lần'], ['先生', 'せんせい', '1 lần'], ['日本', 'にほん', '3 lần']].map(([word, reading, count]) => `<div class="wf-review-row"><strong>${word}</strong><span>${reading}</span><small>${count} bỏ lỡ</small>${button('Ôn từ')}</div>`).join('')}</div>`
    : `<div class="wf-empty"><span class="wf-empty__icon">□</span><h3>Chưa có từ nào cần học lại</h3><p>Các từ trả lời sai hoặc bỏ lỡ sẽ xuất hiện ở đây.</p>${button('Bắt đầu học', true)}</div>`;
  return `${heading('BỘ NHỚ HỌC TẬP', 'Học lại các từ đã lỡ.', 'Sai khi nhấn Enter hoặc để từ vượt phòng tuyến đều được ghi lại tại đây.')}${content}`;
}

/* Dựng form đăng nhập/đăng ký và các phần hồ sơ cho tài liệu wireframe. */
function auth(register) {
  return `<div class="wf-auth"><h2>${register ? 'Biến mỗi lần chơi thành kiến thức' : 'Tiếp tục hành trình học Kanji'}</h2><div class="wf-box wf-auth__card"><small>${register ? 'TẠO TÀI KHOẢN' : 'CHÀO MỪNG TRỞ LẠI'}</small><h3>${register ? 'Đăng ký' : 'Đăng nhập'}</h3>${register ? field('Tên hiển thị') : ''}${field('Email')}${field('Mật khẩu')}${register ? field('Xác nhận mật khẩu') : ''}${button(register ? 'Tạo tài khoản' : 'Đăng nhập', true)}<p>${register ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</p></div></div>`;
}

function profileSide(active) {
  return `<aside class="wf-box wf-profile-side"><div class="wf-profile-side__user"><span class="wf-avatar wf-avatar--large">U</span><strong>Người học</strong><small>user@example.com</small></div><div class="wf-profile-side__menu"><span class="${active === 'account' ? 'is-active' : ''}">Tài khoản</span><span class="${active === 'settings' ? 'is-active' : ''}">Cài đặt</span></div><span>Đăng xuất</span></aside>`;
}

function account(settings) {
  const main = settings
    ? `${heading('CÀI ĐẶT', 'Cài đặt')}${box('Giao diện', `<div class="wf-inline"><div class="wf-choice">Sáng</div><div class="wf-choice is-selected">Tối</div></div>`)}${box('Ngôn ngữ', `<div class="wf-select">Tiếng Việt ▾</div>`)}${box('Tùy chọn', `${row('Giảm chuyển động', '○')}${row('Hiển thị phím tắt', '●')}${row('Xác nhận trước khi xóa', '●')}`)}`
    : `${heading('TÀI KHOẢN', 'Thông tin tài khoản')}${box('Hồ sơ', `<div class="wf-profile-form"><div class="wf-profile-photo"><span class="wf-avatar wf-avatar--huge">U</span>${button('Đổi ảnh')}</div><div class="wf-stack">${field('Tên người dùng', 'Người học')}${field('Email', 'user@example.com')}${field('Ngày sinh', 'dd/mm/yyyy')}${field('Ngày tham gia', '—')}${button('Lưu thay đổi', true)}</div></div>`)}<div class="wf-stat-grid">${['Phiên học', 'Từ đã luyện', 'Độ chính xác', 'Chuỗi học'].map(t => `<div class="wf-box"><small>${t}</small><strong>—</strong></div>`).join('')}</div>${box('Số từ đã luyện', `<div class="wf-split"><span></span><span>Tuần　 Tháng</span></div><div class="wf-chart">BIỂU ĐỒ TIẾN ĐỘ</div>`)}${box('Từ đã quên', `<div class="wf-input">Tìm Kanji hoặc cách đọc</div><div class="wf-review-list"><div class="wf-review-row"><strong>学校</strong><span>がっこう</span><small>2 lần</small></div></div>`)}`;
  return `<div class="wf-account">${profileSide(settings ? 'settings' : 'account')}<div class="wf-stack">${main}</div></div>`;
}

function gate() {
  return `<div class="wf-empty wf-gate"><span class="wf-empty__icon">認</span><h2>Đăng nhập để xem tiến độ.</h2><div class="wf-inline">${button('Đăng nhập', true)}${button('Tạo tài khoản')}</div></div>`;
}

/* Dựng các trang thông tin, liên hệ, quyền riêng tư và lỗi 404 trong bảng thiết kế. */
function about() {
  return `${heading('VỀ DỰ ÁN', 'Học Kanji bằng cách bảo vệ bầu trời.', 'Gõ Hiragana. Bảo vệ phòng tuyến. Ghi nhớ từng từ qua mỗi trận chơi.')}
    <div class="wf-hero-placeholder">MINH HỌA / KHU VỰC GIỚI THIỆU</div><div class="wf-three-col">${box('01 · Chọn từ', '<p>Dùng bộ từ mẫu hoặc nạp CSV.</p>')}${box('02 · Phòng thủ', '<p>Nhập cách đọc để chặn Kanji.</p>')}${box('03 · Học lại', '<p>Ôn các từ đã trả lời sai.</p>')}</div>${box('Chọn chế độ phù hợp', '<div class="wf-choice-grid"><div class="wf-choice">Study</div><div class="wf-choice">Challenge</div><div class="wf-choice">Endless</div></div>')}`;
}

function contact() {
  return `${heading('LIÊN HỆ', 'Liên hệ với chúng tôi.', 'Gửi góp ý để cải thiện trải nghiệm học Kanji.')}
    <div class="wf-two-col">${box('Gửi lời nhắn', `<div class="wf-stack">${field('Họ và tên')}${field('Email')}${field('Chủ đề')}<label class="wf-field"><span>Nội dung</span><span class="wf-field__box wf-field__box--large"></span></label>${button('Gửi liên hệ', true)}</div>`)}${box('Thông tin khác', '<p>Góp ý về nội dung, lỗi hoặc ý tưởng mới.</p><div class="wf-note">Kanji Sky Defense</div>')}</div>`;
}

function privacy() {
  return `${heading('THÔNG TIN', 'Quyền riêng tư.', 'Cách dữ liệu học tập và tài khoản được xử lý.')}
    <div class="wf-article">${['Dữ liệu chúng tôi lưu', 'Mục đích sử dụng', 'Lưu trữ trên thiết bị', 'Quyền của bạn', 'Liên hệ'].map((title, i) => box(`${String(i + 1).padStart(2, '0')} · ${title}`, '<div class="wf-text-lines"><span></span><span></span><span class="short"></span></div>')).join('')}</div>`;
}

function notFound() {
  return `<div class="wf-empty wf-not-found"><span class="wf-error-code">404</span><h2>Không tìm thấy trang</h2><p>Trang bạn cần có thể đã được di chuyển hoặc không tồn tại.</p>${button('Về trang chủ', true)}</div>`;
}

const screens = [
  ['Thiết lập · Study', 'Thiết lập', setup('study', false)],
  ['Thiết lập · Challenge', 'Thiết lập', setup('challenge', true)],
  ['Thiết lập · Endless không HP', 'Thiết lập', setup('endless', false)],
  ['Thiết lập · Endless có HP', 'Thiết lập', setup('endless', true)],
  ['Đang chơi', 'Chơi', play('playing')],
  ['Tạm dừng', 'Chơi', play('paused')],
  ['Hoàn thành', 'Chơi', play('won')],
  ['Thất bại', 'Chơi', play('lost')],
  ['Học lại · Có từ', 'Học lại', review(true)],
  ['Học lại · Trống', 'Học lại', review(false)],
  ['Đăng nhập', 'Tài khoản', auth(false)],
  ['Đăng ký', 'Tài khoản', auth(true)],
  ['Tài khoản', 'Tài khoản', account(false)],
  ['Cài đặt', 'Tài khoản', account(true)],
  ['Chưa đăng nhập', 'Tài khoản', gate()],
  ['Giới thiệu', 'Thông tin', about()],
  ['Liên hệ', 'Thông tin', contact()],
  ['Quyền riêng tư', 'Thông tin', privacy()],
  ['Lỗi 404', 'Thông tin', notFound()]
];

const nav = document.getElementById('screen-links');
const list = document.getElementById('screen-list');
const componentList = document.getElementById('component-list');

componentList.innerHTML = `<article class="component-card"><div class="component-card__title"><strong>Header</strong><span>Biến thể điều hướng / tài khoản</span></div><div class="component-card__viewport">${header('Thiết lập')}</div><div class="component-card__viewport">${header('Tài khoản', true)}</div></article><article class="component-card"><div class="component-card__title"><strong>Footer</strong><span>Điều hướng thông tin</span></div><div class="component-card__viewport">${footer()}</div></article>`;

screens.forEach(([name, group, body], index) => {
  const id = `screen-${String(index + 1).padStart(2, '0')}`;
  const active = group === 'Thông tin' ? name : group === 'Tài khoản' ? 'Tài khoản' : group;
  const signedIn = name === 'Tài khoản' || name === 'Cài đặt';
  nav.insertAdjacentHTML('beforeend', `<a href="#${id}"><span>${String(index + 1).padStart(2, '0')}</span>${name}</a>`);
  list.insertAdjacentHTML('beforeend', `<article class="screen-card" id="${id}"><div class="screen-card__top"><div><span class="screen-card__number">${String(index + 1).padStart(2, '0')}</span><h3>${name}</h3></div><span class="screen-card__group">${group}</span></div><div class="wf-viewport">${header(active, signedIn)}<div class="wf-main">${body}</div>${footer()}</div></article>`);
});
