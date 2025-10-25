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
        // if already excavated, show fragment details
        showFragmentDetails(cellIndex);
        return;
    }
    
    // excavate the cell
    excavateCell(cell, cellIndex);
}

function excavateCell(cell, cellIndex) {
    // add digging animation class
    cell.classList.add('digging');
    
    // simulate digging delay
    setTimeout(function() {
        // remove digging animation
        cell.classList.remove('digging');
        
        // add dust clearing effect
        cell.classList.add('dust-clearing');
        
        // mark as excavated
        cell.classList.add('excavated');
        
        // simulate finding a code fragment
        const fragmentFound = simulateFragmentDiscovery(cellIndex);
        
        setTimeout(function() {
            // remove dust clearing effect
            cell.classList.remove('dust-clearing');
            
            if (fragmentFound) {
                // update fragment count
                fragmentsFound.push(cellIndex);
                
                // update display
                updateDisplay();
                
                // show fragment content
                showFragmentContent(cellIndex);
                
                // save progress
                saveGameProgress();
                
                console.log(`fragment found at cell ${cellIndex}`);
            } else {
                // empty dig site
                cell.textContent = 'X';
                cell.style.color = '#808080';
                console.log(`empty dig site at cell ${cellIndex}`);
            }
        }, 400);
        
    }, 300);
}

function simulateFragmentDiscovery(cellIndex) {
    // simple probability - 70% chance of finding fragment
    // in real implementation, this will use actual era data
    return Math.random() < 0.7;
}

function showFragmentContent(cellIndex) {
    // show fragment indicator with better visual feedback
    const cell = digSiteGrid.children[cellIndex];
    cell.textContent = 'CODE';
    cell.style.color = '#00ffff';
    cell.style.fontWeight = 'bold';
    cell.style.textShadow = '0 0 10px #00ffff';
    cell.title = 'Code fragment found! Click to examine.';
    
    // add pulsing effect
    cell.style.animation = 'glow 2s infinite';
    
    // add click handler for fragment details
    cell.addEventListener('click', function() {
        showFragmentDetails(cellIndex);
    });
    
    // show brief notification
    showFragmentNotification(cellIndex);
}

function showFragmentNotification(cellIndex) {
    // create temporary notification
    const notification = document.createElement('div');
    notification.textContent = 'Code Fragment Discovered!';
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 255, 255, 0.9);
        color: #0a0a0a;
        padding: 10px 20px;
        border: 2px solid #00ffff;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        z-index: 1500;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(notification);
    
    // remove notification after animation
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 2000);
}

function showFragmentDetails(cellIndex) {
    // placeholder for fragment details modal
    console.log(`showing details for fragment at cell ${cellIndex}`);
    
    // create simple modal for now
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: #0a0a0a;
        border: 2px solid #ffb000;
        padding: 20px;
        max-width: 500px;
        width: 90%;
        color: #00ffff;
        font-family: 'Courier New', monospace;
    `;
    
    content.innerHTML = `
        <h3 style="color: #ffb000; margin-bottom: 15px;">Code Fragment #${cellIndex + 1}</h3>
        <div style="background: #404040; padding: 15px; margin-bottom: 15px; border: 1px solid #00ff00;">
            <pre style="color: #00ffff; margin: 0;">// Sample code fragment
PROGRAM HELLO
      PRINT *, 'Hello World'
      END</pre>
        </div>
        <p style="color: #ffffff; margin-bottom: 15px;">
            This is a placeholder code fragment. In the next phase, we'll load real code fragments from JSON data files.
        </p>
        <button onclick="this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement)" 
                style="background: #00ff00; color: #0a0a0a; border: none; padding: 10px 20px; font-family: 'Courier New', monospace; cursor: pointer;">
            Close
        </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // close on click outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
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
