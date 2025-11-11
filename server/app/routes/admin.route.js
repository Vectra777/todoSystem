const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

// Simple protection: allow only localhost unless MONITOR_TOKEN is set
function localOnlyOrToken(req, res, next) {
  const token = process.env.MONITOR_TOKEN;
  if (!token) {
    const ip = req.ip || req.connection.remoteAddress || '';
    if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') return next();
    return res.status(403).send('Access restricted to localhost. Set MONITOR_TOKEN to allow remote access.');
  }

  // If token set, accept via Authorization: Bearer <token> or ?token=
  const auth = req.headers.authorization;
  if (auth && auth.split(' ')[1] === token) return next();
  if (req.query && req.query.token === token) return next();
  return res.status(403).send('Forbidden');
}

// Admin panel form (very small HTML)
router.get('/admin-panel', localOnlyOrToken, (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Local Admin Panel</title>
        <style>
          body{font-family:Arial,Helvetica,sans-serif;background:#f7f7f7;padding:20px}
          .card{max-width:740px;margin:0 auto;background:#fff;padding:20px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
          input,button{display:block;width:100%;padding:10px;margin:8px 0}
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Create Admin</h2>
          <form method="POST" action="/admin-panel/create" style="margin-right:20px">
            <label>First name</label>
            <input name="firstname" required />
            <label>Last name</label>
            <input name="lastname" required />
            <label>Email</label>
            <input name="email" type="email" required />
            <label>Password (optional)</label>
            <input name="password" type="password" />
            <button type="submit" style="text-align:center;margin-left:10px">Create Admin</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Handle form POST to create admin
router.post('/admin-panel/create', localOnlyOrToken, express.urlencoded({ extended: true }), async (req, res) => {
  try {
    // Delegate to controller's createAdmin (it will also allow localhost)
    await employeeController.createAdmin(req, res);
  } catch (err) {
    res.status(500).send('Internal error: ' + (err.message || 'unknown'));
  }
});

module.exports = (app) => {
  app.use('/', router);
};
