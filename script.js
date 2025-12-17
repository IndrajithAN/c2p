const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV_brcuV6LUUqKdx7uL-peKmOm0eVEzq0nq4385qwLjcQuDXpqaO_dHVLk1z7BKQ/pub?gid=1234620442&single=true&output=csv";
const tbody = document.querySelector("tbody");
const searchInput = document.getElementById("search");
const liveStatus = document.getElementById("liveStatus");
const refreshBtn = document.getElementById("refreshBtn");

function updateLiveStatus(text) {
  const now = new Date().toLocaleTimeString();
  liveStatus.textContent = `● ${text} at ${now}`;
}

function renderTable(csv) {
  const rows = csv.split("\n").slice(1);
  tbody.innerHTML = "";

  rows.forEach(row => {
    const cols = row.split(",");
    if (cols.length >= 4) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cols[0]}</td>
        <td>${cols[1]}</td>
        <td>${cols[2]}</td>
        <td>${cols[3]}</td>
      `;
      tbody.appendChild(tr);
    }
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

/* Search (no refresh interaction) */
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  document.querySelectorAll("tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });
});
