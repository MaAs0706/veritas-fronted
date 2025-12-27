// script.js - Veritas Fake News Detection System (Frontend Only)

// DOM Elements
const elements = {
    modeButtons: document.querySelectorAll('.mode-btn'),
    textInputArea: document.getElementById('text-input'),
    urlInputArea: document.getElementById('url-input'),
    newsTextarea: document.getElementById('news-text'),
    newsUrlInput: document.getElementById('news-url'),
    charCounter: document.getElementById('char-counter'),
    modelSelect: document.getElementById('model-select'),
    sampleBtn: document.getElementById('sample-btn'),
    clearBtn: document.getElementById('clear-btn'),
    fetchBtn: document.getElementById('fetch-btn'),
    analyzeBtn: document.getElementById('analyze-btn'),
    newAnalysisBtn: document.getElementById('new-analysis-btn'),
    accuracyStat: document.querySelector('.stat-card:nth-child(1) .stat-value'),
    articlesStat: document.querySelector('.stat-card:nth-child(2) .stat-value'),
    responseStat: document.querySelector('.stat-card:nth-child(3) .stat-value'),
    recentList: document.querySelector('.recent-list')
};

// State Management
const state = {
    totalAnalyses: 2387415,
    totalAccuracy: 98.7,
    totalResponseTime: 0.42,
    recentAnalyses: [],
    isAnalyzing: false,
    selectedMode: 'text'
};

// Sample data for demonstration
const sampleData = {
    realNews: `Scientists have confirmed the discovery of a new exoplanet in the habitable zone of a nearby star system. The planet, named Kepler-452b, is approximately 60% larger than Earth and orbits a sun-like star. Initial observations suggest it may have a rocky surface and could potentially support liquid water.`,
    
    fakeNews: `BREAKING: Government announces mandatory COVID-21 vaccination for all citizens starting next week! The new vaccine contains microchips that allow authorities to track your location 24/7.`,
    
    misleadingNews: `A new study claims that chocolate is more effective than exercise for weight loss. Researchers found that participants who ate dark chocolate daily lost 10 pounds in a month.`
};

// Initialize the application
function init() {
    updateStatsDisplay();
    loadRecentAnalyses();
    setupEventListeners();
    updateCharCounter();
    
    // Initialize with sample recent analyses
    if (state.recentAnalyses.length === 0) {
        addRecentAnalysis("Climate Policy Announcement", "real", 85, "Today, 14:32");
        addRecentAnalysis("Celebrity Health Scare Report", "fake", 92, "Yesterday, 09:15");
        addRecentAnalysis("Stock Market Prediction", "misleading", 67, "Dec 22, 2025");
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Mode switching
    elements.modeButtons.forEach(button => {
        button.addEventListener('click', () => switchMode(button.dataset.mode));
    });
    
    // Text input events
    elements.newsTextarea.addEventListener('input', updateCharCounter);
    
    // Button events
    elements.sampleBtn.addEventListener('click', loadSampleText);
    elements.clearBtn.addEventListener('click', clearText);
    elements.fetchBtn.addEventListener('click', simulateUrlFetch);
    elements.analyzeBtn.addEventListener('click', simulateAnalysis);
    elements.newAnalysisBtn && elements.newAnalysisBtn.addEventListener('click', resetAnalysis);
    
    // Model selection change
    elements.modelSelect && elements.modelSelect.addEventListener('change', onModelChange);
    
    // Navigation
    setupNavigation();
}

// Switch between text and URL input modes
function switchMode(mode) {
    state.selectedMode = mode;
    
    // Update button states
    elements.modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Show/hide input areas
    elements.textInputArea.classList.toggle('active', mode === 'text');
    elements.urlInputArea.classList.toggle('active', mode === 'url');
    
    // Update UI
    if (mode === 'text') {
        elements.analyzeBtn.innerHTML = '<i class="fas fa-play-circle"></i> Analyze Text';
    } else {
        elements.analyzeBtn.innerHTML = '<i class="fas fa-play-circle"></i> Analyze URL';
    }
}

// Update character counter
function updateCharCounter() {
    const length = elements.newsTextarea.value.length;
    elements.charCounter.textContent = length;
    
    // Change color based on length
    if (length < 50) {
        elements.charCounter.style.color = '#ef4444';
    } else if (length < 100) {
        elements.charCounter.style.color = '#f59e0b';
    } else {
        elements.charCounter.style.color = '#10b981';
    }
}

// Load sample text
function loadSampleText() {
    const samples = ['real', 'fake', 'misleading'];
    const sampleType = samples[Math.floor(Math.random() * samples.length)];
    
    switch(sampleType) {
        case 'real':
            elements.newsTextarea.value = sampleData.realNews;
            break;
        case 'fake':
            elements.newsTextarea.value = sampleData.fakeNews;
            break;
        case 'misleading':
            elements.newsTextarea.value = sampleData.misleadingNews;
            break;
    }
    
    updateCharCounter();
    showNotification(`Loaded ${sampleType} news sample`, 'info');
}

// Clear text input
function clearText() {
    elements.newsTextarea.value = '';
    updateCharCounter();
    showNotification('Text cleared', 'info');
}

// Simulate URL fetching
function simulateUrlFetch() {
    const url = elements.newsUrlInput.value.trim();
    
    if (!url) {
        showNotification('Please enter a URL', 'warning');
        return;
    }
    
    if (!url.startsWith('http')) {
        showNotification('Please enter a valid URL starting with http:// or https://', 'warning');
        return;
    }
    
    showNotification('Fetching article content...', 'info');
    elements.fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
    elements.fetchBtn.disabled = true;
    
    // Simulate API delay
    setTimeout(() => {
        // Randomly pick a sample
        const samples = ['real', 'fake', 'misleading'];
        const sampleType = samples[Math.floor(Math.random() * samples.length)];
        
        // Populate the textarea with the fetched content
        switch(sampleType) {
            case 'real':
                elements.newsTextarea.value = sampleData.realNews;
                break;
            case 'fake':
                elements.newsTextarea.value = sampleData.fakeNews;
                break;
            case 'misleading':
                elements.newsTextarea.value = sampleData.misleadingNews;
                break;
        }
        
        // Switch to text mode to show the fetched content
        switchMode('text');
        
        elements.fetchBtn.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Fetch & Analyze';
        elements.fetchBtn.disabled = false;
        
        updateCharCounter();
        showNotification(`Article fetched successfully (${sampleType} sample loaded)`, 'success');
    }, 1500);
}

// Simulate analysis (frontend only)
function simulateAnalysis() {
    const content = state.selectedMode === 'text' 
        ? elements.newsTextarea.value.trim()
        : elements.newsUrlInput.value.trim();
    
    if (state.selectedMode === 'text' && content.length < 10) {
        showNotification('Please enter some text to analyze (minimum 10 characters)', 'warning');
        return;
    }
    
    if (state.selectedMode === 'url' && !content) {
        showNotification('Please enter a URL to analyze', 'warning');
        return;
    }
    
    // Show analysis in progress
    elements.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    elements.analyzeBtn.disabled = true;
    
    // Update stats (simulate new analysis)
    updateStats();
    
    // Add to recent analyses
    const now = new Date();
    const timeString = formatTime(now);
    const sampleTypes = ['real', 'fake', 'misleading'];
    const sampleType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];
    const confidence = 70 + Math.floor(Math.random() * 25);
    
    addRecentAnalysis(`Analysis #${state.totalAnalyses}`, sampleType, confidence, timeString);
    
    // Simulate analysis delay
    setTimeout(() => {
        elements.analyzeBtn.innerHTML = '<i class="fas fa-play-circle"></i> Analyze Authenticity';
        elements.analyzeBtn.disabled = false;
        
        showNotification('Analysis complete! (This is a frontend simulation)', 'success');
    }, 2000);
}

// Update global statistics
function updateStats() {
    // Increment total analyses
    state.totalAnalyses++;
    
    // Slight random variation in accuracy
    const accuracyChange = (Math.random() * 0.1) - 0.05;
    state.totalAccuracy = Math.max(97, Math.min(99.5, state.totalAccuracy + accuracyChange));
    
    // Slight random variation in response time
    const responseChange = (Math.random() * 0.05) - 0.025;
    state.totalResponseTime = Math.max(0.3, Math.min(0.6, state.totalResponseTime + responseChange));
    
    updateStatsDisplay();
}

// Update the stats display
function updateStatsDisplay() {
    elements.accuracyStat.textContent = state.totalAccuracy.toFixed(1) + '%';
    elements.articlesStat.textContent = formatNumber(state.totalAnalyses);
    elements.responseStat.textContent = state.totalResponseTime.toFixed(2) + 's';
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Add a recent analysis to the list
function addRecentAnalysis(title, type, confidence, date) {
    const analysis = {
        id: Date.now(),
        title: title,
        type: type,
        confidence: confidence,
        date: date
    };
    
    state.recentAnalyses.unshift(analysis);
    
    // Keep only the 5 most recent
    if (state.recentAnalyses.length > 5) {
        state.recentAnalyses.pop();
    }
    
    updateRecentAnalysesDisplay();
}

// Update the recent analyses display
function updateRecentAnalysesDisplay() {
    if (!elements.recentList) return;
    
    elements.recentList.innerHTML = '';
    
    state.recentAnalyses.forEach(analysis => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        
        let typeClass = '';
        if (analysis.type === 'real') typeClass = 'real';
        if (analysis.type === 'fake') typeClass = 'fake';
        if (analysis.type === 'misleading') typeClass = 'misleading';
        
        item.innerHTML = `
            <div class="recent-item-header">
                <span class="recent-title">${analysis.title}</span>
                <span class="recent-date">${analysis.date}</span>
            </div>
            <div class="recent-item-details">
                <span class="recent-verdict ${typeClass}">${analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)} (${analysis.confidence}%)</span>
                <span class="recent-model">RoBERTa</span>
            </div>
        `;
        
        elements.recentList.appendChild(item);
    });
}

// Load recent analyses
function loadRecentAnalyses() {
    // In a real app, this would load from localStorage
}

// Reset for a new analysis
function resetAnalysis() {
    if (elements.newsTextarea) elements.newsTextarea.value = '';
    if (elements.newsUrlInput) elements.newsUrlInput.value = '';
    if (elements.charCounter) updateCharCounter();
    
    showNotification('Ready for new analysis', 'info');
}

// Handle model selection change
function onModelChange() {
    const model = elements.modelSelect.value;
    let description = '';
    
    switch(model) {
        case 'roberta':
            description = 'RoBERTa: Most accurate model';
            break;
        case 'bert':
            description = 'BERT Base: Balanced accuracy and speed';
            break;
        case 'distilbert':
            description = 'DistilBERT: Fastest model';
            break;
        case 'ensemble':
            description = 'Ensemble: Combines all models';
            break;
    }
    
    showNotification(`Model changed to: ${description}`, 'info');
}

// Setup navigation
function setupNavigation() {
    // Sign In button
    const signInBtn = document.querySelector('.btn-outline');
    if (signInBtn) {
        signInBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Sign In functionality would open a login modal', 'info');
        });
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.textContent.toLowerCase();
            
            if (page === 'detector') {
                window.location.href = 'index.html';
            } else if (page === 'how it works') {
                window.location.href = 'how-it-works.html';
            } else if (page === 'about') {
                window.location.href = 'about.html';
            } else if (page === 'api') {
                showNotification('API documentation would open in a new tab', 'info');
            }
        });
    });
}

// Format time for display
function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

// Show notification toast
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'error') icon = 'times-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Add CSS for notifications
function addNotificationStyles() {
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #1e293b;
                border-left: 4px solid #6366f1;
                border-radius: 8px;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
            }
            
            .notification-success {
                border-left-color: #10b981;
            }
            
            .notification-warning {
                border-left-color: #f59e0b;
            }
            
            .notification-error {
                border-left-color: #ef4444;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                margin-left: auto;
                padding: 0;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addNotificationStyles();
    init();
});
