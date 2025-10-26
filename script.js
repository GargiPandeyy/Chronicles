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

// minesweeper state variables
let fragmentPositions = [];
let bombPositions = [];
let gridSize = 12; // 4x3 grid
let cellsRevealed = [];
let gameInitialized = false;

// quiz state variables
let currentEraQuiz = {
    questions: [],
    currentQuestionIndex: 0,
    correctAnswers: 0,
    answeredQuestions: 0
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
    console.log('[INIT] Initializing Code Archaeology Game...');
    
    // get dom elements
    digSiteGrid = document.getElementById('dig-site-grid');
    fragmentsFoundDisplay = document.getElementById('fragments-found');
    totalFragmentsDisplay = document.getElementById('total-fragments');
    currentScoreDisplay = document.getElementById('current-score');
    currentEraDisplay = document.getElementById('current-era');
    progressFill = document.getElementById('progress-fill');
    progressText = document.getElementById('progress-text');
    
    console.log('[DOM] DOM Elements:', {
        digSiteGrid: !!digSiteGrid,
        fragmentsFoundDisplay: !!fragmentsFoundDisplay,
        totalFragmentsDisplay: !!totalFragmentsDisplay,
        currentScoreDisplay: !!currentScoreDisplay,
        currentEraDisplay: !!currentEraDisplay,
        progressFill: !!progressFill,
        progressText: !!progressText
    });
    
    // load era data
    loadEraData();
    
    // create dig site grid
    createDigSiteGrid();
    
    // load saved progress
    loadGameProgress();
    
    // update display
    updateDisplay();
    
    console.log('[INIT] Game initialized successfully');
    console.log('[STATE] Current Game State:', {
        currentEra,
        fragmentsFound: fragmentsFound.length,
        score,
        unlockedEras,
        totalFragments
    });
}

async function loadEraData() {
    console.log('[DATA] Loading era data...');
    try {
        // load all era data files
        const fortranResponse = await fetch('data/fortran.json');
        const cResponse = await fetch('data/c.json');
        const pythonResponse = await fetch('data/python.json');
        
        eraData.fortran = await fortranResponse.json();
        eraData.c = await cResponse.json();
        eraData.python = await pythonResponse.json();
        
        console.log('[DATA] Era data loaded:', {
            fortran: { fragments: eraData.fortran.fragments.length, totalFragments: eraData.fortran.totalFragments },
            c: { fragments: eraData.c.fragments.length, totalFragments: eraData.c.totalFragments },
            python: { fragments: eraData.python.fragments.length, totalFragments: eraData.python.totalFragments }
        });
        
        // set current era data
        currentEraData = eraData[currentEra];
        // Use only 6 fragments per era for minesweeper game
        totalFragments = 6;
        
        console.log('[DATA] Era data loaded successfully');
        console.log('[ERA] Current era data:', {
            era: currentEra,
            name: currentEraData.name,
            year: currentEraData.year,
            fragments: currentEraData.fragments.length,
            totalFragments: currentEraData.totalFragments
        });
    } catch (error) {
        console.error('[ERROR] Error loading era data:', error);
        // fallback to default values
        totalFragments = 6; // Always use 6 fragments for minesweeper
    }
}

function createDigSiteGrid() {
    // clear existing grid
    digSiteGrid.innerHTML = '';
    
    // reset game state for minesweeper
    cellsRevealed = [];
    fragmentPositions = [];
    bombPositions = [];
    gameInitialized = false;
    
    // create 4x3 grid (12 cells total)
    for (let i = 0; i < gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'dig-cell';
        cell.dataset.cellIndex = i;
        cell.dataset.revealed = 'false';
        cell.dataset.bomb = 'false';
        cell.dataset.fragment = 'false';
        
        // add click handler
        cell.addEventListener('click', function() {
            handleDigClick(i);
        });
        
        // add hover effect
        cell.addEventListener('mouseenter', function() {
            if (cell.dataset.revealed === 'false') {
                cell.textContent = '?';
                cell.style.color = '#00ff00';
            }
        });
        
        cell.addEventListener('mouseleave', function() {
            if (cell.dataset.revealed === 'false') {
                cell.textContent = '';
            }
        });
        
        digSiteGrid.appendChild(cell);
    }
    
}

function handleDigClick(cellIndex) {
    // initialize game on first click
    if (!gameInitialized) {
        initializeMinesweeper(cellIndex);
        gameInitialized = true;
    }
    
    const cell = digSiteGrid.children[cellIndex];
    
    // check if already excavated
    if (cell.dataset.revealed === 'true') {
        if (cell.dataset.fragment === 'true') {
            showFragmentDetails(cellIndex);
        }
        return;
    }
    
    // check if it's a bomb
    if (cell.dataset.bomb === 'true') {
        handleBombExplosion(cellIndex);
        return;
    }
    
    excavateCell(cell, cellIndex);
}

function initializeMinesweeper(firstClickIndex) {
    if (!currentEraData) {
        return;
    }
    
    // Use only 6 fragments to have 6 bombs in a 12-cell grid
    const numFragments = Math.min(6, currentEraData.fragments.length);
    const numBombs = gridSize - numFragments;
    
    // generate fragment positions (excluding first click)
    const availablePositions = [];
    for (let i = 0; i < gridSize; i++) {
        if (i !== firstClickIndex) {
            availablePositions.push(i);
        }
    }
    
    // shuffle available positions
    for (let i = availablePositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // assign fragments
    fragmentPositions = [];
    const fragmentsToAssign = Math.min(numFragments, availablePositions.length);
    for (let i = 0; i < fragmentsToAssign; i++) {
        fragmentPositions.push(availablePositions[i]);
    }
    
    // assign bombs to remaining positions
    bombPositions = [];
    for (let i = fragmentsToAssign; i < availablePositions.length; i++) {
        bombPositions.push(availablePositions[i]);
    }
    
    // mark cells with bomb/fragment info
    fragmentPositions.forEach(pos => {
        if (digSiteGrid.children[pos]) {
            digSiteGrid.children[pos].dataset.fragment = 'true';
        }
    });
    
    bombPositions.forEach(pos => {
        if (digSiteGrid.children[pos]) {
            digSiteGrid.children[pos].dataset.bomb = 'true';
        }
    });
}

function handleBombExplosion(cellIndex) {
    
    // play explosion sound
    playSound('incorrect');
    
    // reveal the bomb cell
    const cell = digSiteGrid.children[cellIndex];
    cell.dataset.revealed = 'true';
    cell.textContent = '💣';
    cell.style.color = '#ff0040';
    cell.style.backgroundColor = '#ff0000';
    cell.classList.add('bomb');
    
    // show game over message
    showGameOverModal();
    
}

function showGameOverModal() {
    console.log('[MODAL] Showing game over modal');
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: var(--terminal-bg);
        border: 3px solid var(--terminal-red);
        padding: 40px;
        max-width: 500px;
        width: 100%;
        color: var(--terminal-green);
        font-family: var(--font-mono);
        text-align: center;
        box-shadow: 0 0 50px rgba(255, 0, 64, 0.5);
    `;
    
    content.innerHTML = `
        <h1 style="color: var(--terminal-red); font-size: 32px; margin-bottom: 20px;">💥 BUSTED!</h1>
        <h2 style="color: var(--terminal-amber); margin-bottom: 30px;">You Hit a Bomb!</h2>
        
        <div style="background: var(--terminal-dark-gray); padding: 20px; margin-bottom: 30px; border: 1px solid var(--terminal-red);">
            <p style="color: var(--terminal-white); font-size: 16px; line-height: 1.5;">
                You clicked on a bomb! Your progress for this era has been reset.
                You'll need to dig again to find all the code fragments.
            </p>
        </div>
        
        <div style="margin-bottom: 30px;">
            <p style="color: var(--terminal-white); font-size: 16px; line-height: 1.5;">
                Be more careful next time - examine the fragments you've found and use logic to determine safe dig sites!
            </p>
        </div>
        
        <button onclick="restartCurrentEra(); this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement)" 
                style="background: var(--terminal-red); color: var(--terminal-bg); border: none; padding: 12px 24px; font-family: var(--font-mono); cursor: pointer; font-size: 16px;">
            Try Again
        </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

function restartCurrentEra() {
    console.log('[RESET] Restarting current era minesweeper');
    
    // reset fragments found for current era
    fragmentsFound = [];
    
    // recreate grid
    createDigSiteGrid();
    
    // update display
    updateDisplay();
    
    // save progress
    saveGameProgress();
    
    console.log('[RESET] Era restarted successfully');
}

function excavateCell(cell, cellIndex) {
    // mark as revealed
    cell.dataset.revealed = 'true';
    cellsRevealed.push(cellIndex);
    
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
        
        // check if this cell has a fragment
        const hasFragment = cell.dataset.fragment === 'true';
        
        setTimeout(function() {
            // remove dust clearing effect
            cell.classList.remove('dust-clearing');
            
            if (hasFragment) {
                // play found sound
                playSound('found');
                
                // update fragment count
                if (!fragmentsFound.includes(cellIndex)) {
                    fragmentsFound.push(cellIndex);
                }
                
                // check achievements
                checkAchievements();
                
                // update display
                updateDisplay();
                
                // show fragment content
                showFragmentContent(cellIndex);
                
                // check if all fragments found
                checkAllFragmentsFound();
                
                // save progress
                saveGameProgress();
            } else {
                // empty dig site
                cell.textContent = '';
                cell.style.color = '#808080';
                cell.style.backgroundColor = 'rgba(128, 128, 128, 0.2)';
            }
        }, 400);
        
    }, 300);
}

function checkAllFragmentsFound() {
    // Don't trigger quiz if we're already in quiz or switching eras
    if (document.querySelectorAll('[id^="quiz-modal-"]').length > 0) {
        return;
    }
    
    if (fragmentsFound.length >= totalFragments) {
        setTimeout(function() {
            showEraCompletionQuiz();
        }, 1500);
    }
}

function simulateFragmentDiscovery(cellIndex) {
    
    // check if this cell should contain a fragment based on era data
    if (currentEraData && currentEraData.fragments) {
        const fragmentCount = currentEraData.fragments.length;
        const gridSize = 12; // 4x3 grid
        
        console.log(`[FRAGMENT] Fragment distribution check:`, {
            cellIndex,
            fragmentCount,
            gridSize,
            era: currentEra
        });
        
        // Create a deterministic pattern for fragment placement
        // Use a simple modulo approach to distribute fragments evenly
        const fragmentPositions = [];
        
        // Calculate which cells should contain fragments
        for (let i = 0; i < fragmentCount; i++) {
            // Use a deterministic formula based on era and fragment index
            const basePosition = (i * gridSize) / fragmentCount;
            const position = Math.floor(basePosition);
            fragmentPositions.push(position);
        }
        
        // Add some era-specific variation to make it more interesting
        const eraSeed = currentEra.charCodeAt(0);
        const adjustedPositions = fragmentPositions.map((pos, index) => {
            const variation = (eraSeed + index) % 3 - 1; // -1, 0, or 1
            const adjustedPos = Math.max(0, Math.min(gridSize - 1, pos + variation));
            return adjustedPos;
        });
        
        // Remove duplicates
        const uniquePositions = [...new Set(adjustedPositions)];
        
        console.log(`[FRAGMENT] Fragment positions for ${currentEra}:`, {
            originalPositions: fragmentPositions,
            adjustedPositions: adjustedPositions,
            uniquePositions: uniquePositions,
            hasFragment: uniquePositions.includes(cellIndex)
        });
        
        return uniquePositions.includes(cellIndex);
    }
    
    console.log(`[FRAGMENT] No era data available, using fallback probability`);
    // fallback to lower probability
    return Math.random() < 0.3;
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
    // get fragment from current era data based on position in fragmentPositions
    if (fragmentPositions && currentEraData && currentEraData.fragments) {
        const positionInFragmentArray = fragmentPositions.indexOf(cellIndex);
        if (positionInFragmentArray !== -1 && positionInFragmentArray < currentEraData.fragments.length) {
            // Use the actual position to get different fragments
            const fragmentIndex = positionInFragmentArray;
            return currentEraData.fragments[fragmentIndex];
        }
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
    console.log('[QUIZ] Answer selected:', selectedIndex);
    console.log('[QUIZ] Correct answer:', question.correct);
    
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
    console.log('[QUIZ] Answer correct:', isCorrect);
    
    // update score and statistics
    if (isCorrect) {
        score += 10;
        statistics.correctAnswers++;
        feedbackText.textContent = 'Correct! +10 points';
        feedbackText.style.color = '#00ff00';
        playSound('correct');
        console.log('[QUIZ] Correct answer - points awarded');
    } else {
        statistics.incorrectAnswers++;
        feedbackText.textContent = 'Incorrect! No points - Try again';
        feedbackText.style.color = '#ff0040';
        playSound('incorrect');
        console.log('[QUIZ] Incorrect answer - quiz restart needed');
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
    
    console.log('[QUIZ] Answer handling complete');
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
        // show era completion quiz
        setTimeout(function() {
            showEraCompletionQuiz();
        }, 1500);
        // check if we can unlock next era
        checkEraUnlocking();
    }
}

function showEraCompletionQuiz() {
    console.log('[QUIZ] Starting era completion quiz');
    console.log('[QUIZ] Era:', currentEra, 'Fragments found:', fragmentsFound.length);
    
    // Prevent duplicate quiz displays
    if (document.querySelectorAll('[id^="quiz-modal-"]').length > 0) {
        console.log('[QUIZ] Quiz already showing, skipping');
        return;
    }
    
    // Initialize quiz state
    currentEraQuiz = {
        questions: [],
        currentQuestionIndex: 0,
        correctAnswers: 0,
        answeredQuestions: 0
    };
    
    // Select 5 random questions from the era fragments
    if (!currentEraData || !currentEraData.fragments.length) {
        console.error('[QUIZ] No era data available');
        return;
    }
    
    const availableFragments = currentEraData.fragments;
    const selectedFragments = [];
    
    // Shuffle and take first 5
    const shuffled = [...availableFragments];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    for (let i = 0; i < Math.min(5, shuffled.length); i++) {
        // Store full fragment info including code
        currentEraQuiz.questions.push({
            question: shuffled[i].question,
            code: shuffled[i].code,
            title: shuffled[i].title
        });
    }
    
    console.log('[QUIZ] Selected 5 questions for quiz');
    console.log('[QUIZ] Questions:', currentEraQuiz.questions.map(f => f.question.text));
    console.log('[QUIZ] Fragment info:', currentEraQuiz.questions.map(f => ({ title: f.title, hasCode: !!f.code })));
    
    // Show first question
    console.log('[QUIZ] About to show first question');
    showQuizQuestion(0);
    console.log('[QUIZ] First question display complete');
}

function showQuizQuestion(questionIndex) {
    if (questionIndex >= currentEraQuiz.questions.length) {
        // All questions answered, check results
        showQuizResults();
        return;
    }
    
    console.log(`[QUIZ] Showing question ${questionIndex + 1} of ${currentEraQuiz.questions.length}`);
    console.log(`[QUIZ] Current quiz state:`, {
        questionsCount: currentEraQuiz.questions.length,
        correctAnswers: currentEraQuiz.correctAnswers,
        answeredQuestions: currentEraQuiz.answeredQuestions
    });
    
    const modal = document.createElement('div');
    modal.id = `quiz-modal-${questionIndex}`;
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: var(--terminal-bg);
        border: 3px solid var(--terminal-amber);
        padding: 40px;
        max-width: 600px;
        width: 100%;
        color: var(--terminal-green);
        font-family: var(--font-mono);
        text-align: center;
        box-shadow: 0 0 50px rgba(255, 176, 0, 0.5);
    `;
    
    const fragmentInfo = currentEraQuiz.questions[questionIndex];
    const question = fragmentInfo.question;
    
    content.innerHTML = `
        <h1 style="color: var(--terminal-amber); font-size: 28px; margin-bottom: 20px;">Quiz Question ${questionIndex + 1}/5</h1>
        <h2 style="color: var(--terminal-cyan); margin-bottom: 30px;">${getEraDisplayName(currentEra)}</h2>
        
        <div style="background: var(--terminal-dark-gray); padding: 20px; margin-bottom: 30px; border: 1px solid var(--terminal-green);">
            <h3 style="color: var(--terminal-white); margin-bottom: 15px;">Question ${questionIndex + 1}</h3>
            ${fragmentInfo.code ? `
                <div style="background: var(--terminal-bg); border: 1px solid var(--terminal-cyan); padding: 10px; margin-bottom: 15px; text-align: left;">
                    <div style="color: var(--terminal-gray); font-size: 12px; margin-bottom: 5px;">Code:</div>
                    <pre style="color: var(--terminal-cyan); font-family: var(--font-mono); font-size: 12px; margin: 0; white-space: pre-wrap;">${fragmentInfo.code}</pre>
                </div>
            ` : ''}
            <p style="color: var(--terminal-white); margin-bottom: 20px; font-size: 18px; line-height: 1.5;">${question.text}</p>
            
            <div id="quiz-options-container" style="margin-top: 20px;">
                <!-- Options will be populated below -->
            </div>
        </div>
        
        <div style="color: var(--terminal-gray); margin-bottom: 20px;">
            Progress: ${currentEraQuiz.correctAnswers} correct out of ${currentEraQuiz.answeredQuestions} answered
        </div>
        
        <div id="quiz-feedback" class="feedback hidden" style="margin-bottom: 30px; padding: 15px; border: 1px solid var(--terminal-green); background: rgba(0, 255, 0, 0.05);">
            <div id="quiz-feedback-text" style="color: var(--terminal-white); margin-bottom: 10px; font-weight: bold;"></div>
            <div id="quiz-explanation-text" style="color: var(--terminal-gray); margin-bottom: 15px; line-height: 1.5;"></div>
            <button onclick="nextQuizQuestion()" 
                    style="background: var(--terminal-green); color: var(--terminal-bg); border: none; padding: 10px 20px; font-family: var(--font-mono); cursor: pointer; font-size: 16px; margin-top: 10px;">
                Next Question
            </button>
        </div>
    `;
    
    // Add options with randomization
    const optionsContainer = content.querySelector('#quiz-options-container');
    
    // Create array of {option, originalIndex}
    const indexedOptions = question.options.map((option, index) => ({ option, originalIndex: index }));
    
    // Shuffle the options
    for (let i = indexedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
    }
    
    // Create buttons with shuffled options, but track original index
    indexedOptions.forEach((item, displayIndex) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = item.option;
        optionBtn.dataset.optionIndex = item.originalIndex; // Store original index for checking
        optionBtn.style.width = '100%';
        optionBtn.style.marginBottom = '10px';
        optionBtn.style.padding = '12px';
        optionBtn.style.fontSize = '14px';
        optionBtn.style.cursor = 'pointer';
        
        optionBtn.addEventListener('click', function() {
            handleQuizAnswer(item.originalIndex, fragmentInfo, modal, content);
        });
        
        optionsContainer.appendChild(optionBtn);
    });
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Make functions available globally
    window.nextQuizQuestion = function() {
        const nextIndex = questionIndex + 1;
        modal.remove();
        showQuizQuestion(nextIndex);
    };
}

function handleQuizAnswer(selectedIndex, fragmentInfo, modal, content) {
    const question = fragmentInfo.question;
    console.log('[QUIZ] Answer selected:', selectedIndex);
    console.log('[QUIZ] Correct answer:', question.correct);
    
    const isCorrect = selectedIndex === question.correct;
    const feedbackSection = content.querySelector('#quiz-feedback');
    const feedbackText = content.querySelector('#quiz-feedback-text');
    const explanationText = content.querySelector('#quiz-explanation-text');
    const optionsContainer = content.querySelector('#quiz-options-container');
    
    // disable all buttons
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.optionIndex) === selectedIndex) {
            btn.classList.add('selected');
        }
    });
    
    currentEraQuiz.answeredQuestions++;
    
    if (isCorrect) {
        currentEraQuiz.correctAnswers++;
        feedbackText.textContent = 'Correct! ✓';
        feedbackText.style.color = '#00ff00';
        playSound('correct');
        console.log('[QUIZ] Correct answer');
    } else {
        feedbackText.textContent = 'Incorrect ✗';
        feedbackText.style.color = '#ff0040';
        playSound('incorrect');
        console.log('[QUIZ] Incorrect answer');
    }
    
    explanationText.innerHTML = `
        <div style="margin-bottom: 10px;"><strong>Explanation:</strong></div>
        <div>${question.explanation}</div>
    `;
    
    feedbackSection.classList.remove('hidden');
    
    // Update progress display
    const progressText = content.querySelector('div[style*="Progress:"]');
    if (progressText) {
        progressText.textContent = `Progress: ${currentEraQuiz.correctAnswers} correct out of ${currentEraQuiz.answeredQuestions} answered`;
    }
}

function showQuizResults() {
    console.log('[QUIZ] Showing quiz results');
    console.log('[QUIZ] Correct answers:', currentEraQuiz.correctAnswers, 'out of', currentEraQuiz.answeredQuestions);
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: var(--terminal-bg);
        border: 3px solid var(--terminal-amber);
        padding: 40px;
        max-width: 600px;
        width: 100%;
        color: var(--terminal-green);
        font-family: var(--font-mono);
        text-align: center;
        box-shadow: 0 0 50px rgba(255, 176, 0, 0.5);
    `;
    
    const requiredCorrect = 3;
    const passed = currentEraQuiz.correctAnswers >= requiredCorrect;
    
    content.innerHTML = `
        <h1 style="color: ${passed ? 'var(--terminal-green)' : 'var(--terminal-red)'}; font-size: 32px; margin-bottom: 20px;">
            ${passed ? '✓ Quiz Passed!' : '✗ Quiz Failed'}
        </h1>
        <h2 style="color: var(--terminal-cyan); margin-bottom: 30px;">${getEraDisplayName(currentEra)}</h2>
        
        <div style="background: var(--terminal-dark-gray); padding: 20px; margin-bottom: 30px; border: 1px solid var(--terminal-green);">
            <h3 style="color: var(--terminal-white); margin-bottom: 15px;">Quiz Results</h3>
            <div style="font-size: 20px; margin-bottom: 10px;">
                <span style="color: var(--terminal-cyan);">Correct: </span>
                <span style="color: ${currentEraQuiz.correctAnswers >= requiredCorrect ? 'var(--terminal-green)' : 'var(--terminal-red)'}; font-weight: bold;">${currentEraQuiz.correctAnswers} / ${currentEraQuiz.answeredQuestions}</span>
            </div>
            <div style="color: var(--terminal-gray);">
                Required: ${requiredCorrect} correct to advance
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <p style="color: var(--terminal-white); font-size: 16px; line-height: 1.5;">
                ${passed ? 
                    'Congratulations! You scored enough points to advance to the next era!' : 
                    'You need at least 3 correct answers to advance. Try again to dig more fragments!'}
            </p>
        </div>
        
        <button onclick="closeQuizResults()" 
                style="background: ${passed ? 'var(--terminal-green)' : 'var(--terminal-red)'}; color: var(--terminal-bg); border: none; padding: 12px 24px; font-family: var(--font-mono); cursor: pointer; font-size: 16px;">
            ${passed ? 'Continue to Next Era' : 'Retry Quiz'}
        </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Make function available globally
    window.closeQuizResults = function() {
        console.log('[QUIZ] Closing quiz results modal');
        modal.remove();
        
        // Clean up any remaining quiz modals
        const remainingModals = document.querySelectorAll('[id^="quiz-modal-"]');
        remainingModals.forEach(m => m.remove());
        
        if (passed) {
            console.log('[QUIZ] Quiz passed - resetting for next era');
            // Reset fragments found for next era
            fragmentsFound = [];
            
            // Clear quiz state to prevent re-triggering
            currentEraQuiz = {
                questions: [],
                currentQuestionIndex: 0,
                correctAnswers: 0,
                answeredQuestions: 0
            };
            
            // Check if we need to unlock next era
            checkEraUnlocking();
            
            // Determine next action based on whether there are more eras
            const currentIndex = ['fortran', 'c', 'python'].indexOf(currentEra);
            const isLastEra = currentIndex === 2; // Python is last
            
            if (isLastEra) {
                console.log('[QUIZ] Final era (Python) completed - showing final screen');
                // This is the last era, show completion screen after a delay
                setTimeout(function() {
                    checkGameCompletion();
                }, 500);
            } else {
                console.log('[QUIZ] Switching to next era');
                switchToNextEra();
            }
        } else {
            console.log('[QUIZ] Quiz failed - restarting minesweeper');
            restartCurrentEra();
        }
    };
    
    if (passed) {
        playSound('unlock');
    } else {
        playSound('incorrect');
    }
}

function switchToNextEra() {
    const eraOrder = ['fortran', 'c', 'python'];
    const currentIndex = eraOrder.indexOf(currentEra);
    
    if (currentIndex < eraOrder.length - 1) {
        const nextEra = eraOrder[currentIndex + 1];
        if (unlockedEras.includes(nextEra)) {
            switchEra(nextEra);
        }
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
    
    // DON'T check game completion here - it's handled in closeQuizResults()
    // This prevents completion screen from showing before quiz
}

function checkGameCompletion() {
    // check if all eras have been completed (all fragments found)
    const allErasCompleted = unlockedEras.length >= 3;
    
    // Don't show completion screen if quiz is in progress or showing
    if (document.querySelectorAll('[id^="quiz-modal-"]').length > 0) {
        console.log('[COMPLETION] Quiz in progress, skipping completion screen');
        return;
    }
    
    if (allErasCompleted) {
        // show completion screen after a delay
        console.log('[COMPLETION] All eras completed, showing final screen');
        setTimeout(function() {
            showGameCompletionScreen();
        }, 2000);
    }
}


function showGameCompletionScreen() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: var(--terminal-bg);
        border: 3px solid var(--terminal-amber);
        padding: 40px;
        max-width: 700px;
        width: 100%;
        color: var(--terminal-green);
        font-family: var(--font-mono);
        text-align: center;
        box-shadow: 0 0 50px rgba(255, 176, 0, 0.5);
    `;
    
    const accuracy = getAccuracyPercentage();
    const totalFragments = fragmentsFound.length;
    
    content.innerHTML = `
        <h1 style="color: var(--terminal-amber); font-size: 32px; margin-bottom: 20px;">Congratulations!</h1>
        <h2 style="color: var(--terminal-cyan); margin-bottom: 30px;">You've completed Code Archaeology!</h2>
        
        <div style="background: var(--terminal-dark-gray); padding: 20px; margin-bottom: 30px; border: 1px solid var(--terminal-green);">
            <h3 style="color: var(--terminal-white); margin-bottom: 15px;">Final Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div>
                    <div style="color: var(--terminal-gray); font-size: 14px;">Total Score</div>
                    <div style="color: var(--terminal-cyan); font-size: 24px; font-weight: bold;">${score}</div>
                </div>
                <div>
                    <div style="color: var(--terminal-gray); font-size: 14px;">Fragments Found</div>
                    <div style="color: var(--terminal-cyan); font-size: 24px; font-weight: bold;">${totalFragments}</div>
                </div>
                <div>
                    <div style="color: var(--terminal-gray); font-size: 14px;">Accuracy</div>
                    <div style="color: var(--terminal-cyan); font-size: 24px; font-weight: bold;">${accuracy}%</div>
                </div>
                <div>
                    <div style="color: var(--terminal-gray); font-size: 14px;">Eras Completed</div>
                    <div style="color: var(--terminal-cyan); font-size: 24px; font-weight: bold;">${unlockedEras.length}</div>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: var(--terminal-white); margin-bottom: 15px;">🏆 Achievements Unlocked</h3>
            <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                ${Object.entries(achievements).map(([key, unlocked]) => 
                    `<div style="color: ${unlocked ? 'var(--terminal-green)' : 'var(--terminal-gray)'}; font-size: 14px;">
                        ${unlocked ? '✓' : '✗'} ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>`
                ).join('')}
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <p style="color: var(--terminal-white); font-size: 16px; line-height: 1.5;">
                You've successfully excavated the history of programming! From FORTRAN's pioneering days to Python's modern elegance, 
                you've discovered how programming languages evolved and shaped our digital world.
            </p>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button onclick="playAgain()" 
                    style="background: var(--terminal-green); color: var(--terminal-bg); border: none; padding: 12px 24px; font-family: var(--font-mono); cursor: pointer; font-size: 16px;">
                Play Again
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // play completion sound
    playSound('unlock');
}

function showEraUnlockedNotification(nextEra) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: #ffb000; margin-bottom: 10px;">New Era Unlocked!</h3>
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
    console.log('[SAVE] Loading game progress from localStorage...');
    // load from localStorage
    const saved = localStorage.getItem('codeArchaeologyProgress');
    if (saved) {
        console.log('[SAVE] Found saved progress data');
        try {
            const data = JSON.parse(saved);
            console.log('[SAVE] Parsed saved data:', data);
            
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
            
            console.log('[SAVE] Restored game state:', {
                currentEra,
                fragmentsFound: fragmentsFound.length,
                score,
                unlockedEras,
                statistics
            });
            
            // update current era data if it changed
            if (eraData[currentEra]) {
                currentEraData = eraData[currentEra];
                totalFragments = 6; // Always use 6 fragments for minesweeper
                console.log('[SAVE] Updated era data:', {
                    era: currentEra,
                    name: currentEraData.name,
                    totalFragments: totalFragments
                });
            } else {
                console.error('[ERROR] Era data not found for:', currentEra);
            }
            
            console.log('[SAVE] Progress loaded from localStorage successfully');
        } catch (e) {
            console.error('[ERROR] Error loading progress:', e);
        }
    } else {
        console.log('[SAVE] No saved progress found - first time playing');
        // First time playing - show tutorial
        setTimeout(function() {
            console.log('[TUTORIAL] Showing tutorial for new player');
            showTutorial();
        }, 1000);
    }
    
    // update era buttons after loading
    setTimeout(updateEraButtons, 200);
}

function saveGameProgress() {
    console.log('[SAVE] Saving game progress to localStorage...');
    // save to localStorage
    const data = {
        currentEra: currentEra,
        fragmentsFound: fragmentsFound,
        score: score,
        unlockedEras: unlockedEras,
        statistics: statistics,
        timestamp: Date.now()
    };
    
    console.log('[SAVE] Saving data:', data);
    localStorage.setItem('codeArchaeologyProgress', JSON.stringify(data));
    console.log('[SAVE] Progress saved to localStorage successfully');
}

// Game reset and tutorial functions
function resetGame() {
    console.log('[RESET] Starting game reset...');
    
    // Clear all game state
    currentEra = 'fortran';
    fragmentsFound = [];
    score = 0;
    unlockedEras = ['fortran'];
    statistics = {
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        fragmentsCollected: 0
    };
    achievements = {
        firstDig: false,
        firstFragment: false,
        perfectEra: false,
        allEras: false,
        highScore: false
    };
    
    console.log('[RESET] Cleared game state:', {
        currentEra,
        fragmentsFound: fragmentsFound.length,
        score,
        unlockedEras,
        statistics,
        achievements
    });
    
    // Clear localStorage
    localStorage.removeItem('codeArchaeologyProgress');
    console.log('[RESET] Cleared localStorage');
    
    // Reset current era data
    if (eraData[currentEra]) {
        currentEraData = eraData[currentEra];
        totalFragments = 6; // Always use 6 fragments for minesweeper
        console.log('[RESET] Reset era data:', {
            era: currentEra,
            name: currentEraData.name,
            totalFragments: totalFragments
        });
    } else {
        console.error('[ERROR] Era data not available for reset!');
    }
    
    // Recreate dig site grid
    console.log('[RESET] Recreating dig site grid...');
    createDigSiteGrid();
    
    // Update display
    console.log('[RESET] Updating display...');
    updateDisplay();
    updateEraButtons();
    
    console.log('[RESET] Game reset successfully completed');
    console.log('[RESET] Final reset state:', {
        currentEra,
        fragmentsFound: fragmentsFound.length,
        score,
        unlockedEras,
        totalFragments
    });
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        resetGame();
        showTutorial();
    }
}

function showTutorial() {
    const modal = document.createElement('div');
    modal.id = 'tutorial-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: var(--terminal-bg);
        border: 3px solid var(--terminal-amber);
        padding: 40px;
        max-width: 700px;
        width: 100%;
        color: var(--terminal-green);
        font-family: var(--font-mono);
        text-align: center;
        box-shadow: 0 0 50px rgba(255, 176, 0, 0.5);
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    content.innerHTML = `
        <h1 style="color: var(--terminal-amber); font-size: 32px; margin-bottom: 20px;">Welcome to Code Archaeology!</h1>
        <h2 style="color: var(--terminal-cyan); margin-bottom: 30px;">Learn Programming History Through Excavation</h2>
        
        <div style="background: var(--terminal-dark-gray); padding: 20px; margin-bottom: 30px; border: 1px solid var(--terminal-green); text-align: left;">
            <h3 style="color: var(--terminal-white); margin-bottom: 15px; text-align: center;">How to Play</h3>
            <ol style="color: var(--terminal-green); line-height: 1.8; padding-left: 20px;">
                <li><strong>Dig for Fragments:</strong> Click on grid cells to excavate code fragments from different programming eras</li>
                <li><strong>Answer Questions:</strong> When you find a fragment, answer the question about the code to learn programming history</li>
                <li><strong>Complete Eras:</strong> Find all fragments in an era to unlock the next programming language</li>
                <li><strong>Explore History:</strong> Discover how programming languages evolved from FORTRAN (1957) to Python (1991)</li>
                <li><strong>Visit Museum:</strong> Check your discoveries and compare code across different eras</li>
            </ol>
        </div>
        
        <div style="background: var(--terminal-dark-gray); padding: 20px; margin-bottom: 30px; border: 1px solid var(--terminal-green);">
            <h3 style="color: var(--terminal-white); margin-bottom: 15px;">Programming Eras</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; text-align: left;">
                <div style="border-left: 3px solid var(--terminal-amber); padding-left: 10px;">
                    <div style="color: var(--terminal-amber); font-weight: bold;">FORTRAN (1957)</div>
                    <div style="color: var(--terminal-green); font-size: 14px;">First high-level language</div>
                </div>
                <div style="border-left: 3px solid var(--terminal-blue); padding-left: 10px;">
                    <div style="color: var(--terminal-blue); font-weight: bold;">C (1972)</div>
                    <div style="color: var(--terminal-green); font-size: 14px;">System programming</div>
                </div>
                <div style="border-left: 3px solid var(--terminal-cyan); padding-left: 10px;">
                    <div style="color: var(--terminal-cyan); font-weight: bold;">Python (1991)</div>
                    <div style="color: var(--terminal-green); font-size: 14px;">Modern readability</div>
                </div>
            </div>
        </div>
        
        <div style="background: var(--terminal-dark-gray); padding: 20px; margin-bottom: 30px; border: 1px solid var(--terminal-green);">
            <h3 style="color: var(--terminal-white); margin-bottom: 15px;">Controls</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; text-align: left;">
                <div>
                    <div style="color: var(--terminal-amber); font-weight: bold;">Click Grid Cells</div>
                    <div style="color: var(--terminal-green); font-size: 14px;">Dig for fragments</div>
                </div>
                <div>
                    <div style="color: var(--terminal-amber); font-weight: bold;">Era Buttons</div>
                    <div style="color: var(--terminal-green); font-size: 14px;">Switch languages</div>
                </div>
                <div>
                    <div style="color: var(--terminal-amber); font-weight: bold;">Museum</div>
                    <div style="color: var(--terminal-green); font-size: 14px;">View discoveries</div>
                </div>
                <div>
                    <div style="color: var(--terminal-amber); font-weight: bold;">Help</div>
                    <div style="color: var(--terminal-green); font-size: 14px;">Get assistance</div>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <p style="color: var(--terminal-white); font-size: 16px; line-height: 1.5;">
                Ready to start your journey through programming history? Click "Start Digging" to begin excavating code fragments!
            </p>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button onclick="startGame()" 
                    style="background: var(--terminal-green); color: var(--terminal-bg); border: none; padding: 12px 24px; font-family: var(--font-mono); cursor: pointer; font-size: 16px;">
                Start Digging
            </button>
            <button onclick="skipTutorial()" 
                    style="background: var(--terminal-blue); color: var(--terminal-bg); border: none; padding: 12px 24px; font-family: var(--font-mono); cursor: pointer; font-size: 16px;">
                Skip Tutorial
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Make startGame function global
    window.startGame = function() {
        console.log('[TUTORIAL] Start game clicked');
        const tutorialModal = document.getElementById('tutorial-modal');
        if (tutorialModal) {
            tutorialModal.remove();
        }
        // Game is already reset, just close the tutorial
    };
}

function skipTutorial() {
    console.log('[TUTORIAL] Skip tutorial clicked');
    const modal = document.getElementById('tutorial-modal');
    if (modal) {
        console.log('[TUTORIAL] Removing tutorial modal');
        modal.remove();
    } else {
        console.warn('[TUTORIAL] Tutorial modal not found');
    }
    // Game is ready to play
}

function playAgain() {
    console.log('[PLAY] Play Again button clicked');
    resetGame();
    console.log('[TUTORIAL] Showing tutorial after reset');
    showTutorial();
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

function getAccuracyPercentage() {
    if (statistics.totalQuestionsAnswered === 0) {
        return 0;
    }
    return Math.round((statistics.correctAnswers / statistics.totalQuestionsAnswered) * 100);
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
        <h2 style="color: var(--terminal-amber); margin-bottom: 20px; text-align: center;">How to Play Code Archaeology</h2>
        
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
    console.log('[SWITCH_ERA] Switching to era:', newEra);
    
    if (!unlockedEras.includes(newEra)) {
        console.log('[SWITCH_ERA] Era is locked:', newEra);
        return;
    }
    
    console.log('[SWITCH_ERA] Preparing to switch from', currentEra, 'to', newEra);
    
    // switch to new era FIRST
    currentEra = newEra;
    currentEraData = eraData[currentEra];
    totalFragments = 6; // Always use 6 fragments for minesweeper
    
    console.log('[SWITCH_ERA] Era data loaded:', {
        era: currentEra,
        name: currentEraData.name,
        totalFragments: totalFragments
    });
    
    // reset fragments found for new era
    fragmentsFound = [];
    
    // recreate dig site grid (resets minesweeper state)
    createDigSiteGrid();
    
    // update display
    updateDisplay();
    updateEraButtons();
    
    // save progress AFTER updating era
    saveGameProgress();
    console.log('[SWITCH_ERA] Progress saved with new era:', currentEra);
    
    console.log('[SWITCH_ERA] Successfully switched to era:', newEra);
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