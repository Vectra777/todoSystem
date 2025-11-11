const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const app = express();


// Simple server monitoring dashboard (optional)
// - Install with: npm install express-status-monitor
// - Configure access via MONITOR_TOKEN env var (if not set, access is limited to localhost)
const statusMonitor = require('express-status-monitor');
const monitorMiddleware = statusMonitor({ title: 'Todo System Monitor' });
app.use(monitorMiddleware);
app.use(express.urlencoded({ extended: true }));

function monitorAuth(req, res, next) {
  const token = process.env.MONITOR_TOKEN;
  // If no token provided, allow only localhost access
  if (!token) {
    const ip = req.ip || req.connection.remoteAddress || '';
    if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') return next();
    return res.status(403).send('Monitor access restricted to localhost (set MONITOR_TOKEN to enable remote access)');
  }

  // Token provided: accept via Authorization: Bearer <token> or query ?token=
  const auth = req.headers.authorization;
  if (auth && auth.split(' ')[1] === token) return next();
  if (req.query && req.query.token === token) return next();
  return res.status(403).send('Forbidden');
}

// Expose monitor UI at /monitor (protected)
app.get('/monitor', monitorAuth, monitorMiddleware.pageRoute);


const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = require('./app/models');
const sqlFilePath = path.join(__dirname, 'app', 'data', 'default.sql');

// Drop and recreate all tables
db.connex
  .sync({ force: true }) // Deletes all existing tables!
  .then(async () => {
    console.log('✅ Database synchronized (existing tables dropped)');

    // Load and execute SQL file if it exists
    if (fs.existsSync(sqlFilePath)) {
      const sql = fs.readFileSync(sqlFilePath, 'utf8');
      const queries = sql
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      for (const query of queries) {
        try {
          await db.connex.query(query);
        } catch (err) {
          console.error('❌ Error executing query:', query, err.message);
        }
      }

      console.log('📦 Default SQL file loaded successfully.');
    } else {
      console.warn('⚠️ Default SQL file not found:', sqlFilePath);
    }
  })
  .catch(err => {
    console.error('❌ Error synchronizing database:', err);
  });

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes (auth + CRUD)
require('./app/routes/employee.route.js')(app);
require('./app/routes/admin.route.js')(app);
require('./app/routes/team.route.js')(app);
require('./app/routes/team_member.route.js')(app);
require('./app/routes/competence.route.js')(app);
require('./app/routes/user_task.route.js')(app);
require('./app/routes/search.route.js')(app);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});