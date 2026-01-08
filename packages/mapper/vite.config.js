import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Plugin to add file save API endpoint
function fileSavePlugin() {
  return {
    name: 'file-save-api',
    configureServer(server) {
      server.middlewares.use('/api/save', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { filename, content } = JSON.parse(body);
              const samplesPath = resolve(__dirname, '../../samples', filename);
              writeFileSync(samplesPath, content, 'utf8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, path: samplesPath }));
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: error.message }));
            }
          });
        } else {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), fileSavePlugin()],
  server: {
    port: 3002,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
