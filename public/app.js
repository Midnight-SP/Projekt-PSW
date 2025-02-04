import { getCookie, setCookie, deleteCookie } from './utils/cookieUtils.js';
import { setupWebSocket } from './utils/webSocket.js';
import { fetchCars, showCarDetails, editCar, deleteCar, toggleRentCar } from './utils/carUtils.js';
import { fetchUsers } from './utils/userUtils.js';

document.addEventListener('DOMContentLoaded', () => {
  const detailsPanel = document.getElementById('details-panel');
  detailsPanel.style.display = 'none'; // Hide details panel on page load

  const registerForm = document.getElementById('register-form');
  const loginPanel = document.getElementById('login-panel');
  const vehiclesPanel = document.getElementById('vehicles-panel');
  const adminPanel = document.getElementById('admin-panel');
  const logoutButton = document.getElementById('logout-button');

  // Initialize WebSocket connection and fetch the car list
  setupWebSocket();
  fetchCars();

  // Login event handler
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.message === 'Login successful') {
          alert('Login successful');
          // Using our setCookie function without HttpOnly (can't be set client-side)
          setCookie('userId', data.userId, { secure: true });
          setCookie('role', data.role, { secure: true });
          loginPanel.style.display = 'none';
          vehiclesPanel.style.display = 'block';
          logoutButton.style.display = 'block';
          if (data.role === 'admin') {
            adminPanel.style.display = 'block';
            fetchUsers(); // Fetch users when admin logs in
          }
          fetchCars();
        } else {
          alert('Login failed');
        }
      })
      .catch(error => console.error('Error logging in:', error));
  });

  // Logout event handler
  logoutButton.addEventListener('click', () => {
    deleteCookie('userId');
    deleteCookie('role');
    loginPanel.style.display = 'block';
    vehiclesPanel.style.display = 'block';
    adminPanel.style.display = 'none';
    logoutButton.style.display = 'none';
    detailsPanel.style.display = 'none';
    fetchCars();
  });

  // Register event handler
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value || 'user';

    fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        if (data.message === 'User registered successfully') {
          registerForm.reset();
        }
      })
      .catch(error => console.error('Error registering user:', error));
  });

  // Search cars event handler
  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = document.getElementById('search-query') ? document.getElementById('search-query').value : '';
    const year = document.getElementById('search-year') ? document.getElementById('search-year').value : '';
    const available = document.getElementById('search-available') ? document.getElementById('search-available').value : '';
    const searchParams = new URLSearchParams();

    if (query) searchParams.append('query', query);
    if (year) searchParams.append('year', year);
    if (available) searchParams.append('available', available);

    fetch(`/api/cars/search?${searchParams.toString()}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          const carList = document.getElementById('car-list');
          carList.innerHTML = '';
          data.forEach(car => {
            const carItem = document.createElement('div');
            carItem.classList.add('car-item');
            carItem.innerHTML = `
              <span>${car.make} ${car.model} (${car.year})</span>
              ${getCookie('role') === 'admin' ? `<button class="edit-car" data-id="${car.id}">Edit</button>` : ''}
              ${getCookie('role') === 'admin' ? `<button class="delete-car" data-id="${car.id}">Delete</button>` : ''}
            `;
            if (getCookie('role') === 'admin') {
              carItem.querySelector('.edit-car').onclick = (event) => {
                event.stopPropagation();
                editCar(car);
              };
              carItem.querySelector('.delete-car').onclick = (event) => {
                event.stopPropagation();
                deleteCar(car.id);
              };
            }
            carItem.onclick = () => showCarDetails(car.id);
            carList.appendChild(carItem);
          });
        } else {
          console.error('Search result is not an array:', data);
        }
      })
      .catch(error => console.error('Error searching car data:', error));
  });

  // Add car event handler (admin only)
  const addCarForm = document.getElementById('add-car-form');
  addCarForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const year = document.getElementById('year') ? document.getElementById('year').value : new Date().getFullYear();
    const available = document.getElementById('available') ? document.getElementById('available').checked : true;

    fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ make, model, year, available })
    })
      .then(response => response.json())
      .then(car => {
        const carList = document.getElementById('car-list');
        const carItem = document.createElement('div');
        carItem.classList.add('car-item');
        carItem.innerHTML = `
          <span>${car.make} ${car.model} (${car.year})</span>
          ${getCookie('role') === 'admin' ? `<button class="edit-car" data-id="${car.id}">Edit</button>` : ''}
          ${getCookie('role') === 'admin' ? `<button class="delete-car" data-id="${car.id}">Delete</button>` : ''}
        `;
        if (getCookie('role') === 'admin') {
          carItem.querySelector('.edit-car').onclick = (event) => {
            event.stopPropagation();
            editCar(car);
          };
          carItem.querySelector('.delete-car').onclick = (event) => {
            event.stopPropagation();
            deleteCar(car.id);
          };
        }
        carItem.onclick = () => showCarDetails(car.id);
        carList.appendChild(carItem);
        fetchCars(); // Refresh car list after adding a new car
      })
      .catch(error => console.error('Error adding car:', error));
  });
});