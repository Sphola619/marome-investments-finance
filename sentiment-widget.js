/* ===========================================================
   REUSABLE SENTIMENT WIDGET CALCULATOR
   =========================================================== */

   class SentimentWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    /**
     * Calculate sentiment from asset data
     * @param {Array} assets - Array of assets with 'change' property
     * @param {String} assetType - 'Crypto', 'Stock', 'Commodity'
     * @param {String} nameProp - Property name for asset name (e.g., 'name', 'pair')
     */
    calculate(assets, assetType, nameProp = 'name') {
        if (!assets || assets.length === 0) {
            return this.renderError();
        }

        // Count positive vs total
        let positiveCount = 0;
        let totalCount = assets.length;
        
        const performers = assets.map(asset => {
            const changeStr = asset. change || '0%';
            const changeNum = parseFloat(changeStr. replace('%', ''));
            
            if (changeNum > 0) positiveCount++;
            
            return {
                name: asset[nameProp] || asset.name,
                change: changeNum,
                changeStr: changeStr
            };
        });

        // Calculate sentiment score (0-100)
        const sentimentScore = Math.round((positiveCount / totalCount) * 100);

        // Determine sentiment level
        const sentiment = this.getSentimentLevel(sentimentScore);

        // Get top 3 performers and bottom 2 laggards
        const sorted = [... performers].sort((a, b) => b.change - a.change);
        const topPerformers = sorted.slice(0, 3);
        const laggards = sorted.slice(-2).reverse();

        // Generate interpretation
        const interpretation = this.generateInterpretation(
            sentimentScore, 
            assetType, 
            positiveCount, 
            totalCount,
            topPerformers[0]
        );

        // Render widget
        this.render(sentiment, sentimentScore, topPerformers, laggards, interpretation, positiveCount, totalCount);
    }

    /**
     * Get sentiment level based on score
     */
    getSentimentLevel(score) {
        if (score >= 80) {
            return { label: 'VERY BULLISH', emoji: '🚀', class: 'very-bullish' };
        } else if (score >= 60) {
            return { label: 'BULLISH', emoji: '😃', class: 'bullish' };
        } else if (score >= 40) {
            return { label: 'NEUTRAL', emoji: '😐', class:  'neutral' };
        } else if (score >= 20) {
            return { label: 'BEARISH', emoji: '😟', class: 'bearish' };
        } else {
            return { label: 'VERY BEARISH', emoji: '💀', class: 'very-bearish' };
        }
    }

    /**
     * Generate interpretation text
     */
    generateInterpretation(score, assetType, positive, total, topPerformer) {
        const assetTypeLower = assetType.toLowerCase();
        
        if (score >= 80) {
            return `Extremely strong momentum in ${assetTypeLower} markets with ${topPerformer.name} leading at ${topPerformer.changeStr}.  High risk appetite detected.`;
        } else if (score >= 60) {
            return `Positive sentiment dominates ${assetTypeLower} markets.  ${positive} out of ${total} assets are rising with healthy buying pressure.`;
        } else if (score >= 40) {
            return `Mixed signals in ${assetTypeLower} markets.  Traders are cautious as sentiment remains balanced between bulls and bears.`;
        } else if (score >= 20) {
            return `Selling pressure evident in ${assetTypeLower} markets. Risk-off sentiment as ${total - positive} out of ${total} assets decline.`;
        } else {
            return `Severe weakness across ${assetTypeLower} markets.  Widespread selling with only ${positive} out of ${total} assets holding gains.`;
        }
    }

    /**
     * Render the sentiment widget
     */
    render(sentiment, score, topPerformers, laggards, interpretation, positive, total) {
        if (!this.container) return;

        const progressBarFill = `width: ${score}%`;

        this.container.innerHTML = `
            <div class="sentiment-widget ${sentiment.class}">
                <div class="sentiment-header">
                    <span class="sentiment-emoji">${sentiment.emoji}</span>
                    <span class="sentiment-label">${sentiment.label}</span>
                </div>
                
                <div class="sentiment-score">
                    <div class="progress-bar">
                        <div class="progress-fill ${sentiment.class}" style="${progressBarFill}"></div>
                    </div>
                    <div class="score-text">${score}/100</div>
                </div>

                <div class="sentiment-stats">
                    ${positive} out of ${total} assets are rising
                </div>

                ${topPerformers.length > 0 ? `
                    <div class="sentiment-performers">
                        <div class="performers-label">📈 Top Performers:</div>
                        <div class="performers-list">
                            ${topPerformers.map(p => `
                                <span class="performer-item positive">
                                    ${p.name} <strong>${p.changeStr}</strong>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${laggards.length > 0 && laggards[0].change < 0 ? `
                    <div class="sentiment-laggards">
                        <div class="laggards-label">📉 Laggards:</div>
                        <div class="laggards-list">
                            ${laggards.filter(l => l.change < 0).map(l => `
                                <span class="laggard-item negative">
                                    ${l.name} <strong>${l.changeStr}</strong>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="sentiment-interpretation">
                    💡 ${interpretation}
                </div>

                <div class="sentiment-updated">
                    🕐 Updated: ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;
    }

    /**
     * Render error state
     */
    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="sentiment-widget neutral">
                <div class="sentiment-header">
                    <span class="sentiment-emoji">⚠️</span>
                    <span class="sentiment-label">UNAVAILABLE</span>
                </div>
                <div class="sentiment-stats">
                    Unable to calculate sentiment at this time.
                </div>
            </div>
        `;
    }
}