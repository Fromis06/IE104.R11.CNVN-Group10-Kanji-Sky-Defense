# Kanji Sky Defense (漢字スカイディフェンス)

Kanji Sky Defense là website học Kanji theo mô hình game phòng thủ 2D. Người chơi bảo vệ phi thuyền ở cuối màn hình bằng cách đọc Kanji trên các mục tiêu đang rơi và nhập cách đọc tương ứng bằng **Hiragana** hoặc **Romaji**.

Dự án được xây dựng cho môn **IE104 - Internet và Công nghệ Web** bằng HTML5, CSS3 và JavaScript thuần. Website không dùng framework, thư viện giao diện, trình biên dịch hay backend; toàn bộ game và dữ liệu học tập chạy trực tiếp trong trình duyệt.

## Trạng thái dự án

Phiên bản hiện tại đã hoàn thành MVP và có thể chơi được từ đầu đến cuối.

| Hạng mục | Trạng thái |
| --- | --- |
| Thiết lập bộ từ, chế độ, tốc độ và HP | Đã có |
| Game phòng thủ bằng Canvas 2D | Đã có |
| Nhập Hiragana bằng IME | Đã có |
| Chuyển Romaji sang Hiragana theo thời gian thực | Đã có |
| Study, Challenge và Endless | Đã có |
| Điểm, combo, HP, tạm dừng và chơi lại | Đã có |
| Lưu và chơi lại các từ cần ôn | Đã có |
| Trang Giới thiệu và Liên hệ | Đã có |
| Đăng ký, đăng nhập và đăng xuất cục bộ | Đã có |
| Trang cá nhân, chỉnh sửa tài khoản và ảnh đại diện | Đã có |
| Thống kê và biểu đồ học theo tuần/tháng | Đã có |
| Tìm kiếm gần đúng trong thư viện từ đã quên | Đã có |
| Theme sáng/tối và giao diện Việt/Anh/Nhật | Đã có |
| Trang báo lỗi 404 | Đã có |
| Trang Privacy mô tả localStorage và cookie | Đã có |

## Tính năng đã triển khai

### 1. Thiết lập trước khi chơi

- Có sẵn một bộ mẫu gồm 12 từ để người dùng có thể chơi ngay.
- Cho phép tải lên bộ từ riêng bằng file CSV UTF-8.
- Cho phép tải file CSV mẫu từ website.
- Hiển thị tóm tắt cấu hình trước khi bắt đầu: số từ, chế độ, tốc độ và HP.
- Có ba mức tốc độ rơi, hiển thị theo thời gian một thẻ đi từ đầu màn hình tới Vạch phòng thủ:
  - **Dễ:** khoảng 24 giây.
  - **Vừa:** khoảng 16 giây.
  - **Khó:** khoảng 11 giây.
- Vận tốc được tính theo chiều cao vùng chơi để thời gian trên giữ ổn định ở các kích thước màn hình.
- HP có thể điều chỉnh từ 1 đến 20 ở những chế độ sử dụng HP.

### 2. Ba chế độ chơi

| Chế độ | Luật chơi hiện tại |
| --- | --- |
| **Study** | Không giới hạn HP. Wave kết thúc sau khi toàn bộ từ đã bị tiêu diệt hoặc vượt Vạch phòng thủ. |
| **Challenge** | Luôn sử dụng HP. Người chơi phải hoàn thành bộ từ trước khi HP về 0. |
| **Endless** | Bộ từ được xáo trộn và lặp liên tục. Người chơi có thể bật hoặc tắt HP. |

Trong các chế độ có HP, mỗi mục tiêu vượt Vạch phòng thủ làm mất 1 HP. Trả lời sai không trừ HP ngay nhưng làm mất combo và đưa từ đó vào danh sách Học lại.

### 3. Cơ chế game phòng thủ

- Game được vẽ bằng HTML5 Canvas và cập nhật bằng `requestAnimationFrame`.
- Chuyển động dựa trên thời gian thực (`deltaTime`), không phụ thuộc trực tiếp vào tốc độ khung hình.
- Tối đa 5 mục tiêu xuất hiện cùng lúc; mục tiêu mới được sinh theo nhịp khoảng 1,65 giây.
- Phi thuyền và Vạch phòng thủ nằm ở cuối màn hình.
- Mục tiêu hiện tại có viền sáng, đường ngắm, thanh tiến độ và phần xem trước cách đọc.
- Game tự chọn mục tiêu nguy hiểm nhất, tức mục tiêu đang ở gần Vạch phòng thủ nhất.
- Có thể đổi mục tiêu bằng phím `Tab` hoặc nút **Đổi mục tiêu**.
- Khi tiêu diệt mục tiêu, game tự chuyển sang mục tiêu nguy hiểm tiếp theo.
- Trả lời đúng tạo laser và hiệu ứng hạt, tăng điểm và combo.
- Điểm cho một đáp án đúng được tính theo công thức:

  ```text
  số ký tự Hiragana × 100 + min(combo, 10) × 20
  ```

- Có HUD hiển thị chế độ, HP, điểm, combo và số từ còn lại hoặc số mục tiêu đang rơi.
- Có các trạng thái tạm dừng, hoàn thành wave và Game Over.
- Có thể tạm dừng bằng nút trên giao diện hoặc phím `Escape`.
- Khi rời màn chơi trong lúc game đang chạy, game tự chuyển sang trạng thái tạm dừng.

### 4. Nhập Hiragana và Romaji

- Dùng ô nhập HTML để hỗ trợ Japanese IME ổn định.
- Theo dõi sự kiện composition của IME để không kiểm tra chuỗi khi người dùng vẫn đang ghép ký tự.
- Chấp nhận Hiragana trực tiếp, Katakana và Romaji.
- Katakana được chuẩn hóa về Hiragana trước khi so sánh.
- Romaji được chuyển sang Hiragana theo thời gian thực và hiển thị bản xem trước.
- Hỗ trợ các cách viết phổ biến:
  - Âm ngắt như `gakkou` → `がっこう`.
  - Âm ghép như `kya` → `きゃ`, `shu` → `しゅ`, `cho` → `ちょ`.
  - Âm `ん` qua `n`, `nn` hoặc `n'` tùy ngữ cảnh.
  - Một số âm mở rộng như `fa`, `vi`, `she`, `che`.
- Chuỗi nhập được chuẩn hóa Unicode NFKC, bỏ khoảng trắng và dấu `・` trước khi so sánh.
- Chỉ chấm đáp án khi người chơi nhấn `Enter` hoặc nút **Xác nhận**.
- Trả lời sai sẽ xóa ô nhập, đặt combo về 0 và lưu từ vào Học lại.

### 5. Nạp và kiểm tra CSV

File CSV phải có đúng hai cột theo thứ tự sau:

```csv
kanji,hiragana
水,みず
山,やま
学校,がっこう
```

Quy tắc xử lý hiện tại:

- Đọc file UTF-8 và chấp nhận UTF-8 BOM.
- Dòng đầu phải là chính xác `kanji,hiragana` (không phân biệt chữ hoa/chữ thường ở tên cột).
- Bỏ qua dòng trống, dòng thiếu Kanji hoặc thiếu Hiragana.
- Hỗ trợ trường CSV đặt trong dấu ngoặc kép và dấu ngoặc kép được escape theo chuẩn CSV.
- Tự loại bỏ các cặp `kanji` - `hiragana` trùng nhau.
- Giới hạn tối đa 5.000 từ hợp lệ.
- Từ chối file lớn hơn 2 MB.
- Hiển thị thông báo dễ hiểu khi file sai định dạng hoặc không có dữ liệu hợp lệ.

> Website chỉ dùng hai cột đầu vào trên. Nghĩa tiếng Việt, câu ví dụ, cấp độ JLPT và các cột mở rộng chưa được hỗ trợ ở phiên bản hiện tại.

### 6. Học lại bằng dữ liệu cục bộ

- Từ được đưa vào Học lại khi người chơi trả lời sai hoặc để mục tiêu vượt Vạch phòng thủ.
- Danh sách được lưu trong `localStorage` với khóa `kanji-sky-defense-review-v1`.
- Một từ sai nhiều lần không tạo bản ghi trùng; hệ thống tăng `mistakeCount`.
- Danh sách được sắp xếp theo số lần cần ôn từ cao xuống thấp.
- Thanh điều hướng hiển thị số lượng từ đang cần ôn.
- Nút **Học ngay** tạo một wave Study chỉ từ danh sách Học lại.
- Nút **Xóa lịch sử** yêu cầu xác nhận trước khi xóa toàn bộ dữ liệu ôn tập khi tùy chọn xác nhận xóa đang bật.

### 7. Các trang và trải nghiệm giao diện

Website có tám trang HTML, vượt yêu cầu tối thiểu ba trang của đồ án:

- `index.html`: trang chính, gồm ba màn hình Thiết lập, Chơi và Học lại.
- `about.html`: giới thiệu mục tiêu học tập, cách chơi và ba chế độ.
- `contact.html`: biểu mẫu chuẩn bị nội dung góp ý.
- `login.html`: đăng nhập bằng tài khoản cục bộ.
- `register.html`: tạo tài khoản người chơi.
- `user.html`: thông tin tài khoản, thống kê, biểu đồ và thư viện từ đã quên.
- `privacy.html`: chính sách lưu trữ dữ liệu cục bộ, cookie và quyền kiểm soát của người dùng.
- `404.html`: thông báo khi đường dẫn không tồn tại.

Giao diện hiện có:

- Bố cục responsive cho desktop, tablet và mobile với các mốc 900 px và 680 px.
- Sử dụng Flexbox và CSS Grid cho bố cục.
- `css/style.css` chứa token giao diện, quy tắc tổng thể, button, form, header, footer và các component dùng chung.
- Mỗi nhóm trang nạp thêm stylesheet riêng: `index.css`, `about.css`, `contact.css`, `auth.css`, `user.css`, `privacy.css` và `404.css`.
- Canvas tự thay đổi kích thước và giới hạn tỉ lệ điểm ảnh để hiển thị sắc nét nhưng không tiêu tốn quá nhiều tài nguyên.
- Hỗ trợ `prefers-reduced-motion` để giảm chuyển động theo cài đặt hệ điều hành.
- Dùng HTML semantic, nhãn `aria`, trạng thái `aria-live`, tiêu đề trang, meta description, favicon và Open Graph image.
- Icon giao diện dùng SVG sprite nội tuyến, kế thừa `currentColor` và có kích thước mặc định để hoạt động nhất quán ở cả theme sáng/tối.
- Không tải font, script hoặc stylesheet từ dịch vụ bên ngoài.

Biểu mẫu Liên hệ hiện **không gửi dữ liệu lên máy chủ**. Khi gửi form, website chỉ ghép nội dung và sao chép vào clipboard để người dùng tự dán vào kênh liên hệ phù hợp.

### 8. Tài khoản frontend và trang cá nhân

- Cho phép đăng ký, đăng nhập và đăng xuất ngay trên trình duyệt.
- Mỗi email chỉ tạo được một tài khoản trên cùng thiết bị và trình duyệt.
- Mật khẩu được băm trước khi lưu, nhưng đây vẫn chỉ là mô phỏng frontend và không thay thế hệ thống xác thực có máy chủ.
- Phiên đăng nhập được giữ bằng Local Storage.
- Trang cá nhân dùng bố cục sidebar giống một trang quản lý tài khoản thông thường.
- Cho phép cập nhật tên người dùng, email, ngày sinh và ảnh đại diện; ngày tham gia chỉ được xem, không thể chỉnh sửa.
- Có bốn chỉ số tổng quan: số phiên học, số từ đã luyện, độ chính xác và chuỗi ngày học liên tiếp.
- Biểu đồ đường hiển thị số từ đã luyện trong 7 ngày hoặc 30 ngày gần nhất.
- Thống kê được ghi lại khi người chơi đã đăng nhập; lượt chơi ở chế độ khách không được cộng vào hồ sơ.
- Mục Cài đặt cho phép chọn theme sáng/tối, ngôn ngữ Việt/Anh/Nhật, giảm chuyển động, ẩn phím tắt và bật/tắt xác nhận trước khi xóa.
- Tùy chọn giao diện được lưu và áp dụng lại trên các trang của website.

### 9. Thư viện từ đã quên và trang 404

- Danh sách Học lại được tách theo từng tài khoản cục bộ; người chưa đăng nhập dùng một vùng dữ liệu khách riêng.
- Trang cá nhân có thư viện nhỏ hiển thị Kanji, Hiragana và số lần quên.
- Thanh tìm kiếm chấp nhận Kanji, Hiragana hoặc Romaji; kết quả được xếp theo độ gần giống và kết quả phù hợp nhất nằm đầu danh sách.
- Có thể xóa từng từ, xóa toàn bộ thư viện hoặc bắt đầu ngay một wave ôn tập từ thư viện.
- `404.html` hiển thị thông báo thân thiện và đường dẫn quay lại trang chơi hoặc trang cá nhân.

## Cách chơi

1. Dùng bộ 12 từ mẫu hoặc chọn **Nạp CSV** để dùng dữ liệu riêng.
2. Chọn Study, Challenge hoặc Endless.
3. Chọn tốc độ và cấu hình HP nếu chế độ yêu cầu.
4. Nhấn **Bắt đầu nhiệm vụ**.
5. Đọc Kanji trên mục tiêu được tô sáng.
6. Gõ Hiragana hoặc Romaji, sau đó nhấn `Enter` để xác nhận.
7. Nhấn `Tab` khi muốn chuyển sang mục tiêu khác và `Escape` khi muốn tạm dừng.
8. Mở mục **Học lại** để xem hoặc chơi riêng các từ đã trả lời sai/bỏ lỡ.

## Giới hạn hiện tại

- Tài khoản chỉ là mô phỏng frontend, không có backend và không đồng bộ dữ liệu giữa nhiều thiết bị.
- Dữ liệu Học lại phụ thuộc vào trình duyệt và tên miền hiện tại; xóa dữ liệu trình duyệt sẽ làm mất lịch sử.
- Cấu hình và ván đang chơi không được khôi phục sau khi tải lại trang.
- Chưa có nghĩa từ, câu ví dụ, gợi ý, phát âm hoặc âm thanh hiệu ứng.
- Biểu đồ chỉ tổng hợp số từ đã luyện; chưa đo thời gian phản hồi cho từng từ.
- Form Liên hệ chỉ sao chép nội dung, chưa gửi email hoặc lưu góp ý.

## Phạm vi sản phẩm

Các chức năng hiện tại đã đáp ứng phạm vi sản phẩm đã chốt. Dự án không đặt thêm lộ trình tính năng mới ngoài việc sửa lỗi, cải thiện khả năng truy cập, tối ưu hiệu năng và hoàn thiện kiểm thử.

## Công nghệ và API trình duyệt

| Thành phần | Vai trò |
| --- | --- |
| HTML5 semantic | Cấu trúc tám trang, biểu mẫu, điều hướng và ô nhập hỗ trợ IME |
| CSS3 | Theme, component giao diện, Flexbox, Grid và responsive |
| Canvas 2D | Phi thuyền, mục tiêu, Vạch phòng thủ, laser và particle |
| JavaScript ES6+ | State game, game loop, CSV, Romaji, sự kiện và DOM |
| File API / Blob API | Đọc CSV, nhận ảnh đại diện và tạo CSV mẫu để tải xuống |
| Local Storage | Lưu tài khoản, phiên đăng nhập, cài đặt, thống kê và danh sách Học lại |
| Web Crypto API | Băm mật khẩu của tài khoản mô phỏng trước khi lưu |
| Clipboard API | Sao chép nội dung từ form Liên hệ |
| ResizeObserver | Đồng bộ kích thước Canvas với vùng chơi |

## Cấu trúc thư mục

Toàn bộ workspace khi phát triển có cấu trúc như sau:

```text
kanji_game/
├── ref/
│   ├── IE104_Project_Guide.pdf       # Yêu cầu và tiêu chí của đồ án IE104
│   └── Báo cáo CK Web_Final.pdf      # Báo cáo mẫu tham khảo cách trình bày
├── kanji_sky_defense_gdd.md          # Game Design Document và lộ trình sản phẩm
├── og-generated.png                  # Ảnh Open Graph bản nguồn
└── web/                              # Git repository và mã website triển khai
    ├── .openai/
    │   └── hosting.json              # Cấu hình hosting, phục vụ thư mục dist/
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
    ├── dist/                         # Bản sao tĩnh để xuất bản, không phải source of truth
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

`web/` là thư mục gốc của Git repository. Khi chỉnh sửa, hãy thay đổi các file nguồn trực tiếp dưới `web/`, không chỉnh tay trong `dist/` vì thư mục này chỉ là bản xuất bản được tạo lại và đã bị bỏ qua bởi Git.

### Trách nhiệm của các file JavaScript

`js/app.js` chỉ giữ phần điều phối chính:

- State cấu hình, game và Học lại.
- Điều hướng giữa Thiết lập, Chơi và Học lại.
- Sinh mục tiêu, cập nhật game loop, xử lý va chạm Vạch phòng thủ.
- Chấm đáp án, tính điểm/combo/HP và lưu từ sai.
- Vẽ toàn bộ game Canvas và hiệu ứng.

Các phần dùng lại đã được tách riêng:

- `js/utils.js`: truy vấn DOM, chuyển Romaji/Katakana sang Hiragana, chuẩn hóa đáp án, đọc CSV, tìm kiếm gần đúng, xử lý ảnh đại diện, xáo trộn danh sách và định dạng ngày.
- `js/storage.js`: thao tác Local Storage cho tài khoản, phiên đăng nhập, thông tin người dùng, lịch sử hoạt động và thư viện từ đã quên.
- `js/auth.js`: hiển thị trạng thái tài khoản trên header và xử lý form đăng nhập/đăng ký.
- `js/preferences.js`: lưu và áp dụng theme, ngôn ngữ, chuyển động, phím tắt và xác nhận xóa.
- `js/user.js`: cập nhật tài khoản/ảnh đại diện, điều phối sidebar, tổng hợp chỉ số, vẽ biểu đồ, cài đặt và tìm kiếm thư viện từ quên.

`js/site.js` phụ trách:

- Điền năm hiện tại ở footer của các trang thông tin.
- Kiểm tra form Liên hệ bằng ràng buộc HTML.
- Ghép tên, email, nội dung góp ý và sao chép vào clipboard.

## Chạy dự án

Không cần cài dependency hoặc chạy bước build.

### Cách nhanh nhất

Mở trực tiếp `index.html` bằng trình duyệt hiện đại.

### Chạy bằng máy chủ tĩnh cục bộ

Cách này giúp Clipboard API và việc tải file hoạt động ổn định hơn. Tại thư mục `web/`, chạy:

```bash
python -m http.server 8080
```

Sau đó mở:

```text
http://localhost:8080
```

## Yêu cầu trình duyệt

Khuyến nghị dùng phiên bản mới của Chrome, Edge hoặc Firefox. Trình duyệt cần hỗ trợ Canvas 2D, ES6+, Local Storage, File API, `ResizeObserver` và Clipboard API. Nếu Clipboard API bị chặn, các phần còn lại của game vẫn hoạt động; riêng form Liên hệ sẽ yêu cầu người dùng sao chép thủ công.

## Quy ước phát triển

- Giữ dự án ở dạng Vanilla HTML/CSS/JavaScript theo yêu cầu môn học.
- Dùng tên biến và hàm JavaScript theo `camelCase`.
- Đặt tên class CSS theo BEM: block dùng `kebab-case`, element dùng `block__element`, modifier dùng `block--modifier` hoặc `block__element--modifier`.
- Khi JavaScript thay đổi trạng thái giao diện, chỉ thêm/xóa modifier BEM tương ứng, ví dụ `mode-card--active` và `answer-form--correct`.
- Mỗi trang phải có một `id` riêng trên thẻ `body`; mọi selector trong stylesheet riêng của trang phải bắt đầu bằng `#page-id` tương ứng.
- Chỉ đặt style dùng chung hoặc quy tắc giao diện tổng thể trong `css/style.css`; style độc quyền của trang nằm trong file CSS mở rộng của trang đó.
- Không chỉnh sửa `reset.css` nếu dự án bổ sung hoặc sử dụng file reset chuẩn.
- Tách logic dùng chung và logic riêng theo trách nhiệm file.
- Ưu tiên HTML semantic, khả năng truy cập và giao diện responsive.
- Tạo nhánh riêng cho từng tính năng hoặc bản sửa lỗi; mô tả rõ thay đổi trong Pull Request.
- Không commit nội dung tạo tạm hoặc bản sao xuất bản trong `dist/`.

## Tài liệu tham khảo nội bộ

- `../ref/IE104_Project_Guide.pdf`: yêu cầu đồ án, tiêu chí đánh giá và cấu trúc repository được khuyến nghị.
- `../ref/Báo cáo CK Web_Final.pdf`: báo cáo mẫu dùng để tham khảo cách mô tả công nghệ, component, tính năng, kiểm thử và hướng phát triển. Nội dung MyTicket trong báo cáo mẫu không phải tính năng của Kanji Sky Defense.
- `../kanji_sky_defense_gdd.md`: đặc tả gameplay, kiến trúc kỹ thuật và lộ trình sau MVP của Kanji Sky Defense.

## Quyền riêng tư

Website không gửi file CSV, tài khoản, hồ sơ, thống kê, lịch sử Học lại hoặc nội dung gameplay lên máy chủ. File CSV chỉ được đọc trong trình duyệt; toàn bộ dữ liệu người dùng chỉ được lưu trên thiết bị bằng Local Storage. Không nên dùng mật khẩu thật cho tài khoản mô phỏng này.
