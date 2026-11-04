(function () {
  'use strict';

  /* Thiết lập mặc định và khóa lưu tùy chọn giao diện trên trình duyệt. */
  const KEY = 'kanji-sky-defense-preferences-v1';
  const DEFAULTS = Object.freeze({
    theme: 'dark',
    language: 'vi',
    reduceMotion: false,
    showShortcuts: true,
    confirmBeforeDelete: true,
  });
  const LOCALES = Object.freeze({ vi: 'vi-VN', en: 'en-US', ja: 'ja-JP' });

  /* Từ điển Anh/Nhật dùng chuỗi tiếng Việt làm khóa; thiếu bản dịch thì giữ nguyên. */
  const TRANSLATIONS = {
    en: {
      'Thiết lập': 'Setup',
      'Chơi': 'Play',
      'Học lại': 'Review',
      'Giới thiệu': 'About',
      'Liên hệ': 'Contact',
      'Quyền riêng tư': 'Privacy',
      'Thông tin': 'Information',
      'Cá nhân': 'Profile',
      'Đăng nhập': 'Sign in',
      'Đăng ký': 'Sign up',
      'Đăng xuất': 'Sign out',
      'Tạo tài khoản': 'Create account',
      'Tài khoản': 'Account',
      'Cài đặt': 'Settings',
      'Thông tin tài khoản': 'Account information',
      'Ảnh đại diện': 'Profile picture',
      'Đổi ảnh': 'Change photo',
      'Xóa ảnh': 'Remove photo',
      'Tên người dùng': 'Username',
      'Ngày sinh': 'Date of birth',
      'Ngày tham gia': 'Joined date',
      'Lưu thay đổi': 'Save changes',
      'Phiên học': 'Study sessions',
      'Từ đã luyện': 'Words practised',
      'Độ chính xác': 'Accuracy',
      'Chuỗi học': 'Study streak',
      'Số từ đã luyện': 'Words practised',
      'Tuần': 'Week',
      'Tháng': 'Month',
      'Từ đã quên': 'Forgotten words',
      'Xóa tất cả': 'Clear all',
      'Ôn ngay': 'Review now',
      'Tìm Kanji hoặc cách đọc': 'Search Kanji or reading',
      'Giao diện': 'Appearance',
      'Sáng': 'Light',
      'Tối': 'Dark',
      'Ngôn ngữ': 'Language',
      'Tiếng Việt': 'Vietnamese',
      'Tiếng Anh': 'English',
      'Tiếng Nhật': 'Japanese',
      'Tùy chọn': 'Preferences',
      'Giảm chuyển động': 'Reduce motion',
      'Hiển thị phím tắt': 'Show keyboard shortcuts',
      'Xác nhận trước khi xóa': 'Confirm before deleting',
      'Trang cá nhân': 'Profile page',
      'Điều hướng chính': 'Main navigation',
      'Tổng quan tiến độ': 'Progress overview',
      'Khoảng thời gian biểu đồ': 'Chart range',
      'Biểu đồ tiến độ học': 'Learning progress chart',
      'Đăng nhập để xem tiến độ.': 'Sign in to view your progress.',
      'Vào nhiệm vụ': 'Start mission',
      'Chưa có từ bị quên': 'No forgotten words yet',
      'Không tìm thấy từ phù hợp': 'No matching words found',
      'Đã cập nhật tài khoản.': 'Account updated.',
      'Đã cập nhật ảnh đại diện.': 'Profile picture updated.',
      'Đã xóa ảnh đại diện.': 'Profile picture removed.',
      'Không thể đọc ảnh này.': 'This image could not be read.',
      'Vui lòng chọn một tệp ảnh.': 'Please choose an image file.',
      'Ảnh phải nhỏ hơn 8 MB.': 'The image must be smaller than 8 MB.',
      'Tên người dùng cần ít nhất 2 ký tự.': 'The username must contain at least 2 characters.',
      'Ngày sinh chưa hợp lệ.': 'The date of birth is invalid.',
      'Email này đã được đăng ký.': 'This email is already registered.',
      'Email hoặc mật khẩu chưa đúng.': 'Incorrect email or password.',
      'Mật khẩu xác nhận chưa khớp.': 'Passwords do not match.',
      'Đang xử lý…': 'Processing…',
      'Thành công. Đang mở trang cá nhân…': 'Success. Opening your profile…',
      'Không thể hoàn tất thao tác.': 'The action could not be completed.',
      'Tiếp tục hành trình học Kanji': 'Continue your Kanji journey',
      'Biến mỗi lần chơi thành kiến thức': 'Turn every game into knowledge',
      'Đăng nhập Kanji Sky Defense.': 'Sign in to Kanji Sky Defense.',
      'Tạo tài khoản Kanji Sky Defense.': 'Create a Kanji Sky Defense account.',
      'Chào mừng trở lại': 'Welcome back',
      'Email': 'Email',
      'Mật khẩu': 'Password',
      'Xác nhận mật khẩu': 'Confirm password',
      'Tên hiển thị': 'Display name',
      'Chưa có tài khoản?': 'New here?',
      'Đã có tài khoản?': 'Already have an account?',
      'Không tìm thấy trang này': 'This page could not be found',
      'Không tìm thấy trang trong Kanji Sky Defense.': 'Page not found in Kanji Sky Defense.',
      'Giới thiệu · Kanji Sky Defense': 'About · Kanji Sky Defense',
      'Đăng nhập · Kanji Sky Defense': 'Sign in · Kanji Sky Defense',
      'Đăng ký · Kanji Sky Defense': 'Sign up · Kanji Sky Defense',
      'Trang cá nhân · Kanji Sky Defense': 'Profile · Kanji Sky Defense',
      'Không tìm thấy trang · Kanji Sky Defense': 'Page not found · Kanji Sky Defense',
      'Mất tín hiệu mục tiêu': 'Target signal lost',
      'Đường dẫn có thể đã thay đổi hoặc không tồn tại': 'The address may have changed or no longer exists',
      'Quay lại trạm chính để tiếp tục học': 'Return to the main station to continue learning',
      'Về trang chơi': 'Back to game',
      'Mở trang cá nhân': 'Open profile',
      'Về trò chơi': 'About the game',
      'Ghi nhớ cách đọc bằng trò chơi': 'Remember readings through play',
      'Kanji Sky Defense biến mỗi từ vựng thành một mục tiêu đang tiến về phòng tuyến. Bạn đọc Kanji, gõ cách đọc và bảo vệ bầu trời an toàn.': 'Kanji Sky Defense turns each word into a target approaching your defence line. Read the Kanji, type its reading, and keep the sky safe.',
      'Tìm hiểu cách Kanji Sky Defense giúp bạn luyện đọc Kanji.': 'Learn how Kanji Sky Defense helps you practise reading Kanji.',
      'Cách chơi': 'How to play',
      'Bắt đầu nhiệm vụ': 'Start mission',
      'Chọn bộ từ': 'Choose a word set',
      'Gõ cách đọc': 'Type the reading',
      'Ôn từ đã lỡ': 'Review missed words',
      '3 chế độ chơi': 'Three game modes',
      'Chọn chế độ chơi phù hợp với nhu cầu của bạn': 'Choose the game mode that suits your needs',
      'Liên hệ · Kanji Sky Defense': 'Contact · Kanji Sky Defense',
      'Quyền riêng tư · Kanji Sky Defense': 'Privacy · Kanji Sky Defense',
      'Chính sách lưu trữ dữ liệu cục bộ và cookie của Kanji Sky Defense.': 'Kanji Sky Defense local data storage and cookie policy.',
      'Chính sách lưu trữ dữ liệu': 'Data storage policy',
      'Kanji Sky Defense là ứng dụng web chạy trực tiếp trong trình duyệt. Phiên bản hiện tại không có backend và không gửi dữ liệu học tập hoặc tài khoản của bạn lên máy chủ của ứng dụng.': 'Kanji Sky Defense runs entirely in your browser. The current version has no backend and does not send your learning or account data to an application server.',
      'Cập nhật lần cuối: 12/09/2026': 'Last updated: September 12, 2026',
      'Tóm tắt chính sách': 'Policy summary',
      'Tóm tắt nhanh': 'At a glance',
      'Dữ liệu được lưu trên thiết bị bằng': 'Data is stored on your device using',
      'Ứng dụng hiện không tự đặt cookie.': 'The app currently does not set cookies.',
      'Không có quảng cáo hoặc công cụ theo dõi bên thứ ba.': 'There are no ads or third-party trackers.',
      'Bạn có thể xóa dữ liệu qua phần cài đặt trình duyệt.': 'You can clear the data through your browser settings.',
      'Dữ liệu được lưu': 'Data we store',
      'Khi bạn sử dụng các tính năng tương ứng, trình duyệt có thể lưu tên hiển thị, email, mã băm mật khẩu, ngày sinh, ảnh đại diện, ngày tạo tài khoản và mã phiên đăng nhập. Ứng dụng cũng lưu cài đặt giao diện, ngôn ngữ, tùy chọn truy cập, thống kê học tập và danh sách từ cần ôn.': 'When you use the relevant features, your browser may store your display name, email, password hash, date of birth, profile picture, account creation date, and sign-in session ID. The app also stores appearance settings, language, accessibility preferences, learning statistics, and your review list.',
      'Không nên sử dụng mật khẩu thật hoặc mật khẩu đang dùng cho dịch vụ khác. Hệ thống tài khoản chỉ là mô phỏng phía trình duyệt và không thay thế cơ chế xác thực có máy chủ.': 'Do not use a real password or one that you use for another service. This account system is only a browser-based simulation and is not a substitute for server-side authentication.',
      'Mục đích lưu trữ': 'Why we store it',
      'Dữ liệu cục bộ được dùng để duy trì đăng nhập, khôi phục lựa chọn giao diện, hiển thị tiến độ và giúp bạn tiếp tục ôn những từ đã trả lời sai. File CSV và nội dung góp ý chỉ được xử lý trong trình duyệt; biểu mẫu liên hệ sao chép nội dung vào clipboard và không tự gửi đi.': 'Local data keeps you signed in, restores your appearance choices, displays your progress, and lets you continue reviewing words you answered incorrectly. CSV files and feedback are processed only in your browser; the contact form copies the message to your clipboard and does not send it automatically.',
      'Cookie và theo dõi': 'Cookies and tracking',
      'Mã nguồn hiện tại không tạo cookie và không tích hợp quảng cáo, phân tích hành vi hoặc tracker bên thứ ba. Nếu cách triển khai website thay đổi và bắt đầu sử dụng cookie, chính sách này cần được cập nhật trước khi áp dụng.': 'The current code does not create cookies or integrate ads, behavioural analytics, or third-party trackers. If the website deployment changes and begins using cookies, this policy must be updated before they are introduced.',
      'Thời gian lưu và quyền kiểm soát': 'Retention and your control',
      'thường tiếp tục tồn tại sau khi đóng và mở lại trình duyệt. Dữ liệu được giữ cho đến khi ứng dụng xóa mục tương ứng, trình duyệt tự dọn dữ liệu, hoặc bạn xóa dữ liệu website trong phần quyền riêng tư của trình duyệt. Đăng xuất chỉ xóa phiên đăng nhập, không xóa hồ sơ đã lưu.': 'usually remains after you close and reopen your browser. Data is kept until the app removes the relevant item, the browser clears it automatically, or you clear the website data in your browser privacy settings. Signing out removes only the sign-in session, not the saved profile.',
      'Bảo mật và giới hạn': 'Security and limitations',
      'Dữ liệu cục bộ thuộc origin của website và không được ứng dụng tự động gửi kèm mọi yêu cầu như cookie. Tuy vậy, người có quyền truy cập thiết bị, hồ sơ trình duyệt hoặc mã chạy trong cùng origin có thể tiếp cận dữ liệu này. Không lưu thông tin nhạy cảm trong ứng dụng.': 'Local data belongs to the website origin and, unlike cookies, is not automatically sent with every request. However, anyone with access to the device, browser profile, or code running on the same origin may be able to access it. Do not store sensitive information in the app.',
      'Thay đổi và liên hệ': 'Changes and contact',
      'Chính sách có thể được cập nhật khi chức năng lưu trữ hoặc cách triển khai thay đổi. Ngày cập nhật mới nhất sẽ luôn được ghi ở đầu trang. Nếu có câu hỏi, bạn có thể chuẩn bị nội dung tại trang': 'This policy may be updated when storage features or deployment methods change. The latest revision date will always appear at the top of this page. If you have questions, you can prepare a message on the',
      'Tham khảo kỹ thuật': 'Technical references',
      'Thông tin về cơ chế lưu trữ được tham khảo từ tài liệu Web Storage và HTTP Cookie của MDN.': 'Information about storage mechanisms is based on MDN documentation for Web Storage and HTTP cookies.',
      'Góp ý để trang web phát triển.': 'Help us improve the website.',
      'Nếu bạn gặp lỗi khi sử dụng trang web, hãy gửi phản hồi của bạn cho chúng tôi nhé, mọi ý kiến đều được trân trọng và được xem xét để cải thiện trải nghiệm người dùng hơn nữa.': 'If you encounter a problem while using the website, send us your feedback. We value every suggestion and will consider it to improve the experience.',
      'Gửi góp ý cho Kanji Sky Defense.': 'Send feedback about Kanji Sky Defense.',
      'Gửi': 'Send',
      'Tên của bạn': 'Your name',
      'Nội dung góp ý': 'Feedback',
      'Sao chép nội dung': 'Copy message',
      'Nội dung sẽ được sao chép để bạn gửi qua kênh liên hệ phù hợp.': 'Your message will be copied so you can send it through your preferred channel.',
      'Thiết lập nhiệm vụ': 'Mission setup',
      'Chọn cách bạn muốn học.': 'Choose how you want to learn.',
      'Nạp bộ từ của riêng bạn, chọn chế độ và tốc độ. Bảo vệ bầu trời !': 'Upload your own word set, choose a mode and speed, and defend the sky!',
      'Luyện đọc Kanji bằng một trận chiến phòng thủ trên bầu trời.': 'Practise reading Kanji in a sky defence battle.',
      'Gõ Hiragana. Bảo vệ bầu trời.': 'Type Hiragana. Defend the sky.',
      'Về trang thiết lập': 'Back to setup',
      'Dữ liệu từ vựng': 'Vocabulary data',
      'Bộ mẫu · 12 từ': 'Sample set · 12 words',
      '12 từ': '12 words',
      '12 từ còn lại': '12 words left',
      'Bạn có thể chơi ngay hoặc nạp file CSV riêng.': 'Play now or upload your own CSV file.',
      'Nạp CSV': 'Upload CSV',
      'CSV mẫu': 'Sample CSV',
      'Hai cột UTF-8:': 'Two UTF-8 columns:',
      'Chế độ chơi': 'Game mode',
      'Học không áp lực': 'Learn without pressure',
      'Không có HP. Từ bị bỏ lỡ hoặc trả lời sai sẽ tự động vào Học lại.': 'No HP. Missed or incorrect words are automatically added to Review.',
      'Vượt qua một bộ từ': 'Complete a word set',
      'Có HP tùy chỉnh. Hoàn thành toàn bộ bộ từ trước khi phòng tuyến thất thủ.': 'Custom HP. Complete the entire word set before the defence line falls.',
      'Chơi không giới hạn': 'Play without limits',
      'Từ vựng lặp vô tận. Bạn có thể bật hoặc tắt giới hạn HP.': 'Vocabulary repeats endlessly. You can enable or disable the HP limit.',
      'Tốc độ rơi': 'Fall speed',
      'Dễ': 'Easy',
      'Vừa': 'Normal',
      'Khó': 'Hard',
      '24 giây tới vạch': '24 seconds to the line',
      '16 giây tới vạch': '16 seconds to the line',
      '11 giây tới vạch': '11 seconds to the line',
      'Giới hạn HP': 'HP limit',
      'Giảm HP': 'Decrease HP',
      'Tăng HP': 'Increase HP',
      'Challenge luôn sử dụng HP.': 'Challenge always uses HP.',
      'Endless có thể chơi tự do hoặc dùng HP.': 'Endless can be played freely or with HP.',
      'Có HP': 'HP enabled',
      'Không HP': 'No HP',
      'Tóm tắt nhiệm vụ': 'Mission summary',
      'Bộ từ': 'Word set',
      'Chế độ': 'Mode',
      'Tốc độ': 'Speed',
      'Khu vực chơi Kanji Sky Defense': 'Kanji Sky Defense play area',
      'Nhập Hiragana hoặc Romaji': 'Enter Hiragana or Romaji',
      'Không giới hạn': 'Unlimited',
      'Chấp nhận cả': 'Accepts both',
      'và': 'and',
      'Nhấn Enter để xác nhận.': 'Press Enter to submit.',
      '. Nhấn Enter để xác nhận.': '. Press Enter to submit.',
      'BẮT ĐẦU NHIỆM VỤ': 'START MISSION',
      'Tạm dừng': 'Pause',
      'ĐIỂM': 'SCORE',
      'COMBO': 'COMBO',
      'Chơi lại': 'Restart',
      'Tiếp tục': 'Resume',
      'Xác nhận': 'Submit',
      'Đổi mục tiêu': 'Switch target',
      'Bộ nhớ học tập': 'Learning memory',
      'Học lại các từ đã lỡ.': 'Review missed words.',
      'Sai khi nhấn Enter hoặc để từ vượt phòng tuyến đều được ghi lại tại đây.': 'Incorrect answers and words that cross the defence line are saved here.',
      'Xóa lịch sử': 'Clear history',
      'Học ngay': 'Study now',
      'Từ vựng': 'Vocabulary',
      'Số lần cần ôn': 'Review count',
      'Chưa có từ cần học lại': 'Nothing to review yet',
      'Đi tới thiết lập': 'Go to setup',
      'Đang tìm mục tiêu': 'Finding target',
      'Tạm dừng…': 'Paused…',
      'gakkou hoặc がっこう': 'gakkou or がっこう',
      'Đã tạm dừng': 'Paused',
      'Nhiệm vụ tạm nghỉ': 'Mission paused',
      'Tiếp tục khi bạn đã sẵn sàng.': 'Resume when you are ready.',
      'Phòng tuyến thất thủ': 'Defence line breached',
      'Thử lại nhé': 'Try again',
      'Wave hoàn tất': 'Wave complete',
      'Bầu trời an toàn': 'The sky is safe',
      '{count} từ': '{count} words',
      '{count} ngày': '{count} days',
      '{count} lần': '{count} times',
      '{count} từ còn lại': '{count} words left',
      '{count} mục tiêu đang rơi': '{count} falling targets',
      '{count} từ đã được lưu vào Học lại.': '{count} words were added to Review.',
      '{count} từ hợp lệ': '{count} valid words',
      '{seconds} giây': '{seconds} sec',
      'Mục tiêu · {word}': 'Target · {word}',
      'Bạn đạt {score} điểm.': 'You scored {score} points.',
      'Chính xác! Phòng tuyến được giữ vững.': 'Correct! The defence line holds.',
      'Chưa đúng. Đáp án {answer} đã vào Học lại.': 'Not quite. {answer} was added to Review.',
      '7 ngày': '7 days',
      '30 ngày': '30 days',
      'Biểu đồ {period}: {values}': '{period} chart: {values}',
      'Xóa {word} khỏi thư viện': 'Remove {word} from the library',
      'Đã đọc {count} từ hợp lệ.': 'Loaded {count} valid words.',
      'Bắt đầu một nhiệm vụ để luyện tập.': 'Start a mission to practise.',
      'Các từ bỏ lỡ đã được lưu vào Học lại.': 'Missed words were added to Review.',
      'Nhập Hiragana hoặc Romaji, rồi nhấn Enter.': 'Type Hiragana or Romaji, then press Enter.',
      'File quá lớn. Hãy dùng CSV dưới 2 MB.': 'The file is too large. Use a CSV under 2 MB.',
      'Không thể đọc file CSV.': 'The CSV file could not be read.',
      'Xóa toàn bộ thư viện từ đã quên?': 'Clear the entire forgotten-word library?',
      'Xóa toàn bộ danh sách Học lại?': 'Clear the entire Review list?',
      'Chơi ngay với 12 từ mẫu hoặc nạp CSV gồm hai cột': 'Play with 12 sample words or upload a two-column CSV',
      'Nhập trực tiếp Hiragana hoặc gõ Romaji. Trò chơi tự chuyển đổi để so sánh đáp án.': 'Enter Hiragana directly or type Romaji. The game converts it before checking your answer.',
      'Mọi đáp án sai và mục tiêu vượt phòng tuyến đều có thể được học lại !': 'You can review incorrect answers and targets that cross the defence line!',
      'Không giới hạn HP, phù hợp để làm quen bộ từ mới.': 'Unlimited HP, ideal for learning a new word set.',
      'Hoàn thành với số HP đã chọn.': 'Complete the set with your chosen HP.',
      'Từ vựng lặp liên tục, có thể bật hoặc tắt giới hạn HP.': 'Vocabulary repeats continuously, with an optional HP limit.',
      'Người học': 'Learner',
      '0 ngày': '0 days',
      '0 từ': '0 words',
      'Tài khoản, tiến độ học và thư viện từ đã quên của người chơi Kanji Sky Defense.': 'Your Kanji Sky Defense account, learning progress, and forgotten-word library.',
      'Đã sao chép. Bạn có thể dán nội dung vào kênh liên hệ của mình.': 'Copied. You can paste the message into your preferred contact channel.',
      'Trình duyệt không cho phép sao chép tự động. Hãy chọn và sao chép nội dung thủ công.': 'Automatic copying is unavailable. Select and copy the message manually.',
    },
    ja: {
      'Thiết lập': '設定',
      'Chơi': 'プレイ',
      'Học lại': '復習',
      'Giới thiệu': '紹介',
      'Liên hệ': 'お問い合わせ',
      'Quyền riêng tư': 'プライバシー',
      'Thông tin': '情報',
      'Cá nhân': 'プロフィール',
      'Đăng nhập': 'ログイン',
      'Đăng ký': '新規登録',
      'Đăng xuất': 'ログアウト',
      'Tạo tài khoản': 'アカウント作成',
      'Tài khoản': 'アカウント',
      'Cài đặt': '設定',
      'Thông tin tài khoản': 'アカウント情報',
      'Ảnh đại diện': 'プロフィール画像',
      'Đổi ảnh': '画像を変更',
      'Xóa ảnh': '画像を削除',
      'Tên người dùng': 'ユーザー名',
      'Ngày sinh': '生年月日',
      'Ngày tham gia': '登録日',
      'Lưu thay đổi': '変更を保存',
      'Phiên học': '学習セッション',
      'Từ đã luyện': '練習した単語',
      'Độ chính xác': '正答率',
      'Chuỗi học': '連続学習',
      'Số từ đã luyện': '練習した単語数',
      'Tuần': '週間',
      'Tháng': '月間',
      'Từ đã quên': '忘れた単語',
      'Xóa tất cả': 'すべて削除',
      'Ôn ngay': '今すぐ復習',
      'Tìm Kanji hoặc cách đọc': '漢字または読み方を検索',
      'Giao diện': '外観',
      'Sáng': 'ライト',
      'Tối': 'ダーク',
      'Ngôn ngữ': '言語',
      'Tiếng Việt': 'ベトナム語',
      'Tiếng Anh': '英語',
      'Tiếng Nhật': '日本語',
      'Tùy chọn': 'オプション',
      'Giảm chuyển động': '動きを減らす',
      'Hiển thị phím tắt': 'ショートカットを表示',
      'Xác nhận trước khi xóa': '削除前に確認',
      'Trang cá nhân': 'プロフィールページ',
      'Điều hướng chính': 'メインナビゲーション',
      'Tổng quan tiến độ': '学習進捗',
      'Khoảng thời gian biểu đồ': 'グラフ期間',
      'Biểu đồ tiến độ học': '学習進捗グラフ',
      'Đăng nhập để xem tiến độ.': '進捗を見るにはログインしてください。',
      'Vào nhiệm vụ': 'ミッション開始',
      'Chưa có từ bị quên': '忘れた単語はまだありません',
      'Không tìm thấy từ phù hợp': '一致する単語がありません',
      'Đã cập nhật tài khoản.': 'アカウントを更新しました。',
      'Đã cập nhật ảnh đại diện.': 'プロフィール画像を更新しました。',
      'Đã xóa ảnh đại diện.': 'プロフィール画像を削除しました。',
      'Không thể đọc ảnh này.': 'この画像を読み込めません。',
      'Vui lòng chọn một tệp ảnh.': '画像ファイルを選択してください。',
      'Ảnh phải nhỏ hơn 8 MB.': '画像は8MB未満にしてください。',
      'Tên người dùng cần ít nhất 2 ký tự.': 'ユーザー名は2文字以上で入力してください。',
      'Ngày sinh chưa hợp lệ.': '生年月日が正しくありません。',
      'Email này đã được đăng ký.': 'このメールアドレスはすでに登録されています。',
      'Email hoặc mật khẩu chưa đúng.': 'メールアドレスまたはパスワードが正しくありません。',
      'Mật khẩu xác nhận chưa khớp.': 'パスワードが一致しません。',
      'Không thể hoàn tất thao tác.': '操作を完了できませんでした。',
      'Đang xử lý…': '処理中…',
      'Thành công. Đang mở trang cá nhân…': '完了しました。プロフィールを開きます…',
      'Tiếp tục hành trình học Kanji': '漢字学習を続けましょう',
      'Biến mỗi lần chơi thành kiến thức': '遊びながら知識を身につけよう',
      'Đăng nhập Kanji Sky Defense.': 'Kanji Sky Defenseにログインします。',
      'Tạo tài khoản Kanji Sky Defense.': 'Kanji Sky Defenseのアカウントを作成します。',
      'Chào mừng trở lại': 'おかえりなさい',
      'Email': 'メールアドレス',
      'Mật khẩu': 'パスワード',
      'Xác nhận mật khẩu': 'パスワード確認',
      'Tên hiển thị': '表示名',
      'Chưa có tài khoản?': 'アカウントをお持ちでないですか？',
      'Đã có tài khoản?': 'すでにアカウントをお持ちですか？',
      'Không tìm thấy trang này': 'ページが見つかりません',
      'Không tìm thấy trang trong Kanji Sky Defense.': 'Kanji Sky Defenseでページが見つかりません。',
      'Giới thiệu · Kanji Sky Defense': '紹介 · Kanji Sky Defense',
      'Đăng nhập · Kanji Sky Defense': 'ログイン · Kanji Sky Defense',
      'Đăng ký · Kanji Sky Defense': '新規登録 · Kanji Sky Defense',
      'Trang cá nhân · Kanji Sky Defense': 'プロフィール · Kanji Sky Defense',
      'Không tìm thấy trang · Kanji Sky Defense': 'ページが見つかりません · Kanji Sky Defense',
      'Mất tín hiệu mục tiêu': 'ターゲット信号を見失いました',
      'Đường dẫn có thể đã thay đổi hoặc không tồn tại': 'URLが変更されたか、ページが存在しません',
      'Quay lại trạm chính để tiếp tục học': 'メイン画面に戻って学習を続けてください',
      'Về trang chơi': 'ゲームに戻る',
      'Mở trang cá nhân': 'プロフィールを開く',
      'Về trò chơi': 'ゲームについて',
      'Ghi nhớ cách đọc bằng trò chơi': 'ゲームで読み方を覚えよう',
      'Kanji Sky Defense biến mỗi từ vựng thành một mục tiêu đang tiến về phòng tuyến. Bạn đọc Kanji, gõ cách đọc và bảo vệ bầu trời an toàn.': 'Kanji Sky Defenseでは、単語が防衛ラインに迫るターゲットになります。漢字を読み、読み方を入力して空を守りましょう。',
      'Tìm hiểu cách Kanji Sky Defense giúp bạn luyện đọc Kanji.': 'Kanji Sky Defenseで漢字の読み方を練習する方法をご紹介します。',
      'Cách chơi': '遊び方',
      'Bắt đầu nhiệm vụ': 'ミッション開始',
      'Chọn bộ từ': '単語セットを選ぶ',
      'Gõ cách đọc': '読み方を入力',
      'Ôn từ đã lỡ': '間違えた単語を復習',
      '3 chế độ chơi': '3つのゲームモード',
      'Chọn chế độ chơi phù hợp với nhu cầu của bạn': '自分に合ったゲームモードを選びましょう',
      'Liên hệ · Kanji Sky Defense': 'お問い合わせ · Kanji Sky Defense',
      'Góp ý để trang web phát triển.': 'ウェブサイト改善のためのご意見をお寄せください。',
      'Nếu bạn gặp lỗi khi sử dụng trang web, hãy gửi phản hồi của bạn cho chúng tôi nhé, mọi ý kiến đều được trân trọng và được xem xét để cải thiện trải nghiệm người dùng hơn nữa.': 'ウェブサイトの利用中に問題が発生した場合は、ご意見をお寄せください。いただいたご意見を大切にし、使いやすさの向上に役立てます。',
      'Gửi góp ý cho Kanji Sky Defense.': 'Kanji Sky Defenseへのご意見を送ります。',
      'Gửi': '送信',
      'Quyền riêng tư · Kanji Sky Defense': 'プライバシー · Kanji Sky Defense',
      'Chính sách lưu trữ dữ liệu cục bộ và cookie của Kanji Sky Defense.': 'Kanji Sky Defenseのローカルデータ保存とCookieに関するポリシーです。',
      'Chính sách lưu trữ dữ liệu': 'データ保存ポリシー',
      'Kanji Sky Defense là ứng dụng web chạy trực tiếp trong trình duyệt. Phiên bản hiện tại không có backend và không gửi dữ liệu học tập hoặc tài khoản của bạn lên máy chủ của ứng dụng.': 'Kanji Sky Defenseはブラウザ上で直接動作するWebアプリです。現在のバージョンにはバックエンドがなく、学習データやアカウントデータをアプリのサーバーへ送信しません。',
      'Cập nhật lần cuối: 12/09/2026': '最終更新日：2026年9月12日',
      'Tóm tắt chính sách': 'ポリシーの概要',
      'Tóm tắt nhanh': '概要',
      'Dữ liệu được lưu trên thiết bị bằng': 'データは端末上の',
      'Ứng dụng hiện không tự đặt cookie.': '現在、アプリはCookieを設定しません。',
      'Không có quảng cáo hoặc công cụ theo dõi bên thứ ba.': '広告や第三者のトラッカーはありません。',
      'Bạn có thể xóa dữ liệu qua phần cài đặt trình duyệt.': 'ブラウザの設定からデータを削除できます。',
      'Dữ liệu được lưu': '保存されるデータ',
      'Khi bạn sử dụng các tính năng tương ứng, trình duyệt có thể lưu tên hiển thị, email, mã băm mật khẩu, ngày sinh, ảnh đại diện, ngày tạo tài khoản và mã phiên đăng nhập. Ứng dụng cũng lưu cài đặt giao diện, ngôn ngữ, tùy chọn truy cập, thống kê học tập và danh sách từ cần ôn.': '各機能を使用すると、ブラウザに表示名、メールアドレス、パスワードのハッシュ、生年月日、プロフィール画像、アカウント作成日、ログインセッションIDが保存される場合があります。また、表示設定、言語、アクセシビリティ設定、学習統計、復習リストも保存されます。',
      'Không nên sử dụng mật khẩu thật hoặc mật khẩu đang dùng cho dịch vụ khác. Hệ thống tài khoản chỉ là mô phỏng phía trình duyệt và không thay thế cơ chế xác thực có máy chủ.': '実際のパスワードや他のサービスで使用しているパスワードは使わないでください。このアカウントシステムはブラウザ上のシミュレーションにすぎず、サーバーによる認証の代わりにはなりません。',
      'Mục đích lưu trữ': '保存の目的',
      'Dữ liệu cục bộ được dùng để duy trì đăng nhập, khôi phục lựa chọn giao diện, hiển thị tiến độ và giúp bạn tiếp tục ôn những từ đã trả lời sai. File CSV và nội dung góp ý chỉ được xử lý trong trình duyệt; biểu mẫu liên hệ sao chép nội dung vào clipboard và không tự gửi đi.': 'ローカルデータは、ログイン状態の維持、表示設定の復元、進捗の表示、間違えた単語の復習継続に使用されます。CSVファイルとご意見の内容はブラウザ内でのみ処理され、お問い合わせフォームは内容をクリップボードにコピーするだけで自動送信しません。',
      'Cookie và theo dõi': 'Cookieとトラッキング',
      'Mã nguồn hiện tại không tạo cookie và không tích hợp quảng cáo, phân tích hành vi hoặc tracker bên thứ ba. Nếu cách triển khai website thay đổi và bắt đầu sử dụng cookie, chính sách này cần được cập nhật trước khi áp dụng.': '現在のコードはCookieを作成せず、広告、行動分析、第三者のトラッカーも組み込んでいません。サイトの運用方法が変わりCookieを使用する場合は、導入前にこのポリシーを更新します。',
      'Thời gian lưu và quyền kiểm soát': '保存期間とユーザーによる管理',
      'thường tiếp tục tồn tại sau khi đóng và mở lại trình duyệt. Dữ liệu được giữ cho đến khi ứng dụng xóa mục tương ứng, trình duyệt tự dọn dữ liệu, hoặc bạn xóa dữ liệu website trong phần quyền riêng tư của trình duyệt. Đăng xuất chỉ xóa phiên đăng nhập, không xóa hồ sơ đã lưu.': 'は通常、ブラウザを閉じて再度開いた後も保持されます。データは、アプリが該当項目を削除するか、ブラウザが自動的に消去するか、ブラウザのプライバシー設定でサイトデータを削除するまで保存されます。ログアウトで削除されるのはログインセッションのみで、保存済みプロフィールは削除されません。',
      'Bảo mật và giới hạn': 'セキュリティと制限',
      'Dữ liệu cục bộ thuộc origin của website và không được ứng dụng tự động gửi kèm mọi yêu cầu như cookie. Tuy vậy, người có quyền truy cập thiết bị, hồ sơ trình duyệt hoặc mã chạy trong cùng origin có thể tiếp cận dữ liệu này. Không lưu thông tin nhạy cảm trong ứng dụng.': 'ローカルデータはサイトのオリジンに属し、Cookieのようにすべてのリクエストへ自動送信されることはありません。ただし、端末やブラウザプロフィールへアクセスできる人、または同じオリジンで動くコードが、このデータへアクセスできる場合があります。機密情報はアプリに保存しないでください。',
      'Thay đổi và liên hệ': '変更とお問い合わせ',
      'Chính sách có thể được cập nhật khi chức năng lưu trữ hoặc cách triển khai thay đổi. Ngày cập nhật mới nhất sẽ luôn được ghi ở đầu trang. Nếu có câu hỏi, bạn có thể chuẩn bị nội dung tại trang': '保存機能や運用方法が変わった場合、このポリシーを更新することがあります。最新の更新日は常にページ上部に表示します。ご質問がある場合は、',
      'Tham khảo kỹ thuật': '技術資料',
      'Thông tin về cơ chế lưu trữ được tham khảo từ tài liệu Web Storage và HTTP Cookie của MDN.': '保存の仕組みに関する情報は、MDNのWeb StorageおよびHTTP Cookieの資料を参照しています。',
      'Nội dung sẽ được sao chép để bạn gửi qua kênh liên hệ phù hợp.': '内容をコピーし、お好みの連絡方法で送信できます。',
      'Tên của bạn': 'お名前',
      'Nội dung góp ý': 'ご意見',
      'Sao chép nội dung': '内容をコピー',
      'Thiết lập nhiệm vụ': 'ミッション設定',
      'Chọn cách bạn muốn học.': '学習方法を選びましょう。',
      'Nạp bộ từ của riêng bạn, chọn chế độ và tốc độ. Bảo vệ bầu trời !': '自分の単語セットを読み込み、モードと速度を選んで空を守りましょう！',
      'Luyện đọc Kanji bằng một trận chiến phòng thủ trên bầu trời.': '空を守るゲームで漢字の読み方を練習しましょう。',
      'Gõ Hiragana. Bảo vệ bầu trời.': 'ひらがなを入力して空を守ろう。',
      'Về trang thiết lập': '設定画面に戻る',
      'Dữ liệu từ vựng': '単語データ',
      'Bộ mẫu · 12 từ': 'サンプル · 12語',
      '12 từ': '12語',
      '12 từ còn lại': '残り12語',
      'Bạn có thể chơi ngay hoặc nạp file CSV riêng.': 'すぐにプレイするか、自分のCSVを読み込めます。',
      'Nạp CSV': 'CSVを読み込む',
      'CSV mẫu': 'CSVサンプル',
      'Hai cột UTF-8:': 'UTF-8の2列：',
      'Chế độ chơi': 'ゲームモード',
      'Học không áp lực': '気軽に学習',
      'Không có HP. Từ bị bỏ lỡ hoặc trả lời sai sẽ tự động vào Học lại.': 'HPなし。間違えた単語や逃した単語は自動的に復習へ追加されます。',
      'Vượt qua một bộ từ': '単語セットに挑戦',
      'Có HP tùy chỉnh. Hoàn thành toàn bộ bộ từ trước khi phòng tuyến thất thủ.': 'HPを設定し、防衛ラインが破られる前に単語セットを完了します。',
      'Chơi không giới hạn': 'エンドレスプレイ',
      'Từ vựng lặp vô tận. Bạn có thể bật hoặc tắt giới hạn HP.': '単語が無限に繰り返されます。HP制限はオン・オフできます。',
      'Tốc độ rơi': '落下速度',
      'Dễ': 'かんたん',
      'Vừa': 'ふつう',
      'Khó': 'むずかしい',
      '24 giây tới vạch': 'ラインまで24秒',
      '16 giây tới vạch': 'ラインまで16秒',
      '11 giây tới vạch': 'ラインまで11秒',
      'Giới hạn HP': 'HP制限',
      'Giảm HP': 'HPを減らす',
      'Tăng HP': 'HPを増やす',
      'Challenge luôn sử dụng HP.': 'Challengeでは常にHPを使用します。',
      'Endless có thể chơi tự do hoặc dùng HP.': 'EndlessはHPなし、またはHPありでプレイできます。',
      'Có HP': 'HPあり',
      'Không HP': 'HPなし',
      'Tóm tắt nhiệm vụ': 'ミッション概要',
      'Bộ từ': '単語セット',
      'Chế độ': 'モード',
      'Tốc độ': '速度',
      'Khu vực chơi Kanji Sky Defense': 'Kanji Sky Defenseのプレイエリア',
      'Nhập Hiragana hoặc Romaji': 'ひらがなまたはローマ字を入力',
      'Không giới hạn': '無制限',
      'Chấp nhận cả': '入力対応：',
      'và': 'と',
      'Nhấn Enter để xác nhận.': 'Enterで決定します。',
      '. Nhấn Enter để xác nhận.': '。Enterで決定します。',
      'BẮT ĐẦU NHIỆM VỤ': 'ミッション開始',
      'Tạm dừng': '一時停止',
      'ĐIỂM': 'スコア',
      'COMBO': 'コンボ',
      'Chơi lại': 'もう一度',
      'Tiếp tục': '再開',
      'Xác nhận': '決定',
      'Đổi mục tiêu': 'ターゲット変更',
      'Bộ nhớ học tập': '学習メモリー',
      'Học lại các từ đã lỡ.': '間違えた単語を復習しよう。',
      'Sai khi nhấn Enter hoặc để từ vượt phòng tuyến đều được ghi lại tại đây.': '不正解や防衛ラインを越えた単語がここに保存されます。',
      'Xóa lịch sử': '履歴を削除',
      'Học ngay': '今すぐ学習',
      'Từ vựng': '単語',
      'Số lần cần ôn': '復習回数',
      'Chưa có từ cần học lại': '復習する単語はありません',
      'Đi tới thiết lập': '設定へ',
      'Đang tìm mục tiêu': 'ターゲットを検索中',
      'Tạm dừng…': '一時停止中…',
      'gakkou hoặc がっこう': 'gakkou または がっこう',
      'Đã tạm dừng': '一時停止',
      'Nhiệm vụ tạm nghỉ': 'ミッション一時停止',
      'Tiếp tục khi bạn đã sẵn sàng.': '準備ができたら再開してください。',
      'Phòng tuyến thất thủ': '防衛ライン突破',
      'Thử lại nhé': 'もう一度挑戦',
      'Wave hoàn tất': 'ウェーブ完了',
      'Bầu trời an toàn': '空の安全を守りました',
      '{count} từ': '{count}語',
      '{count} ngày': '{count}日',
      '{count} lần': '{count}回',
      '{count} từ còn lại': '残り{count}語',
      '{count} mục tiêu đang rơi': '落下中のターゲット：{count}',
      '{count} từ đã được lưu vào Học lại.': '{count}語を復習に追加しました。',
      '{count} từ hợp lệ': '有効な単語：{count}',
      '{seconds} giây': '{seconds}秒',
      'Mục tiêu · {word}': 'ターゲット · {word}',
      'Bạn đạt {score} điểm.': 'スコア：{score}',
      'Chính xác! Phòng tuyến được giữ vững.': '正解！防衛ラインを守りました。',
      'Chưa đúng. Đáp án {answer} đã vào Học lại.': '不正解。{answer}を復習に追加しました。',
      '7 ngày': '7日間',
      '30 ngày': '30日間',
      'Biểu đồ {period}: {values}': '{period}のグラフ：{values}',
      'Xóa {word} khỏi thư viện': '{word}をライブラリから削除',
      'Đã đọc {count} từ hợp lệ.': '有効な単語を{count}語読み込みました。',
      'Bắt đầu một nhiệm vụ để luyện tập.': 'ミッションを開始して練習しましょう。',
      'Các từ bỏ lỡ đã được lưu vào Học lại.': '間違えた単語を復習に追加しました。',
      'Nhập Hiragana hoặc Romaji, rồi nhấn Enter.': 'ひらがなまたはローマ字を入力してEnterを押してください。',
      'File quá lớn. Hãy dùng CSV dưới 2 MB.': 'ファイルが大きすぎます。2MB未満のCSVを使用してください。',
      'Không thể đọc file CSV.': 'CSVファイルを読み込めません。',
      'Xóa toàn bộ thư viện từ đã quên?': '忘れた単語をすべて削除しますか？',
      'Xóa toàn bộ danh sách Học lại?': '復習リストをすべて削除しますか？',
      'Chơi ngay với 12 từ mẫu hoặc nạp CSV gồm hai cột': '12語のサンプルで遊ぶか、2列のCSVを読み込めます',
      'Nhập trực tiếp Hiragana hoặc gõ Romaji. Trò chơi tự chuyển đổi để so sánh đáp án.': 'ひらがなを直接入力するか、ローマ字を入力できます。ゲームが変換して答えを確認します。',
      'Mọi đáp án sai và mục tiêu vượt phòng tuyến đều có thể được học lại !': '不正解や防衛ラインを越えた単語は後で復習できます！',
      'Không giới hạn HP, phù hợp để làm quen bộ từ mới.': 'HP無制限で、新しい単語セットの学習に最適です。',
      'Hoàn thành với số HP đã chọn.': '選んだHPで単語セットをクリアします。',
      'Từ vựng lặp liên tục, có thể bật hoặc tắt giới hạn HP.': '単語が繰り返され、HP制限をオン・オフできます。',
      'Người học': '学習者',
      '0 ngày': '0日',
      '0 từ': '0語',
      'Tài khoản, tiến độ học và thư viện từ đã quên của người chơi Kanji Sky Defense.': 'Kanji Sky Defenseのアカウント、学習進捗、復習単語リスト。',
      'Đã sao chép. Bạn có thể dán nội dung vào kênh liên hệ của mình.': 'コピーしました。お好みの連絡方法に貼り付けてください。',
      'Trình duyệt không cho phép sao chép tự động. Hãy chọn và sao chép nội dung thủ công.': '自動コピーできません。内容を選択して手動でコピーしてください。',
    },
  };

  /* Giữ nội dung gốc trong WeakMap để đổi ngôn ngữ mà không dịch chồng lên bản dịch. */
  const textState = new WeakMap();
  const attributeState = new WeakMap();
  let current = read();

  /* Ghép thiết lập đã lưu vào giá trị mặc định và phục hồi khi JSON lỗi. */
  function copySettings(source, target) {
    if (source === null || source === undefined) return;
    const keys = Object.keys(source);
    for (let index = 0; index < keys.length; index += 1) target[keys[index]] = source[keys[index]];
  }

  function read() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      const result = {};
      const saved = stored && typeof stored === 'object' ? stored : {};
      copySettings(DEFAULTS, result);
      copySettings(saved, result);
      return result;
    } catch (error) {
      const result = {};
      copySettings(DEFAULTS, result);
      return result;
    }
  }

  /* Thay biến trong chuỗi dịch, ví dụ số từ và điểm, nhưng giữ biến chưa được cung cấp. */
  function interpolate(value, variables) {
    const values = variables === undefined ? {} : variables;
    return String(value).replace(/\{(\w+)\}/g, function (match, key) {
      if (values[key] !== null && values[key] !== undefined) return values[key];
      return '{' + key + '}';
    });
  }

  /* Tra bản dịch theo ngôn ngữ hiện tại rồi điền các biến nội dung. */
  function t(source, variables) {
    const languageMap = TRANSLATIONS[current.language];
    const translated = languageMap && languageMap[source] ? languageMap[source] : source;
    return interpolate(translated, variables);
  }

  /* Đặt thuộc tính trên phần tử gốc để CSS áp dụng theme và tùy chọn chuyển động. */
  function apply() {
    document.documentElement.dataset.theme = current.theme;
    document.documentElement.dataset.reduceMotion = String(current.reduceMotion);
    document.documentElement.dataset.showShortcuts = String(current.showShortcuts);
    document.documentElement.lang = current.language;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = current.theme === 'light' ? '#f4f7fb' : '#07111d';
  }

  /* Dịch nút văn bản và giữ khoảng trắng quanh nội dung gốc. */
  function translateTextNode(node) {
    const previous = textState.get(node);
    let source = previous && previous.source ? previous.source : node.nodeValue;
    if (previous && node.nodeValue !== previous.rendered) source = node.nodeValue;
    const match = source.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const translated = match ? match[1] + t(match[2]) + match[3] : source;
    node.nodeValue = translated;
    textState.set(node, { source, rendered: translated });
  }

  /* Dịch nhãn trợ năng, gợi ý nhập và metadata mà vẫn lưu giá trị nguồn. */
  function translateAttributes(element) {
    const values = attributeState.get(element) || {};
    const attributes = ['placeholder', 'aria-label', 'title'];
    if (element.matches('meta[name="description"]')) attributes.push('content');
    for (let index = 0; index < attributes.length; index += 1) {
      const attribute = attributes[index];
      if (!element.hasAttribute(attribute)) continue;
      const currentValue = element.getAttribute(attribute);
      const previous = values[attribute];
      const source = previous && currentValue === previous.rendered ? previous.source : currentValue;
      const rendered = t(source);
      element.setAttribute(attribute, rendered);
      values[attribute] = { source: source, rendered: rendered };
    }
    attributeState.set(element, values);
  }

  /* Duyệt nội dung hiển thị, bỏ qua mã script/style và nội dung textarea. */
  function translate(root) {
    if (root === undefined) root = document;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        const parentName = node.parentElement ? node.parentElement.tagName : '';
        return /^(SCRIPT|STYLE|TEXTAREA)$/.test(parentName)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    while (walker.nextNode()) translateTextNode(walker.currentNode);
    if (root.querySelectorAll) {
      const elements = root.querySelectorAll('[placeholder], [aria-label], [title], meta[name="description"]');
      for (let index = 0; index < elements.length; index += 1) translateAttributes(elements[index]);
    }
  }

  /* Lưu tùy chọn, áp dụng ngay và phát sự kiện để các màn hình tự cập nhật. */
  function update(changes) {
    const next = {};
    copySettings(current, next);
    copySettings(changes, next);
    current = next;
    localStorage.setItem(KEY, JSON.stringify(current));
    apply();
    translate(document);
    window.dispatchEvent(new CustomEvent('kanji-preferences-change', { detail: get() }));
    return get();
  }

  /* Trả bản sao thiết lập để nơi gọi không sửa trực tiếp trạng thái bên trong. */
  function get() {
    const copy = {};
    copySettings(current, copy);
    return copy;
  }

  /* Áp dụng theme sớm, sau đó dịch trang khi DOM đã sẵn sàng. */
  // Theme đang chờ DOM tải xong nên lúc mở trang còn nháy màu.
  document.addEventListener('DOMContentLoaded', apply);
  window.KanjiPreferences = Object.freeze({ get: get, locale: function () { return LOCALES[current.language]; }, t: t, translate: translate, update: update });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { translate(document); });
  else translate(document);
})();
