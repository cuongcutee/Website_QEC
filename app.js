const dataModule = window.QEC_DATA;
const starterProjects = dataModule.getStarterProjects();
const STORAGE_KEYS = dataModule.STORAGE_KEYS;
const slugify = dataModule.slugify;

const API_BASE = "/api";

const projectGrid = document.getElementById("projectGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const form = document.getElementById("projectForm");
const submitBtn = form?.querySelector("button[type='submit']");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileAvatar = document.getElementById("profileAvatar");
const themeToggle = document.getElementById("themeToggle");
const demoLoginBtn = document.getElementById("demoLogin");
const syncStatus = document.getElementById("syncStatus");

const state = {
  projects: [],
  user: loadUser(),
  filter: "all",
  loadingProjects: true,
};

function loadProjectsFromCache() {
  const cached = localStorage.getItem(STORAGE_KEYS.projects);
  if (!cached) {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(starterProjects));
    return starterProjects.map((project) => ({ ...project }));
  }
  try {
    const parsed = JSON.parse(cached);
    return normalizeProjects(parsed);
  } catch (error) {
    console.warn("Không thể đọc dữ liệu dự án, dùng dữ liệu mẫu.", error);
    return starterProjects.map((project) => ({ ...project }));
  }
}

function normalizeProjects(projects) {
  return projects.map((project) => {
    const slug = project.slug || slugify(project.title);
    const starter = starterProjects.find((item) => item.slug === slug);
    return {
      ...project,
      slug,
      category: project.category || starter?.category || "web",
      tags: project.tags || starter?.tags || [],
      guide: project.guide || starter?.guide || null,
      publishedAt: project.publishedAt || starter?.publishedAt || null,
    };
  });
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
}

async function fetchProjectsFromApi() {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu từ máy chủ");
  }
  return response.json();
}

async function refreshProjects() {
  if (!projectGrid) return;
  state.loadingProjects = true;
  renderProjects();
  setSyncStatus("Đang đồng bộ dữ liệu...", "loading");
  try {
    const remoteProjects = await fetchProjectsFromApi();
    state.projects = normalizeProjects(remoteProjects);
    saveProjects(state.projects);
    const now = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    setSyncStatus(`Đã đồng bộ lúc ${now}`, "success");
  } catch (error) {
    console.warn("Không thể đồng bộ backend, dùng dữ liệu cache.", error);
    state.projects = loadProjectsFromCache();
    setSyncStatus("Mất kết nối, đang dùng dữ liệu cache", "error");
  } finally {
    state.loadingProjects = false;
    renderProjects();
  }
}

function setSyncStatus(message, variant = "idle") {
  if (!syncStatus) return;
  syncStatus.textContent = message;
  syncStatus.dataset.state = variant;
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
  if (!projectGrid) return;
  if (state.loadingProjects) {
    projectGrid.innerHTML = `<p class="note">Đang tải dữ liệu dự án...</p>`;
    return;
  }

  const projects =
    state.filter === "all"
      ? state.projects
      : state.projects.filter((project) => project.category === state.filter);

  if (!projects.length) {
    projectGrid.innerHTML = `<p class="note">Hiện chưa có dự án nào trong mục này.</p>`;
    return;
  }

  projectGrid.innerHTML = projects
    .map((project) => {
      const detailHref = `projects.html?project=${project.slug}`;
      const externalLink = project.link
        ? `<a class="cta ghost tiny" href="${project.link}" target="_blank" rel="noopener">Demo</a>`
        : "";
      return `
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
        <div class="card-actions">
          <a class="cta tiny" href="${detailHref}">Xem bài viết</a>
          ${externalLink}
        </div>
        <small>Đăng bởi ${project.author || "Thành viên QEC"}</small>
      </article>
    `;
    })
    .join("");
}

function updateProfileUI() {
  if (!submitBtn) return;
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

if (demoLoginBtn) {
  demoLoginBtn.addEventListener("click", () => {
    state.user = {
      name: "Demo Member",
      email: "demo@qec.club",
      picture:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80",
    };
    saveUser(state.user);
    updateProfileUI();
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.user) return alert("Hãy đăng nhập bằng Google trước khi gửi dự án");

    const formData = new FormData(form);
    const title = formData.get("title").trim();
    const payload = {
      title,
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
    };

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang gửi...";
      const saved = await createProjectOnServer(payload);
      state.projects = [normalizeProjects([saved])[0], ...state.projects];
      saveProjects(state.projects);
      renderProjects();
      form.reset();
    } catch (error) {
      console.warn("Không thể gửi dữ liệu tới backend", error);
      const fallback = {
        ...payload,
        slug: createUniqueSlug(title),
        guide: null,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString().split("T")[0],
      };
      state.projects = [fallback, ...state.projects];
      saveProjects(state.projects);
      renderProjects();
      alert("Không thể kết nối máy chủ, dự án được lưu tạm trên trình duyệt.");
    } finally {
      submitBtn.disabled = !state.user;
      submitBtn.textContent = state.user ? "Gửi dự án" : "Đăng nhập để gửi";
    }
  });
}

async function createProjectOnServer(project) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tạo dự án mới");
  }
  return response.json();
}

function createUniqueSlug(title) {
  const base = slugify(title) || `du-an-${Date.now()}`;
  const existing = new Set(state.projects.map((project) => project.slug));
  if (!existing.has(base)) return base;
  let counter = 2;
  let candidate = `${base}-${counter}`;
  while (existing.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

function inferCategory(tagString) {
  if (!tagString) return "web";
  const normalized = tagString.toLowerCase();
  if (normalized.includes("mobile")) return "mobile";
  if (normalized.includes("ai")) return "ai";
  if (normalized.includes("data")) return "ai";
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

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

async function bootstrap() {
  initTheme();
  updateProfileUI();
  await refreshProjects();
}

bootstrap();
