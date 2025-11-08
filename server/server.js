const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const app = express();


const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = require('./app/models');
db.connex.sync();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Routes (auth + CRUD)
require('./app/routes/employee.route.js')(app);
require('./app/routes/team.route.js')(app);
require('./app/routes/team_member.route.js')(app);
require('./app/routes/competence.route.js')(app);
require('./app/routes/user_task.route.js')(app);
require('./app/routes/search.route.js')(app);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});