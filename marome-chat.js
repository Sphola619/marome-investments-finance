// Marome AI Chat Widget - Backend Version
class MaromeChat {
    constructor() {
        this.isOpen = false;
        // Use production backend if deployed, otherwise localhost
        this.backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000'
            : 'https://finance-backend-5xk5.onrender.com';
        this.conversationHistory = [];
        console.log('🤖 Marome Chat initialized');
        console.log('🌐 Backend URL:', this.backendUrl);
        console.log('📍 Current hostname:', window.location.hostname);
        this.init();
    }

    init() {
        this.createChatWidget();
        this.attachEventListeners();
    }

    createChatWidget() {
        // Create chat button
        const chatButton = document.createElement('button');
        chatButton.id = 'marome-chat-button';
        chatButton.className = 'marome-chat-button';
        chatButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="marome-tooltip">Ask Marome</span>
        `;

        // Create chat popup
        const chatPopup = document.createElement('div');
        chatPopup.id = 'marome-chat-popup';
        chatPopup.className = 'marome-chat-popup';
        chatPopup.innerHTML = `
            <div class="marome-chat-header">
                <div class="marome-header-content">
                    <div class="marome-avatar">M</div>
                    <div class="marome-header-text">
                        <h3>Marome AI Assistant</h3>
                        <span class="marome-status">Online</span>
                    </div>
                </div>
                <button class="marome-close-button" id="marome-close-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="marome-chat-messages" id="marome-chat-messages">
                <div class="marome-message marome-message-bot">
                    <div class="marome-message-avatar">M</div>
                    <div class="marome-message-content">
                        <p>Hi, I'm Marome. How can I assist you today?</p>
                        <p class="marome-message-subtitle">I can help you with questions about finance, investments, markets, and more!</p>
                    </div>
                </div>
            </div>
            <div class="marome-chat-input-container">
                <textarea 
                    id="marome-chat-input" 
                    class="marome-chat-input" 
                    placeholder="Ask me anything about finance..."
                    rows="1"
                ></textarea>
                <button id="marome-send-button" class="marome-send-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;

        // Append to body
        document.body.appendChild(chatButton);
        document.body.appendChild(chatPopup);
    }

    attachEventListeners() {
        const chatButton = document.getElementById('marome-chat-button');
        const closeButton = document.getElementById('marome-close-button');
        const sendButton = document.getElementById('marome-send-button');
        const chatInput = document.getElementById('marome-chat-input');

        chatButton.addEventListener('click', () => this.toggleChat());
        closeButton.addEventListener('click', () => this.toggleChat());
        sendButton.addEventListener('click', () => this.sendMessage());
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        chatInput.addEventListener('input', (e) => {
            this.autoResize(e.target);
        });
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const popup = document.getElementById('marome-chat-popup');
        const button = document.getElementById('marome-chat-button');
        
        if (this.isOpen) {
            popup.classList.add('marome-chat-open');
            button.classList.add('marome-button-hidden');
            document.getElementById('marome-chat-input').focus();
        } else {
            popup.classList.remove('marome-chat-open');
            button.classList.remove('marome-button-hidden');
        }
    }

    async sendMessage() {
        const input = document.getElementById('marome-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.removeTypingIndicator();
            console.error('Marome Chat Error Details:', error);
            const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
            const errorMsg = isProduction 
                ? `I'm sorry, I encountered an error connecting to the backend. The server might be starting up (Render can take ~30 seconds on first request).`
                : `I'm sorry, I encountered an error. Please make sure the backend server is running on port 5000.`;
            this.addMessage(errorMsg, 'bot', true);
        }
    }

    addMessage(text, sender, isError = false) {
        const messagesContainer = document.getElementById('marome-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `marome-message marome-message-${sender}`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="marome-message-avatar">M</div>
                <div class="marome-message-content ${isError ? 'marome-message-error' : ''}">
                    <p>${this.formatMessage(text)}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="marome-message-content">
                    <p>${this.escapeHtml(text)}</p>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('marome-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'marome-typing-indicator';
        typingDiv.className = 'marome-message marome-message-bot';
        typingDiv.innerHTML = `
            <div class="marome-message-avatar">M</div>
            <div class="marome-message-content">
                <div class="marome-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('marome-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async getAIResponse(userMessage) {
        // Add message to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // Keep only last 8 messages to manage context
        if (this.conversationHistory.length > 8) {
            this.conversationHistory = this.conversationHistory.slice(-8);
        }

        // Get current page info
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const pageTitle = document.title || 'Marome Investments';

        const response = await fetch(`${this.backendUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                history: this.conversationHistory,
                context: {
                    currentPage: currentPage,
                    pageTitle: pageTitle
                }
            })
        });

        console.log('📡 Chat API Response Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Backend API Error:', response.status, errorData);
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = data.response;

        // Add assistant response to history
        this.conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });

        return assistantMessage;
    }

    formatMessage(text) {
        // Basic formatting for bot messages
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize Marome Chat when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MaromeChat();
    });
} else {
    new MaromeChat();
}
