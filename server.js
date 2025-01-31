const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');
const sequelize = require('./sequelize');
const mqtt = require('mqtt');

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
      scriptSrc: ["'self'", "https://unpkg.com"],
      connectSrc: ["'self'", "wss://broker.hivemq.com:8000", "ws://localhost:1883"],
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

// MQTT setup
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Ensure this matches your broker's address and port

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});

module.exports = mqttClient;