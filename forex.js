const API_BASE_URL = "http://localhost:5000/api";

async function loadForex() {
    try {
        const response = await fetch(`${API_BASE_URL}/forex`);
        const data = await response.json();

        const container = document.getElementById("forex-list");
        container.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "market-item forex-card";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${item.pair}</h3>
                    <p>${item.name}</p>
                </div>
                <div class="performance ${item.trend}">
                    ${item.change}
                </div>
            `;

            container.appendChild(div);
        });
    } catch (err) {
        console.error("Forex error:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadForex);
