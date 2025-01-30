const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');
const sequelize = require('./sequelize');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(helmet());

// Custom CSP configuration
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  })
);

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Car Rental Service');
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

const carRoutes = require('./routes/carRoutes');
app.use('/api/cars', carRoutes);

// Sync database and start server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});