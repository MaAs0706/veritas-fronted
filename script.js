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
let sseSource = null;
let loaderActive = false;
let loaderInterval = null;
let currentMessage = '';
let lastAgent = null;
let verdictCompleted = false;


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
    elements.analyzeBtn.addEventListener('click', analyzeWithAPI);

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

    switch (sampleType) {
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
        switch (sampleType) {
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

    switch (model) {
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


async function analyzeWithAPI() {
    const rawInput =
        state.selectedMode === 'text'
            ? elements.newsTextarea.value.trim()
            : elements.newsUrlInput.value.trim();

    if (!rawInput) {
        showNotification('Input cannot be empty', 'warning');
        return;
    }

    if (state.selectedMode === 'text' && rawInput.length < 50) {
        showNotification('Minimum 50 characters required', 'warning');
        return;
    }

    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    try {
        const res = await fetch('https://nh34qdxh-8000.inc1.devtunnels.ms/crew/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                claim: rawInput
            })
        });

        if (!res.ok) {
            throw new Error('Backend error');
        }

        const data = await res.json();

        if (!data.job_id) {
            throw new Error('Job ID missing');
        }
        // reset loader state for new run
        startingCrewShown = false;

        lastAgent = null;
        agentMessageIndex = 0;
        
        console.log("Job Scheduled: Job id : -  " + data.job_id) 
        verdictCompleted = false;

        startStreaming(data.job_id);
        showNotification('Analysis started', 'info');

    } catch (err) {
        console.error(err);
        showNotification('Failed to submit job', 'error');
        resetAnalyzeButton();
    }
}

function startLoader(message) {
    if (loaderActive) return;

    loaderActive = true;
    currentMessage = message;
    lockTextarea();

    let dots = 0;

    // 🔥 MISSING LINE
    elements.newsTextarea.value = message;

    loaderInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        elements.newsTextarea.value =
            currentMessage + '.'.repeat(dots);
    }, 500);
}



function stopLoader(finalMessage = '') {
    loaderActive = false;

    if (loaderInterval) {
        clearInterval(loaderInterval);
        loaderInterval = null;
    }

    if (finalMessage) {
        elements.newsTextarea.value = finalMessage;
    }

    unlockTextarea();
}


const SOURCE_STAGE_MAP = {
    'spaCy-NLP TOOL': '🔍 Extracting entities and meanings',
    'Gemini-Summarizer-Tool': '🧠 Summarizing the claim',
    'Search-Tool': '🌐 Verifying with trusted sources',
    'VERDICT AGENT': '⚖️ Evaluating credibility'
};





function updateLoaderMessage(message) {
    currentMessage = message;
}

function resetAnalyzeButton() {
    elements.analyzeBtn.disabled = false;

    elements.analyzeBtn.innerHTML =
        state.selectedMode === 'text'
            ? '<i class="fas fa-play-circle"></i> Analyze Text'
            : '<i class="fas fa-play-circle"></i> Analyze URL';
}


function startStreaming(jobId) {
    if (sseSource) {
        sseSource.close();
    }

    // RESET STATE
    lastAgent = null;
    agentMessageIndex = 0;

    // ✅ SHOW ONCE
    startLoader('⏳ Starting crew');

    sseSource = new EventSource(
        `https://nh34qdxh-8000.inc1.devtunnels.ms/crew/stream/${jobId}`
    );

    // 🔁 Agent updates
    sseSource.addEventListener('log', async (e) => {
    try {
        const log = JSON.parse(e.data);
        console.log(log)
        
        // ---- UI update (same as before)
        if (log.source) {
            currentMessage =
                SOURCE_STAGE_MAP[log.source] || '⚙️ Processing';
        }
        if (
            log.source === 'VERDICT AGENT' &&
            log.type === 'FAILED' &&
            !verdictCompleted
        ){
            stopLoader();
            resetAnalyzeButton();

            // close SSE
            sseSource.close();
        }
        // ---- 🔥 COMPLETION CONDITION
        if (
            log.source === 'VERDICT AGENT' &&
            log.type === 'END' &&
            !verdictCompleted
        ) {
            verdictCompleted = true;

            // stop loader + spinner immediately
            stopLoader();
            resetAnalyzeButton();

            // close SSE
            sseSource.close();

            // fetch final result
            await fetchFinalResult(jobId);
        }

    } catch {
        // ignore malformed logs
    }
});



    


    // ❌ Error
    sseSource.onerror = () => {
        if (!loaderActive) return; // 👈 prevents false error
        stopLoader('⚠️ Connection lost. Please retry.');
        resetAnalyzeButton();    
        sseSource.close();
    };

}


function lockTextarea() {
    const textarea = elements.newsTextarea;
    textarea.disabled = true;
    textarea.readOnly = true;
    textarea.style.cursor = 'not-allowed';
}

function unlockTextarea() {
    const textarea = elements.newsTextarea;
    textarea.disabled = false;
    textarea.readOnly = false;
    textarea.style.cursor = 'text';
}





function updateStatusUI(stage) {
    const el = document.getElementById('results-status');
    if (!el) return;

    switch (stage) {
        case 'queued':
            el.innerHTML =
                '<i class="fas fa-clock"></i> Starting crew...';
            break;

        case 'analyzing':
            el.innerHTML =
                '<i class="fas fa-cogs fa-spin"></i> Analyzing content....';
            break;

        case 'finalizing':
            el.innerHTML =
                '<i class="fas fa-search fa-spin"></i> Finding results....';
            break;

        case 'fetching':
            el.innerHTML =
                '<i class="fas fa-download fa-spin"></i> Fetching final result...';
            break;

        case 'failed':
            el.innerHTML =
                '<i class="fas fa-times-circle"></i> Analysis failed';
            break;

        case 'timeout':
            el.innerHTML =
                '<i class="fas fa-hourglass-end"></i> Analysis timed out';
            break;

        case 'error':
            el.innerHTML =
                '<i class="fas fa-exclamation-triangle"></i> Error occurred';
            break;

        default:
            el.innerHTML =
                '<i class="fas fa-hourglass-half"></i> Processing....';
    }
}


async function fetchFinalResult(jobId) {
    try {
        const res = await fetch(
            `https://nh34qdxh-8000.inc1.devtunnels.ms/crew/result/${jobId}`,
            { headers: { Accept: 'application/json' } }
        );

        if (!res.ok) {
            throw new Error('Result not ready');
        }

        const data = await res.json();
        if (data){
            console.log("Data recieved")
            
        }
        renderFinalResult(data);


    } catch (err) {
        console.error(err);
        showNotification('Failed to fetch final result', 'error');
        resetAnalyzeButton();
    }
}

function typeText(element, text, speed = 18) {
    element.textContent = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            requestAnimationFrame(type);
        }
    }

    type();
}

function renderFinalResult(result) {
  console.log("FINAL RESULT:", result);

  // ---------- Verdict ----------
  const verdict = (result?.verdict || "UNKNOWN").toUpperCase();
  document.getElementById("verdict-text").innerText = verdict;
  document.getElementById("score-verdict").innerText = verdict;



  // ---------- Confidence ----------
  const confidence = result?.confidence ?? 0;

  const confidenceEl = document.getElementById("confidence-value");
if (confidenceEl) {
  confidenceEl.innerText = `${confidence}%`;
}

  // ---------- Reasoning ----------
  document.getElementById("verdict-description").innerText =
    result?.reasoning || "No explanation available.";

  // ---------- Explainability ----------
  const positive = document.getElementById("positive-insights");
  const negative = document.getElementById("negative-insights");

  positive.innerHTML = "";
  negative.innerHTML = "";

  const factors = result?.key_factors || {};

  Object.entries(factors).forEach(([key, value]) => {
    const tag = document.createElement("span");
    tag.className = "insight-tag";
    tag.innerText = `${key.replaceAll("_", " ")}: ${value}`;

    value >= 50 ? positive.appendChild(tag) : negative.appendChild(tag);
  });

  // ---------- Sources ----------
  const sourcesList = document.getElementById("sources-list");
  sourcesList.innerHTML = "";

  Object.values(result?.sources_analyzed || {})
    .flat()
    .forEach(url => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
      sourcesList.appendChild(li);
    });

  // ---------- Show Results ----------
  document.getElementById("results-placeholder").classList.add("hidden");
  document.getElementById("results-content").classList.remove("hidden");

  applyVerdictStyle(verdict);
}


function applyVerdictStyle(verdict) {
  const card = document.querySelector(".verdict-card");
  card.classList.remove("real", "fake", "unverified");


  

  if (verdict === "REAL") card.classList.add("real");
  else if (verdict === "FAKE") card.classList.add("fake");
  else card.classList.add("unverified");
  // 🔥 Force visibility (bypass scroll observer)
document.querySelectorAll(
  '#results-content, #results-content *'
).forEach(el => {
  el.classList.add('visible');
  el.style.opacity = '1';
  el.style.transform = 'none';
});

}


