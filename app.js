const projectGrid = document.getElementById("projectGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const form = document.getElementById("projectForm");
const submitBtn = form.querySelector("button[type='submit']");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileAvatar = document.getElementById("profileAvatar");
const themeToggle = document.getElementById("themeToggle");
const demoLoginBtn = document.getElementById("demoLogin");

const STORAGE_KEYS = {
  projects: "qec-projects",
  user: "qec-user",
  theme: "qec-theme",
};

const starterProjects = [
  {
    title: "EcoCycle",
    description: "Nền tảng gamification khuyến khích phân loại rác thông minh trong khuôn viên trường.",
    tags: ["mobile", "ux"],
    category: "mobile",
    link: "https://github.com/qec-lab/ecocycle",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    author: "Thảo Nguyễn",
  },
  {
    title: "Mentor Radar",
    description: "Ứng dụng web kết nối sinh viên với mentor phù hợp bằng AI matching.",
    tags: ["web", "ai"],
    category: "ai",
    link: "https://mentor.qec.club",
    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
    author: "Hải Bùi",
  },
  {
    title: "QEC Studio",
    description: "Website giới thiệu dự án CLB với khả năng cập nhật realtime.",
    tags: ["web", "design"],
    category: "web",
    link: "https://dribbble.com/shots/222222",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    author: "Linh Đoàn",
  },
];

const state = {
  projects: loadProjects(),
  user: loadUser(),
  filter: "all",
};

function loadProjects() {
  const cached = localStorage.getItem(STORAGE_KEYS.projects);
  if (!cached) {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(starterProjects));
    return [...starterProjects];
  }
  try {
    return JSON.parse(cached);
  } catch (error) {
    console.warn("Không thể đọc dữ liệu dự án, dùng dữ liệu mẫu.");
    return [...starterProjects];
  }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
}

function loadUser() {
  const cached = localStorage.getItem(STORAGE_KEYS.user);
  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch (error) {
    return null;
  }
}

function saveUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.user);
  } else {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }
}

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Không thể phân tích JWT", error);
    return null;
  }
}

function renderProjects() {
  const projects =
    state.filter === "all"
      ? state.projects
      : state.projects.filter((project) => project.category === state.filter);

  if (!projects.length) {
    projectGrid.innerHTML = `<p class="note">Hiện chưa có dự án nào trong mục này.</p>`;
    return;
  }

  projectGrid.innerHTML = projects
    .map(
      (project) => `
      <article class="project-card" data-category="${project.category}">
        ${project.image ? `<img src="${project.image}" alt="${project.title}" loading="lazy" />` : ""}
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="tags">
          ${project.tags
            .slice(0, 3)
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join("")}
        </div>
        <a href="${project.link}" target="_blank" rel="noopener">Xem chi tiết →</a>
        <small>Đăng bởi ${project.author || "Thành viên QEC"}</small>
      </article>
    `
    )
    .join("");
}

function updateProfileUI() {
  if (state.user) {
    profileName.textContent = state.user.name;
    profileEmail.textContent = state.user.email;
    profileAvatar.src = state.user.picture || "https://avatars.githubusercontent.com/u/9919";
    submitBtn.disabled = false;
    submitBtn.textContent = "Gửi dự án";
  } else {
    profileName.textContent = "Khách tham quan";
    profileEmail.textContent = "Hãy đăng nhập để cùng sáng tạo";
    profileAvatar.src = "https://avatars.githubusercontent.com/u/9919";
    submitBtn.disabled = true;
    submitBtn.textContent = "Đăng nhập để gửi";
  }
}

window.handleGoogleCredentialResponse = (response) => {
  const payload = parseJwt(response.credential);
  if (!payload) return;
  state.user = {
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
  };
  saveUser(state.user);
  updateProfileUI();
};

demoLoginBtn.addEventListener("click", () => {
  state.user = {
    name: "Demo Member",
    email: "demo@qec.club",
    picture: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80",
  };
  saveUser(state.user);
  updateProfileUI();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.user) return alert("Hãy đăng nhập bằng Google trước khi gửi dự án");

  const formData = new FormData(form);
  const newProject = {
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    tags: formData
      .get("tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 3),
    category: inferCategory(formData.get("tags")),
    link: formData.get("link").trim(),
    image: formData.get("image").trim(),
    author: state.user.name,
    createdAt: new Date().toISOString(),
  };

  state.projects = [newProject, ...state.projects];
  saveProjects(state.projects);
  renderProjects();
  form.reset();
});

function inferCategory(tagString) {
  const normalized = tagString.toLowerCase();
  if (normalized.includes("mobile")) return "mobile";
  if (normalized.includes("ai")) return "ai";
  return "web";
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    renderProjects();
  });
});

function initTheme() {
  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
  document.body.classList.toggle("light", storedTheme === "light");
  themeToggle.textContent = storedTheme === "light" ? "☀️" : "🌙";
}

function toggleTheme() {
  const isLight = document.body.classList.toggle("light");
  localStorage.setItem(STORAGE_KEYS.theme, isLight ? "light" : "dark");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", toggleTheme);

initTheme();
renderProjects();
updateProfileUI();
