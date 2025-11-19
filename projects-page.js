const dataStore = window.QEC_DATA;
const starterProjects = dataStore.getStarterProjects();
const STORAGE_KEYS = dataStore.STORAGE_KEYS;
const slugify = dataStore.slugify;

const API_BASE = "/api";

const heroEl = document.getElementById("projectHero");
const guideEl = document.getElementById("guideContainer");
const sidebarEl = document.getElementById("projectSidebar");
const timelineEl = document.getElementById("projectTimeline");

const state = {
  projects: [],
};

renderLoadingStates();
initPage();

async function initPage() {
  await hydrateProjects();
  const sortedProjects = sortProjects(state.projects);
  const activeProject = getActiveProject(sortedProjects);

  renderHero(activeProject);
  renderGuide(activeProject);
  renderSidebar(sortedProjects, activeProject?.slug);
  renderTimeline(sortedProjects, activeProject?.slug);

  document.title = activeProject
    ? `${activeProject.title} · Kho dự án QEC`
    : "Kho dự án QEC";
}

async function hydrateProjects() {
  try {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) throw new Error("Không thể tải dữ liệu từ backend");
    const data = await response.json();
    state.projects = normalizeProjects(data);
    cacheProjects(state.projects);
  } catch (error) {
    console.warn("Không thể kết nối backend, dùng dữ liệu cache", error);
    state.projects = loadProjectsFromCache();
  }
}

function cacheProjects(projectsList) {
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projectsList));
}

function renderLoadingStates() {
  if (heroEl) {
    heroEl.innerHTML = `
      <div class="glass">
        <p class="eyebrow">Kho dự án QEC</p>
        <h1>Đang tải dữ liệu...</h1>
        <p class="lead">Vui lòng chờ trong giây lát.</p>
      </div>`;
  }
  if (guideEl) {
    guideEl.innerHTML = "";
  }
  if (sidebarEl) {
    sidebarEl.innerHTML = `<div class="glass"><p>Đang tải...</p></div>`;
  }
  if (timelineEl) {
    timelineEl.innerHTML = "";
  }
}

function loadProjectsFromCache() {
  const cached = localStorage.getItem(STORAGE_KEYS.projects);
  if (!cached) {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(starterProjects));
    return starterProjects;
  }
  try {
    return normalizeProjects(JSON.parse(cached));
  } catch (error) {
    console.warn("Không đọc được dữ liệu dự án, dùng dữ liệu mẫu.", error);
    return starterProjects;
  }
}

function normalizeProjects(projectsList) {
  return projectsList.map((project) => {
    const slug = project.slug || slugify(project.title);
    const starter = starterProjects.find((item) => item.slug === slug);
    return {
      ...starter,
      ...project,
      slug,
      tags: project.tags || starter?.tags || [],
      guide: project.guide || starter?.guide || null,
      category: project.category || starter?.category || "web",
    };
  });
}

function sortProjects(list) {
  return [...list].sort((a, b) => {
    const dateA = Date.parse(a.publishedAt || a.createdAt || "");
    const dateB = Date.parse(b.publishedAt || b.createdAt || "");
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return dateB - dateA;
    }
    return (b.title || "").localeCompare(a.title || "");
  });
}

function getActiveProject(list) {
  if (!list.length) return null;
  const params = new URLSearchParams(window.location.search);
  const slugParam = params.get("project");
  if (!slugParam) return list[0];
  return list.find((project) => project.slug === slugParam) || list[0];
}

function renderHero(project) {
  if (!heroEl) return;
  if (!project) {
    heroEl.innerHTML = `
      <div class="glass">
        <h1>Chưa có bài viết dự án</h1>
        <p class="lead">Quay lại landing page để gửi dự án đầu tiên nhé!</p>
      </div>`;
    return;
  }

  heroEl.innerHTML = `
    <div class="project-hero__content glass">
      <p class="eyebrow">Kho dự án QEC</p>
      <h1>${project.title}</h1>
      <p class="lead">${project.description}</p>
      <ul class="project-hero__meta">
        <li><span>Tác giả</span>${project.author || "Thành viên QEC"}</li>
        <li><span>Danh mục</span>${project.category?.toUpperCase()}</li>
        <li><span>Ngày phát hành</span>${formatDate(project.publishedAt)}</li>
      </ul>
      <div class="hero__actions">
        <a class="cta" href="#guide">Đọc hướng dẫn</a>
        ${
          project.link
            ? `<a class="cta ghost" href="${project.link}" target="_blank" rel="noopener">Xem demo</a>`
            : ""
        }
      </div>
    </div>
    ${
      project.image
        ? `<div class="project-hero__cover"><img src="${project.image}" alt="${project.title}" loading="lazy" /></div>`
        : ""
    }
  `;
}

function renderGuide(project) {
  if (!guideEl) return;
  if (!project) {
    guideEl.innerHTML = "";
    return;
  }
  const guide = project.guide || createFallbackGuide(project);
  guideEl.innerHTML = `
    <article class="guide-article glass" id="guide">
      <h2>Cách chúng tôi xây dựng ${project.title}</h2>
      <p class="lead">${guide.intro || project.description}</p>
      ${renderHighlights(guide.highlights)}
      <div class="guide-steps">
        ${guide.steps.map(renderStep).join("")}
      </div>
      ${renderResources(guide.resources)}
    </article>
  `;
}

function renderHighlights(highlights = []) {
  if (!highlights.length) return "";
  return `
    <div class="guide-highlights">
      ${highlights.map((item) => `<div class="highlight">${item}</div>`).join("")}
    </div>
  `;
}

function renderStep(step, index) {
  return `
    <section class="guide-step">
      <span class="step-index">${String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>${step.title}</h3>
        <p>${step.detail}</p>
      </div>
    </section>
  `;
}

function renderResources(resources = []) {
  if (!resources.length) return "";
  return `
    <div class="guide-resources">
      <h4>Tài liệu tham khảo</h4>
      <ul>
        ${resources
          .map((resource) => `<li><a href="${resource.url}" target="_blank" rel="noopener">${resource.label}</a></li>`)
          .join("")}
      </ul>
    </div>
  `;
}

function renderSidebar(projectsList, activeSlug) {
  if (!sidebarEl) return;
  if (!projectsList.length) {
    sidebarEl.innerHTML = `<div class="glass"><p>Chưa có dự án nào để hiển thị.</p></div>`;
    return;
  }
  sidebarEl.innerHTML = `
    <h3>Bài viết dự án</h3>
    <ul>
      ${projectsList
        .map(
          (project) => `
          <li>
            <a href="projects.html?project=${project.slug}" class="${
            project.slug === activeSlug ? "active" : ""
          }">${project.title}</a>
            <small>${formatDate(project.publishedAt)}</small>
          </li>`
        )
        .join("")}
    </ul>
  `;
}

function renderTimeline(projectsList, activeSlug) {
  if (!timelineEl) return;
  if (!projectsList.length) {
    timelineEl.innerHTML = `
      <div class="section-heading">
        <h2>Chưa có dữ liệu</h2>
        <p>Gửi dự án mới để thấy lịch trình cập nhật.</p>
      </div>`;
    return;
  }
  timelineEl.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Kho bài viết</p>
      <div>
        <h2>Các dự án khác của CLB</h2>
        <p>Chọn một dự án để đọc câu chuyện triển khai chi tiết.</p>
      </div>
    </div>
    <div class="timeline-grid">
      ${projectsList
        .map((project) => `
          <article class="timeline-card ${project.slug === activeSlug ? "active" : ""}">
            <div class="timeline-meta">
              <span>${formatDate(project.publishedAt)}</span>
              <span>${project.category?.toUpperCase()}</span>
            </div>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="tags">
              ${project.tags
                .slice(0, 3)
                .map((tag) => `<span class="tag">${tag}</span>`)
                .join("")}
            </div>
            <a class="cta tiny" href="projects.html?project=${project.slug}">Đọc bài viết</a>
          </article>
        `)
        .join("")}
    </div>
  `;
}

function formatDate(value) {
  if (!value) return "Đang cập nhật";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

function createFallbackGuide(project) {
  return {
    intro: project.description,
    highlights: [
      "Bài viết được tự động tạo từ form gửi dự án",
      "Cập nhật lại phần hướng dẫn trong CMS để câu chuyện trọn vẹn hơn",
    ],
    steps: [
      {
        title: "Ý tưởng tổng quan",
        detail: project.description,
      },
      {
        title: "Thành viên phụ trách",
        detail: `Dẫn dắt bởi ${project.author || "thành viên CLB"}. Chi tiết sẽ được cập nhật thêm trong CMS.`,
      },
    ],
    resources: project.link
      ? [{ label: "Xem demo", url: project.link }]
      : [],
  };
}
