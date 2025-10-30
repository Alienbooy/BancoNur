// Lightweight static file server - start with: node app.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE = path.resolve(__dirname);

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.htm': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function send404(res){
  res.statusCode = 404;
  res.setHeader('Content-Type','text/plain; charset=UTF-8');
  res.end('404 Not Found');
}

function send500(res, err){
  res.statusCode = 500;
  res.setHeader('Content-Type','text/plain; charset=UTF-8');
  res.end('500 Internal Server Error\n' + String(err));
}

const server = http.createServer((req, res) => {
  try{
    let requestPath = decodeURIComponent(req.url.split('?')[0]);
    if(requestPath === '/') requestPath = '/index.html';

    // prevent directory traversal
    const safePath = path.normalize(requestPath).replace(/^\/+/, '');
    const filePath = path.join(BASE, safePath);

    if(!filePath.startsWith(BASE)){
      res.statusCode = 400;
      res.end('400 Bad Request');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if(err) { send404(res); return; }
      if(stats.isDirectory()){ send404(res); return; }

      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      const stream = fs.createReadStream(filePath);
      stream.on('error', e => send500(res, e));
      stream.pipe(res);
    });
  }catch(e){
    send500(res, e);
  }
});

server.listen(PORT, () => {
  console.log(`Banco NUR static server running at http://localhost:${PORT}/`);
});

// Graceful shutdown on SIGINT
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => process.exit(0));
});
// end of server file
