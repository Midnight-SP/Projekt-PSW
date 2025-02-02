document.addEventListener('DOMContentLoaded', () => {
  const carList = document.getElementById('car-list');
  const carDetails = document.getElementById('car-details');
  const registerForm = document.getElementById('register-form');
  const loginPanel = document.getElementById('login-panel');
  const vehiclesPanel = document.getElementById('vehicles-panel');
  const adminPanel = document.getElementById('admin-panel');
  const logoutButton = document.getElementById('logout-button');

  // WebSocket client setup
  const ws = new WebSocket('ws://localhost:3000');

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

  function fetchCars() {
    fetch('/api/cars')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          carList.innerHTML = ''; // Clear previous results
          data.forEach(car => {
            const carItem = document.createElement('div');
            carItem.classList.add('car-item');
            carItem.innerHTML = `
              <span>${car.make} ${car.model} (${car.year})</span>
              <button class="edit-car" data-id="${car.id}">Edit</button>
              <button class="delete-car" data-id="${car.id}">Delete</button>
            `;
            carItem.querySelector('.edit-car').onclick = () => editCar(car);
            carItem.querySelector('.delete-car').onclick = () => deleteCar(car.id);
            carItem.onclick = () => showCarDetails(car.id); // Add this line to call showCarDetails
            carList.appendChild(carItem);
          });
        } else {
          console.error('Fetched data is not an array:', data);
        }
      })
      .catch(error => console.error('Error fetching car data:', error));
  }

  function showCarDetails(carId) {
    fetch(`/api/cars/${carId}`)
      .then(response => response.json())
      .then(car => {
        if (car.rentedBy) {
          fetch(`/api/cars/users/${car.rentedBy}`)
            .then(response => response.json())
            .then(user => {
              displayCarDetails(car, user);
            })
            .catch(error => console.error('Error fetching user data:', error));
        } else {
          displayCarDetails(car, null);
        }
      })
      .catch(error => console.error('Error fetching car details:', error));
  }
  
  function displayCarDetails(car, user) {
    const userId = sessionStorage.getItem('userId');
    const rentButton = userId && car.available ? `<button id="rent-button">Rent</button>` : '';
    const returnButton = userId && car.rentedBy === parseInt(userId) ? `<button id="return-button">Return</button>` : '';
  
    carDetails.innerHTML = `
      <button id="close-details">Close</button>
      <h2>${car.make} ${car.model} (${car.year})</h2>
      <p>Available: ${car.available}</p>
      <p>Rented By: ${user ? user.username : 'N/A'}</p>
      <p>Rented At: ${car.rentedAt ? new Date(car.rentedAt).toLocaleString() : 'N/A'}</p>
      <p>Added At: ${new Date(car.createdAt).toLocaleString()}</p>
      <p>Updated At: ${new Date(car.updatedAt).toLocaleString()}</p>
      ${rentButton}
      ${returnButton}
    `;
  
    if (userId && car.available) {
      document.getElementById('rent-button').onclick = () => toggleRentCar(car);
    }
    if (userId && car.rentedBy === parseInt(userId)) {
      document.getElementById('return-button').onclick = () => toggleRentCar(car);
    }
  
    document.getElementById('close-details').onclick = () => {
      carDetails.style.display = 'none';
    };
    carDetails.style.display = 'block';
  }

  function editCar(car) {
    document.getElementById('edit-id').value = car.id;
    document.getElementById('edit-make').value = car.make;
    document.getElementById('edit-model').value = car.model;
    document.getElementById('edit-year').value = car.year;
    document.getElementById('edit-available').checked = car.available;
    document.getElementById('edit-car-form').style.display = 'block';
  }

  function deleteCar(id) {
    fetch(`/api/cars/${id}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(() => {
      fetchCars();
    })
    .catch(error => console.error('Error deleting car:', error));
  }

  function toggleRentCar(car) {
    const url = car.available ? `/api/cars/rent/${car.id}` : `/api/cars/return/${car.id}`;
    fetch(url, {
      method: 'POST',
    })
    .then(response => response.json())
    .then(() => {
      showCarDetails(car.id); // Refresh car details without closing the details view
    })
    .catch(error => console.error('Error toggling rent car:', error));
  }

  fetchCars();

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
        sessionStorage.setItem('role', data.role);
        sessionStorage.setItem('userId', data.userId);
        loginPanel.style.display = 'none';
        vehiclesPanel.style.display = 'block';
        logoutButton.style.display = 'block';
        if (data.role === 'admin') {
          adminPanel.style.display = 'block';
        }
        fetchCars();
      } else {
        alert('Login failed');
      }
    })
    .catch(error => console.error('Error logging in:', error));
  });

  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');
    loginPanel.style.display = 'block';
    vehiclesPanel.style.display = 'block';
    adminPanel.style.display = 'none';
    logoutButton.style.display = 'none';
    fetchCars();
  });

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    fetch('/api/cars/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'User registered successfully') {
        alert('User registered successfully');
        document.getElementById('register-form').reset();
      } else {
        alert(data.message);
      }
    })
    .catch(error => console.error('Error registering user:', error));
  });

  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = document.getElementById('search-query').value;
    const year = document.getElementById('search-year').value;
    const available = document.getElementById('search-available').value;

    const searchParams = new URLSearchParams();
    if (query) searchParams.append('query', query);
    if (year) searchParams.append('year', year);
    if (available) searchParams.append('available', available);

    fetch(`/api/cars/search?${searchParams.toString()}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          carList.innerHTML = ''; // Clear previous results
          data.forEach(car => {
            const carItem = document.createElement('div');
            carItem.classList.add('car-item');
            carItem.innerHTML = `
              <span>${car.make} ${car.model} (${car.year})</span>
              <button class="edit-car" data-id="${car.id}">Edit</button>
              <button class="delete-car" data-id="${car.id}">Delete</button>
            `;
            carItem.querySelector('.edit-car').onclick = () => editCar(car);
            carItem.querySelector('.delete-car').onclick = () => deleteCar(car.id);
            carList.appendChild(carItem);
          });
        } else {
          console.error('Search result is not an array:', data);
        }
      })
      .catch(error => console.error('Error searching car data:', error));
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
      carItem.classList.add('car-item');
      carItem.innerHTML = `
        <span>${car.make} ${car.model} (${car.year})</span>
        <button class="edit-car" data-id="${car.id}">Edit</button>
        <button class="delete-car" data-id="${car.id}">Delete</button>
      `;
      carItem.querySelector('.edit-car').onclick = () => editCar(car);
      carItem.querySelector('.delete-car').onclick = () => deleteCar(car.id);
      carList.appendChild(carItem);
      fetchCars(); // Refresh car list after adding a new car
    })
    .catch(error => console.error('Error adding car:', error));
  });

  const editCarForm = document.getElementById('edit-car-form');
  editCarForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('edit-id').value;
    const make = document.getElementById('edit-make').value;
    const model = document.getElementById('edit-model').value;
    const year = document.getElementById('edit-year').value;
    const available = document.getElementById('edit-available').checked;

    fetch(`/api/cars/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ make, model, year, available }),
    })
    .then(response => response.json())
    .then(() => {
      document.getElementById('edit-car-form').style.display = 'none';
      fetchCars();
    })
    .catch(error => console.error('Error editing car:', error));
  });

  // Hide register form if user is logged in
  if (sessionStorage.getItem('userId')) {
    loginPanel.style.display = 'none';
    vehiclesPanel.style.display = 'block';
    logoutButton.style.display = 'block';
    if (sessionStorage.getItem('role') === 'admin') {
      adminPanel.style.display = 'block';
    }
  } else {
    loginPanel.style.display = 'block';
    vehiclesPanel.style.display = 'block';
    adminPanel.style.display = 'none';
    logoutButton.style.display = 'none';
  }
});