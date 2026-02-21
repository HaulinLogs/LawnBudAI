#!/usr/bin/env node

/**
 * Simple HTTP server to serve dist folder at /LawnBudAI path
 * Matches production GitHub Pages structure for E2E testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, '../dist');
const BASE_PATH = '/LawnBudAI';

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Parse requested URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Remove /LawnBudAI prefix from path
  if (pathname.startsWith(BASE_PATH)) {
    pathname = pathname.slice(BASE_PATH.length) || '/';
  }

  // If root, serve index.html
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Construct file path
  let filePath = path.join(DIST_DIR, pathname);

  // Try to serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found and it's a route (no extension), try to serve index.html (SPA routing)
      if (err.code === 'ENOENT' && !path.extname(pathname)) {
        fs.readFile(path.join(DIST_DIR, 'index.html'), (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - File not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': mimeTypes['.html'] });
          res.end(indexData);
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - File not found');
      return;
    }

    // Determine content type
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}${BASE_PATH}/`);
});
