const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSV_brcuV6LUUqKdx7uL-peKmOm0eVEzq0nq4385qwLjcQuDXpqaO_dHVLk1z7BKQ/pub?gid=1234620442&single=true&output=csv";

fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").slice(1);
    const tbody = document.querySelector("tbody");

    rows.forEach(row => {
      const cols = row.split(",");
      if (cols.length >= 4) {
        tbody.innerHTML += `
          <tr>
            <td>${cols[0]}</td>
            <td>${cols[1]}</td>
            <td>${cols[2]}</td>
            <td>${cols[3]}</td>
          </tr>
        `;
      }
    });
  });

document.getElementById("search").addEventListener("keyup", function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll("tbody tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value)
      ? ""
      : "none";
  });
});
