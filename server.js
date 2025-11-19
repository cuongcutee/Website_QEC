const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { URL } = require("url");

const dataStore = require("./data.js");

const PORT = Number(process.env.PORT) || 4173;
const PUBLIC_DIR = __dirname;
const DATA_FILE = path.join(__dirname, "storage", "projects.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

async function ensureStorage() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    const seeds = dataStore.getStarterProjects();
    await fs.writeFile(DATA_FILE, JSON.stringify(seeds, null, 2), "utf-8");
  }
}

async function readProjects() {
  await ensureStorage();
  const content = await fs.readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(content);
  } catch (error) {
    console.warn("Không thể parse dữ liệu storage, tạo lại file.", error);
    const seeds = dataStore.getStarterProjects();
    await fs.writeFile(DATA_FILE, JSON.stringify(seeds, null, 2), "utf-8");
    return seeds;
  }
}

async function writeProjects(projects) {
  await ensureStorage();
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/projects") {
    const projects = await readProjects();
    sendJson(res, 200, projects);
    return true;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/projects/")) {
    const slug = url.pathname.split("/").pop();
    const projects = await readProjects();
    const project = projects.find((item) => item.slug === slug);
    if (!project) {
      sendJson(res, 404, { message: "Không tìm thấy dự án" });
    } else {
      sendJson(res, 200, project);
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/projects") {
    const payload = await readRequestBody(req);
    const validation = validateProjectPayload(payload);
    if (!validation.valid) {
      sendJson(res, 400, { message: validation.message });
      return true;
    }

    const projects = await readProjects();
    const slug = createUniqueSlug(projects, payload.title);
    const newProject = {
      ...payload,
      slug,
      tags: normalizeTags(payload.tags),
      category: payload.category || inferCategoryFromTags(payload.tags),
      createdAt: new Date().toISOString(),
      publishedAt: payload.publishedAt || new Date().toISOString().split("T")[0],
      guide: payload.guide || null,
    };

    projects.unshift(newProject);
    await writeProjects(projects);
    sendJson(res, 201, newProject);
    return true;
  }

  return false;
}

function normalizeTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag || "").trim())
      .filter(Boolean)
      .slice(0, 5);
  }
  return String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function inferCategoryFromTags(tags) {
  const joined = Array.isArray(tags) ? tags.join(",") : String(tags || "");
  const normalized = joined.toLowerCase();
  if (normalized.includes("mobile")) return "mobile";
  if (normalized.includes("ai") || normalized.includes("ml")) return "ai";
  return "web";
}

function validateProjectPayload(payload = {}) {
  if (!payload.title || !payload.description) {
    return { valid: false, message: "Thiếu tiêu đề hoặc mô tả dự án" };
  }
  if (!payload.link) {
    return { valid: false, message: "Vui lòng cung cấp liên kết demo hoặc repo" };
  }
  if (!payload.author) {
    return { valid: false, message: "Thiếu thông tin tác giả" };
  }
  return { valid: true };
}

function createUniqueSlug(projects, title) {
  const slugify = dataStore.slugify;
  const base = slugify(title) || `du-an-${Date.now()}`;
  const existing = new Set(projects.map((project) => project.slug));
  if (!existing.has(base)) return base;
  let counter = 2;
  let candidate = `${base}-${counter}`;
  while (existing.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

async function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error("Payload quá lớn"));
        req.connection.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (error) {
        reject(new Error("Payload không hợp lệ"));
      }
    });
    req.on("error", reject);
  });
}

async function serveStatic(res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(PUBLIC_DIR, safePath);
  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, "Không được phép");
    return;
  }

  try {
    const data = await fs.readFile(normalized);
    const ext = path.extname(normalized).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(res, 404, "Không tìm thấy tài nguyên");
    } else {
      sendText(res, 500, "Lỗi máy chủ nội bộ");
    }
  }
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    try {
      const handled = await handleApi(req, res, url);
      if (!handled) {
        await serveStatic(res, url.pathname);
      }
    } catch (error) {
      console.error("Server error", error);
      sendJson(res, 500, { message: "Đã xảy ra lỗi trên máy chủ" });
    }
  });
}

async function start() {
  const server = createServer();
  await ensureStorage();
  server.listen(PORT, () => {
    console.log(`QEC server chạy tại http://localhost:${PORT}`);
  });
  return server;
}

if (require.main === module) {
  start();
}

module.exports = { createServer, start, readProjects, writeProjects };
