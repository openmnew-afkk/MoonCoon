import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 3000,
    strictPort: false,
    open: true,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(server) {
      // Динамический импорт только в dev режиме
      const { createServer } = await import("./server/index.js");
      const app = createServer();
      
      // Handle API routes with Express
      server.middlewares.use("/api", (req, res, next) => {
        // Remove /api prefix before passing to Express
        const originalUrl = req.url;
        if (originalUrl) {
          req.url = originalUrl.replace(/^\/api/, "") || "/";
        }
        
        // Call Express app
        app(req, res, (err?: any) => {
          // Restore original URL
          if (originalUrl) {
            req.url = originalUrl;
          }
          if (err) {
            next(err);
          } else {
            // If Express didn't send response, continue to next middleware
            if (!res.headersSent) {
              next();
            }
          }
        });
      });
    },
  };
}
