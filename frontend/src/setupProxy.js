import { createProxyMiddleware } from 'http-proxy-middleware';

export default function(app) {
  app.use(
    '/api/',
    createProxyMiddleware({
      target: 'https://e2425-wads-l4ccg3-server.csbihub.id',
      changeOrigin: true,
      secure: true,
      onProxyReq: (proxyReq) => {
        // Log proxy requests for debugging
        console.log('Proxying request:', {
          url: proxyReq.path,
          method: proxyReq.method,
          headers: proxyReq.getHeaders()
        });
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
};