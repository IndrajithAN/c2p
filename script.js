const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV_brcuV6LUUqKdx7uL-peKmOm0eVEzq0nq4385qwLjcQuDXpqaO_dHVLk1z7BKQ/pub?gid=1234620442&single=true&output=csv";
const tbody = document.querySelector("tbody");
const searchInput = document.getElementById("search");
const liveStatus = document.getElementById("liveStatus");

let previousPrices = {};
let refreshPaused = false;
let lastCSVData = "";

function updateLiveStatus() {
  const now = new Date().toLocaleTimeString();
  liveStatus.textContent = `● Live • Updated ${now}`;
}

function renderTable(csv) {
  const rows = csv.split("\n").slice(1);
  tbody.innerHTML = "";

  rows.forEach(row => {
    const cols = row.split(",");
    if (cols.length >= 4) {
      const name = cols[0];
      const price = cols[3];

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cols[0]}</td>
        <td>${cols[1]}</td>
        <td>${cols[2]}</td>
        <td>${price}</td>
      `;

      if (previousPrices[name] && previousPrices[name] !== price) {
        tr.classList.add("price-updated");
      }

      previousPrices[name] = price;
      tbody.appendChild(tr);
    }
  });
}

function loadData() {
  if (refreshPaused) return;

  fetch(sheetURL + "&t=" + Date.now())
    .then(res => res.text())
    .then(csv => {
      lastCSVData = csv;
      renderTable(csv);
      updateLiveStatus();
    })
    .catch(err => console.error("CSV fetch error:", err));
}

/* Initial load */
loadData();

/* Auto refresh every 2 seconds */
setInterval(loadData, 2000);

/* SEARCH HANDLING — THIS IS THE FIX */
searchInput.addEventListener("input", () => {
  refreshPaused = true;

  const value = searchInput.value.toLowerCase();
  document.querySelectorAll("tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });

  // Resume refresh ONLY after user stops typing
  clearTimeout(searchInput._typingTimer);
  searchInput._typingTimer = setTimeout(() => {
    refreshPaused = false;

    // Re-render fresh data once search ends
    if (lastCSVData) {
      renderTable(lastCSVData);
    }
  }, 1500);
});
