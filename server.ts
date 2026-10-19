import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const FASTAPI_PORT = parseInt(process.env.FASTAPI_PORT || '5001', 10);
const FASTAPI_TARGET = `http://127.0.0.1:${FASTAPI_PORT}`;

let pythonProcess: ChildProcess | null = null;

function startFastAPIServer() {
  console.log(`[FastAPI] Starting Python backend server on port ${FASTAPI_PORT}...`);
  const backendDir = path.join(__dirname, 'backend');

  pythonProcess = spawn(
    'python3',
    ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', String(FASTAPI_PORT)],
    {
      cwd: backendDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
      },
    }
  );

  pythonProcess.on('error', (err) => {
    console.error('[FastAPI] Failed to start Python process:', err);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.warn(`[FastAPI] Process exited with code ${code} and signal ${signal}`);
  });
}

// Graceful cleanup
process.on('exit', () => {
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
  }
});
process.on('SIGINT', () => {
  if (pythonProcess) {
    pythonProcess.kill('SIGINT');
  }
  process.exit(0);
});
process.on('SIGTERM', () => {
  if (pythonProcess) {
    pythonProcess.kill('SIGTERM');
  }
  process.exit(0);
});

async function createServer() {
  const app = express();

  // Start FastAPI backend
  startFastAPIServer();

  // Wait briefly for FastAPI to bind
  await new Promise((r) => setTimeout(r, 1200));

  // Proxy /api requests to FastAPI backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: FASTAPI_TARGET,
      changeOrigin: true,
      on: {
        error: (err: any, req: any, res: any) => {
          console.error('[Proxy Error]', err?.message);
          if (res && !res.headersSent && typeof res.writeHead === 'function') {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Backend Service Unavailable',
                message: 'Connecting to FastAPI backend. Please retry in a few seconds.',
              })
            );
          }
        },
      },
    })
  );

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`Spam Message Detection System full-stack server running`);
    console.log(`URL: http://0.0.0.0:${PORT}`);
    console.log(`Backend Proxy: /api -> ${FASTAPI_TARGET}/api`);
    console.log(`====================================================`);
  });
}

createServer().catch((err) => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});
