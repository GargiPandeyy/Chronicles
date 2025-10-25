// game state variables
let currentEra = 'fortran';
let eraData = {};
let fragmentsFound = [];
let score = 0;
let unlockedEras = ['fortran'];
let totalFragments = 0;
let gameState = {};
let currentEraData = null;

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
    
    // load era data
    loadEraData();
    
    // create dig site grid
    createDigSiteGrid();
    
    // load saved progress
    loadGameProgress();
    
    // update display
    updateDisplay();
    
    console.log('game initialized');
}

async function loadEraData() {
    try {
        // load all era data files
        const fortranResponse = await fetch('data/fortran.json');
        const cResponse = await fetch('data/c.json');
        const pythonResponse = await fetch('data/python.json');
        
        eraData.fortran = await fortranResponse.json();
        eraData.c = await cResponse.json();
        eraData.python = await pythonResponse.json();
        
        // set current era data
        currentEraData = eraData[currentEra];
        totalFragments = currentEraData.totalFragments;
        
        console.log('era data loaded successfully');
    } catch (error) {
        console.error('error loading era data:', error);
        // fallback to default values
        totalFragments = 12;
    }
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
    // check if this cell should contain a fragment based on era data
    if (currentEraData && currentEraData.fragments) {
        // each cell has a chance to contain a fragment
        // distribute fragments across the grid
        const fragmentCount = currentEraData.fragments.length;
        const gridSize = 12; // 4x3 grid
        const fragmentProbability = fragmentCount / gridSize;
        
        return Math.random() < fragmentProbability;
    }
    
    // fallback to simple probability
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
    
    // store fragment data
    const fragmentData = getFragmentDataForCell(cellIndex);
    cell.dataset.fragmentId = fragmentData ? fragmentData.id : cellIndex;
    
    // add click handler for fragment details
    cell.addEventListener('click', function() {
        showFragmentDetails(cellIndex);
    });
    
    // show brief notification
    showFragmentNotification(cellIndex);
}

function getFragmentDataForCell(cellIndex) {
    // get a random fragment from current era data
    if (currentEraData && currentEraData.fragments) {
        const fragmentIndex = cellIndex % currentEraData.fragments.length;
        return currentEraData.fragments[fragmentIndex];
    }
    return null;
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
    const cell = digSiteGrid.children[cellIndex];
    const fragmentId = cell.dataset.fragmentId;
    
    // get fragment data
    const fragmentData = getFragmentDataForCell(cellIndex);
    if (!fragmentData) {
        console.log('no fragment data found');
        return;
    }
    
    // show question modal
    showQuestionModal(fragmentData);
}

function showQuestionModal(fragmentData) {
    const modal = document.getElementById('question-modal');
    const codeDisplay = document.getElementById('question-code');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('question-options');
    const feedbackSection = document.getElementById('answer-feedback');
    
    // hide feedback section initially
    feedbackSection.classList.add('hidden');
    
    // display code fragment
    codeDisplay.textContent = fragmentData.code;
    
    // display question
    questionText.textContent = fragmentData.question.text;
    
    // create options
    optionsContainer.innerHTML = '';
    fragmentData.question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.dataset.optionIndex = index;
        
        optionBtn.addEventListener('click', function() {
            handleAnswerSelection(index, fragmentData.question);
        });
        
        optionsContainer.appendChild(optionBtn);
    });
    
    // show modal
    modal.classList.remove('hidden');
    
    // add close functionality
    const closeBtn = document.getElementById('close-modal');
    const continueBtn = document.getElementById('continue-btn');
    
    closeBtn.onclick = function() {
        modal.classList.add('hidden');
    };
    
    continueBtn.onclick = function() {
        modal.classList.add('hidden');
    };
    
    // close on click outside
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };
}

function handleAnswerSelection(selectedIndex, question) {
    const optionsContainer = document.getElementById('question-options');
    const feedbackSection = document.getElementById('answer-feedback');
    const feedbackText = document.getElementById('feedback-text');
    const explanationText = document.getElementById('explanation-text');
    
    // disable all option buttons
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.optionIndex) === selectedIndex) {
            btn.classList.add('selected');
        }
    });
    
    // check if answer is correct
    const isCorrect = selectedIndex === question.correct;
    
    // update score
    if (isCorrect) {
        score += 10;
        feedbackText.textContent = 'Correct! +10 points';
        feedbackText.style.color = '#00ff00';
    } else {
        feedbackText.textContent = 'Incorrect! No points';
        feedbackText.style.color = '#ff0040';
    }
    
    // show explanation with better formatting
    explanationText.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>Explanation:</strong>
        </div>
        <div style="line-height: 1.5;">
            ${question.explanation}
        </div>
    `;
    
    // show feedback section
    feedbackSection.classList.remove('hidden');
    
    // save progress
    saveGameProgress();
    
    // update display
    updateDisplay();
    
    console.log(`answer selected: ${selectedIndex}, correct: ${question.correct}, isCorrect: ${isCorrect}`);
}

function updateDisplay() {
    // update fragment count
    fragmentsFoundDisplay.textContent = fragmentsFound.length;
    
    // update total fragments
    totalFragmentsDisplay.textContent = totalFragments;
    
    // update score
    currentScoreDisplay.textContent = score;
    
    // update era display
    currentEraDisplay.textContent = getEraDisplayName(currentEra);
    
    // update progress bar
    updateProgressBar();
    
    // update era description
    updateEraDescription();
}

function updateEraDescription() {
    const eraDescriptionElement = document.getElementById('era-description');
    if (eraDescriptionElement && currentEraData) {
        eraDescriptionElement.innerHTML = `
            <p><strong>${currentEraData.name} (${currentEraData.year})</strong></p>
            <p>${currentEraData.description}</p>
        `;
    }
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
            
            // update current era data if it changed
            if (eraData[currentEra]) {
                currentEraData = eraData[currentEra];
                totalFragments = currentEraData.totalFragments;
            }
            
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
        unlockedEras: unlockedEras,
        timestamp: Date.now()
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