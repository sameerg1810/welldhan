const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const TARGET_DIRS = ["frontend", "frontend-web"];
const OUT_FILE = path.join(ROOT, "frontend-texts.txt");

const exts = new Set([".js", ".jsx", ".ts", ".tsx", ".html", ".md"]);

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (
        ["node_modules", ".git", "build", "dist", "__pycache__"].includes(
          e.name,
        )
      )
        continue;
      walk(full, cb);
    } else if (e.isFile()) {
      cb(full);
    }
  }
}

function extractFromFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!exts.has(ext)) return [];
  try {
    const txt = fs.readFileSync(file, "utf8");
    const results = new Set();

    // Extract JSX text nodes: > some text <
    const jsxRe = />\s*([^<>]+?)\s*</g;
    let m;
    while ((m = jsxRe.exec(txt)) !== null) {
      const s = m[1].trim();
      if (s && s.length > 1) results.add(s.replace(/\s+/g, " "));
    }

    // Extract quoted strings
    const quoteRe = /(['`\"])((?:\\.|(?!\1).)*)\1/g;
    while ((m = quoteRe.exec(txt)) !== null) {
      const s = m[2].trim();
      if (s && s.length > 1 && !/^[{}\s]*$/.test(s))
        results.add(s.replace(/\s+/g, " "));
    }

    return Array.from(results);
  } catch (e) {
    return [];
  }
}

const all = new Set();

for (const dir of TARGET_DIRS) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  walk(full, (file) => {
    const extracted = extractFromFile(file);
    for (const s of extracted) all.add(s);
  });
}

const sorted = Array.from(all).sort((a, b) => a.localeCompare(b));
fs.writeFileSync(OUT_FILE, sorted.join("\n"), "utf8");
console.log("Wrote", sorted.length, "unique strings to", OUT_FILE);
