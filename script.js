const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV_brcuV6LUUqKdx7uL-peKmOm0eVEzq0nq4385qwLjcQuDXpqaO_dHVLk1z7BKQ/pub?gid=1234620442&single=true&output=csv";
const tbody = document.querySelector("tbody");

function loadData() {
  // cache-busting param so browser + Google don't serve old CSV
  const url = sheetURL + "&t=" + Date.now();

  fetch(url)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.split("\n").slice(1);

      tbody.innerHTML = ""; // clear old rows

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
    })
    .catch(err => console.error("CSV fetch error:", err));
}

// Initial load when page opens
loadData();

// Auto-refresh every 2 seconds
setInterval(loadData, 2000);
