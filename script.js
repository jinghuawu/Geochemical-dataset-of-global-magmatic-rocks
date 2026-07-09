const DATA_URL = 'data.csv';

const map = L.map('map').setView([20, 105], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let allRows = [];
let markersLayer = L.layerGroup().addTo(map);

const searchInput = document.getElementById('searchInput');
const rockTypeFilter = document.getElementById('rockTypeFilter');
const sio2Min = document.getElementById('sio2Min');
const resetBtn = document.getElementById('resetBtn');

const modal = document.getElementById('dataModal');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const sampleTable = document.getElementById('sampleTable');

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => row[h] = values[i] ?? '');
    return row;
  });
}

function groupByPluton(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const key = row.Pluton;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return groups;
}

function populateRockTypeFilter(rows) {
  const rockTypes = [...new Set(rows.map(r => r.RockType).filter(Boolean))].sort();
  rockTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    rockTypeFilter.appendChild(option);
  });
}

function rowPassesFilters(row) {
  const query = searchInput.value.trim().toLowerCase();
  const selectedRockType = rockTypeFilter.value;
  const minSio2 = parseFloat(sio2Min.value);

  if (query && !row.Pluton.toLowerCase().includes(query)) return false;
  if (selectedRockType !== 'all' && row.RockType !== selectedRockType) return false;
  if (!Number.isNaN(minSio2) && parseFloat(row.SiO2) < minSio2) return false;

  return true;
}

function renderMap() {
  markersLayer.clearLayers();

  const filteredRows = allRows.filter(rowPassesFilters);
  const groups = groupByPluton(filteredRows);

  groups.forEach((rows, plutonName) => {
    const first = rows[0];
    const lat = parseFloat(first.Lat);
    const lon = parseFloat(first.Lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;

    const radius = Math.min(18, 6 + Math.sqrt(rows.length));

    const marker = L.circleMarker([lat, lon], {
      radius,
      color: '#1f2937',
      weight: 1,
      fillColor: '#f97316',
      fillOpacity: 0.75
    }).addTo(markersLayer);

    marker.bindTooltip(`${plutonName} (${rows.length} samples)`);
    marker.on('click', () => showPlutonData(plutonName, rows));
  });
}

function showPlutonData(plutonName, rows) {
  const first = rows[0];
  modalTitle.textContent = `${plutonName} pluton`;
  modalMeta.innerHTML = `
    <strong>Location:</strong> ${first.Lat}°N, ${first.Lon}°E<br>
    <strong>Rock type:</strong> ${first.RockType || 'Not specified'}<br>
    <strong>Age:</strong> ${first.Age_Ma || 'Not specified'} Ma<br>
    <strong>Reference:</strong> ${first.Reference || 'Not specified'}<br>
    <strong>Samples:</strong> ${rows.length}
  `;

  const headers = Object.keys(rows[0]);
  sampleTable.innerHTML = '';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  sampleTable.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = row[h];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  sampleTable.appendChild(tbody);

  modal.classList.remove('hidden');
}

function closeDataModal() {
  modal.classList.add('hidden');
}

searchInput.addEventListener('input', renderMap);
rockTypeFilter.addEventListener('change', renderMap);
sio2Min.addEventListener('input', renderMap);
resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  rockTypeFilter.value = 'all';
  sio2Min.value = '';
  renderMap();
});
closeModal.addEventListener('click', closeDataModal);
modal.addEventListener('click', event => {
  if (event.target === modal) closeDataModal();
});

fetch(DATA_URL)
  .then(response => response.text())
  .then(text => {
    allRows = parseCSV(text);
    populateRockTypeFilter(allRows);
    renderMap();
  })
  .catch(error => {
    alert('无法读取 data.csv。请确认文件存在并与 index.html 位于同一目录。');
    console.error(error);
  });
