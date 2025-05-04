// Initialize reservations from localStorage or with sample data
let reservationsData = JSON.parse(localStorage.getItem('reservations')) || [
  { id: '1', name: 'John Doe', amount: '$100', state: 'Confirmed' },
  { id: '2', name: 'Jane Smith', amount: '$150', state: 'Pending' },
  { id: '3', name: 'Alice Johnson', amount: '$200', state: 'Cancelled' },
  { id: '4', name: 'Bob Brown', amount: '$120', state: 'Confirmed' }
];

document.addEventListener('DOMContentLoaded', () => {
  // Show the default tab (reservations)
  showTab('reservations');

  // Populate the tables with the existing data
  populateTable('reservationsTable', reservationsData);
  populateTable('filterTable', reservationsData);

  // Handle filter change event
  document.querySelectorAll("input[name='stateFilter']").forEach(radio => {
    radio.addEventListener('change', () => {
      const selected = document.querySelector("input[name='stateFilter']:checked").value;
      const filtered = selected === 'All' ? reservationsData : reservationsData.filter(r => r.state === selected);
      populateTable('filterTable', filtered);
    });
  });

  // Handle CSV file input
  document.getElementById('csvFileInput').addEventListener('change', handleFileSelect);
});

// Function to populate the tables
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
        <button onclick="editReservation(${index})" class="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
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

      // Split the content into lines, skip header line
      const rows = content.split('\n').slice(1);

      // Map the rows to an array of objects
      const newData = rows.map(row => {
        const [id, name, amount, state] = row.split(',').map(field => field.trim());
        if (id && name && amount && state) {
          return { id, name, amount, state };
        }
        return null;
      }).filter(Boolean);

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

// Edit Reservation
function editReservation(index) {
  const reservation = reservationsData[index];

  // Prompt user to edit the reservation (simple prompt for demo purposes)
  const newName = prompt('Enter new name', reservation.name);
  const newAmount = prompt('Enter new amount', reservation.amount);
  const newState = prompt('Enter new state (Confirmed, Pending, Cancelled)', reservation.state);

  if (newName && newAmount && newState) {
    reservationsData[index] = { ...reservation, name: newName, amount: newAmount, state: newState };
    localStorage.setItem('reservations', JSON.stringify(reservationsData));
    populateTable('reservationsTable', reservationsData);
    populateTable('filterTable', reservationsData);
  }
}

// Delete Reservation
function deleteReservation(index) {
  if (confirm('Are you sure you want to delete this reservation?')) {
    reservationsData.splice(index, 1); // Remove the reservation at the specified index
    localStorage.setItem('reservations', JSON.stringify(reservationsData));
    populateTable('reservationsTable', reservationsData);
    populateTable('filterTable', reservationsData);
  }
}

// Function to switch between tabs
function showTab(tabId) {
  // Hide all tabs
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

  // Show the selected tab
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.add('active');
  }
}

