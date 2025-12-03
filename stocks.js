async function loadIndices() {
  const container = document.getElementById("indices-list");
  container.innerHTML = "";

  const response = await fetch("http://localhost:5000/api/indices");
  const indices = await response.json();

  indices.forEach(item => {
      const div = document.createElement("div");
      div.className = "market-item";

      div.innerHTML = `
          <div class="market-info">
              <h3>${item.name}</h3>
              <p>${item.symbol}</p>
          </div>
          <div class="performance ${item.trend}">
              ${item.change}
          </div>
      `;

      container.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", loadIndices);
