const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/',
    createProxyMiddleware({
      target: process.env.BACKEND_URL || 'http://localhost:5000',
      changeOrigin: true,
      secure: true,
      cookieDomainRewrite: '',
      onProxyReq: (proxyReq, req) => {
        // Log proxy requests for debugging
        console.log('Proxying request:', {
          url: proxyReq.path,
          method: proxyReq.method,
          headers: proxyReq.getHeaders(),
          origin: req.headers.origin
        });
      },
      onProxyRes: (proxyRes, req) => {
        // Ensure CORS headers are set in the proxy response
        proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        if (req.method === 'OPTIONS') {
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-User-Role, Origin, X-Requested-With, Accept';
        }
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': req.headers.origin || '*',
          'Access-Control-Allow-Credentials': 'true'
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
};