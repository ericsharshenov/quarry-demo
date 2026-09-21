import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const distHtml = join(distDir, "index.html");
const outFile = join(root, "standalone.html");

if (!existsSync(distHtml)) {
  console.error("Не найден dist/index.html — сначала выполните vite build.");
  process.exit(1);
}

const toAssetPath = (ref) => join(distDir, ref.replace(/^\.?\//, ""));

let html = await readFile(distHtml, "utf8");

const scriptTags = [...html.matchAll(/<script\b[^>]*\btype="module"[^>]*><\/script>/g)];
const styleTags = [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)];

if (scriptTags.length !== 1) {
  console.error(`Ожидался один module-скрипт в dist/index.html, найдено: ${scriptTags.length}`);
  process.exit(1);
}

for (const tag of scriptTags) {
  const src = tag[0].match(/\bsrc="([^"]+)"/)?.[1];
  if (!src) {
    console.error("У скрипта в dist/index.html нет src — инлайнинг невозможен.");
    process.exit(1);
  }
  let js = await readFile(toAssetPath(src), "utf8");
  if (js.includes("</script")) {
    js = js.replaceAll("</script", "<\\/script");
  }
  html = html.replace(tag[0], () => `<script type="module">\n${js}\n</script>`);
}

for (const tag of styleTags) {
  const href = tag[0].match(/\bhref="([^"]+)"/)?.[1];
  if (!href) continue;
  const css = await readFile(toAssetPath(href), "utf8");
  if (css.includes("</style")) {
    console.error("CSS содержит </style — инлайнинг невозможен.");
    process.exit(1);
  }
  html = html.replace(tag[0], () => `<style>\n${css}\n</style>`);
}

if (/assets\/[\w.-]+\.(js|css)/.test(html)) {
  console.error("В standalone.html остались внешние ссылки на ассеты.");
  process.exit(1);
}

html = html.replace(
  "<!doctype html>",
  "<!-- Сгенерировано командой npm run build:standalone. Правьте исходники в src/. -->\n<!doctype html>",
);

await writeFile(outFile, html, "utf8");
console.log(`standalone.html собран: ${(Buffer.byteLength(html) / 1024).toFixed(1)} КБ`);
