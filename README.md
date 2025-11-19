# Website QEC Club

Website landing page dành cho câu lạc bộ (CLB) công nghệ QEC với phần đăng nhập Google, khu vực đăng dự án nội bộ và kho bài viết mô tả chi tiết từng dự án. Frontend được phục vụ từ backend Node.js tự sinh API nên dữ liệu có thể đồng bộ giữa nhiều thành viên thay vì chỉ nằm trên trình duyệt.

## Tính năng chính

- Hero section đậm chất công nghệ với thông tin CLB, CTA và số liệu.
- Khu vực profile với Google One Tap / Google Sign-In (Google Identity Services).
- Bộ lọc dự án theo danh mục (Tất cả/Web/Mobile/AI).
- Form gửi dự án mới, chỉ khả dụng sau khi đăng nhập.
- Khi bấm "Xem bài viết" trên card dự án bạn sẽ được chuyển tới `projects.html` để đọc hướng dẫn triển khai dạng bài viết, kèm đường dẫn demo/tài liệu.
- Backend Node.js thuần xử lý API `/api/projects`, lưu trữ dự án vào file JSON và phục vụ toàn bộ static site.
- Thanh trạng thái đồng bộ cho biết dữ liệu đang được lấy từ backend hay đang dùng cache để tránh hiểu nhầm khi backend tạm thời offline.
- Chế độ sáng/tối được lưu trong `localStorage`.
- Dữ liệu dự án được lưu trên backend, nhưng client vẫn cache bản sao trong `localStorage` để đọc offline và đồng bộ lại khi backend hoạt động.

## Cấu trúc

```
├── index.html        # Landing page chính
├── projects.html     # Kho bài viết dự án, hiển thị như blog hướng dẫn
├── styles.css        # Hiệu ứng glassmorphism và responsive
├── data.js           # Seed dữ liệu dự án + helper slugify (dùng cho front & server)
├── app.js            # Logic Google Sign-In, lọc dự án, đồng bộ API
├── projects-page.js  # Render bài viết hướng dẫn cho từng dự án
├── server.js         # Backend HTTP native, phục vụ static + API dự án
└── storage/             # Sinh tự động khi chạy server, chứa projects.json
```

## Thiết lập Google Sign-In

1. Tạo OAuth Client ID dạng "Web" trong Google Cloud Console.
2. Thêm domain deploy vào phần Authorized JavaScript origins.
3. Sao chép Client ID và thay chuỗi `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` trong `index.html`.
4. Deploy website lên host tĩnh (GitHub Pages, Netlify, Vercel...).

> Nếu chỉ muốn demo nhanh trên máy, hãy dùng nút **"Thử đăng nhập demo"** để kích hoạt form gửi dự án.

## Phát triển cục bộ

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:4173`. Mặc định backend cũng phục vụ các file tĩnh nên chỉ cần chạy một lệnh để vừa xem landing (`/`) vừa xem kho bài viết (`/projects.html`).

> Thư mục `storage/` và file `storage/projects.json` được tạo tự động khi backend chạy. Chúng không nằm trong Git để tránh xung đột khi nhiều thành viên cùng phát triển. Nếu muốn reset dữ liệu cục bộ, chỉ cần xoá thư mục này rồi chạy lại `npm run dev` để server seed dữ liệu mẫu mới.

## API dự án

- `GET /api/projects`: trả về toàn bộ danh sách dự án được lưu trong `storage/projects.json` (bao gồm cả seed ban đầu).
- `GET /api/projects/:slug`: trả về chi tiết một dự án theo slug.
- `POST /api/projects`: thêm dự án mới. Trường bắt buộc: `title`, `description`, `link`, `author`. Backend tự tạo slug, ngày `publishedAt` mặc định là ngày hiện tại.

> Toàn bộ API đều chạy trên cùng host nên frontend chỉ cần gọi `/api/...`. Trong trường hợp backend không phản hồi, client sẽ tự động dùng dữ liệu cache trong `localStorage` để không bị gián đoạn.
