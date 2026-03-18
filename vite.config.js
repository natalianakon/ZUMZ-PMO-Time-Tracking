import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const DATA_FILE = path.resolve(__dirname, "data/pmo-tracker-live.json");

function fileApiPlugin() {
  return {
    name: "pmo-file-api",
    configureServer(server) {
      // GET /api/data — read live data file from disk
      server.middlewares.use("/api/data", (req, res) => {
        if (req.method === "GET") {
          if (fs.existsSync(DATA_FILE)) {
            res.setHeader("Content-Type", "application/json");
            res.end(fs.readFileSync(DATA_FILE, "utf-8"));
          } else {
            res.setHeader("Content-Type", "application/json");
            res.end("null");
          }
        } else if (req.method === "POST") {
          // POST /api/data — write live data file to disk
          let body = "";
          req.on("data", chunk => { body += chunk; });
          req.on("end", () => {
            fs.writeFileSync(DATA_FILE, body);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          });
        } else {
          res.statusCode = 405;
          res.end("Method not allowed");
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), fileApiPlugin()],
  server: {
    port: 5173,
    host: "127.0.0.1",
    open: false,
  },
});
