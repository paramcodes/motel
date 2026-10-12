import { join } from "path";

const port = Number(process.env.PORT || 3000);
const prototypeDir = join(import.meta.dir, "prototype");

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" || path === "/prototype" || path === "/prototype/header" || path === "/prototype/") {
      const htmlFile = Bun.file(join(prototypeDir, "index.html"));
      if (await htmlFile.exists()) {
        return new Response(htmlFile, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }
    }

    // Serve static files from prototype dir
    const filePath = join(prototypeDir, path.replace(/^\/prototype\//, ""));
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }

    // Fallback to prototype index
    const fallback = Bun.file(join(prototypeDir, "index.html"));
    return new Response(fallback, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
});

console.log(`[Prototype Server] Motel Navigation Header prototype running at http://localhost:${server.port}/prototype/header`);
