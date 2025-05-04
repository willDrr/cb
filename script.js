let reservationsData = JSON.parse(localStorage.getItem('reservations')) || [
  { id: '1', name: 'John Doe', amount: '$100', state: 'Confirmed' },
  { id: '2', name: 'Jane Smith', amount: '$150', state: 'Pending' },
  { id: '3', name: 'Alice Johnson', amount: '$200', state: 'Cancelled' },
  { id: '4', name: 'Bob Brown', amount: '$120', state: 'Confirmed' }
];

document.addEventListener('DOMContentLoaded', () => {
  showTab('reservations');
  populateTable('reservationsTable', reservationsData);
  populateTable('filterTable', reservationsData);

  document.querySelectorAll("input[name='stateFilter']").forEach(radio => {
    radio.addEventListener('change', () => {
      const selected = document.querySelector("input[name='stateFilter']:checked").value;
      const filtered = selected === 'All' ? reservationsData : reservationsData.filter(r => r.state === selected);
      populateTable('filterTable', filtered);
    });
  });

  document.getElementById('csvFileInput').addEventListener('change', handleFileSelect);
  document.getElementById('addReservationForm').addEventListener('submit', addManualReservation);
});

// Populate table with reservation data
function populateTable(tableId, data) {
  const tbody = document.getElementById(tableId).querySelector('tbody');
  tbody.innerHTML = '';
  data.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2 px-4 border-b">${row.id}</td>
      <td class="py-2 px-4 border-b">${row.name}</td>
      <td class="py-2 px-4 border-b">${row.amount}</td>
      <td class="py-2 px-4 border-b">${row.state}</td>
      <td class="py-2 px-4 border-b">
        <button onclick="openEditForm(${index})" class="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="deleteReservation(${index})" class="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Handle CSV file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file && file.type === 'text/csv') {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const content = evt.target.result;
      const rows = content.split('\n').slice(1);
      
      // Map the rows to an array of objects
      const newData = rows.map(row => {
        const [id, name, amount, state] = row.split(',').map(field => field.trim());
        if (id && name && amount && state) {
          return { id, name, amount, state };
        }
        return null;
      }).filter(Boolean);

      // Check for duplicates
      const duplicates = newData.filter(newRow => reservationsData.some(r => r.id === newRow.id));

      // If duplicates exist, show a toast message
      if (duplicates.length > 0) {
        showToast(`Duplicate entries found: ${duplicates.map(d => d.id).join(', ')}`);
      }

      // Add new data without duplicates
      newData.forEach(newRow => {
        if (!reservationsData.some(r => r.id === newRow.id)) {
          reservationsData.push(newRow);
        }
      });

      // Save to localStorage and update tables
      localStorage.setItem('reservations', JSON.stringify(reservationsData));
      populateTable('reservationsTable', reservationsData);
      populateTable('filterTable', reservationsData);
    };
    reader.readAsText(file);
  } else {
    alert('Please upload a valid CSV file.');
  }
}

// Show Toast Notification for Duplicates
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg';
  toast.innerText = message;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// Edit Reservation (open form with data)
function openEditForm(index) {
  const reservation = reservationsData[index];
  
  // Populate the form with current reservation data
  document.getElementById('editId').value = reservation.id;
  document.getElementById('editName').value = reservation.name;
  document.getElementById('editAmount').value = reservation.amount;
  document.getElementById('editState').value = reservation.state;

  // Show the edit form tab
  showTab('editReservation');
}

// Save Edited Reservation
function saveEditedReservation(event) {
  event.preventDefault();

  const id = document.getElementById('editId').value;
  const name = document.getElementById('editName').value;
  const amount = document.getElementById('editAmount').value;
  const state = document.getElementById('editState').value;

  const index = reservationsData.findIndex(r => r.id === id);
  if (index !== -1) {
    reservationsData[index] = { id, name, amount, state };
    localStorage.setItem('reservations', JSON.stringify(reservationsData));
    populateTable('reservationsTable', reservationsData);
    populateTable('filterTable', reservationsData);

    // Go back to the reservations tab after saving
    showTab('reservations');
  }
}

// Delete Reservation
function deleteReservation(index) {
  if (confirm('Are you sure you want to delete this reservation?')) {
    reservationsData.splice(index, 1);
    localStorage.setItem('reservations', JSON.stringify(reservationsData));
    populateTable('reservationsTable', reservationsData);
    populateTable('filterTable', reservationsData);
  }
}

// Add New Reservation Manually
function addManualReservation(event) {
  event.preventDefault();

  const id = document.getElementById('manualId').value;
  const name = document.getElementById('manualName').value;
  const amount = document.getElementById('manualAmount').value;
  const state = document.getElementById('manualState').value;

  if (id && name && amount && state) {
    const newReservation = { id, name, amount, state };

    // Check if ID already exists
    if (reservationsData.some(reservation => reservation.id === id)) {
      showToast('Reservation ID already exists!');
      return;
    }

    reservationsData.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservationsData));
    populateTable('reservationsTable', reservationsData);
    populateTable('filterTable', reservationsData);

    // Reset the form
    document.getElementById('addReservationForm').reset();
  } else {
    alert('Please fill in all fields');
  }
}

// Switch Between Tabs
function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}


