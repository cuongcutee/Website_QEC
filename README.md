# Website QEC Club

Website landing page dành cho câu lạc bộ (CLB) công nghệ QEC với phần đăng nhập Google, khu vực đăng dự án nội bộ và kho bài viết mô tả chi tiết từng dự án. Mọi nội dung đều là tĩnh nên bạn có thể deploy ở bất kỳ static hosting nào.

## Tính năng chính

- Hero section đậm chất công nghệ với thông tin CLB, CTA và số liệu.
- Khu vực profile với Google One Tap / Google Sign-In (Google Identity Services).
- Bộ lọc dự án theo danh mục (Tất cả/Web/Mobile/AI).
- Form gửi dự án mới, chỉ khả dụng sau khi đăng nhập.
- Khi bấm "Xem bài viết" trên card dự án bạn sẽ được chuyển tới `projects.html` để đọc hướng dẫn triển khai dạng bài viết, kèm đường dẫn demo/tài liệu.
- Chế độ sáng/tối được lưu trong `localStorage`.
- Mọi dự án được lưu cục bộ (`localStorage`), dữ liệu mẫu sẽ tự khởi tạo lần đầu.

## Cấu trúc

```
├── index.html        # Landing page chính
├── projects.html     # Kho bài viết dự án, hiển thị như blog hướng dẫn
├── styles.css        # Hiệu ứng glassmorphism và responsive
├── data.js           # Seed dữ liệu dự án + helper slugify
├── app.js            # Logic Google Sign-In, lọc dự án, form
└── projects-page.js  # Render bài viết hướng dẫn cho từng dự án
```

## Thiết lập Google Sign-In

1. Tạo OAuth Client ID dạng "Web" trong Google Cloud Console.
2. Thêm domain deploy vào phần Authorized JavaScript origins.
3. Sao chép Client ID và thay chuỗi `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` trong `index.html`.
4. Deploy website lên host tĩnh (GitHub Pages, Netlify, Vercel...).

> Nếu chỉ muốn demo nhanh trên máy, hãy dùng nút **"Thử đăng nhập demo"** để kích hoạt form gửi dự án.

## Phát triển cục bộ

```bash
python -m http.server 4173
```

Sau đó truy cập `http://localhost:4173` để xem giao diện landing (`index.html`) và `http://localhost:4173/projects.html` cho kho bài viết.
