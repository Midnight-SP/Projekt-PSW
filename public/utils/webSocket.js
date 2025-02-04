import { fetchCars } from './carUtils.js';

function setupWebSocket() {
  const ws = new WebSocket('wss://localhost:3000');

  ws.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  ws.onmessage = (event) => {
    const { topic, car } = JSON.parse(event.data);
    if (topic === 'cars/created') {
      console.log(`Car created: ${car.id}`);
    } else if (topic === 'cars/updated') {
      console.log(`Car updated: ${car.id}`);
    } else if (topic === 'cars/deleted') {
      console.log(`Car deleted: ${car.id}`);
    }
    fetchCars(); // Refresh car list
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
}

export { setupWebSocket };