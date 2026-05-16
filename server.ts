import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  }

  // Serve static files from 'dist'
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));

  // Universal SPA Fallback - MUST be after static assets
  app.get('*', async (req, res, next) => {
    // Skip static assets (e.g. .js, .css, .png)
    if (req.url.includes('.') && !req.url.endsWith('.html')) {
      return next();
    }

    const url = req.originalUrl;
    try {
      if (process.env.NODE_ENV !== "production" && vite) {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } else {
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
        return next();
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production" && vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
