const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV_brcuV6LUUqKdx7uL-peKmOm0eVEzq0nq4385qwLjcQuDXpqaO_dHVLk1z7BKQ/pub?gid=1942754613&single=true&output=csv";
const table = document.getElementById("rateTable");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");
const searchInput = document.getElementById("search");
const liveStatus = document.getElementById("liveStatus");
const refreshBtn = document.getElementById("refreshBtn");

function updateLiveStatus(text) {
  const now = new Date().toLocaleTimeString();
  liveStatus.textContent = `● ${text} at ${now}`;
}

/* Proper CSV parsing (handles commas safely) */
function parseCSV(csv) {
  const rows = [];
  let current = [];
  let value = "";
  let insideQuotes = false;

  for (let char of csv) {
    if (char === '"' ) {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      current.push(value);
      value = "";
    } else if (char === "\n" && !insideQuotes) {
      current.push(value);
      rows.push(current);
      current = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value) {
    current.push(value);
    rows.push(current);
  }
  return rows;
}

function renderTable(csv) {
  const rows = parseCSV(csv);
  if (rows.length === 0) return;

  /* Render headers */
  thead.innerHTML = "";
  const headerRow = document.createElement("tr");
  rows[0].forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  /* Render body */
  tbody.innerHTML = "";
  rows.slice(1).forEach(row => {
    if (row.length === 0) return;

    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function fetchAndRender() {
  refreshBtn.disabled = true;
  updateLiveStatus("Refreshing");

  fetch(sheetURL + "&t=" + Date.now())
    .then(res => res.text())
    .then(csv => {
      renderTable(csv);
      updateLiveStatus("Live • Updated");
    })
    .catch(err => {
      console.error("CSV error:", err);
      updateLiveStatus("Error loading data");
    })
    .finally(() => {
      refreshBtn.disabled = false;
    });
}

/* Initial load */
fetchAndRender();

/* Manual refresh */
refreshBtn.addEventListener("click", fetchAndRender);

/* Search across ALL columns */
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  document.querySelectorAll("tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });
});
