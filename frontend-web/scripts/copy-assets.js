const fs = require("fs");
const path = require("path");

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function copyDir(src, dest) {
  try {
    const entries = await fs.promises.readdir(src, { withFileTypes: true });
    await ensureDir(dest);
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else if (entry.isFile()) {
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    // If source doesn't exist, skip silently
    if (err.code !== "ENOENT") throw err;
  }
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  // repoRoot is frontend-web; assets are at ../frontend/assets
  const assetsRoot = path.resolve(repoRoot, "..", "frontend", "assets");

  const imagesSrc = path.join(assetsRoot, "images");
  const fontsSrc = path.join(assetsRoot, "fonts");

  const imagesDest = path.resolve(repoRoot, "public", "images");
  const fontsDest = path.resolve(repoRoot, "public", "fonts");

  console.log("Copying images from", imagesSrc, "to", imagesDest);
  await copyDir(imagesSrc, imagesDest);
  console.log("Copying fonts from", fontsSrc, "to", fontsDest);
  await copyDir(fontsSrc, fontsDest);

  console.log("Assets copy complete.");
}

main().catch((err) => {
  console.error("Error copying assets:", err);
  process.exit(1);
});
