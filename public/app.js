document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/cars')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data);
        const carList = document.getElementById('car-list');
        data.forEach(car => {
          const carItem = document.createElement('div');
          carItem.textContent = `${car.make} ${car.model} (${car.year}) - Available: ${car.available}`;
          carList.appendChild(carItem);
        });
      })
      .catch(error => console.error('Error fetching car data:', error));
  
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
  
      fetch('/api/cars/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Login successful') {
          alert('Login successful');
          document.getElementById('login-form').style.display = 'none';
          if (data.role === 'admin') {
            document.getElementById('add-car-form').style.display = 'block';
          }
        } else {
          alert('Login failed');
        }
      })
      .catch(error => console.error('Error logging in:', error));
    });
  
    const addCarForm = document.getElementById('add-car-form');
    addCarForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const make = document.getElementById('make').value;
      const model = document.getElementById('model').value;
      const year = document.getElementById('year').value;
      const available = document.getElementById('available').checked;
  
      fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ make, model, year, available }),
      })
      .then(response => response.json())
      .then(car => {
        const carItem = document.createElement('div');
        carItem.textContent = `${car.make} ${car.model} (${car.year}) - Available: ${car.available}`;
        document.getElementById('car-list').appendChild(carItem);
      })
      .catch(error => console.error('Error adding car:', error));
    });
  });