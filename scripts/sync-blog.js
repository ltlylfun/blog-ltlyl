const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "../blog");
const README_PATH = path.join(__dirname, "../README.md");

// 获取所有博客文件
function getBlogFiles() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      file: f,
      fullPath: path.join(BLOG_DIR, f),
    }));
}

// 解析文件名和内容，生成元数据
function parseBlogMeta(file) {
  const match = file.match(/(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
  if (!match) return null;
  const [_, year, month, day, slug] = match;
  const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
  // 优先读取 frontmatter 的 title 字段
  let title = null;
  const fmMatch = content.match(/---([\s\S]*?)---/);
  if (fmMatch) {
    const titleMatch = fmMatch[1].match(/title:\s*(.+)/);
    if (titleMatch) {
      title = titleMatch[1].replace(/^"|"$/g, "").trim();
    }
  }
  // 如果没有 frontmatter title，则回退到 # 标题或 slug
  if (!title) {
    const h1Match = content.match(/^# (.+)/m);
    title = h1Match ? h1Match[1].trim() : slug.replace(/-/g, " ");
  }
  return {
    year,
    month,
    day,
    slug,
    title,
    url: `https://ltlylfun.github.io/blog-ltlyl/blog/${slug}`,
  };
}

// 按年份、月份分组
function groupBlogs(blogs) {
  const grouped = {};
  blogs.forEach((blog) => {
    if (!grouped[blog.year]) grouped[blog.year] = {};
    if (!grouped[blog.year][blog.month]) grouped[blog.year][blog.month] = [];
    grouped[blog.year][blog.month].push(blog);
  });
  return grouped;
}

// 生成 Markdown 目录
function generateBlogCatalog(grouped) {
  let md = "";
  const years = Object.keys(grouped).sort((a, b) => b - a);
  years.forEach((year) => {
    md += `\n### ${year} 年\n\n`;
    const months = Object.keys(grouped[year]).sort((a, b) => b - a);
    months.forEach((month) => {
      md += `#### ${parseInt(month, 10)} 月\n\n`;
      grouped[year][month]
        .sort((a, b) => b.day - a.day)
        .forEach((blog, idx) => {
          md += `${idx + 1}. [${blog.title}](${blog.url})\n`;
        });
      md += "\n";
    });
  });
  return md;
}

// 替换 README.md 的 blog 目录部分
function updateReadme(catalog) {
  const readme = fs.readFileSync(README_PATH, "utf-8");
  const start = readme.indexOf("## 📝 blog 目录");
  const end = readme.indexOf("## 📄 许可证");
  if (start === -1 || end === -1) {
    console.error("README.md 格式不正确");
    process.exit(1);
  }
  const before = readme.slice(0, start + "## 📝 blog 目录".length);
  const after = readme.slice(end);
  const newReadme = `${before}\n${catalog}\n${after}`;
  fs.writeFileSync(README_PATH, newReadme, "utf-8");
  console.log("README.md 已同步 blog 目录");
}

function main() {
  const files = getBlogFiles();
  const blogs = files.map((f) => parseBlogMeta(f.file)).filter(Boolean);
  const grouped = groupBlogs(blogs);
  const catalog = generateBlogCatalog(grouped);
  updateReadme(catalog);
}

main();
