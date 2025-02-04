import { getCookie } from './cookieUtils.js';

function fetchCars() {
  fetch('/api/cars')
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data)) {
        const carList = document.getElementById('car-list');
        carList.innerHTML = ''; // Clear previous results
        const userRole = getCookie('role');
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
      const userRole = getCookie('role');
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
  const userId = getCookie('userId');
  const userRole = getCookie('role');
  const rentButton = userId && car.available ? `<button id="rent-button">Rent</button>` : '';
  const returnButton = userId && car.rentedBy === parseInt(userId) ? `<button id="return-button">Return</button>` : '';
  const rentedByInfo = userRole === 'admin' ? `<p>Rented By: ${user ? user.username : 'N/A'}</p>` : '';

  const detailsPanel = document.getElementById('details-panel');
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

export { fetchCars, showCarDetails, displayCarDetails, editCar, deleteCar, toggleRentCar };