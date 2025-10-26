// game state variables
let currentEra = 'fortran';
let eraData = {};
let fragmentsFound = [];
let score = 0;
let unlockedEras = ['fortran'];
let totalFragments = 0;
let gameState = {};
let currentEraData = null;
let statistics = {
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    fragmentsCollected: 0
};
let soundEnabled = true;
let achievements = {
    firstDig: false,
    firstFragment: false,
    perfectEra: false,
    allEras: false,
    highScore: false
};

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
    
    // play dig sound
    playSound('dig');
    
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
                // play found sound
                playSound('found');
                
                // update fragment count
                fragmentsFound.push(cellIndex);
                
                // check achievements
                checkAchievements();
                
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
    
    // update score and statistics
    if (isCorrect) {
        score += 10;
        statistics.correctAnswers++;
        feedbackText.textContent = 'Correct! +10 points';
        feedbackText.style.color = '#00ff00';
        playSound('correct');
    } else {
        statistics.incorrectAnswers++;
        feedbackText.textContent = 'Incorrect! No points';
        feedbackText.style.color = '#ff0040';
        playSound('incorrect');
    }
    
    statistics.totalQuestionsAnswered++;
    
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
        // check if we can unlock next era
        checkEraUnlocking();
    }
}

function checkEraUnlocking() {
    const eraOrder = ['fortran', 'c', 'python'];
    const currentIndex = eraOrder.indexOf(currentEra);
    
    if (currentIndex < eraOrder.length - 1) {
        const nextEra = eraOrder[currentIndex + 1];
        if (!unlockedEras.includes(nextEra)) {
            unlockedEras.push(nextEra);
            showEraUnlockedNotification(nextEra);
            playSound('unlock');
            saveGameProgress();
        }
    }
}

function showEraUnlockedNotification(nextEra) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: #ffb000; margin-bottom: 10px;">🎉 New Era Unlocked!</h3>
            <p style="color: #00ffff; font-size: 18px;">${getEraDisplayName(nextEra)}</p>
            <p style="color: #ffffff; margin-top: 10px;">You can now explore the next programming era!</p>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: #00ff00;
        padding: 30px;
        border: 3px solid #ffb000;
        font-family: 'Courier New', monospace;
        z-index: 3000;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 0 30px rgba(255, 176, 0, 0.5);
    `;
    
    document.body.appendChild(notification);
    
    // remove notification after 4 seconds
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
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
            statistics = data.statistics || {
                totalQuestionsAnswered: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                fragmentsCollected: 0
            };
            
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
    
    // update era buttons after loading
    setTimeout(updateEraButtons, 200);
}

function saveGameProgress() {
    // save to localStorage
    const data = {
        currentEra: currentEra,
        fragmentsFound: fragmentsFound,
        score: score,
        unlockedEras: unlockedEras,
        statistics: statistics,
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
    const modal = document.getElementById('museum-modal');
    const museumContent = document.getElementById('museum-content');
    
    // build museum content
    museumContent.innerHTML = buildMuseumContent();
    
    // show modal
    modal.classList.remove('hidden');
    
    // add close functionality
    const closeBtn = document.getElementById('close-museum');
    closeBtn.onclick = function() {
        modal.classList.add('hidden');
    };
    
    // close on click outside
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };
}

function buildMuseumContent() {
    let content = '<div class="museum-section">';
    
    // museum header
    content += `
        <div class="museum-header">
            <h2 style="color: #ffb000; text-align: center; margin-bottom: 20px;">🏛️ Code Artifact Museum</h2>
            <div class="museum-stats">
                <div class="stat-item">
                    <span class="stat-label">Total Fragments:</span>
                    <span class="stat-value">${fragmentsFound.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Score:</span>
                    <span class="stat-value">${score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Accuracy:</span>
                    <span class="stat-value">${getAccuracyPercentage()}%</span>
                </div>
            </div>
            <div class="timeline-section">
                <h3 style="color: #00ffff; margin-bottom: 15px;">📅 Programming History Timeline</h3>
                ${buildTimeline()}
            </div>
        </div>
    `;
    
    // era sections
    const eraOrder = ['fortran', 'c', 'python'];
    eraOrder.forEach(era => {
        if (eraData[era]) {
            content += buildEraSection(era);
        }
    });
    
    content += '</div>';
    return content;
}

function buildEraSection(era) {
    const eraInfo = eraData[era];
    const isUnlocked = unlockedEras.includes(era);
    const isCurrentEra = era === currentEra;
    
    let sectionClass = 'era-section';
    if (!isUnlocked) sectionClass += ' locked';
    if (isCurrentEra) sectionClass += ' current';
    
    let content = `
        <div class="${sectionClass}">
            <h3 class="era-title">
                ${eraInfo.name} (${eraInfo.year})
                ${isCurrentEra ? ' - Current Era' : ''}
                ${!isUnlocked ? ' - Locked' : ''}
            </h3>
            <p class="era-description">${eraInfo.description}</p>
    `;
    
    if (isUnlocked) {
        content += `
            <div class="era-fragments">
                <h4>Code Fragments:</h4>
                <div class="fragments-grid">
        `;
        
        // show fragments for this era
        eraInfo.fragments.forEach((fragment, index) => {
            content += `
                <div class="fragment-card">
                    <div class="fragment-title">${fragment.title}</div>
                    <div class="fragment-code">
                        <pre>${fragment.code}</pre>
                    </div>
                    <div class="fragment-description">${fragment.description}</div>
                    <div class="fragment-actions">
                        <button class="compare-btn" onclick="showCodeComparison('${era}', ${index})">
                            Compare Across Eras
                        </button>
                    </div>
                </div>
            `;
        });
        
        content += `
                </div>
            </div>
        `;
    }
    
    content += '</div>';
    return content;
}

function buildTimeline() {
    const timelineData = [
        { year: '1957', name: 'FORTRAN', description: 'First high-level language', unlocked: unlockedEras.includes('fortran') },
        { year: '1972', name: 'C', description: 'System programming language', unlocked: unlockedEras.includes('c') },
        { year: '1991', name: 'Python', description: 'Modern readable language', unlocked: unlockedEras.includes('python') }
    ];
    
    let timeline = '<div class="timeline">';
    
    timelineData.forEach((item, index) => {
        const isUnlocked = item.unlocked;
        const isCurrent = item.name.toLowerCase() === currentEra;
        const timelineClass = `timeline-item ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;
        
        timeline += `
            <div class="${timelineClass}">
                <div class="timeline-year">${item.year}</div>
                <div class="timeline-content">
                    <div class="timeline-name">${item.name}</div>
                    <div class="timeline-description">${item.description}</div>
                    ${isUnlocked ? '<div class="timeline-status">✓ Unlocked</div>' : '<div class="timeline-status">🔒 Locked</div>'}
                </div>
            </div>
        `;
        
        // add connector line (except for last item)
        if (index < timelineData.length - 1) {
            timeline += '<div class="timeline-connector"></div>';
        }
    });
    
    timeline += '</div>';
    return timeline;
}

function showCodeComparison(era, fragmentIndex) {
    const fragment = eraData[era].fragments[fragmentIndex];
    const fragmentTitle = fragment.title;
    
    // find similar fragments across eras
    const comparisons = findSimilarFragments(fragmentTitle);
    
    // create comparison modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: var(--terminal-bg);
        border: 2px solid var(--terminal-amber);
        padding: 20px;
        max-width: 1000px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        color: var(--terminal-green);
        font-family: var(--font-mono);
    `;
    
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: var(--terminal-amber); margin: 0;">Code Evolution: ${fragmentTitle}</h2>
            <button onclick="this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement)" 
                    style="background: var(--terminal-red); color: var(--terminal-bg); border: none; padding: 8px 15px; cursor: pointer;">
                Close
            </button>
        </div>
        <div class="comparison-grid">
            ${buildComparisonGrid(comparisons)}
        </div>
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

function findSimilarFragments(title) {
    const comparisons = [];
    const eraOrder = ['fortran', 'c', 'python'];
    
    eraOrder.forEach(era => {
        if (eraData[era]) {
            const fragment = eraData[era].fragments.find(f => 
                f.title.toLowerCase().includes(title.toLowerCase()) ||
                title.toLowerCase().includes(f.title.toLowerCase())
            );
            
            if (fragment) {
                comparisons.push({
                    era: era,
                    eraName: eraData[era].name,
                    year: eraData[era].year,
                    fragment: fragment
                });
            }
        }
    });
    
    return comparisons;
}

function buildComparisonGrid(comparisons) {
    let grid = '';
    
    comparisons.forEach(comparison => {
        grid += `
            <div class="comparison-item">
                <div class="comparison-header">
                    <h3 style="color: var(--terminal-cyan); margin: 0;">${comparison.eraName} (${comparison.year})</h3>
                </div>
                <div class="comparison-code">
                    <pre style="color: var(--terminal-cyan); margin: 0; font-size: 12px;">${comparison.fragment.code}</pre>
                </div>
                <div class="comparison-description">
                    <p style="color: var(--terminal-white); margin: 10px 0 0 0; font-size: 12px;">${comparison.fragment.description}</p>
                </div>
            </div>
        `;
    });
    
    return grid;
}

// sound system
function playSound(type) {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // set frequency and duration based on sound type
    let frequency, duration;
    switch(type) {
        case 'dig':
            frequency = 200;
            duration = 0.1;
            break;
        case 'found':
            frequency = 800;
            duration = 0.3;
            break;
        case 'correct':
            frequency = 600;
            duration = 0.2;
            break;
        case 'incorrect':
            frequency = 200;
            duration = 0.3;
            break;
        case 'unlock':
            frequency = 1000;
            duration = 0.5;
            break;
        default:
            frequency = 440;
            duration = 0.1;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        soundBtn.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
    }
    console.log('sound', soundEnabled ? 'enabled' : 'disabled');
}

function checkAchievements() {
    // first dig achievement
    if (!achievements.firstDig) {
        achievements.firstDig = true;
        showAchievement('First Dig', 'You made your first excavation!');
    }
    
    // first fragment achievement
    if (!achievements.firstFragment && fragmentsFound.length >= 1) {
        achievements.firstFragment = true;
        showAchievement('Code Discoverer', 'You found your first code fragment!');
    }
    
    // perfect era achievement
    if (!achievements.perfectEra && fragmentsFound.length >= totalFragments) {
        achievements.perfectEra = true;
        showAchievement('Era Master', 'You completed an entire programming era!');
    }
    
    // all eras achievement
    if (!achievements.allEras && unlockedEras.length >= 3) {
        achievements.allEras = true;
        showAchievement('Programming Historian', 'You unlocked all programming eras!');
    }
    
    // high score achievement
    if (!achievements.highScore && score >= 100) {
        achievements.highScore = true;
        showAchievement('High Scorer', 'You reached 100 points!');
    }
}

function showAchievement(title, description) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: #ffb000; margin-bottom: 10px;">🏆 Achievement Unlocked!</h3>
            <h4 style="color: #00ffff; margin-bottom: 5px;">${title}</h4>
            <p style="color: #ffffff; margin: 0;">${description}</p>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.95);
        color: #00ff00;
        padding: 20px;
        border: 3px solid #ffb000;
        font-family: 'Courier New', monospace;
        z-index: 3000;
        max-width: 300px;
        box-shadow: 0 0 20px rgba(255, 176, 0, 0.5);
        animation: slideIn 0.5s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // remove notification after 4 seconds
    setTimeout(function() {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }
    }, 4000);
}

function showHelp() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: var(--terminal-bg);
        border: 2px solid var(--terminal-green);
        padding: 30px;
        max-width: 600px;
        width: 100%;
        color: var(--terminal-green);
        font-family: var(--font-mono);
        line-height: 1.6;
    `;
    
    content.innerHTML = `
        <h2 style="color: var(--terminal-amber); margin-bottom: 20px; text-align: center;">🎮 How to Play Code Archaeology</h2>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: var(--terminal-cyan);">Objective</h3>
            <p>Excavate code fragments from different programming eras and learn about the evolution of programming languages!</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: var(--terminal-cyan);">How to Play</h3>
            <ol style="padding-left: 20px;">
                <li><strong>Dig:</strong> Click on grid cells to excavate code fragments</li>
                <li><strong>Answer:</strong> When you find a fragment, answer the question about it</li>
                <li><strong>Learn:</strong> Read explanations to understand programming history</li>
                <li><strong>Progress:</strong> Complete all fragments in an era to unlock the next</li>
                <li><strong>Explore:</strong> Visit the Museum to see all your discoveries</li>
            </ol>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: var(--terminal-cyan);">Eras</h3>
            <ul style="padding-left: 20px;">
                <li><strong>FORTRAN (1957):</strong> The first high-level programming language</li>
                <li><strong>C (1972):</strong> System programming and portability</li>
                <li><strong>Python (1991):</strong> Modern, readable programming</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement)" 
                    style="background: var(--terminal-green); color: var(--terminal-bg); border: none; padding: 10px 20px; font-family: var(--font-mono); cursor: pointer;">
                Got it!
            </button>
        </div>
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

// add event listeners for action buttons
document.addEventListener('DOMContentLoaded', function() {
    // these will be added after the buttons exist
    setTimeout(function() {
        const resetBtn = document.getElementById('reset-btn');
        const museumBtn = document.getElementById('museum-btn');
        const helpBtn = document.getElementById('help-btn');
        
        // era navigation buttons
        const fortranBtn = document.getElementById('era-fortran');
        const cBtn = document.getElementById('era-c');
        const pythonBtn = document.getElementById('era-python');
        
        if (resetBtn) resetBtn.addEventListener('click', resetProgress);
        if (museumBtn) museumBtn.addEventListener('click', showMuseum);
        if (helpBtn) helpBtn.addEventListener('click', showHelp);
        
        // era navigation
        if (fortranBtn) fortranBtn.addEventListener('click', () => switchEra('fortran'));
        if (cBtn) cBtn.addEventListener('click', () => switchEra('c'));
        if (pythonBtn) pythonBtn.addEventListener('click', () => switchEra('python'));
        
        // update era button states
        updateEraButtons();
    }, 100);
});

function switchEra(newEra) {
    if (!unlockedEras.includes(newEra)) {
        console.log(`era ${newEra} is locked`);
        return;
    }
    
    // save current progress
    saveGameProgress();
    
    // switch to new era
    currentEra = newEra;
    currentEraData = eraData[currentEra];
    totalFragments = currentEraData.totalFragments;
    
    // reset fragments found for new era
    fragmentsFound = [];
    
    // recreate dig site grid
    createDigSiteGrid();
    
    // update display
    updateDisplay();
    updateEraButtons();
    
    console.log(`switched to era: ${newEra}`);
}

function updateEraButtons() {
    const fortranBtn = document.getElementById('era-fortran');
    const cBtn = document.getElementById('era-c');
    const pythonBtn = document.getElementById('era-python');
    
    const buttons = [
        { btn: fortranBtn, era: 'fortran' },
        { btn: cBtn, era: 'c' },
        { btn: pythonBtn, era: 'python' }
    ];
    
    buttons.forEach(({ btn, era }) => {
        if (btn) {
            // remove all classes
            btn.classList.remove('active', 'locked');
            
            if (unlockedEras.includes(era)) {
                if (era === currentEra) {
                    btn.classList.add('active');
                }
            } else {
                btn.classList.add('locked');
            }
        }
    });
}