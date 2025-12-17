const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV_brcuV6LUUqKdx7uL-peKmOm0eVEzq0nq4385qwLjcQuDXpqaO_dHVLk1z7BKQ/pub?gid=1942754613&single=true&output=csv";
const table = document.getElementById("rateTable");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");
const searchInput = document.getElementById("search");
const liveStatus = document.getElementById("liveStatus");
const refreshBtn = document.getElementById("refreshBtn");

/* cooldown to avoid hitting same cached CSV snapshot */
let lastRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 3000;

/* update live badge */
function updateLiveStatus(text) {
  const now = new Date().toLocaleTimeString();
  liveStatus.textContent = `● ${text} at ${now}`;
}

/* robust CSV parser (handles commas inside quotes) */
function parseCSV(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let char of csv) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

/* render ONLY first 4 columns */
function renderTable(csv) {
  const rows = parseCSV(csv);
  if (!rows.length) return;

  /* headers */
  thead.innerHTML = "";
  const headerRow = document.createElement("tr");
  rows[0].slice(0, 4).forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  /* body */
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

/* fetch + render with strong cache busting */
function fetchAndRender() {
  const now = Date.now();

  /* prevent rapid refresh hitting same cached snapshot */
  if (now - lastRefreshTime < REFRESH_COOLDOWN_MS) {
    updateLiveStatus("Please wait before refreshing");
    return;
  }

  lastRefreshTime = now;
  refreshBtn.disabled = true;
  updateLiveStatus("Refreshing");

  const cacheBust =
    Date.now().toString() + "-" + Math.random().toString(36).substring(2);

  fetch(sheetURL + "&nocache=" + cacheBust)
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

/* initial load */
fetchAndRender();

/* manual refresh only */
refreshBtn.addEventListener("click", fetchAndRender);

/* search across visible columns only */
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  document.querySelectorAll("tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });
});
