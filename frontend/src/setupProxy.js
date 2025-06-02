const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3033'
        : 'https://e2425-wads-l4ccg3-server.csbihub.id',
      changeOrigin: true,
      secure: process.env.NODE_ENV !== 'development',
    })
  );
};