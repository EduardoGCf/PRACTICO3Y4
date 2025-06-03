// proxy/index.js

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

// Logging de cada petición para depuración
app.use((req, res, next) => {
  console.log(`[Proxy] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:8000/api', // Django en el puerto 8000
    changeOrigin: true,
    secure: false,
    ws: false,

    // Reescribe el dominio de la cookie a "localhost"
    cookieDomainRewrite: {
      // Si Django envía Domain=localhost, lo dejamos igual.
      // Si hubiera otro dominio, podría reescribirse aquí.
      "localhost": "localhost"
    },

    onProxyReq: (proxyReq, req, res) => {
      // Reenvía al backend la cookie que trae el navegador (csrftoken, sessionid, etc.)
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
    },

    onProxyRes: (proxyRes, req, res) => {
      // Modificamos las cookies que devuelve Django:
      const cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        proxyRes.headers['set-cookie'] = cookies.map(cookie => {
          // Quitamos "Secure" para que el navegador la acepte en HTTP
          let newCookie = cookie.replace(/; *Secure/gi, '');
          // Nos aseguramos de que SameSite=None esté presente (para envíos cross‐site entre puertos)
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
