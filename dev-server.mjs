// Small local-only static server for previewing the MIAT project.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT || 4174);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".wav": "audio/wav",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const requestedPath = pathname === "/" ? "index.html" : pathname.slice(1);
    const target = resolve(root, requestedPath);
    if (target !== root && !target.startsWith(root + sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const contents = await readFile(target);
    response.writeHead(200, { "Content-Type": types[extname(target).toLowerCase()] || "application/octet-stream" });
    response.end(contents);
  } catch {
    try {
      const notFound = await readFile(resolve(root, "404.html"));
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" }).end(notFound);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    }
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`MIAT site available at http://localhost:${port}`);
});
