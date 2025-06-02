import { createProxyMiddleware } from 'http-proxy-middleware';

export default function(app) {
  app.use(
    '/api/',
    createProxyMiddleware({
      target: 'https://e2425-wads-l4ccg3-server.csbihub.id',
      changeOrigin: true,
      secure: true,
    })
  );
};