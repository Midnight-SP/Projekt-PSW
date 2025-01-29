document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/cars')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data); // Dodaj to logowanie
        const carList = document.getElementById('car-list');
        data.forEach(car => {
          const carItem = document.createElement('div');
          carItem.textContent = `${car.make} ${car.model} (${car.year}) - Available: ${car.available}`;
          carList.appendChild(carItem);
        });
      })
      .catch(error => console.error('Error fetching car data:', error));
  });