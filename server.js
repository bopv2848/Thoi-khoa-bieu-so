const http = require('http');
const fs = require('fs');
const path = require('path');

let port = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
};

function startServer(p) {
  const server = http.createServer((req, res) => {
    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(req.url.split('?')[0]);
    } catch (e) {
      decodedUrl = req.url.split('?')[0];
    }
    if (decodedUrl === '/' || decodedUrl === '') {
      decodedUrl = '/index.html';
    }

    const safePath = path.normalize(decodedUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      let targetPath = filePath;
      if (stats.isDirectory()) {
        targetPath = path.join(filePath, 'index.html');
      }

      const ext = path.extname(targetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(targetPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('500 Internal Server Error');
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
          });
          res.end(content);
        }
      });
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${p} đang bận, thử port ${p + 1}...`);
      startServer(p + 1);
    } else {
      console.error('Lỗi server:', err);
    }
  });

  server.listen(p, () => {
    console.log(`Server đang chạy tại http://localhost:${p}`);
  });
}

startServer(port);
