async function loadCommodities() {
  const listContainer = document.querySelector(".market-list");

  try {
      const res = await fetch("http://localhost:5000/api/commodities");
      const data = await res.json();

      listContainer.innerHTML = "";

      data.forEach(item => {
          const div = document.createElement("div");
          div.className = "market-item";

          const trendClass = item.trend === "positive" ? "positive" : "negative";

          div.innerHTML = `
              <div class="market-info">
                  <h3>${item.name}</h3>
                  <p>${item.symbol}</p>
              </div>
              <div class="performance ${trendClass}">
                  ${item.change}
              </div>
          `;

          listContainer.appendChild(div);
      });

  } catch (err) {
      console.error("Commodity load error:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadCommodities);
