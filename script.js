// Code Archaeology Game - Main JavaScript File

// game state variables
let currentEra = 'fortran';
let eraData = {};
let fragmentsFound = [];
let score = 0;
let unlockedEras = ['fortran'];
let totalFragments = 0;
let gameState = {};

// dom elements
let digSiteGrid;
let fragmentsFoundDisplay;
let totalFragmentsDisplay;
let currentScoreDisplay;
let currentEraDisplay;
let progressFill;
let progressText;

// initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

function initializeGame() {
    // get dom elements
    digSiteGrid = document.getElementById('dig-site-grid');
    fragmentsFoundDisplay = document.getElementById('fragments-found');
    totalFragmentsDisplay = document.getElementById('total-fragments');
    currentScoreDisplay = document.getElementById('current-score');
    currentEraDisplay = document.getElementById('current-era');
    progressFill = document.getElementById('progress-fill');
    progressText = document.getElementById('progress-text');
    
    // create dig site grid
    createDigSiteGrid();
    
    // load saved progress
    loadGameProgress();
    
    // update display
    updateDisplay();
    
    console.log('game initialized');
}

function createDigSiteGrid() {
    // clear existing grid
    digSiteGrid.innerHTML = '';
    
    // create 4x3 grid (12 cells total)
    for (let i = 0; i < 12; i++) {
        const cell = document.createElement('div');
        cell.className = 'dig-cell';
        cell.dataset.cellIndex = i;
        
        // add click handler
        cell.addEventListener('click', function() {
            handleDigClick(i);
        });
        
        // add hover effect
        cell.addEventListener('mouseenter', function() {
            if (!cell.classList.contains('excavated')) {
                cell.textContent = '?';
                cell.style.color = '#00ff00';
            }
        });
        
        cell.addEventListener('mouseleave', function() {
            if (!cell.classList.contains('excavated')) {
                cell.textContent = '';
            }
        });
        
        digSiteGrid.appendChild(cell);
    }
    
    console.log('dig site grid created with 12 cells');
}

function handleDigClick(cellIndex) {
    const cell = digSiteGrid.children[cellIndex];
    
    // check if already excavated
    if (cell.classList.contains('excavated')) {
        return;
    }
    
    // excavate the cell
    excavateCell(cell, cellIndex);
}

function excavateCell(cell, cellIndex) {
    // mark as excavated
    cell.classList.add('excavated');
    
    // simulate finding a code fragment
    const fragmentFound = simulateFragmentDiscovery(cellIndex);
    
    if (fragmentFound) {
        // update fragment count
        fragmentsFound.push(cellIndex);
        
        // update display
        updateDisplay();
        
        // show fragment content (placeholder for now)
        showFragmentContent(cellIndex);
        
        console.log(`fragment found at cell ${cellIndex}`);
    } else {
        // empty dig site
        cell.textContent = 'X';
        cell.style.color = '#808080';
        console.log(`empty dig site at cell ${cellIndex}`);
    }
}

function simulateFragmentDiscovery(cellIndex) {
    // simple probability - 70% chance of finding fragment
    // in real implementation, this will use actual era data
    return Math.random() < 0.7;
}

function showFragmentContent(cellIndex) {
    // placeholder - will show actual code fragments later
    const cell = digSiteGrid.children[cellIndex];
    cell.textContent = 'CODE';
    cell.style.color = '#00ffff';
    cell.title = 'Code fragment found! Click to examine.';
}

function updateDisplay() {
    // update fragment count
    fragmentsFoundDisplay.textContent = fragmentsFound.length;
    
    // update total fragments (placeholder - will be set from era data)
    totalFragmentsDisplay.textContent = totalFragments || 12;
    
    // update score
    currentScoreDisplay.textContent = score;
    
    // update era display
    currentEraDisplay.textContent = getEraDisplayName(currentEra);
    
    // update progress bar
    updateProgressBar();
}

function getEraDisplayName(era) {
    const eraNames = {
        'fortran': 'FORTRAN (1957)',
        'c': 'C (1972)',
        'python': 'Python (1991)'
    };
    return eraNames[era] || era;
}

function updateProgressBar() {
    const total = parseInt(totalFragmentsDisplay.textContent);
    const found = fragmentsFound.length;
    const percentage = total > 0 ? (found / total) * 100 : 0;
    
    progressFill.style.width = percentage + '%';
    
    if (found === 0) {
        progressText.textContent = 'Start digging to find code fragments!';
    } else if (found < total) {
        progressText.textContent = `Found ${found} of ${total} fragments`;
    } else {
        progressText.textContent = 'All fragments found! Era complete!';
    }
}

function loadGameProgress() {
    // load from localStorage
    const saved = localStorage.getItem('codeArchaeologyProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            currentEra = data.currentEra || 'fortran';
            fragmentsFound = data.fragmentsFound || [];
            score = data.score || 0;
            unlockedEras = data.unlockedEras || ['fortran'];
            
            console.log('progress loaded from localStorage');
        } catch (e) {
            console.log('error loading progress:', e);
        }
    }
}

function saveGameProgress() {
    // save to localStorage
    const data = {
        currentEra: currentEra,
        fragmentsFound: fragmentsFound,
        score: score,
        unlockedEras: unlockedEras
    };
    
    localStorage.setItem('codeArchaeologyProgress', JSON.stringify(data));
    console.log('progress saved to localStorage');
}

// placeholder functions for future implementation
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        localStorage.removeItem('codeArchaeologyProgress');
        location.reload();
    }
}

function showMuseum() {
    console.log('museum view - to be implemented');
}

function showHelp() {
    console.log('help system - to be implemented');
}

// add event listeners for action buttons
document.addEventListener('DOMContentLoaded', function() {
    // these will be added after the buttons exist
    setTimeout(function() {
        const resetBtn = document.getElementById('reset-btn');
        const museumBtn = document.getElementById('museum-btn');
        const helpBtn = document.getElementById('help-btn');
        
        if (resetBtn) resetBtn.addEventListener('click', resetProgress);
        if (museumBtn) museumBtn.addEventListener('click', showMuseum);
        if (helpBtn) helpBtn.addEventListener('click', showHelp);
    }, 100);
});
