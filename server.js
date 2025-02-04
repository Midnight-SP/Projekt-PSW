const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const sequelize = require('./sequelize');
const mqtt = require('mqtt');
const { WebSocketServer } = require('ws');
const logger = require('./logger'); // Import the logger
const fs = require('fs');
const https = require('https');

// Load SSL certificates
const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser()); // Use cookie-parser

// Custom CSP configuration
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://unpkg.com"],
      connectSrc: ["'self'", "wss://broker.hivemq.com:8000", "wss://localhost:3000"],
      imgSrc: ["'self'", "data:"],
    },
  })
);

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // Set to true if using HTTPS
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
  logger.info('Connected to MQTT broker');
  mqttClient.subscribe('cars/#'); // Subscribe to all car-related topics
});

mqttClient.on('error', (err) => {
  logger.error('MQTT connection error:', err);
});

// WebSocket setup
const server = https.createServer(credentials, app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  ws.on('message', (message) => {
    logger.info('Received:', message);
  });
  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });
});

// Start the server
server.listen(port, () => {
  logger.info(`Server running at https://localhost:${port}`);
});

// Synchronize database
sequelize.sync().then(() => {
  logger.info('Database synchronized');
}).catch(err => {
  logger.error('Error synchronizing database:', err);
});

module.exports = mqttClient;