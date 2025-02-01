document.addEventListener('DOMContentLoaded', () => {
  const carList = document.getElementById('car-list');
  const carDetails = document.getElementById('car-details');
  const registerForm = document.getElementById('register-form');
  const preferencesForm = document.getElementById('preferences-form');
  const carsPerPageInput = document.getElementById('cars-per-page');
  const loginPanel = document.getElementById('login-panel');
  const carListPanel = document.getElementById('car-list-panel');
  const adminPanel = document.getElementById('admin-panel');
  const logoutButton = document.getElementById('logout-button');
  const searchForm = document.getElementById('search-form');
  const addCarForm = document.getElementById('add-car-form');
  const editCarForm = document.getElementById('edit-car-form');
  const loginForm = document.getElementById('login-form');
  const userList = document.getElementById('users');

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
    } else if (topic === 'cars/rented') {
      console.log(`Car rented: ${car.id}`);
    } else if (topic === 'cars/returned') {
      console.log(`Car returned: ${car.id}`);
    }
    fetchCars(); // Refresh car list
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  function fetchCars() {
    const carsPerPage = getCookie('carsPerPage') || 10;
    fetch(`/api/cars?limit=${carsPerPage}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          carList.innerHTML = ''; // Clear previous results
          data.forEach(car => {
            const carItem = document.createElement('div');
            carItem.textContent = `${car.make} ${car.model} (${car.year})`;
            carItem.onclick = () => showCarDetails(car.id);
            if (sessionStorage.getItem('role') === 'admin') {
              const editButton = document.createElement('button');
              editButton.textContent = 'Edit';
              editButton.onclick = (event) => {
                event.stopPropagation();
                editCar(car);
              };
              carItem.appendChild(editButton);

              const deleteButton = document.createElement('button');
              deleteButton.textContent = 'Delete';
              deleteButton.onclick = (event) => {
                event.stopPropagation();
                deleteCar(car.id);
              };
              carItem.appendChild(deleteButton);
            }
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
      <p>Seats: ${car.seats}</p>
      <p>Body Type: ${car.bodyType}</p>
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
    window.scrollTo(0, 0); // Przewiń stronę do góry
  }

  function editCar(car) {
    document.getElementById('edit-id').value = car.id;
    document.getElementById('edit-make').value = car.make;
    document.getElementById('edit-model').value = car.model;
    document.getElementById('edit-year').value = car.year;
    document.getElementById('edit-seats').value = car.seats;
    document.getElementById('edit-bodyType').value = car.bodyType;
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

  function fetchUsers() {
    fetch('/api/cars/users')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          userList.innerHTML = ''; // Clear previous results
          data.forEach(user => {
            const userItem = document.createElement('div');
            userItem.textContent = `${user.username} (${user.role})`;
            userItem.onclick = () => showUserDetails(user.id);
            userList.appendChild(userItem);
          });
        } else {
          console.error('Fetched data is not an array:', data);
        }
      })
      .catch(error => console.error('Error fetching user data:', error));
  }

  function showUserDetails(userId) {
    fetch(`/api/cars/users/${userId}`)
      .then(response => response.json())
      .then(user => {
        displayUserDetails(user);
      })
      .catch(error => console.error('Error fetching user details:', error));
  }

  function displayUserDetails(user) {
    const rentedCars = user.rentedCars ? user.rentedCars.map(car => `<li>${car.make} ${car.model} (${car.year})</li>`).join('') : '';
    carDetails.innerHTML = `
      <button id="close-details">Close</button>
      <h2>${user.username} (${user.role})</h2>
      <p>Rented Cars:</p>
      <ul>${rentedCars}</ul>
    `;

    document.getElementById('close-details').onclick = () => {
      carDetails.style.display = 'none';
    };

    carDetails.style.display = 'block';
    window.scrollTo(0, 0); // Przewiń stronę do góry
  }

  fetchCars();
  fetchUsers();

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
        updateUI();
        fetchCars();
        fetchUsers();
      } else {
        alert('Login failed');
      }
    })
    .catch(error => console.error('Error logging in:', error));
  });

  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');
    updateUI();
    fetchCars();
    fetchUsers();
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
        fetchUsers();
      } else {
        alert(data.message);
      }
    })
    .catch(error => console.error('Error registering user:', error));
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = document.getElementById('search-query').value;
    const year = document.getElementById('search-year').value;
    const available = document.getElementById('search-available').value;
    const carsPerPage = getCookie('carsPerPage') || 10;

    const searchParams = new URLSearchParams();
    if (query) searchParams.append('query', query);
    if (year) searchParams.append('year', year);
    if (available) searchParams.append('available', available);
    searchParams.append('limit', carsPerPage);

    fetch(`/api/cars/search?${searchParams.toString()}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          carList.innerHTML = ''; // Clear previous results
          data.forEach(car => {
            const carItem = document.createElement('div');
            carItem.textContent = `${car.make} ${car.model} (${car.year})`;
            carItem.onclick = () => showCarDetails(car.id);
            if (sessionStorage.getItem('role') === 'admin') {
              const editButton = document.createElement('button');
              editButton.textContent = 'Edit';
              editButton.onclick = (event) => {
                event.stopPropagation();
                editCar(car);
              };
              carItem.appendChild(editButton);

              const deleteButton = document.createElement('button');
              deleteButton.textContent = 'Delete';
              deleteButton.onclick = (event) => {
                event.stopPropagation();
                deleteCar(car.id);
              };
              carItem.appendChild(deleteButton);
            }
            carList.appendChild(carItem);
          });
        } else {
          console.error('Search result is not an array:', data);
        }
      })
      .catch(error => console.error('Error searching car data:', error));
  });

  addCarForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const year = document.getElementById('year').value;
    const seats = document.getElementById('seats').value;
    const bodyType = document.getElementById('bodyType').value;

    fetch('/api/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ make, model, year, seats, bodyType, available: true }),
    })
    .then(response => response.json())
    .then(car => {
      const carItem = document.createElement('div');
      carItem.textContent = `${car.make} ${car.model} (${car.year})`;
      carItem.onclick = () => showCarDetails(car.id);
      if (sessionStorage.getItem('role') === 'admin') {
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = (event) => {
          event.stopPropagation();
          editCar(car);
        };
        carItem.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = (event) => {
          event.stopPropagation();
          deleteCar(car.id);
        };
        carItem.appendChild(deleteButton);
      }
      carList.appendChild(carItem);
      fetchCars(); // Refresh car list after adding a new car
    })
    .catch(error => console.error('Error adding car:', error));
  });

  editCarForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('edit-id').value;
    const make = document.getElementById('edit-make').value;
    const model = document.getElementById('edit-model').value;
    const year = document.getElementById('edit-year').value;
    const seats = document.getElementById('edit-seats').value;
    const bodyType = document.getElementById('edit-bodyType').value;

    fetch(`/api/cars/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ make, model, year, seats, bodyType }),
    })
    .then(response => response.json())
    .then(() => {
      document.getElementById('edit-car-form').style.display = 'none';
      fetchCars();
    })
    .catch(error => console.error('Error editing car:', error));
  });

  preferencesForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const carsPerPage = carsPerPageInput.value;
    setCookie('carsPerPage', carsPerPage, 365);
    alert('Preferences saved');
    fetchCars();
  });

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function updateUI() {
    const role = sessionStorage.getItem('role');
    const userId = sessionStorage.getItem('userId');

    if (userId) {
      loginPanel.style.display = 'none';
      logoutButton.style.display = 'block';
      carListPanel.style.display = 'block';
      if (role === 'admin') {
        adminPanel.style.display = 'block';
      } else {
        adminPanel.style.display = 'none';
      }
    } else {
      loginPanel.style.display = 'block';
      logoutButton.style.display = 'none';
      adminPanel.style.display = 'none';
      carListPanel.style.display = 'block';
    }
  }

  // Initial UI update
  updateUI();
});