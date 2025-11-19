(function (global, factory) {
  if (typeof module === "object" && typeof module.exports !== "undefined") {
    module.exports = factory();
  } else {
    global.QEC_DATA = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const STORAGE_KEYS = {
    projects: "qec-projects",
    user: "qec-user",
    theme: "qec-theme",
  };

  const rawProjects = [
    {
      title: "EcoCycle",
      slug: "ecocycle",
      description:
        "Nền tảng gamification khuyến khích phân loại rác thông minh trong khuôn viên trường.",
      tags: ["mobile", "ux", "sustainability"],
      category: "mobile",
      link: "https://github.com/qec-lab/ecocycle",
      image:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
      author: "Thảo Nguyễn",
      publishedAt: "2024-04-02",
      guide: {
        intro:
          "EcoCycle được xây để giúp sinh viên phân loại rác đúng cách thông qua các thử thách vui nhộn và bảng xếp hạng theo khoa.",
        highlights: [
          "Thiết kế Flutter đa nền tảng với đồ hoạ minh hoạ riêng của CLB.",
          "Gamification: nhiệm vụ hàng ngày, huy hiệu tái chế và bảng xếp hạng thời gian thực.",
          "Dashboards cho ban quản lý ký túc để nắm tiến độ giảm rác thải.",
        ],
        steps: [
          {
            title: "Khảo sát hiện trạng",
            detail:
              "Đội dự án thực hiện 220 khảo sát nhanh và 10 buổi shadow sinh viên tại các khu ký túc để hiểu hành vi vứt rác.",
          },
          {
            title: "Tạo prototype",
            detail:
              "Nhóm UI/UX dựng prototype trên Figma, thử nghiệm 3 vòng với các thành viên CLB để tinh chỉnh luồng nhiệm vụ và phần thưởng.",
          },
          {
            title: "Phát triển & đo lường",
            detail:
              "Ứng dụng Flutter được kết nối Firebase cho realtime database, Cloud Functions xử lý điểm và BigQuery để phân tích xu hướng.",
          },
        ],
        resources: [
          { label: "Figma prototype", url: "https://www.figma.com/file/qec/ecocycle" },
          { label: "Báo cáo thử nghiệm", url: "https://qec.club/files/ecocycle-report.pdf" },
        ],
      },
    },
    {
      title: "Mentor Radar",
      slug: "mentor-radar",
      description: "Ứng dụng web kết nối sinh viên với mentor phù hợp bằng AI matching.",
      tags: ["web", "ai", "community"],
      category: "ai",
      link: "https://mentor.qec.club",
      image:
        "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80",
      author: "Hải Bùi",
      publishedAt: "2024-03-14",
      guide: {
        intro:
          "Mentor Radar dùng vector similarity để ghép mentor với mentee dựa trên mục tiêu nghề nghiệp và thời gian rảnh.",
        highlights: [
          "Thuật toán matching kết hợp OpenAI Embeddings và rule-based scoring.",
          "Trang tổng quan mentor hiển thị lịch và phản hồi nhanh.",
          "Thông báo realtime qua email + Discord webhook.",
        ],
        steps: [
          {
            title: "Chuẩn hoá dữ liệu",
            detail:
              "Dùng Airtable để thu thập hồ sơ mentor/mentee, sau đó đồng bộ sang PostgreSQL với cron job.",
          },
          {
            title: "Huấn luyện mô hình",
            detail:
              "Sử dụng 1.500 cặp mentor-mentee từ mùa trước để tinh chỉnh trọng số scoring và benchmark độ chính xác.",
          },
          {
            title: "Triển khai dashboard",
            detail:
              "Next.js + Supabase Auth đảm bảo mentor có thể cập nhật trạng thái, Slack bot gửi nhắc lịch hằng tuần.",
          },
        ],
        resources: [
          { label: "Thuật toán matching", url: "https://gist.github.com/qec-lab/mentor-radar" },
          { label: "Template onboarding", url: "https://qec.club/templates/mentor-onboarding.docx" },
        ],
      },
    },
    {
      title: "QEC Studio",
      slug: "qec-studio",
      description: "Website giới thiệu dự án CLB với khả năng cập nhật realtime.",
      tags: ["web", "design", "cms"],
      category: "web",
      link: "https://dribbble.com/shots/222222",
      image:
        "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
      author: "Linh Đoàn",
      publishedAt: "2024-02-01",
      guide: {
        intro:
          "QEC Studio đóng vai trò như cổng portfolio, tích hợp CMS để các nhóm dự án tự cập nhật nội dung và ảnh demo.",
        highlights: [
          "Sử dụng Astro + Tailwind cho hiệu năng tối ưu và dễ mở rộng.",
          "CMS mã nguồn mở (Payload) được host trên Render, bảo mật bằng OAuth.",
          "Pipeline triển khai tự động thông qua GitHub Actions.",
        ],
        steps: [
          {
            title: "Xây dựng cấu trúc nội dung",
            detail:
              "Định nghĩa schema cho dự án, thành viên, đối tác; tạo block linh hoạt để kể câu chuyện dự án.",
          },
          {
            title: "Thiết kế component",
            detail:
              "Thiết kế hệ thống card, testimonial và landing section thống nhất giúp các nhóm chỉ tập trung viết nội dung.",
          },
          {
            title: "Tích hợp CMS",
            detail:
              "Sử dụng Payload CMS, tạo webhook để tự động build khi nội dung mới được publish.",
          },
        ],
        resources: [
          { label: "Hệ thống thiết kế", url: "https://www.figma.com/file/qec/qec-studio" },
          { label: "Repo front-end", url: "https://github.com/qec-lab/studio" },
        ],
      },
    },
  ];

  function slugify(text) {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  const starterProjects = rawProjects.map((project) => ({
    ...project,
    slug: project.slug || slugify(project.title),
  }));

  function clone(project) {
    return JSON.parse(JSON.stringify(project));
  }

  return {
    STORAGE_KEYS,
    getStarterProjects() {
      return starterProjects.map(clone);
    },
    slugify,
  };
});
