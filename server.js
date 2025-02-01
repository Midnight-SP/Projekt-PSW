const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sequelize = require('./sequelize');
const mqtt = require('mqtt');
const { WebSocketServer } = require('ws');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());

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
app.use('/api/cars', carRoutes);

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
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

mqttClient.on('message', (topic, message) => {
  const car = JSON.parse(message.toString());
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ topic, car }));
    }
  });
});

// Logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
});

module.exports = mqttClient;