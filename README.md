# Kanji Sky Defense (漢字スカイディフェンス)

Kanji Sky Defense là ứng dụng web học Kanji kết hợp trò chơi phòng thủ 2D. Trong game, bạn bảo vệ phi thuyền ở cuối màn hình bằng cách đọc Kanji trên các mục tiêu đang rơi và nhập cách đọc tương ứng bằng **Hiragana** hoặc **Romaji**.

Dự án được xây dựng cho môn **IE104 - Internet và Công nghệ Web** bằng HTML5, CSS3 và JavaScript thuần (Vanilla JS), không sử dụng framework, thư viện giao diện hay backend. Toàn bộ logic game và dữ liệu học tập đều chạy và lưu trữ trực tiếp trên trình duyệt.

## Trạng thái dự án

| Hạng mục | Trạng thái |
| --- | --- |
| Thiết lập bộ từ, chế độ chơi, tốc độ và HP | Hoàn thành |
| Game phòng thủ bằng HTML5 Canvas 2D | Hoàn thành |
| Nhập Hiragana trực tiếp bằng bộ gõ IME | Hoàn thành |
| Chuyển đổi Romaji sang Hiragana theo thời gian thực | Hoàn thành |
| 3 chế độ chơi: Study, Challenge và Endless | Hoàn thành |
| Hệ thống tính điểm, combo, HP, tạm dừng và chơi lại | Hoàn thành |
| Lưu trữ và ôn tập lại các từ trả lời sai/bỏ lỡ | Hoàn thành |
| Các trang thông tin (Giới thiệu, Liên hệ, Chính sách, 404) | Hoàn thành |
| Đăng ký, đăng nhập và quản lý phiên cục bộ | Hoàn thành |
| Trang cá nhân, chỉnh sửa hồ sơ và ảnh đại diện | Hoàn thành |
| Thống kê tiến độ và biểu đồ học tập theo tuần/tháng | Hoàn thành |
| Tìm kiếm gần đúng trong thư viện từ đã quên | Hoàn thành |
| Hỗ trợ giao diện Sáng/Tối và đa ngôn ngữ (Việt/Anh/Nhật) | Hoàn thành |

## Tính năng chính

### 1. Thiết lập trước khi chơi
- Tích hợp sẵn bộ 12 từ mẫu để trải nghiệm ngay.
- Hỗ trợ tải lên bộ từ vựng cá nhân qua định dạng CSV (UTF-8) và cung cấp sẵn file CSV mẫu để tải về.
- Hiển thị tóm tắt cấu hình trước khi vào màn chơi (số lượng từ, chế độ, tốc độ, HP).
- Ba mức tốc độ rơi tính theo thời gian mục tiêu đi từ đỉnh màn hình xuống Vạch phòng thủ (vận tốc tự động điều chỉnh theo chiều cao khung hình):
  - **Dễ:** ~24 giây.
  - **Vừa:** ~16 giây.
  - **Khó:** ~11 giây.
- Tùy chỉnh HP từ 1 đến 20 ở các chế độ có giới hạn máu.

### 2. Ba chế độ chơi

| Chế độ | Luật chơi |
| --- | --- |
| **Study** | Không giới hạn HP. Màn chơi kết thúc khi toàn bộ từ vựng đã được xử lý hoặc rơi qua Vạch phòng thủ. |
| **Challenge** | Bắt buộc dùng HP. Hoàn thành toàn bộ bộ từ trước khi HP giảm về 0. |
| **Endless** | Bộ từ được xáo trộn và lặp lại vô tận. Cho phép bật hoặc tắt giới hạn HP. |

Ở các chế độ dùng HP, mỗi mục tiêu lọt qua Vạch phòng thủ sẽ trừ 1 HP. Nhập sai đáp án không trừ HP nhưng sẽ ngắt chuỗi combo và tự động đưa từ đó vào danh sách **Học lại**.

### 3. Cơ chế game phòng thủ
- Render đồ họa bằng HTML5 Canvas và cập nhật khung hình qua `requestAnimationFrame` kết hợp `deltaTime` để đảm bảo tốc độ ổn định trên mọi tần số quét màn hình.
- Tối đa 5 mục tiêu xuất hiện cùng lúc, nhịp sinh mục tiêu mới khoảng 1,65 giây.
- Tự động khóa mục tiêu nguy hiểm nhất (gần Vạch phòng thủ nhất) với hiệu ứng viền sáng, đường ngắm, thanh tiến độ và xem trước cách đọc.
- Hỗ trợ chuyển đổi mục tiêu linh hoạt bằng phím `Tab` hoặc nút **Đổi mục tiêu**.
- Công thức tính điểm cho mỗi đáp án đúng:
  ```text
  Điểm = (Số ký tự Hiragana × 100) + (min(combo, 10) × 20)
  ```
- Hỗ trợ tạm dừng bằng phím `Escape`, nút trên giao diện hoặc tự động tạm dừng khi người dùng chuyển tab/rời khỏi màn chơi.

### 4. Bộ xử lý nhập liệu Hiragana & Romaji
- Theo dõi sự kiện `composition` của trình duyệt để tương thích tốt với bộ gõ tiếng Nhật (IME), tránh chấm điểm nhầm khi người dùng đang ghép chữ.
- Chấp nhận đồng thời Hiragana, Katakana (tự động quy đổi về Hiragana) và Romaji (chuyển đổi trực tiếp sang Hiragana kèm bản xem trước).
- Xử lý đầy đủ các quy tắc biến âm tiếng Nhật: âm ngắt (`gakkou` → `がっこう`), âm ghép (`kya` → `きゃ`, `shu` → `しゅ`), âm mũi `ん` (`n`, `nn`, `n'`) và các âm mở rộng (`fa`, `vi`, `she`, `che`).
- Chuẩn hóa chuỗi bằng Unicode NFKC, loại bỏ khoảng trắng và dấu `・` trước khi đối chiếu đáp án.

### 5. Định dạng và kiểm tra file CSV
File CSV đầu vào yêu cầu cấu trúc 2 cột theo đúng thứ tự:

```csv
kanji,hiragana
水,みず
山,やま
学校,がっこう
```

- Hỗ trợ mã hóa UTF-8 (bao gồm UTF-8 BOM) và chuẩn escape dấu ngoặc kép của CSV.
- Tự động lọc bỏ dòng trống, dòng thiếu dữ liệu và các cặp từ trùng lặp.
- Giới hạn dung lượng tối đa 2 MB và tối đa 5.000 từ hợp lệ mỗi lần nạp.

### 6. Hệ thống Học lại (Ôn tập cục bộ)
- Tự động lưu các từ trả lời sai hoặc bỏ lỡ vào `localStorage` (khóa `kanji-sky-defense-review-v1`).
- Cộng dồn số lần sai (`mistakeCount`) cho các từ lặp lại và sắp xếp danh sách ưu tiên từ cao xuống thấp.
- Cho phép tạo nhanh một màn chơi Study chỉ gồm các từ trong danh sách cần ôn tập.

### 7. Hệ thống trang và trải nghiệm người dùng
- **8 trang HTML độc lập:** Trang chủ/Game (`index.html`), Giới thiệu (`about.html`), Liên hệ (`contact.html`), Đăng nhập (`login.html`), Đăng ký (`register.html`), Cá nhân (`user.html`), Chính sách dữ liệu (`privacy.html`) và Trang báo lỗi (`404.html`).
- **Giao diện Responsive:** Tương thích từ desktop đến thiết bị di động (các mốc breakpoint 900px và 680px) bằng Flexbox và CSS Grid.
- **Tối ưu hiển thị:** Canvas tự động điều chỉnh kích thước và giới hạn mật độ điểm ảnh (`devicePixelRatio`); hỗ trợ tùy chọn giảm chuyển động (`prefers-reduced-motion`).
- **Độc lập tài nguyên:** Sử dụng bộ icon SVG sprite nội tuyến và font hệ thống, không phụ thuộc vào CDN hay tài nguyên bên ngoài.

### 8. Tài khoản cục bộ và Trang cá nhân
- Mô phỏng luồng đăng ký, đăng nhập và lưu phiên làm việc bằng `localStorage`. Mật khẩu được băm bằng Web Crypto API trước khi lưu trữ.
- Trang cá nhân cung cấp giao diện quản lý hồ sơ (đổi tên, email, ngày sinh, ảnh đại diện) và khu vực Cài đặt (giao diện Sáng/Tối, ngôn ngữ Việt/Anh/Nhật, bật/tắt phím tắt, xác nhận xóa).
- Thống kê 4 chỉ số học tập (số phiên, số từ đã luyện, độ chính xác, chuỗi ngày liên tiếp) kèm biểu đồ đường theo dõi tiến độ 7 ngày hoặc 30 ngày gần nhất.
- Thư viện từ đã quên tách biệt theo từng tài khoản, hỗ trợ tìm kiếm gần đúng theo Kanji, Hiragana hoặc Romaji.

## Hướng dẫn chơi

1. Sử dụng bộ 12 từ có sẵn hoặc nhấn **Nạp CSV** để tải lên danh sách từ vựng của bạn.
2. Chọn chế độ chơi (**Study**, **Challenge** hoặc **Endless**), tốc độ rơi và số lượng HP.
3. Nhấn **Bắt đầu nhiệm vụ**.
4. Quan sát chữ Kanji trên mục tiêu đang được khóa, gõ cách đọc bằng Hiragana hoặc Romaji rồi nhấn `Enter`.
5. Dùng phím `Tab` để đổi mục tiêu và `Escape` để tạm dừng khi cần.
6. Truy cập mục **Học lại** hoặc **Trang cá nhân** để ôn tập lại các từ đã quên.

## Giới hạn của phiên bản hiện tại

- Hệ thống tài khoản và dữ liệu học tập hoạt động hoàn toàn phía client (trình duyệt), chưa hỗ trợ đồng bộ đa thiết bị qua máy chủ.
- Lịch sử học tập và danh sách ôn tập sẽ bị xóa nếu người dùng xóa dữ liệu duyệt web.
- Trạng thái ván chơi đang diễn ra chưa được lưu lại nếu tải lại trang (`F5`).
- Dữ liệu từ vựng hiện chỉ hỗ trợ cặp `kanji - hiragana`, chưa bao gồm nghĩa tiếng Việt, ví dụ hoặc âm thanh.
- Biểu mẫu tại trang Liên hệ đóng gói nội dung và sao chép vào clipboard để người dùng tự gửi, chưa tích hợp dịch vụ gửi email tự động.

## Công nghệ sử dụng

| Công nghệ / API | Vai trò trong dự án |
| --- | --- |
| HTML5 Semantic | Xây dựng cấu trúc 8 trang, điều hướng và tối ưu hỗ trợ tiếp cận (ARIA) |
| CSS3 | Hệ thống biến màu (Theme), bố cục Flexbox/Grid và thiết kế Responsive |
| HTML5 Canvas 2D | Vẽ phi thuyền, mục tiêu, Vạch phòng thủ, tia laser và hiệu ứng hạt |
| JavaScript (ES6+) | Quản lý state, game loop, bộ chuyển đổi Romaji và bộ đọc CSV |
| Local Storage | Lưu trữ thông tin tài khoản, cài đặt giao diện, thống kê và danh sách Học lại |
| File API & Blob API | Đọc file CSV, tải lên ảnh đại diện và xuất file CSV mẫu |
| Web Crypto API | Băm mật khẩu người dùng trước khi lưu xuống bộ nhớ trình duyệt |
| Clipboard API | Sao chép nhanh nội dung góp ý tại trang Liên hệ |
| ResizeObserver | Tự động cập nhật kích thước Canvas khi vùng hiển thị thay đổi |

## Cấu trúc thư mục

```text
├── css/
│   ├── style.css                 # Theme và component dùng chung
│   ├── index.css                 # Thiết lập, game và Học lại
│   ├── about.css                 # Trang Giới thiệu
│   ├── contact.css               # Trang Liên hệ
│   ├── auth.css                  # Trang Đăng nhập và Đăng ký
│   ├── user.css                  # Trang tài khoản và cài đặt
│   ├── privacy.css               # Trang chính sách lưu trữ dữ liệu
│   └── 404.css                   # Trang không tìm thấy
├── assets/
│   └── icons/                    # Các file SVG nguồn của bộ icon giao diện
├── images/
│   ├── favicon.svg               # Biểu tượng trên tab trình duyệt
│   └── og.png                    # Ảnh xem trước khi chia sẻ liên kết
├── js/
│   ├── app.js                    # Điều phối màn hình và vòng lặp game chính
│   ├── auth.js                   # Giao diện đăng nhập/đăng ký/đăng xuất
│   ├── icons.js                  # SVG sprite và hàm tạo icon dùng chung
│   ├── preferences.js            # Theme, ngôn ngữ và tùy chọn giao diện
│   ├── site.js                   # Logic dùng cho trang thông tin/liên hệ
│   ├── storage.js                # Tài khoản, thống kê và Học lại cục bộ
│   ├── user.js                   # Trang cá nhân, biểu đồ và thư viện từ quên
│   └── utils.js                  # CSV, Romaji, chuẩn hóa và hàm tiện ích
├── .gitignore                    # Các file/thư mục không đưa lên Git
├── 404.html                      # Trang không tìm thấy
├── index.html                    # Trang chính: Thiết lập, Chơi, Học lại
├── about.html                    # Trang Giới thiệu
├── contact.html                  # Trang Liên hệ
├── login.html                    # Trang Đăng nhập
├── register.html                 # Trang Đăng ký
├── user.html                     # Tài khoản và tiến độ người học
├── privacy.html                  # Chính sách localStorage và cookie
└── README.md                     # Tài liệu dự án
```

### Phân chia module JavaScript
- `js/app.js`: Quản lý trạng thái màn chơi, vòng lặp game, sinh mục tiêu, kiểm tra va chạm, tính điểm và vẽ Canvas.
- `js/utils.js`: Chuyển đổi Romaji/Katakana sang Hiragana, chuẩn hóa chuỗi, phân tích cú pháp CSV, tìm kiếm gần đúng và xử lý ảnh đại diện.
- `js/storage.js`: Quản lý dữ liệu `localStorage` cho tài khoản, phiên đăng nhập, lịch sử luyện tập và danh sách từ cần ôn.
- `js/auth.js`: Xử lý giao diện và logic biểu mẫu đăng nhập, đăng ký, đăng xuất.
- `js/preferences.js`: Lưu trữ và áp dụng các tùy chọn giao diện (theme, ngôn ngữ, hiệu ứng chuyển động, phím tắt).
- `js/user.js`: Xử lý thông tin cá nhân, tổng hợp dữ liệu thống kê, vẽ biểu đồ tiến độ và quản lý thư viện từ đã quên.
- `js/icons.js`: Khởi tạo hệ thống icon SVG dùng chung trên toàn trang.
- `js/site.js`: Xử lý các tiện ích trên các trang thông tin và sao chép nội dung biểu mẫu Liên hệ.

## Hướng dẫn chạy dự án

Dự án không yêu cầu cài đặt thư viện hay bước build phức tạp.

**Cách 1: Mở trực tiếp**
Mở file `index.html` bằng trình duyệt web (Chrome, Edge, Firefox...).

**Cách 2: Chạy qua máy chủ tĩnh cục bộ (Khuyến nghị)**
Chạy qua HTTP server giúp các API như Clipboard hoạt động ổn định hơn. Tại thư mục gốc của dự án, mở terminal và chạy:

```bash
python -m http.server 8080
```

Sau đó mở trình duyệt và truy cập địa chỉ `http://localhost:8080`.

## Quy ước mã nguồn

- **JavaScript:** Sử dụng chuẩn ES6+, đặt tên biến và hàm theo quy tắc `camelCase`.
- **CSS:** Áp dụng quy tắc đặt tên class theo chuẩn BEM (`block__element--modifier`).
- **Phân tách style:** Các quy tắc dùng chung đặt tại `css/style.css`. Mỗi trang HTML có một `id` riêng trên thẻ `<body>` và sử dụng stylesheet riêng biệt để tránh xung đột CSS.
- **Tổ chức mã nguồn:** Tách biệt rõ ràng giữa logic giao diện, xử lý dữ liệu lưu trữ và vòng lặp trò chơi.

## Quyền riêng tư

Ứng dụng không thu thập hay gửi bất kỳ dữ liệu cá nhân, file CSV hoặc lịch sử học tập nào ra bên ngoài. Toàn bộ thông tin được lưu cục bộ trên trình duyệt của người dùng thông qua `localStorage`. *(Lưu ý: Không sử dụng mật khẩu thật cho tính năng tài khoản mô phỏng trên trình duyệt).*