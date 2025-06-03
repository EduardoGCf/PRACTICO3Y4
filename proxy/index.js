const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[Proxy] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:8000/api',
    changeOrigin: true,
    secure: false,
    ws: false,

    cookieDomainRewrite: {
      "localhost": "localhost"
    },

    onProxyReq: (proxyReq, req, res) => {
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
    },

    onProxyRes: (proxyRes, req, res) => {
      const cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        proxyRes.headers['set-cookie'] = cookies.map(cookie => {
          let newCookie = cookie.replace(/; *Secure/gi, '');
          if (!/SameSite=/i.test(newCookie)) {
            newCookie += '; SameSite=None';
          } else {
            newCookie = newCookie.replace(/SameSite=(Lax|Strict)/i, 'SameSite=None');
          }
          return newCookie;
        });
      }
    },
  })
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Proxy corriendo en http://localhost:${PORT}`);
});
