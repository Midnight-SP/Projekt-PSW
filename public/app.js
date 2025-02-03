document.addEventListener('DOMContentLoaded', () => {
  const carList = document.getElementById('car-list');
  const detailsPanel = document.getElementById('details-panel');
  const registerForm = document.getElementById('register-form');
  const loginPanel = document.getElementById('login-panel');
  const vehiclesPanel = document.getElementById('vehicles-panel');
  const adminPanel = document.getElementById('admin-panel');
  const logoutButton = document.getElementById('logout-button');
  const userList = document.getElementById('user-list');

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
          const userRole = sessionStorage.getItem('role');
          data.forEach(car => {
            const carItem = document.createElement('div');
            carItem.classList.add('car-item');
            carItem.innerHTML = `
              <span>${car.make} ${car.model} (${car.year})</span>
              ${userRole === 'admin' ? `<button class="edit-car" data-id="${car.id}">Edit</button>` : ''}
              ${userRole === 'admin' ? `<button class="delete-car" data-id="${car.id}">Delete</button>` : ''}
            `;
            if (userRole === 'admin') {
              carItem.querySelector('.edit-car').onclick = (event) => {
                event.stopPropagation();
                editCar(car);
              };
              carItem.querySelector('.delete-car').onclick = (event) => {
                event.stopPropagation();
                deleteCar(car.id);
              };
            }
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
        const userRole = sessionStorage.getItem('role');
        if (userRole === 'admin' && car.rentedBy) {
          fetch(`/api/users/${car.rentedBy}`)
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
    const userRole = sessionStorage.getItem('role');
    const rentButton = userId && car.available ? `<button id="rent-button">Rent</button>` : '';
    const returnButton = userId && car.rentedBy === parseInt(userId) ? `<button id="return-button">Return</button>` : '';
    const rentedByInfo = userRole === 'admin' ? `<p>Rented By: ${user ? user.username : 'N/A'}</p>` : '';

    detailsPanel.innerHTML = `
      <button id="close-details">Close</button>
      <h2>${car.make} ${car.model} (${car.year})</h2>
      <p>Available: ${car.available}</p>
      ${rentedByInfo}
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
      detailsPanel.style.display = 'none';
    };
    detailsPanel.style.display = 'block';
  }

  function fetchUsers() {
    fetch('/api/users')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          userList.innerHTML = ''; // Clear previous results
          data.forEach(user => {
            const userItem = document.createElement('div');
            userItem.classList.add('user-item');
            userItem.innerHTML = `
              <span>${user.username} (${user.role})</span>
            `;
            userItem.onclick = () => showUserDetails(user.id);
            userList.appendChild(userItem);
          });
        } else {
          console.error('Fetched data is not an array:', data);
          userList.innerHTML = '<p>User not found</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        userList.innerHTML = '<p>User not found</p>';
      });
  }

  function showUserDetails(userId) {
    fetch(`/api/users/${userId}`)
      .then(response => response.json())
      .then(user => {
        displayUserDetails(user);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        detailsPanel.innerHTML = '<p>User not found</p>';
      });
  }

  function editUserRole(userId, role) {
    fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    })
      .then(response => response.json())
      .then(() => {
        fetchUsers();
      })
      .catch(error => console.error('Error editing user role:', error));
  }

  function deleteUser(id) {
    fetch(`/api/users/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(() => {
        fetchUsers();
        detailsPanel.style.display = 'none';
      })
      .catch(error => console.error('Error deleting user:', error));
  }

  function displayUserDetails(user) {
    detailsPanel.innerHTML = `
      <button id="close-details">Close</button>
      <h2>${user.username}</h2>
      <p>Role: ${user.role}</p>
      <form id="edit-user-form">
        <select id="edit-user-role">
          <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
        <button type="submit">Save Changes</button>
      </form>
      <button id="delete-user">Delete User</button>
    `;

    document.getElementById('edit-user-form').onsubmit = (event) => {
      event.preventDefault();
      const role = document.getElementById('edit-user-role').value;
      editUserRole(user.id, role);
    };

    document.getElementById('delete-user').onclick = () => {
      deleteUser(user.id);
    };

    document.getElementById('close-details').onclick = () => {
      detailsPanel.style.display = 'none';
    };
    detailsPanel.style.display = 'block';
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

    fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
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
        sessionStorage.setItem('role', data.role);
        sessionStorage.setItem('userId', data.userId);
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

  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userId');
    loginPanel.style.display = 'block';
    vehiclesPanel.style.display = 'block';
    adminPanel.style.display = 'none';
    logoutButton.style.display = 'none';
    detailsPanel.style.display = 'none'; // Close the details panel on logout
    fetchCars();
  });

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    fetch('/api/users/register', {
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
              ${sessionStorage.getItem('role') === 'admin' ? `<button class="edit-car" data-id="${car.id}">Edit</button>` : ''}
              ${sessionStorage.getItem('role') === 'admin' ? `<button class="delete-car" data-id="${car.id}">Delete</button>` : ''}
            `;
            if (sessionStorage.getItem('role') === 'admin') {
              carItem.querySelector('.edit-car').onclick = (event) => {
                event.stopPropagation();
                editCar(car);
              };
              carItem.querySelector('.delete-car').onclick = (event) => {
                event.stopPropagation();
                deleteCar(car.id);
              };
            }
            carItem.onclick = () => showCarDetails(car.id); // Add this line to call showCarDetails
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
        ${sessionStorage.getItem('role') === 'admin' ? `<button class="edit-car" data-id="${car.id}">Edit</button>` : ''}
        ${sessionStorage.getItem('role') === 'admin' ? `<button class="delete-car" data-id="${car.id}">Delete</button>` : ''}
      `;
      if (sessionStorage.getItem('role') === 'admin') {
        carItem.querySelector('.edit-car').onclick = (event) => {
          event.stopPropagation();
          editCar(car);
        };
        carItem.querySelector('.delete-car').onclick = (event) => {
          event.stopPropagation();
          deleteCar(car.id);
        };
      }
      carList.appendChild(carItem);
      fetchCars(); // Refresh car list after adding a new car
    })
    .catch(error => console.error('Error adding car:', error));
  });

  // Hide register form if user is logged in
  if (sessionStorage.getItem('userId')) {
    loginPanel.style.display = 'none';
    vehiclesPanel.style.display = 'block';
    logoutButton.style.display = 'block';
    if (sessionStorage.getItem('role') === 'admin') {
      adminPanel.style.display = 'block';
      fetchUsers(); // Fetch users when admin logs in
    }
  } else {
    loginPanel.style.display = 'block';
    vehiclesPanel.style.display = 'block';
    adminPanel.style.display = 'none';
    logoutButton.style.display = 'none';
    detailsPanel.style.display = 'none'; // Ensure details panel is hidden on page load
  }
});