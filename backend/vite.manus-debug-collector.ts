import fs from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir(logDir: string) {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    for (let index = lines.length - 1; index >= 0; index--) {
      const lineBytes = Buffer.byteLength(`${lines[index]}\n`, "utf-8");
      if (keptBytes + lineBytes > TRIM_TARGET_BYTES) {
        break;
      }
      keptLines.unshift(lines[index]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    // Ignore debug log trimming failures.
  }
}

function writeToLogFile(logDir: string, source: LogSource, entries: unknown[]) {
  if (entries.length === 0) {
    return;
  }

  ensureLogDir(logDir);
  const logPath = path.join(logDir, `${source}.log`);
  const lines = entries.map((entry) => `[${new Date().toISOString()}] ${JSON.stringify(entry)}`);

  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

export function createManusDebugCollector(logDir: string): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html: string) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }

      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use("/__manus__/logs", (req: any, res: any, next: any) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile(logDir, "browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile(logDir, "networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile(logDir, "sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(error) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            handlePayload(JSON.parse(body));
          } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(error) }));
          }
        });
      });
    },
  };
}