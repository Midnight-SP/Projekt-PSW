document.addEventListener('DOMContentLoaded', () => {
  const carList = document.getElementById('car-list');

  function fetchCars() {
    fetch('/api/cars')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          carList.innerHTML = ''; // Clear previous results
          data.forEach(car => {
            const carItem = document.createElement('div');
            carItem.textContent = `${car.make} ${car.model} (${car.year}) - Available: ${car.available}`;
            if (sessionStorage.getItem('role') === 'admin') {
              const editButton = document.createElement('button');
              editButton.textContent = 'Edit';
              editButton.onclick = () => editCar(car);
              carItem.appendChild(editButton);

              const deleteButton = document.createElement('button');
              deleteButton.textContent = 'Delete';
              deleteButton.onclick = () => deleteCar(car.id);
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
        document.getElementById('login-form').style.display = 'none';
        sessionStorage.setItem('role', data.role);
        if (data.role === 'admin') {
          document.getElementById('add-car-form').style.display = 'block';
        }
        fetchCars();
      } else {
        alert('Login failed');
      }
    })
    .catch(error => console.error('Error logging in:', error));
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
            carItem.textContent = `${car.make} ${car.model} (${car.year}) - Available: ${car.available}`;
            if (sessionStorage.getItem('role') === 'admin') {
              const editButton = document.createElement('button');
              editButton.textContent = 'Edit';
              editButton.onclick = () => editCar(car);
              carItem.appendChild(editButton);

              const deleteButton = document.createElement('button');
              deleteButton.textContent = 'Delete';
              deleteButton.onclick = () => deleteCar(car.id);
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
      if (sessionStorage.getItem('role') === 'admin') {
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editCar(car);
        carItem.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteCar(car.id);
        carItem.appendChild(deleteButton);
      }
      carList.appendChild(carItem);
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
});