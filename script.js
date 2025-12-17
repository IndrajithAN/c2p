const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV_brcuV6LUUqKdx7uL-peKmOm0eVEzq0nq4385qwLjcQuDXpqaO_dHVLk1z7BKQ/pub?gid=1234620442&single=true&output=csv";
const tbody = document.querySelector("tbody");
const searchInput = document.getElementById("search");
const liveStatus = document.getElementById("liveStatus");

let previousPrices = {};
let refreshPaused = false;

function updateLiveStatus() {
  const now = new Date().toLocaleTimeString();
  liveStatus.textContent = `● Live • Updated ${now}`;
}

function loadData() {
  if (refreshPaused) return;

  fetch(sheetURL + "&t=" + Date.now())
    .then(res => res.text())
    .then(csv => {
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

          // Highlight if price changed
          if (previousPrices[name] && previousPrices[name] !== price) {
            tr.classList.add("price-updated");
          }

          previousPrices[name] = price;
          tbody.appendChild(tr);
        }
      });

      updateLiveStatus();
    })
    .catch(err => console.error("CSV fetch error:", err));
}

// Initial load
loadData();

// Auto refresh every 2 seconds
setInterval(loadData, 2000);

/* Pause refresh while typing */
searchInput.addEventListener("input", () => {
  refreshPaused = true;

  const value = searchInput.value.toLowerCase();
  document.querySelectorAll("tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });

  // Resume refresh after user stops typing (1.5 sec)
  clearTimeout(searchInput._timer);
  searchInput._timer = setTimeout(() => {
    refreshPaused = false;
  }, 1500);
});
