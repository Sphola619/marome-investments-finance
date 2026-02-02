const API_BASE_URL = CONFIG.API_BASE_URL;

/* ===========================================================
      LOAD ECONOMIC CALENDAR
   =========================================================== */

async function loadEconomicCalendar() {
    const container = document.getElementById("calendar-events");
    
    container.innerHTML = `<p class="placeholder-text">Loading economic events...</p>`;
    
    try {
        console.log("🔄 Fetching calendar from:", `${API_BASE_URL}/economic-calendar`);
        
        const response = await fetch(`${API_BASE_URL}/economic-calendar`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } 
        
        const events = await response.json();
        
        console.log("📦 Received events:", events.length);
        
        // Check if response is an error object
        if (events.error) {
            throw new Error(events.error);
        }
        
        if (! Array.isArray(events)) {
            throw new Error("Expected array of events");
        }
        
        if (events.length === 0) {
            container.innerHTML = `
                <div class="placeholder-text" style="text-align: center; padding: 3rem;">
                    <h3>📅 No Upcoming Events</h3>
                    <p style="margin-top: 1rem; color: #666;">
                        There are no major economic events scheduled for the next 30 days.
                    </p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = ""; // Clear loading message
        
        // Check if first event is far in the future
        const firstEventDate = new Date(events[0].date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((firstEventDate - today) / (1000 * 60 * 60 * 24));
        
        // Show warning if first event is more than 3 days away
        if (daysDiff > 3) {
            const warningDiv = document.createElement("div");
            warningDiv.className = "calendar-warning";
            warningDiv.innerHTML = `
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; border-radius: 5px; margin-bottom: 1.5rem;">
                    <strong>⚠️ Notice:</strong> No major economic events scheduled for the next ${daysDiff} days.
                    <br>
                    <span style="font-size: 0.9rem; color: #666;">Next event: ${formatDate(events[0].date)}</span>
                </div>
            `;
            container.appendChild(warningDiv);
        }
        
        // Group events by date
        const eventsByDate = {};
        events.forEach(event => {
            const date = event.date;
            if (!eventsByDate[date]) {
                eventsByDate[date] = [];
            }
            eventsByDate[date].push(event);
        });
        
        console.log("📅 Events grouped by", Object.keys(eventsByDate).length, "dates");
        
        // Display events grouped by date
        Object.entries(eventsByDate).forEach(([date, dayEvents]) => {
            // Date header with event count
            const dateHeader = document.createElement("div");
            dateHeader.className = "calendar-date-header";
            dateHeader. innerHTML = `
                <h3>
                    ${formatDateWithLabel(date)}
                    <span style="font-size: 0.8rem; font-weight: normal; opacity: 0.8; margin-left: 1rem;">
                        (${dayEvents.length} event${dayEvents.length !== 1 ? 's' :  ''})
                    </span>
                </h3>
            `;
            container.appendChild(dateHeader);
            
            // Sort events by importance (High first) and time
            dayEvents.sort((a, b) => {
                const importanceOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
                const impA = importanceOrder[a. importance] ??  3;
                const impB = importanceOrder[b.importance] ??  3;
                
                if (impA !== impB) return impA - impB;
                
                // If same importance, sort by time
                return a.time.localeCompare(b.time);
            });
            
            // Events for this date
            dayEvents. forEach(event => {
                const eventDiv = document.createElement("div");
                eventDiv.className = "calendar-event";
                
                // Add importance class for styling
                eventDiv.classList.add(`importance-${event.importance. toLowerCase()}`);
                
                const importanceIcon = getImportanceIcon(event.importance);
                const countryFlag = getCountryFlag(event.country);
                
                eventDiv.innerHTML = `
                    <div class="event-header">
                        <span class="event-time">${formatTime(event.time)}</span>
                        <span class="event-country">${countryFlag} ${event.country}</span>
                        <span class="event-importance">${importanceIcon}</span>
                    </div>
                    <div class="event-name">${event.event}</div>
                    <div class="event-data">
                        <span class="data-item ${event.actual !== null ? 'has-value' : ''}">
                            <strong>Actual:</strong> ${event.actual !== null ? event.actual : '-'}
                        </span>
                        <span class="data-item ${event. forecast !== null ? 'has-value' : ''}">
                            <strong>Forecast:</strong> ${event.forecast !== null ?  event.forecast :  '-'}
                        </span>
                        <span class="data-item ${event.previous !== null ? 'has-value' :  ''}">
                            <strong>Previous:</strong> ${event. previous !== null ? event.previous :  '-'}
                        </span>
                    </div>
                `;
                
                container.appendChild(eventDiv);
            });
        });
        
        console.log("✅ Calendar loaded successfully");
        
    } catch (err) {
        console.error("❌ Calendar error:", err);
        container.innerHTML = `
            <div class="placeholder-text" style="color: red; padding: 2rem; text-align: center;">
                <h3>❌ Failed to Load Economic Calendar</h3>
                <p style="margin-top: 1rem;">${err.message}</p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">
                    Check browser console (F12) for details.
                </p>
                <button onclick="loadEconomicCalendar()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border:  none; border-radius: 5px; cursor: pointer;">
                    🔄 Retry
                </button>
            </div>
        `;
    }
}

/* ===========================================================
      HELPER FUNCTIONS
   =========================================================== */

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const options = { weekday: 'long', year:  'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch {
        return dateString;
    }
}

function formatDateWithLabel(dateString) {
    try {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const eventDate = new Date(date);
        eventDate.setHours(0, 0, 0, 0);
        
        // Check if today
        if (eventDate.getTime() === today.getTime()) {
            return "📍 Today - " + date.toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
            });
        }
        
        // Check if tomorrow
        if (eventDate.getTime() === tomorrow.getTime()) {
            return "⏭️ Tomorrow - " + date. toLocaleDateString('en-US', { 
                weekday:  'long', month: 'long', day: 'numeric', year: 'numeric' 
            });
        }
        
        // Check if this week (next 7 days)
        const weekAhead = new Date(today);
        weekAhead.setDate(today.getDate() + 7);
        
        if (eventDate >= today && eventDate <= weekAhead) {
            return "📅 This Week - " + date.toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric', year:  'numeric' 
            });
        }
        
        // Otherwise show normal date
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year:  'numeric' 
        });
        
    } catch {
        return dateString;
    }
}

function formatTime(timeString) {
    try {
        // If already in HH:MM format, return as is
        if (/^\d{2}:\d{2}$/. test(timeString)) {
            return timeString;
        }
        
        // If "All Day" or similar
        if (timeString. toLowerCase().includes('all')) {
            return "All Day";
        }
        
        return timeString;
    } catch {
        return timeString;
    }
}

function getImportanceIcon(importance) {
    const imp = String(importance || '').toLowerCase();
    switch(imp) {
        case 'high': 
            return '🔴 High';
        case 'medium':
            return '🟠 Medium';
        case 'low':
            return '🟡 Low';
        default: 
            return '⚪ ' + (importance || 'Unknown');
    }
}

function getCountryFlag(country) {
    const flags = {
        'US': '🇺🇸',
        'USA': '🇺🇸',
        'United States': '🇺🇸',
        'EU': '🇪🇺',
        'EUR': '🇪🇺',
        'Eurozone':  '🇪🇺',
        'GB':  '🇬🇧',
        'UK': '🇬🇧',
        'United Kingdom': '🇬🇧',
        'JP': '🇯🇵',
        'JPN': '🇯🇵',
        'Japan': '🇯🇵',
        'ZA': '🇿🇦',
        'ZAR': '🇿🇦',
        'South Africa': '🇿🇦',
        'AU': '🇦🇺',
        'AUD': '🇦🇺',
        'Australia': '🇦🇺',
        'CH': '🇨🇭',
        'CHF': '🇨🇭',
        'Switzerland': '🇨🇭',
        'CN': '🇨🇳',
        'CNY': '🇨🇳',
        'China': '🇨🇳',
        'CA': '🇨🇦',
        'CAD': '🇨🇦',
        'Canada': '🇨🇦',
        'NZ': '🇳🇿',
        'NZD': '🇳🇿',
        'New Zealand': '🇳🇿',
        'BR': '🇧🇷',
        'BRL': '🇧🇷',
        'Brazil': '🇧🇷',
        'MX': '🇲🇽',
        'MXN': '🇲🇽',
        'Mexico': '🇲🇽',
        'IN': '🇮🇳',
        'INR': '🇮🇳',
        'India': '🇮🇳',
        'DE': '🇩🇪',
        'Germany': '🇩🇪',
        'FR': '🇫🇷',
        'France': '🇫🇷',
        'IT': '🇮🇹',
        'Italy': '🇮🇹',
        'ES': '🇪🇸',
        'Spain': '🇪🇸'
    };
    return flags[country] || '🌍';
}

/* ===========================================================
      PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    console.log("📅 Calendar page loaded, fetching events...");
    loadEconomicCalendar();
});