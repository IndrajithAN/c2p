const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV_brcuV6LUUqKdx7uL-peKmOm0eVEzq0nq4385qwLjcQuDXpqaO_dHVLk1z7BKQ/pub?gid=1942754613&single=true&output=csv";
const table = document.getElementById("rateTable");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");
const searchInput = document.getElementById("search");
const liveStatus = document.getElementById("liveStatus");
const refreshBtn = document.getElementById("refreshBtn");

/* Update live badge */
function updateLiveStatus(text) {
  const now = new Date().toLocaleTimeString();
  liveStatus.textContent = `● ${text} at ${now}`;
}

/* Simple CSV parser (safe for commas in quotes) */
function parseCSV(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let char of csv) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
    } else if (char === "\n" && !insideQuotes) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}

/* Render ONLY first 4 columns */
function renderTable(csv) {
  const rows = parseCSV(csv);
  if (rows.length === 0) return;

  /* Headers: first 4 columns only */
  thead.innerHTML = "";
  const headerRow = document.createElement("tr");
  rows[0].slice(0, 4).forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  /* Body: first 4 columns only */
  tbody.innerHTML = "";
  rows.slice(1).forEach(row => {
    if (row.length < 4) return;

    const tr = document.createElement("tr");
    row.slice(0, 4).forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

/* Fetch + render (manual refresh only) */
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
      console.error("CSV fetch error:", err);
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

/* Search across visible columns only */
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  document.querySelectorAll("tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });
});
