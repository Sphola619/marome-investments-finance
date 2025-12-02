const API_BASE_URL = "http://localhost:5000/api";

// Load Forex Pair Prices
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

// Load Currency Strength
async function loadStrength() {
    try {
        const response = await fetch(`${API_BASE_URL}/forex-strength`);
        const data = await response.json();

        const container = document.getElementById("strength-list");
        container.innerHTML = "";

        Object.entries(data).forEach(([currency, status]) => {
            const icon =
                status === "Strong" ? "🔥" :
                status === "Weak"   ? "🔻" :
                                      "⚪";

            const div = document.createElement("div");
            div.className = "market-item strength-card";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${currency}</h3>
                    <p>Status</p>
                </div>
                <div class="trend-info">
                    <span class="trend-badge">${icon}</span>
                    <span>${status}</span>
                </div>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error("Strength error:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadForex();
    loadStrength();
});
