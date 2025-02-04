import { getCookie } from './cookieUtils.js';

function fetchUsers() {
  fetch('/api/users')
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data)) {
        const userList = document.getElementById('user-list');
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
      const detailsPanel = document.getElementById('details-panel');
      detailsPanel.innerHTML = '<p>User not found</p>';
    });
}

function displayUserDetails(user) {
  const detailsPanel = document.getElementById('details-panel');
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
      const detailsPanel = document.getElementById('details-panel');
      detailsPanel.style.display = 'none';
    })
    .catch(error => console.error('Error deleting user:', error));
}

export { fetchUsers, showUserDetails, displayUserDetails, editUserRole, deleteUser };