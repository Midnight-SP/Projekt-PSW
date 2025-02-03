const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');
const sequelize = require('./sequelize');
const mqtt = require('mqtt');
const { WebSocketServer } = require('ws');

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
      connectSrc: ["'self'", "wss://broker.hivemq.com:8000", "ws://localhost:1883", "ws://localhost:3000"],
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
const userRoutes = require('./routes/userRoutes');
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);

// MQTT setup
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Ensure this matches your broker's address and port

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('cars/#'); // Subscribe to all car-related topics
});

mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

// WebSocket setup
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('message', (message) => {
    console.log('Received:', message);
  });
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Synchronize database
sequelize.sync().then(() => {
  console.log('Database synchronized');
}).catch(err => {
  console.error('Error synchronizing database:', err);
});

module.exports = mqttClient;