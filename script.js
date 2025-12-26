const elements ={
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
    
    
    resultsStatus: document.getElementById('results-status'),
    resultsPlaceholder: document.getElementById('results-placeholder'),
    resultsContent: document.getElementById('results-content'),

    // THese should be dynamic 
    confidenceScore: document.querySelector('.score-number'),
    confidenceCircle: document.querySelector('.score-circle-fill'),
    verdictText: document.querySelector('.verdict-text'),
    scoreVerdict: document.querySelector('.score-verdict'),
    verdictDescription: document.querySelector('.verdict-description'),
    
    // Stats elements
    accuracyStat: document.querySelector('.stat-card:nth-child(1) .stat-value'),
    articlesStat: document.querySelector('.stat-card:nth-child(2) .stat-value'),
    responseStat: document.querySelector('.stat-card:nth-child(3) .stat-value'),
    
    // Recent analyses list
    recentList: document.querySelector('.recent-list'),
    
    // Components for dynamic updates
    insightTagsPositive: document.querySelector('.insight.positive .insight-tags'),
    insightTagsNegative: document.querySelector('.insight.negative .insight-tags'),
    highlightedText: document.querySelector('.text-highlights p'),
    modelPredictions: document.querySelectorAll('.model-prediction .prediction-value')
};

const state = {
    totalanaylses: 0,
    accuratepredictions: 0,
    totalresponseTime: 0,
    recentAnalyses: [],
    currentanalysis: null,
    isanalyzing: false,
    selectmode: 'text' // 'text' or 'url'

};

const sampleData = {
    realNews: `Scientists have confirmed the discovery of a new exoplanet in the habitable zone of a nearby star system. The planet, named Kepler-452b, is approximately 60% larger than Earth and orbits a sun-like star. Initial observations suggest it may have a rocky surface and could potentially support liquid water. This discovery was made using data from the Kepler Space Telescope and has been verified by multiple independent research teams. Further studies are planned to analyze the planet's atmosphere for signs of biological activity. The findings have been published in the peer-reviewed Astrophysical Journal.`,
    
    fakeNews: `BREAKING: Government announces mandatory COVID-21 vaccination for all citizens starting next week! The new vaccine contains microchips that allow authorities to track your location 24/7. Multiple sources confirm that those who refuse will have their bank accounts frozen. This was secretly approved in a midnight session of Congress without public discussion. Share this urgent news before they delete it!`,
    
    misleadingNews: `A new study claims that chocolate is more effective than exercise for weight loss. Researchers found that participants who ate dark chocolate daily lost 10 pounds in a month without changing their diet or exercise habits. The compound in chocolate supposedly boosts metabolism by 300%. However, the study was funded by a major chocolate manufacturer and only included 15 participants over a very short period. Critics point out significant methodological flaws.`
};