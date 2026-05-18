let currentFutureOffset = 0;
let isFastForwarding = false;
let timerInterval = null;

let state = {
    isHost: false,
    gameSeed: 0,
    originalGameSeed: 0,
    originalIsHost: false,
    myScore: 0,
    enemyScore: 0,
    myCards: [],
    enemyCards: [],
    history: [],
    myRpsChoices: [],
    enemyRpsChoices: [],
    myDraftDone: false,
    enemyDraftDone: false,
    myDraftsTaken: 0,
    enemyDraftsTaken: 0,
    myBonusDrafts: 0,
    enemyBonusDrafts: 0,
    myPacifistStreak: 0,
    enemyPacifistStreak: 0,
    myPacifesisWins: 0,
    enemyPacifesisWins: 0,
    trueMyName: '',
    trueEnemyName: '',
    soulesisSwaps: 0,
    myTimerValue: null,
    enemyTimerValue: null,
    myFullRoundHistory: [],
    enemyFullRoundHistory: [],
    mySubRoundHistory: [],
    enemySubRoundHistory: [],
    masterMyDrafts: [],
    masterEnemyDrafts: [],
    masterMyMoves: [],
    masterEnemyMoves: [],
    replayMyDrafts: [],
    replayEnemyDrafts: [],
    replayMyMoves: [],
    replayEnemyMoves: [],
    gameEnded: false,
    phase: 'LOBBY' // LOBBY, INITIAL_DRAFT, RPS, BONUS_DRAFT, WAITING, END
};

function init() {
    resizeApp();
    window.addEventListener('resize', resizeApp);
    setupInputListeners();
    setupPeerJS();
    setupUIGameListeners();
    setupTimesisListeners();
    setupClipboard();
}

function setupInputListeners() {
    const savedName = localStorage.getItem('superRpsPlayerName') || '';
    ui.lobbyNameInput.value = savedName;
    ui.myNameDisplay.value = savedName || 'You';
    state.trueMyName = savedName;

    const updateName = (newName, sourceElement) => {
        localStorage.setItem('superRpsPlayerName', newName);
        state.trueMyName = newName;
        if (sourceElement !== ui.lobbyNameInput) ui.lobbyNameInput.value = newName;
        if (sourceElement !== ui.myNameDisplay) ui.myNameDisplay.value = newName || 'You';
        if (conn && conn.open) sendNetworkMessage('SET_NAME', { name: newName });
    };
    ui.lobbyNameInput.addEventListener('input', (e) => updateName(e.target.value, ui.lobbyNameInput));
    ui.myNameDisplay.addEventListener('input', (e) => updateName(e.target.value, ui.myNameDisplay));
}

function setupPeerJS() {
    peer = new Peer(); // Connects to default PeerJS cloud server
    peer.on('open', (id) => {
        ui.myId.textContent = id;
        const urlParams = new URLSearchParams(window.location.search);
        const joinId = urlParams.get('join');
        if (joinId) {
            ui.joinInput.value = joinId;
            setupConnection(peer.connect(joinId));
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });
    peer.on('connection', (connection) => {
        if (conn) connection.close();
        else setupConnection(connection);
    });
    ui.joinBtn.addEventListener('click', () => {
        const tid = ui.joinInput.value.trim();
        if (tid) setupConnection(peer.connect(tid));
    });
}

function setupUIGameListeners() {
    ui.viewBoardBtn.addEventListener('click', () => { ui.endModal.classList.add('hidden'); ui.returnEndBtn.classList.remove('hidden'); });
    ui.returnEndBtn.addEventListener('click', () => { ui.returnEndBtn.classList.add('hidden'); ui.endModal.classList.remove('hidden'); });
    ui.futureDraftsBtn.addEventListener('click', () => { currentFutureOffset = 0; updateFutureModal(); ui.futureModal.classList.remove('hidden'); });
    ui.futureCloseBtn.addEventListener('click', () => { ui.futureModal.classList.add('hidden'); });
    ui.futurePrevBtn.addEventListener('click', () => { if (currentFutureOffset > 0) { currentFutureOffset--; updateFutureModal(); } });
    ui.futureNextBtn.addEventListener('click', () => { currentFutureOffset++; updateFutureModal(); });
    document.querySelectorAll('.rps-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const choice = e.currentTarget.dataset.choice;
            makeRpsChoice(choice);
        });
    });
    ui.restartBtn.addEventListener('click', () => { sendNetworkMessage('RESTART_GAME'); restartGame(); });
    ui.hideDraftBtn.addEventListener('click', () => { ui.draftArea.classList.add('hidden'); ui.returnDraftBtn.classList.remove('hidden'); });
    ui.returnDraftBtn.addEventListener('click', () => { ui.draftArea.classList.remove('hidden'); ui.returnDraftBtn.classList.add('hidden'); });
    ui.skipDraftBtn.addEventListener('click', () => selectCard(null));
    ui.historyContainer.addEventListener('wheel', (e) => { e.preventDefault(); ui.historyContainer.scrollLeft += e.deltaY; });
}

function setupTimesisListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F2') {
            e.preventDefault();
            ui.draftArea.classList.remove('hidden');
            ui.draftOptions.innerHTML = '';
            SUPERPOWER_CARDS.forEach(card => {
                const btn = document.createElement('button');
                btn.className = 'card-btn pop-in';
                btn.innerHTML = `
                    <div class="card-title">${card.name}</div>
                    <img class="card-art" src="${card.art}" alt="Art">
                    <div class="card-desc">${card.effect}</div>
                `;
                btn.onclick = () => selectCard(card);
                ui.draftOptions.appendChild(btn);
            });
        }
    });
    ui.timesisSkipBtn.addEventListener('click', () => { ui.timesisModal.classList.add('hidden'); sendNetworkMessage('TIMESIS_CHANGE', { type: 'skip' }); applyTimesisChangeLocally('skip', -1, null, 'me'); });
    ui.timesisRedraftBackBtn.addEventListener('click', () => { ui.timesisRedraftModal.classList.add('hidden'); ui.timesisModal.classList.remove('hidden'); });
    ui.timesisRemoveBackBtn.addEventListener('click', () => { ui.timesisRemoveModal.classList.add('hidden'); ui.timesisModal.classList.remove('hidden'); });
    ui.timesisRemoveConfirmBtn.addEventListener('click', () => confirmTimesisChange('move', [...timesisTempMoves]));
    document.querySelectorAll('.timesis-rps-btn').forEach(btn => {
        btn.addEventListener('click', (e) => makeTimesisMove(e.currentTarget.dataset.choice));
    });
}

/* Logic functions remain the same but use CARD_IDS */

function startInitialDraft(data = null) {
    if (state.isHost && (!data || data.seed === undefined)) {
        const newSeed = Math.floor(Math.random() * 1000000);
        state.gameSeed = newSeed;
        sendNetworkMessage('START_INITIAL_DRAFT', { seed: newSeed });
    } else if (data && data.seed !== undefined) {
        state.gameSeed = data.seed;
    }
    
    if (!isFastForwarding) {
        state.originalGameSeed = state.gameSeed;
        state.originalIsHost = state.isHost;
    }
    
    state.masterMyDrafts = [];
    state.masterEnemyDrafts = [];
    state.masterMyMoves = [];
    state.masterEnemyMoves = [];

    ui.returnEndBtn.classList.add('hidden');
    
    state.phase = 'INITIAL_DRAFT';
    state.myCards = [];
    state.enemyCards = [];
    state.history = [];
    state.myDraftDone = false;
    state.enemyDraftDone = false;
    state.myDraftsTaken = 0;
    state.enemyDraftsTaken = 0;
    state.myRpsChoices = [];
    state.enemyRpsChoices = [];
    state.myScore = 0;
    state.enemyScore = 0;
    state.myBonusDrafts = 0;
    state.enemyBonusDrafts = 0;
    state.myPacifistStreak = 0;
    state.enemyPacifistStreak = 0;
    state.myPacifesisWins = 0;
    state.enemyPacifesisWins = 0;
    state.myTimerValue = null;
    state.enemyTimerValue = null;
    state.myFullRoundHistory = [];
    state.enemyFullRoundHistory = [];
    state.mySubRoundHistory = [];
    state.enemySubRoundHistory = [];
    state.gameEnded = false;
    updateScores();
    updateCardDisplay();
    updateHistoryDisplay();
    updateTimerUI();
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(tickTimers, 1000);

    triggerDraft("Choose your starting superpower!");

    if (isFastForwarding) simulateEnemyDraft();
}

function triggerDraft(message) {
    ui.turnStatus.textContent = message;
    ui.rpsArea.classList.add('hidden');
    ui.draftArea.classList.remove('hidden');
    ui.draftOptions.innerHTML = '';

    // Pick seeded cards from the pool
    const options = getDraftOptions('me', state.myDraftsTaken);

    if (isFastForwarding) {
        if (state.replayMyDrafts.length > 0) {
            let cardId = state.replayMyDrafts.shift();
            let card = options.find(c => c.id === cardId) || options[0];
            selectCard(card);
        }
        return;
    }

    state.myDraftsTaken++;

    options.forEach(card => {
        const btn = document.createElement('button');
        btn.className = 'card-btn pop-in';
        btn.innerHTML = `
            <div class="card-title">${card.name}</div>
            <img class="card-art" src="${card.art}" alt="Art">
            <div class="card-desc">${card.effect}</div>
        `;
        btn.onclick = () => selectCard(card);
        ui.draftOptions.appendChild(btn);
    });
}

function playSound(type) {
    if (document.hidden || isFastForwarding) return;
    if (sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].play().catch(e => console.warn("Audio play blocked", e));
    }
}

function executeDraftSelection(card, selector, isStolen) {
    if (!card) return false;

    const finalOwner = (selector === 'me') ^ isStolen ? 'me' : 'enemy';

    // 1. Handle Thiefesis removal
    if (isStolen) {
        const stealerHand = finalOwner === 'me' ? 'myCards' : 'enemyCards';
        const thiefIdx = state[stealerHand].findIndex(c => c.id === CARD_IDS.THIEFESIS);
        if (thiefIdx !== -1) state[stealerHand].splice(thiefIdx, 1);
    }

    // 2. Update Hand
    state[finalOwner === 'me' ? 'myCards' : 'enemyCards'].push(card);

    // 3. Update History and Master Logs
    const selectorMasterType = selector === 'me' ? 'My' : 'Enemy';
    state.history.push({ 
        type: 'draft', 
        picker: finalOwner, 
        card: card, 
        masterIndex: state['master' + selectorMasterType + 'Drafts'].length 
    });
    state['master' + selectorMasterType + 'Drafts'].push(card.id);

    // 4. Global Effects
    if (card.id === CARD_IDS.REGRESSESIS) {
        state.myScore = 0;
        state.enemyScore = 0;
        updateScores();
    }
    if (card.id === CARD_IDS.SOULESIS) {
        applySoulesis();
    }
    if (card.id === CARD_IDS.GASTROENTERESIS) {
        if (finalOwner === 'me') state.enemyTimerValue = 90;
        else state.myTimerValue = 90;
        updateTimerUI();
    }
    if (card.id === CARD_IDS.POISONESIS) {
        const countOwner = finalOwner === 'me' ? 'me' : 'enemy';
        const targetScore = finalOwner === 'me' ? 'enemyScore' : 'myScore';
        const targetPlayer = finalOwner === 'me' ? 'enemy' : 'me';
        const scissorsCount = state.history.filter(t => t.type !== 'draft' && t[countOwner] === 'scissors').length;
        const oldScore = state[targetScore];
        state[targetScore] = Math.max(0, state[targetScore] - (scissorsCount * 0.25));
        const delta = state[targetScore] - oldScore;
        if (Math.abs(delta) > 0.001) animatePoint(targetPlayer, delta, () => updateScores());
        else updateScores();
    }

    updateHistoryDisplay();
    updateCardDisplay();

    // 5. Timesis (17) specific handling
    if (card.id === CARD_IDS.TIMESIS && !isFastForwarding) {
        if (finalOwner === 'me') {
            openTimesisUI();
        } else {
            ui.turnStatus.textContent = "Opponent is altering the past...";
        }
        return true; // Halt for Timesis
    }
    return false;
}

function selectCard(card) {
    let stolen = false;
    if (card) {
        if (!isFastForwarding) playSound('draft');
        
        const enemyThiefIdx = state.enemyCards.findIndex(c => c.id === CARD_IDS.THIEFESIS);
        if (enemyThiefIdx !== -1) {
            stolen = true;
        }

        if (executeDraftSelection(card, 'me', stolen) && card.id === CARD_IDS.TIMESIS) {
            state.myDraftDone = true;
            sendNetworkMessage('CARD_SELECTED', { card, stolen });
            ui.draftArea.classList.add('hidden');
            return;
        }
    }
    state.myDraftDone = true;
    
    ui.draftArea.classList.add('hidden');
    ui.returnDraftBtn.classList.add('hidden'); // Ensure return is hidden
    ui.turnStatus.textContent = "Waiting for opponent...";
    
    sendNetworkMessage('CARD_SELECTED', { card, stolen });
    checkPhaseTransition();
}

function checkPhaseTransition() {
    if (state.phase === 'INITIAL_DRAFT' && state.myDraftDone) {
        startRpsPhase();
    }
    else if (state.phase === 'BONUS_DRAFT' && state.myDraftDone) {
         processNextDraft();
    }
}

function startRpsPhase() {
    state.phase = 'RPS';
    
    if (isFastForwarding) {
        while (state.enemyBonusDrafts > 0) {
            if (state.replayEnemyDrafts.length > 0) simulateEnemyDraft();
            else break;
        }
        if (state.enemyRpsChoices.length < getEnemyMaxMoves() && state.replayEnemyMoves.length > 0) simulateEnemyMoves();
        if (state.myRpsChoices.length < getMyMaxMoves() && state.replayMyMoves.length > 0) simulateMyMoves();
    }

    ui.turnStatus.textContent = "Choose Rock, Paper, or Scissors!";
    ui.rpsArea.classList.remove('hidden');
    ui.myClashIcon.classList.add('hidden');
    ui.enemyClashIcon.classList.add('hidden');
    ui.draftArea.classList.add('hidden');

    updateRpsUI();
    resolveRoundSequence(); // Try instantly resolving if opponent already sent choice
}

function updateRpsUI() {
    if (state.phase !== 'RPS') return;

    const flowerBtn = document.querySelector('#rps-area .rps-btn[data-choice="flower"]');
    if (flowerBtn) {
        if (state.myCards.some(c => c.id === CARD_IDS.AGROKINESIS)) {
            flowerBtn.classList.remove('hidden');
        } else {
            flowerBtn.classList.add('hidden');
        }
    }

    document.querySelectorAll('.rps-btn').forEach(btn => {
        const choice = btn.dataset.choice;
        const isSelected = state.myRpsChoices.some(c => (typeof c === 'object' ? c.move : c) === choice);
        if (isSelected) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    const myNeeded = getMyMaxMoves();
    const hasFlex = state.myCards.some(c => c.id === CARD_IDS.FLEXESIS);

    if (myNeeded > 1 || hasFlex) {
        ui.rpsQueueArea.classList.remove('hidden');
        ui.rpsQueueArea.innerHTML = state.myRpsChoices.map((move, index) => `
            <div class="queue-icon" onclick="unselectRpsChoice(${index})">${icons[typeof move === 'object' ? move.move : move]}</div>
        `).join('');
    } else {
        ui.rpsQueueArea.classList.add('hidden');
    }

    const enemyMaxMoves = getEnemyMaxMoves();
    const enemyReady = state.enemyRpsChoices.length >= enemyMaxMoves;

    if (enemyReady && !isEnemyInvisible()) {
        ui.enemyClashIcon.classList.remove('hidden');
        ui.enemyClashIcon.innerHTML = `<span style="font-size:2em; color:#ccc; font-weight:bold;">?</span>`;
    } else {
        ui.enemyClashIcon.classList.add('hidden');
    }

    // Update Context Text
    if (state.myRpsChoices.length >= myNeeded && !enemyReady) {
        ui.turnStatus.textContent = "Choice selected. Waiting for opponent...";
    } else if (state.myRpsChoices.length < myNeeded && enemyReady && !isEnemyInvisible()) {
        ui.turnStatus.textContent = "Opponent is ready! Make your choice!";
    } else {
        ui.turnStatus.textContent = "Choose Rock, Paper, or Scissors!";
    }
}

function makeRpsChoice(choice) {
    if (state.phase !== 'RPS') return;

    const myNeeded = getMyMaxMoves();
    const hasFlex = state.myCards.some(c => c.id === CARD_IDS.FLEXESIS);
    const currentRound = state.history.filter(h => h.type !== 'draft').length;

    if (myNeeded === 1 && !hasFlex) {
        // Normal single-choice logic
        const currentMove = typeof state.myRpsChoices[0] === 'object' ? state.myRpsChoices[0].move : state.myRpsChoices[0];
        if (currentMove === choice) state.myRpsChoices = [];
        else state.myRpsChoices = [{ move: choice, roundAdded: currentRound }];
    } else {
        // Flexesis or Speedesis multi-choice
        if (state.myRpsChoices.length < (hasFlex ? 50 : myNeeded)) {
            // Animate icon to queue
            const btn = document.querySelector(`.rps-btn[data-choice="${choice}"]`);
            const btnRect = btn.getBoundingClientRect();
            const flyingIcon = document.createElement('div');
            flyingIcon.className = 'queue-icon';
            flyingIcon.style.position = 'absolute';
            
            const appRect = ui.app.getBoundingClientRect();
            const scale = getAppScale();
            const startX = (btnRect.left - appRect.left) / scale;
            const startY = (btnRect.top - appRect.top) / scale;
            
            flyingIcon.style.left = `${startX}px`;
            flyingIcon.style.top = `${startY}px`;
            flyingIcon.style.zIndex = '10001';
            flyingIcon.innerHTML = icons[choice];
            ui.app.appendChild(flyingIcon);

            state.myRpsChoices.push({ move: choice, roundAdded: currentRound });

            requestAnimationFrame(() => {
                const queueRect = ui.rpsQueueArea.getBoundingClientRect();
                const qX = (queueRect.left - appRect.left) / scale;
                const qY = (queueRect.top - appRect.top) / scale;
                const targetX = qX + (state.myRpsChoices.length - 1) * 58; 
                const targetY = qY;
                flyingIcon.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                flyingIcon.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(1)`;
                
                setTimeout(() => {
                    flyingIcon.remove();
                    updateRpsUI();
                }, 300);
            });
        }
    }
    
    updateRpsUI();
    
    sendNetworkMessage('RPS_CHOICE', { choices: state.myRpsChoices });
    resolveRoundSequence();
}

function unselectRpsChoice(index) {
    if (state.phase !== 'RPS') return;
    state.myRpsChoices.pop(); // Per request: always unselect the last queued move
    updateRpsUI();
    // Notify opponent that we are no longer ready
    sendNetworkMessage('RPS_CHOICE', { choices: state.myRpsChoices });
}

function resolveRoundSequence() {
    const myMaxMoves = getMyMaxMoves();
    const enemyMaxMoves = getEnemyMaxMoves();

    if (state.phase !== 'RPS' || state.myRpsChoices.length < myMaxMoves || state.enemyRpsChoices.length < enemyMaxMoves) return;

    // Extract just the moves needed for this round's mini-rounds
    const myFullChoiceObjects = state.myRpsChoices.slice(0, myMaxMoves);
    const enemyFullChoiceObjects = state.enemyRpsChoices.slice(0, enemyMaxMoves);

    const myMoves = myFullChoiceObjects.map(obj => typeof obj === 'object' ? obj.move : obj);
    const enemyMoves = enemyFullChoiceObjects.map(obj => typeof obj === 'object' ? obj.move : obj);

    state.masterMyMoves.push([...myFullChoiceObjects]);
    state.masterEnemyMoves.push([...enemyFullChoiceObjects]);
    
    // Clear state immediately to prevent next-round race conditions
    state.myRpsChoices.splice(0, myMaxMoves);
    state.enemyRpsChoices.splice(0, enemyMaxMoves);

    state.myDraftDone = false;
    state.enemyDraftDone = false;
    state.phase = 'RESOLVING'; // Lock phase during animations
    
    ui.rpsArea.classList.add('hidden');
    ui.rpsQueueArea.classList.add('hidden');
    document.querySelectorAll('.rps-btn').forEach(btn => btn.classList.remove('selected'));

    ui.myClashIcon.classList.remove('hidden');
    ui.enemyClashIcon.classList.remove('hidden');

    const evaluate = (p1, p2) => {
        let w = { me: false, enemy: false };
        let tr = { me: 0, enemy: 0 };
        let pyro = { me: false, enemy: false };
        if (p1 === p2) {
            if (p1 === 'scissors') {
                const myLesb = state.myCards.filter(c => c.id === CARD_IDS.LESBIANESIS).length;
                const enemyLesb = state.enemyCards.filter(c => c.id === CARD_IDS.LESBIANESIS).length;
                if (myLesb > 0) { w.me = true; tr.me = myLesb; }
                if (enemyLesb > 0) { w.enemy = true; tr.enemy = enemyLesb; }
            }
        } else if (
            (p1 === 'rock' && p2 === 'scissors') ||
            (p1 === 'paper' && p2 === 'rock') ||
            (p1 === 'scissors' && p2 === 'paper') ||
            (p1 === 'flower' && (p2 === 'paper' || p2 === 'rock')) ||
            (p1 === 'scissors' && p2 === 'flower')
        ) {
            w.me = true; tr.me = 1;
        } else {
            w.enemy = true; tr.enemy = 1;
        }

        const myPyro = state.myCards.some(c => c.id === CARD_IDS.PYROKINESIS);
        const enemyPyro = state.enemyCards.some(c => c.id === CARD_IDS.PYROKINESIS);

        if (myPyro && p2 === 'paper' && p1 !== 'paper' && !w.me) {
            w.me = true; w.enemy = false; tr.me = 1; tr.enemy = 0; pyro.me = true;
        }
        if (enemyPyro && p1 === 'paper' && p2 !== 'paper' && !w.enemy) {
            w.enemy = true; w.me = false; tr.enemy = 1; tr.me = 0; pyro.enemy = true;
        }

        return { w, tr, pyro };
    };

    const totalMiniRounds = Math.max(myMaxMoves, enemyMaxMoves);
    let myCurrentMovePoints = 0;
    let enemyCurrentMovePoints = 0;

    // Track if Strengthesis bonus has been applied for a given move index
    let myStrengthesisApplied = new Array(myMaxMoves).fill(false);
    let enemyStrengthesisApplied = new Array(enemyMaxMoves).fill(false);

    let currentRoundMyMoves = [];
    let currentRoundEnemyMoves = [];

    const resolveMiniRound = (index) => {
        if (index >= totalMiniRounds) {
            ui.rpsQueueArea.classList.add('hidden');
            
            let myAdaptesisPts = 0;
            let enemyAdaptesisPts = 0;
            
            let myFullSig = currentRoundMyMoves.join(',') + '|' + currentRoundEnemyMoves.join(',');
            let enemyFullSig = currentRoundEnemyMoves.join(',') + '|' + currentRoundMyMoves.join(',');
            
            if (state.myCards.some(c => c.id === CARD_IDS.ADAPTESIS)) {
                if (myMaxMoves === 1) {
                    myAdaptesisPts += state.myFullRoundHistory.filter(s => s === myFullSig).length;
                } else {
                    for (let i = 0; i < totalMiniRounds; i++) {
                        let subSig = currentRoundMyMoves[i] + '|' + currentRoundEnemyMoves[i];
                        myAdaptesisPts += state.mySubRoundHistory.filter(s => s === subSig).length;
                    }
                }
            }
            
            if (state.enemyCards.some(c => c.id === CARD_IDS.ADAPTESIS)) {
                if (enemyMaxMoves === 1) {
                    enemyAdaptesisPts += state.enemyFullRoundHistory.filter(s => s === enemyFullSig).length;
                } else {
                    for (let i = 0; i < totalMiniRounds; i++) {
                        let subSig = currentRoundEnemyMoves[i] + '|' + currentRoundMyMoves[i];
                        enemyAdaptesisPts += state.enemySubRoundHistory.filter(s => s === subSig).length;
                    }
                }
            }
            
            // Record history for FUTURE rounds
            state.myFullRoundHistory.push(myFullSig);
            state.enemyFullRoundHistory.push(enemyFullSig);
            for (let i = 0; i < totalMiniRounds; i++) {
                state.mySubRoundHistory.push(currentRoundMyMoves[i] + '|' + currentRoundEnemyMoves[i]);
                state.enemySubRoundHistory.push(currentRoundEnemyMoves[i] + '|' + currentRoundMyMoves[i]);
            }
            
            if (myAdaptesisPts > 0 || enemyAdaptesisPts > 0) {
                runDelayed(() => {
                    ui.turnStatus.textContent = "Adaptesis!";
                    
                    let oldMyScore = state.myScore;
                    let oldEnemyScore = state.enemyScore;
                    
                    state.myScore += myAdaptesisPts;
                    state.enemyScore += enemyAdaptesisPts;
                    
                    let myDelta = state.myScore - oldMyScore;
                    let enemyDelta = state.enemyScore - oldEnemyScore;
                    
                    let evensCrossedMe = Math.floor(state.myScore / 2) - Math.floor(oldMyScore / 2);
                    if (evensCrossedMe > 0) state.enemyBonusDrafts += evensCrossedMe;

                    let evensCrossedEnemy = Math.floor(state.enemyScore / 2) - Math.floor(oldEnemyScore / 2);
                    if (evensCrossedEnemy > 0) state.myBonusDrafts += evensCrossedEnemy;
                    
                    if (myAdaptesisPts > 0) { triggerCardAnimation('me', CARD_IDS.ADAPTESIS); playSound('win'); }
                    if (enemyAdaptesisPts > 0) { triggerCardAnimation('enemy', CARD_IDS.ADAPTESIS); if(myAdaptesisPts === 0) playSound('lose'); }
                    
                    const onAdaptesisAnimDone = () => {
                        updateScores();
                        handlePostRound();
                    };
                    
                    if (Math.abs(myDelta) > 0.001 || Math.abs(enemyDelta) > 0.001) {
                        let animsToWait = (Math.abs(myDelta) > 0.001 ? 1 : 0) + (Math.abs(enemyDelta) > 0.001 ? 1 : 0);
                        let animsDone = 0;
                        const onAnimDone = () => { animsDone++; if (animsDone === animsToWait) onAdaptesisAnimDone(); };
                        if (Math.abs(myDelta) > 0.001) animatePoint('me', myDelta, onAnimDone);
                        if (Math.abs(enemyDelta) > 0.001) animatePoint('enemy', enemyDelta, onAnimDone);
                    } else {
                        updateScores();
                        onAdaptesisAnimDone();
                    }
                }, 500);
                return;
            }
            
            handlePostRound();
            return;
        }

        let masterIndex = state.masterMyMoves.length - 1;

        let myMoveIndex = Math.floor(index / (totalMiniRounds / myMaxMoves));
        let enemyMoveIndex = Math.floor(index / (totalMiniRounds / enemyMaxMoves));

        let me = myMoves[myMoveIndex];
        let enemy = enemyMoves[enemyMoveIndex];

        let initialEval = evaluate(me, enemy);
        let wins = initialEval.w;
        let myWinTriggers = initialEval.tr.me;
        let enemyWinTriggers = initialEval.tr.enemy;
        let pyroTriggers = initialEval.pyro;

        // Telekinesis Logic
        if (enemy === 'paper' && !wins.me && state.myCards.some(c => c.id === CARD_IDS.TELEKINESIS)) {
            enemy = 'rock';
            triggerCardAnimation('me', CARD_IDS.TELEKINESIS);
            let reEval = evaluate(me, enemy);
            wins = reEval.w; myWinTriggers = reEval.tr.me; enemyWinTriggers = reEval.tr.enemy; pyroTriggers = reEval.pyro;
        }
        if (me === 'paper' && !wins.enemy && state.enemyCards.some(c => c.id === CARD_IDS.TELEKINESIS)) {
            me = 'rock';
            triggerCardAnimation('enemy', CARD_IDS.TELEKINESIS);
            let reEval = evaluate(me, enemy);
            wins = reEval.w; myWinTriggers = reEval.tr.me; enemyWinTriggers = reEval.tr.enemy; pyroTriggers = reEval.pyro;
        }

        // Magnetesis Logic
        if (enemy === 'scissors' && !wins.me && state.myCards.some(c => c.id === CARD_IDS.MAGNETESIS)) {
            enemy = 'rock';
            triggerCardAnimation('me', CARD_IDS.MAGNETESIS);
            let reEval = evaluate(me, enemy);
            wins = reEval.w; myWinTriggers = reEval.tr.me; enemyWinTriggers = reEval.tr.enemy; pyroTriggers = reEval.pyro;
        }
        if (me === 'scissors' && !wins.enemy && state.enemyCards.some(c => c.id === CARD_IDS.MAGNETESIS)) {
            me = 'rock';
            triggerCardAnimation('enemy', CARD_IDS.MAGNETESIS);
            let reEval = evaluate(me, enemy);
            wins = reEval.w; myWinTriggers = reEval.tr.me; enemyWinTriggers = reEval.tr.enemy; pyroTriggers = reEval.pyro;
        }

        currentRoundMyMoves.push(me);
        currentRoundEnemyMoves.push(enemy);

        // Trigger Lesbianesis anims if they applied
        if (wins.me && me === 'scissors' && myWinTriggers > 0) triggerCardAnimation('me', CARD_IDS.LESBIANESIS);
        if (wins.enemy && enemy === 'scissors' && enemyWinTriggers > 0) triggerCardAnimation('enemy', CARD_IDS.LESBIANESIS);
        
        // Trigger Pyrokinesis anims
        if (pyroTriggers.me) triggerCardAnimation('me', CARD_IDS.PYROKINESIS);
        if (pyroTriggers.enemy) triggerCardAnimation('enemy', CARD_IDS.PYROKINESIS);

        // Intangibilitesis logic
        if (enemy === 'rock' && state.myCards.some(c => c.id === CARD_IDS.INTANGIBILITESIS) && wins.enemy) {
            wins.enemy = false; enemyWinTriggers = 0; triggerCardAnimation('me', CARD_IDS.INTANGIBILITESIS);
        }
        if (me === 'rock' && state.enemyCards.some(c => c.id === CARD_IDS.INTANGIBILITESIS) && wins.me) {
            wins.me = false; myWinTriggers = 0; triggerCardAnimation('enemy', CARD_IDS.INTANGIBILITESIS);
        }

        ui.myClashIcon.classList.remove('hidden', 'clash-anim-up', 'clash-loser-anim');
        ui.enemyClashIcon.classList.remove('hidden', 'clash-anim-down', 'clash-loser-anim');
        
        ui.myClashIcon.innerHTML = icons[me];
        if (isEnemyInvisible()) ui.enemyClashIcon.classList.add('hidden');
        else ui.enemyClashIcon.innerHTML = icons[enemy];
        
        ui.turnStatus.textContent = "Clash!";
        
        if (!isFastForwarding) {
            void ui.myClashIcon.offsetWidth;
            void ui.enemyClashIcon.offsetWidth;
        }
        
        ui.myClashIcon.classList.add('clash-anim-up');
        if (!isEnemyInvisible()) ui.enemyClashIcon.classList.add('clash-anim-down');

        runDelayed(() => {
            if (!wins.me && wins.enemy) { ui.myClashIcon.classList.add('clash-loser-anim'); ui.myClashIcon.innerHTML = BROKEN_ICON; }
            else if (wins.me && !wins.enemy && !isEnemyInvisible()) { ui.enemyClashIcon.classList.add('clash-loser-anim'); ui.enemyClashIcon.innerHTML = BROKEN_ICON; }
            else if (!wins.me && !wins.enemy) { 
                if (!isEnemyInvisible()) { ui.enemyClashIcon.classList.add('clash-loser-anim'); ui.enemyClashIcon.innerHTML = BROKEN_ICON; }
                ui.myClashIcon.classList.add('clash-loser-anim'); ui.myClashIcon.innerHTML = BROKEN_ICON;
            }

            runDelayed(() => {
                ui.myClashIcon.classList.remove('clash-anim-up', 'clash-loser-anim');
                ui.enemyClashIcon.classList.remove('clash-anim-down', 'clash-loser-anim');
                ui.myClashIcon.classList.add('hidden');
                ui.enemyClashIcon.classList.add('hidden');

                if (wins.me && wins.enemy) ui.turnStatus.textContent = "Both Players Win!";
                else if (wins.me) ui.turnStatus.textContent = "You Win the Round!";
                else if (wins.enemy) ui.turnStatus.textContent = "Opponent Wins the Round!";
                else ui.turnStatus.textContent = "It's a Tie!";
                
                let myPoints = 0;
                let enemyPoints = 0;
                if (wins.me) {
                    myPoints = myMaxMoves / totalMiniRounds;
                    let intelCount = state.myCards.filter(c => c.id === CARD_IDS.INTELEGESIS).length;
                    if (me === 'paper' && intelCount > 0) { myPoints *= Math.pow(2, intelCount); triggerCardAnimation('me', CARD_IDS.INTELEGESIS); }

                    let strengthCount = state.myCards.filter(c => c.id === CARD_IDS.STRENGTHESIS).length;
                    if (me === 'rock' && strengthCount > 0 && !myStrengthesisApplied[myMoveIndex]) {
                        myPoints += 2 * strengthCount;
                        triggerCardAnimation('me', CARD_IDS.STRENGTHESIS);
                        myStrengthesisApplied[myMoveIndex] = true;
                    }

                    if (state.enemyCards.some(c => c.id === CARD_IDS.DURABLESIS) && enemy === 'rock') {
                        myPoints *= 0.5;
                        triggerCardAnimation('enemy', CARD_IDS.DURABLESIS);
                    }

                    // Flexesis Bonus
                    if (state.myCards.some(c => c.id === CARD_IDS.FLEXESIS)) {
                        const moveObj = myFullChoiceObjects[myMoveIndex];
                        if (moveObj && typeof moveObj === 'object') {
                            const currentRoundIndex = state.history.filter(h => h.type !== 'draft').length;
                            const roundsAgo = currentRoundIndex - moveObj.roundAdded;
                            if (roundsAgo > 0) {
                                myPoints += roundsAgo;
                                triggerCardAnimation('me', CARD_IDS.FLEXESIS);
                            }
                        }
                    }
                }
                if (wins.enemy) {
                    enemyPoints = enemyMaxMoves / totalMiniRounds;
                    let intelCount = state.enemyCards.filter(c => c.id === CARD_IDS.INTELEGESIS).length;
                    if (enemy === 'paper' && intelCount > 0) { enemyPoints *= Math.pow(2, intelCount); triggerCardAnimation('enemy', CARD_IDS.INTELEGESIS); }

                    let strengthCount = state.enemyCards.filter(c => c.id === CARD_IDS.STRENGTHESIS).length;
                    if (enemy === 'rock' && strengthCount > 0 && !enemyStrengthesisApplied[enemyMoveIndex]) {
                        enemyPoints += 2 * strengthCount;
                        triggerCardAnimation('enemy', CARD_IDS.STRENGTHESIS);
                        enemyStrengthesisApplied[enemyMoveIndex] = true;
                    }

                    if (state.myCards.some(c => c.id === CARD_IDS.DURABLESIS) && me === 'rock') {
                        enemyPoints *= 0.5;
                        triggerCardAnimation('me', CARD_IDS.DURABLESIS);
                    }

                    // Enemy Flexesis Bonus
                    if (state.enemyCards.some(c => c.id === CARD_IDS.FLEXESIS)) {
                        const moveObj = enemyFullChoiceObjects[enemyMoveIndex];
                        if (moveObj && typeof moveObj === 'object') {
                            const currentRoundIndex = state.history.filter(h => h.type !== 'draft').length;
                            const roundsAgo = currentRoundIndex - moveObj.roundAdded;
                            if (roundsAgo > 0) {
                                enemyPoints += roundsAgo;
                                triggerCardAnimation('enemy', CARD_IDS.FLEXESIS);
                            }
                        }
                    }
                }

                if (state.myCards.some(c => c.id === CARD_IDS.GRAVITESIS) && me === 'rock') {
                    triggerCardAnimation('me', CARD_IDS.GRAVITESIS);
                    if (myPoints > 0) {
                        enemyPoints -= myPoints;
                        myPoints = 0;
                    }
                }
                if (state.enemyCards.some(c => c.id === CARD_IDS.GRAVITESIS) && enemy === 'rock') {
                    triggerCardAnimation('enemy', CARD_IDS.GRAVITESIS);
                    if (enemyPoints > 0) {
                        myPoints -= enemyPoints;
                        enemyPoints = 0;
                    }
                }

                state.history.push({ me, enemy, wins, myPoints, enemyPoints, masterIndex: masterIndex });
                updateHistoryDisplay();

                let oldMyScore = state.myScore;
                state.myScore = Math.max(0, state.myScore + myPoints);
                let evensCrossedMe = Math.floor(state.myScore / 2) - Math.floor(oldMyScore / 2);
                if (evensCrossedMe > 0) state.enemyBonusDrafts += evensCrossedMe;

                let oldEnemyScore = state.enemyScore;
                state.enemyScore = Math.max(0, state.enemyScore + enemyPoints);
                let evensCrossedEnemy = Math.floor(state.enemyScore / 2) - Math.floor(oldEnemyScore / 2);
                if (evensCrossedEnemy > 0) state.myBonusDrafts += evensCrossedEnemy;

                // Add 10 seconds for paper
                if (me === 'paper' && state.myTimerValue !== null) {
                    state.myTimerValue += 10;
                }
                if (enemy === 'paper' && state.enemyTimerValue !== null) {
                    state.enemyTimerValue += 10;
                }
                updateTimerUI();

                // Pacifesis Logic
                myCurrentMovePoints += (myPoints + enemyPoints);
                enemyCurrentMovePoints += (myPoints + enemyPoints);

                let isLastSubroundForMyMove = (index === totalMiniRounds - 1) || (Math.floor((index + 1) / (totalMiniRounds / myMaxMoves)) !== myMoveIndex);
                let isLastSubroundForEnemyMove = (index === totalMiniRounds - 1) || (Math.floor((index + 1) / (totalMiniRounds / enemyMaxMoves)) !== enemyMoveIndex);

                if (isLastSubroundForMyMove) {
                    let myPacifesisCount = state.myCards.filter(c => c.id === CARD_IDS.PACIFESIS).length;
                    if (myMoves[myMoveIndex] === 'paper' && myCurrentMovePoints < 0.001 && myPacifesisCount > 0) {
                        state.myPacifistStreak++;
                        triggerCardAnimation('me', CARD_IDS.PACIFESIS);
                        if (state.myPacifistStreak >= 2) {
                            state.myPacifesisWins += myPacifesisCount;
                            state.myPacifistStreak = 0;
                        }
                    } else {
                        state.myPacifistStreak = 0;
                    }
                    myCurrentMovePoints = 0;
                }

                if (isLastSubroundForEnemyMove) {
                    let enemyPacifesisCount = state.enemyCards.filter(c => c.id === CARD_IDS.PACIFESIS).length;
                    if (enemyMoves[enemyMoveIndex] === 'paper' && enemyCurrentMovePoints < 0.001 && enemyPacifesisCount > 0) {
                        state.enemyPacifistStreak++;
                        triggerCardAnimation('enemy', CARD_IDS.PACIFESIS);
                        if (state.enemyPacifistStreak >= 2) {
                            state.enemyPacifesisWins += enemyPacifesisCount;
                            state.enemyPacifistStreak = 0;
                        }
                    } else {
                        state.enemyPacifistStreak = 0;
                    }
                    enemyCurrentMovePoints = 0;
                }

                let myDelta = state.myScore - oldMyScore;
                let enemyDelta = state.enemyScore - oldEnemyScore;

                const onAllPointsAnimated = () => {
                    updateScores();

                    let myCurrentTotalWins = Math.floor(state.myScore / WIN_SCORE) + state.myPacifesisWins;
                    let enemyCurrentTotalWins = Math.floor(state.enemyScore / WIN_SCORE) + state.enemyPacifesisWins;

                    if (myCurrentTotalWins > 0 || enemyCurrentTotalWins > 0) {
                        handlePostRound(); // This will trigger endGame
                    } else {
                        resolveMiniRound(index + 1);
                    }
                };

                if (myDelta > 0) playSound('win');
                if (enemyDelta > 0 && myDelta <= 0) playSound('lose');

                if (Math.abs(myDelta) > 0.001 || Math.abs(enemyDelta) > 0.001) {
                    let animsToWait = (Math.abs(myDelta) > 0.001 ? 1 : 0) + (Math.abs(enemyDelta) > 0.001 ? 1 : 0);
                    let animsDone = 0;
                    const onAnimDone = () => { animsDone++; if (animsDone === animsToWait) onAllPointsAnimated(); };
                    if (Math.abs(myDelta) > 0.001) animatePoint('me', myDelta, onAnimDone);
                    if (Math.abs(enemyDelta) > 0.001) animatePoint('enemy', enemyDelta, onAnimDone);
                } else {
                    updateScores();
                    onAllPointsAnimated();
                }
            }, 600);
        }, 200);
    };

    resolveMiniRound(0);
}

function handlePostRound() {
    let myWins = Math.floor(state.myScore / WIN_SCORE) + state.myPacifesisWins;
    let enemyWins = Math.floor(state.enemyScore / WIN_SCORE) + state.enemyPacifesisWins;

    if (myWins > 0 || enemyWins > 0) {
        let msg = "";
        if (myWins > 0 && enemyWins > 0) {
            msg = `You won${myWins > 1 ? ' ' + myWins + ' times' : ''}! (Opponent also won${enemyWins > 1 ? ' ' + enemyWins + ' times' : ''})`;
        } else if (myWins > 0) {
            msg = `You won${myWins > 1 ? ' ' + myWins + ' times' : ''}!`;
        } else {
            msg = `Opponent won${enemyWins > 1 ? ' ' + enemyWins + ' times' : ''}! (You did not win)`;
        }
        endGame(msg);
        return;
    }

    // Host forces synchronization of scores to resolve any minor network desyncs
    if (state.isHost) {
        sendNetworkMessage('SYNC_STATE', {
            hostScore: state.myScore,
            clientScore: state.enemyScore
        });
    }

    processNextDraft();
}

function processNextDraft() {
    if (state.myBonusDrafts > 0) {
        state.myBonusDrafts--;
        state.phase = 'BONUS_DRAFT';
        state.myDraftDone = false;
        triggerDraft("Choose a bonus card!");
    } else {
        startRpsPhase();
    }
}

function endGame(msg) {
    state.phase = 'END';
    state.gameEnded = true;
    if (isFastForwarding) return;
    
    ui.turnStatus.textContent = `Game Over - ${msg}`;
    ui.rpsArea.classList.add('hidden');
    ui.draftArea.classList.add('hidden');
    
    ui.endMessage.textContent = msg;
    ui.endModal.classList.remove('hidden');

    // Reveal the board locally
    updateScores();
    updateCardDisplay();
    updateHistoryDisplay();
}

function restartGame() {
    ui.endModal.classList.add('hidden');
    startInitialDraft();
}

// --- 6. Utilities ---
function runDelayed(callback, delay) {
    if (document.hidden || isFastForwarding) {
        callback();
    } else {
        setTimeout(callback, delay);
    }
}

function applySoulesis() {
    // Swap Scores
    let tempScore = state.myScore;
    state.myScore = state.enemyScore;
    state.enemyScore = tempScore;

    // Swap Cards
    let tempCards = state.myCards;
    state.myCards = state.enemyCards;
    state.enemyCards = tempCards;

    // Swap Bonus Drafts
    let tempBonusDrafts = state.myBonusDrafts;
    state.myBonusDrafts = state.enemyBonusDrafts;
    state.enemyBonusDrafts = tempBonusDrafts;

    // Swap Pacifist Progress
    let tempPacifistStreak = state.myPacifistStreak;
    state.myPacifistStreak = state.enemyPacifistStreak;
    state.enemyPacifistStreak = tempPacifistStreak;

    let tempPacifesisWins = state.myPacifesisWins;
    state.myPacifesisWins = state.enemyPacifesisWins;
    state.enemyPacifesisWins = tempPacifesisWins;

    // Swap Timers
    let tempTimer = state.myTimerValue;
    state.myTimerValue = state.enemyTimerValue;
    state.enemyTimerValue = tempTimer;

    // Swap History Signatures
    let tempFull = state.myFullRoundHistory;
    state.myFullRoundHistory = state.enemyFullRoundHistory;
    state.enemyFullRoundHistory = tempFull;

    let tempSub = state.mySubRoundHistory;
    state.mySubRoundHistory = state.enemySubRoundHistory;
    state.enemySubRoundHistory = tempSub;

    if (state.masterMyDrafts) {
        let tempMD = state.masterMyDrafts; state.masterMyDrafts = state.masterEnemyDrafts; state.masterEnemyDrafts = tempMD;
        let tempMM = state.masterMyMoves; state.masterMyMoves = state.masterEnemyMoves; state.masterEnemyMoves = tempMM;
    }
    
    if (state.replayMyDrafts) {
        let tempRMD = state.replayMyDrafts; state.replayMyDrafts = state.replayEnemyDrafts; state.replayEnemyDrafts = tempRMD;
        let tempRMM = state.replayMyMoves; state.replayMyMoves = state.replayEnemyMoves; state.replayEnemyMoves = tempRMM;
    }

    // Swap Host state to shift the deterministic RNG generation offsets mathematically
    state.isHost = !state.isHost;

    // Swap Player Names
    let myName = ui.myNameDisplay.value;
    let enemyName = ui.enemyNameDisplay.textContent;
    ui.myNameDisplay.value = enemyName === 'Opponent' ? 'You' : enemyName;
    ui.enemyNameDisplay.textContent = myName === 'You' ? 'Opponent' : myName;
    localStorage.setItem('superRpsPlayerName', ui.myNameDisplay.value);

    // Swap the past visual history log
    state.history.forEach(turn => {
        if (turn.type === 'draft') {
            turn.picker = turn.picker === 'me' ? 'enemy' : 'me';
        } else {
            let tempMe = turn.me; turn.me = turn.enemy; turn.enemy = tempMe;
            let tempWinsMe = turn.wins.me; turn.wins.me = turn.wins.enemy; turn.wins.enemy = tempWinsMe;
            let tempMyPts = turn.myPoints; turn.myPoints = turn.enemyPoints; turn.enemyPoints = tempMyPts;
        }
    });

    // Destroy Soulesis
    let myIdx = state.myCards.findIndex(c => c.id === CARD_IDS.SOULESIS); if (myIdx !== -1) state.myCards.splice(myIdx, 1);
    let enIdx = state.enemyCards.findIndex(c => c.id === CARD_IDS.SOULESIS); if (enIdx !== -1) state.enemyCards.splice(enIdx, 1);

    updateScores();
    if (!ui.futureModal.classList.contains('hidden')) updateFutureModal();
    ui.turnStatus.textContent = "Soulesis Swapped Everything!";
    updateTimerUI();
}

function getDraftOptions(playerType, draftIndex) {
    if (!state.gameSeed) return [];

    const playerOffset = playerType === 'me' 
        ? (state.isHost ? 1 : 2) 
        : (state.isHost ? 2 : 1);
    let seed = state.gameSeed + playerOffset * 13371337 + draftIndex * 7331337;
    
    let currentSeed = seed;
    const nextRand = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
    };

    let pool = [...SUPERPOWER_CARDS];
    let options = [];
    for (let i = 0; i < DRAFT_OPTIONS_COUNT; i++) {
        if (pool.length === 0) break;
        const idx = Math.floor(nextRand() * pool.length);
        options.push(pool.splice(idx, 1)[0]);
    }
    return options;
}

function updateFutureModal() {
    ui.futureModalTitle.textContent = `Future Drafts (+${currentFutureOffset} from now)`;
    ui.futurePrevBtn.disabled = currentFutureOffset === 0;
    ui.futurePrevBtn.style.opacity = currentFutureOffset === 0 ? '0.5' : '1';

    const myOpts = getDraftOptions('me', state.myDraftsTaken + currentFutureOffset);
    const enemyOpts = getDraftOptions('enemy', state.enemyDraftsTaken + currentFutureOffset);
    
    const renderCard = (c) => `
        <div class="card pop-in" style="cursor: default;" data-effect="${c.effect.replace(/"/g, '&quot;')}">
            <div class="card-title">${c.name}</div>
            <img class="card-art" src="${c.art}" alt="Art">
        </div>`;
        
    ui.futureMyOptions.innerHTML = myOpts.map(renderCard).join('');
    ui.futureEnemyOptions.innerHTML = enemyOpts.map(renderCard).join('');
}

function getMyMaxMoves() {
    const count = state.myCards.filter(c => c.id === CARD_IDS.SPEEDESIS).length;
    return count > 0 ? Math.pow(2, count) : 1;
}
function getEnemyMaxMoves() {
    const count = state.enemyCards.filter(c => c.id === CARD_IDS.SPEEDESIS).length;
    return count > 0 ? Math.pow(2, count) : 1;
}

// --- Timesis Core Logic ---

let timesisTarget = { type: null, index: -1 };
let timesisTempMoves = [];
let timesisMaxMoves = 1;

function openTimesisUI() {
    ui.timesisHistoryContainer.innerHTML = state.history.map(turn => {
        if (turn.type === 'draft') {
            if (turn.picker === 'enemy' && isEnemyInvisible()) return ''; // Completely hide enemy drafts
            
            let interactive = turn.picker === 'me' ? `onclick="handleTimesisHistoryClick('draft', ${turn.masterIndex})" style="cursor:pointer; box-shadow: 0 0 10px #3498db;"` : '';
            
            return `
                <div class="history-turn">
                    <div class="history-icon ${turn.picker === 'enemy' ? 'draft-icon' : 'empty'}">${turn.picker === 'enemy' && !isEnemyInvisible() ? icons.card : ''}</div>
                    <div class="history-icon ${turn.picker === 'me' ? 'draft-icon interactive' : 'empty'}" ${interactive}>${turn.picker === 'me' ? icons.card : ''}</div>
                </div>
            `;
        } else {
            let enemyPoints = turn.enemyPoints ?? (turn.wins.enemy ? 1 : 0);
            let myPoints = turn.myPoints ?? (turn.wins.me ? 1 : 0);
            
            let enemyIconClass = isEnemyInvisible() ? 'empty' : (turn.wins.enemy ? (enemyPoints >= 0.999 ? 'winner' : 'fraction-winner') : (turn.wins.me ? 'loser' : 'tie'));
            let myIconClass = turn.wins.me ? (myPoints >= 0.999 ? 'winner' : 'fraction-winner') : (turn.wins.enemy ? 'loser' : 'tie');
            
            let enemyStyle = '';
            if (turn.wins.enemy && enemyPoints > 0.001 && enemyPoints < 0.999 && !isEnemyInvisible()) {
                let degrees = enemyPoints * 360;
                enemyStyle = `style="background: conic-gradient(#f1c40f ${degrees}deg, #fff 0);"`;
            }
            
            let myStyle = '';
            if (turn.wins.me && myPoints > 0.001 && myPoints < 0.999) {
                let degrees = myPoints * 360;
                myStyle = `style="background: conic-gradient(#f1c40f ${degrees}deg, #fff 0);"`;
            }

            let enemyIconHTML = isEnemyInvisible() ? '' : icons[turn.enemy];
            let interactive = `onclick="handleTimesisHistoryClick('move', ${turn.masterIndex})" style="cursor:pointer; box-shadow: 0 0 10px #3498db;"`;
            
            return `
                <div class="history-turn">
                    <div class="history-icon ${enemyIconClass}" ${enemyStyle}>${enemyIconHTML}</div>
                    <div class="history-icon ${myIconClass} interactive" ${myStyle} ${interactive}>${icons[turn.me]}</div>
                </div>
            `;
        }
    }).join('');
    ui.timesisModal.classList.remove('hidden');
}

window.handleTimesisHistoryClick = function(type, index) {
    timesisTarget = { type, index };
    if (type === 'draft') {
        let options = getDraftOptions('me', index);
        ui.timesisDraftOptions.innerHTML = '';
        options.forEach(card => {
            const btn = document.createElement('button');
            btn.className = 'card-btn pop-in';
            btn.innerHTML = `<div class="card-title">${card.name}</div><img class="card-art" src="${card.art}" alt="Art"><div class="card-desc">${card.effect}</div>`;
            btn.onclick = () => confirmTimesisChange('draft', card.id);
            ui.timesisDraftOptions.appendChild(btn);
        });
        ui.timesisModal.classList.add('hidden');
        ui.timesisRedraftModal.classList.remove('hidden');
    } else {
        timesisTempMoves = [];
        timesisMaxMoves = state.masterMyMoves[index].length;
        
        const timesisFlowerBtn = document.querySelector('#timesis-remove-area .rps-btn[data-choice="flower"]');
        if (timesisFlowerBtn) {
            if (state.myCards.some(c => c.id === CARD_IDS.AGROKINESIS)) {
                timesisFlowerBtn.classList.remove('hidden');
            } else {
                timesisFlowerBtn.classList.add('hidden');
            }
        }
        
        updateTimesisRemoveUI();
        ui.timesisModal.classList.add('hidden');
        ui.timesisRemoveModal.classList.remove('hidden');
    }
}

function updateTimesisRemoveUI() {
    ui.timesisRemoveQueue.innerHTML = timesisTempMoves.map((move, index) => `<div class="queue-icon" onclick="timesisTempMoves.splice(${index},1); updateTimesisRemoveUI()">${icons[move]}</div>`).join('');
    if (timesisTempMoves.length === timesisMaxMoves) ui.timesisRemoveConfirmBtn.classList.remove('hidden');
    else ui.timesisRemoveConfirmBtn.classList.add('hidden');
}

function makeTimesisMove(choice) {
    if (timesisTempMoves.length < timesisMaxMoves) {
        timesisTempMoves.push(choice);
        updateTimesisRemoveUI();
    }
}

function confirmTimesisChange(type, newValue) {
    ui.timesisRedraftModal.classList.add('hidden');
    ui.timesisRemoveModal.classList.add('hidden');
    ui.timesisModal.classList.add('hidden');
    sendNetworkMessage('TIMESIS_CHANGE', { type: type, index: timesisTarget.index, newValue: newValue });
    applyTimesisChangeLocally(type, timesisTarget.index, newValue, 'me');
}

function applyTimesisChangeLocally(type, index, newValue, player) {
    if (type === 'draft') {
        if (player === 'me') state.masterMyDrafts[index] = newValue;
        else state.masterEnemyDrafts[index] = newValue;
    } else if (type === 'move') {
        if (player === 'me') state.masterMyMoves[index] = newValue;
        else state.masterEnemyMoves[index] = newValue;
    }
    fastForwardToPresent();
}

function simulateEnemyDraft() {
    let options = getDraftOptions('enemy', state.enemyDraftsTaken);
    let cardId = state.replayEnemyDrafts.shift();
    let card = options.find(c => c.id === cardId) || options[0];
    
    state.enemyDraftDone = true;
    state.enemyDraftsTaken++;
    if (state.enemyBonusDrafts > 0) state.enemyBonusDrafts--;
    
    executeDraftSelection(card, 'enemy', stolen);
    
    checkPhaseTransition();
}

function simulateEnemyMoves() {
    let moves = state.replayEnemyMoves.shift();
    if (!moves || moves.length !== getEnemyMaxMoves()) moves = new Array(getEnemyMaxMoves()).fill('rock');
    state.enemyRpsChoices = moves;
    resolveRoundSequence();
}

function simulateMyMoves() {
    let moves = state.replayMyMoves.shift();
    if (!moves || moves.length !== getMyMaxMoves()) moves = new Array(getMyMaxMoves()).fill('rock');
    moves.forEach(m => makeRpsChoice(m));
}

function fastForwardToPresent() {
    isFastForwarding = true;
    
    state.replayMyDrafts = [...state.masterMyDrafts];
    state.replayEnemyDrafts = [...state.masterEnemyDrafts];
    state.replayMyMoves = [...state.masterMyMoves];
    state.replayEnemyMoves = [...state.masterEnemyMoves];
    
    let seed = state.originalGameSeed;
    let isHost = state.originalIsHost;
    
    startInitialDraft({ seed: seed });
    state.isHost = isHost;
    state.originalIsHost = isHost;
    state.originalGameSeed = seed;
    
    while(state.replayMyDrafts.length > 0 || state.replayEnemyDrafts.length > 0 || state.replayMyMoves.length > 0 || state.replayEnemyMoves.length > 0) {
        let progressed = false;

        if (state.phase === 'INITIAL_DRAFT') {
            if (!state.myDraftDone && state.replayMyDrafts.length > 0) {
                let card = getDraftOptions('me', state.myDraftsTaken).find(c => c.id === state.replayMyDrafts.shift()) || getDraftOptions('me', state.myDraftsTaken)[0];
                selectCard(card); progressed = true;
            }
            if (!state.enemyDraftDone && state.replayEnemyDrafts.length > 0) {
                simulateEnemyDraft(); progressed = true;
            }
        }
        else if (state.phase === 'BONUS_DRAFT') {
            if (!state.myDraftDone && state.replayMyDrafts.length > 0) {
                let card = getDraftOptions('me', state.myDraftsTaken).find(c => c.id === state.replayMyDrafts.shift()) || getDraftOptions('me', state.myDraftsTaken)[0];
                selectCard(card); progressed = true;
            }
            else if (state.enemyBonusDrafts > 0 && state.replayEnemyDrafts.length > 0) {
                simulateEnemyDraft(); progressed = true;
            }
        }
        else if (state.phase === 'RPS') {
            if (state.enemyBonusDrafts > 0 && state.replayEnemyDrafts.length > 0) {
                simulateEnemyDraft(); progressed = true;
            } else if (state.enemyBonusDrafts === 0) {
                if (state.myRpsChoices.length < getMyMaxMoves() && state.replayMyMoves.length > 0) { simulateMyMoves(); progressed = true; }
                if (state.enemyRpsChoices.length < getEnemyMaxMoves() && state.replayEnemyMoves.length > 0) { simulateEnemyMoves(); progressed = true; }
            }
        }
        else if (state.phase === 'END') break;
        
        if (!progressed) break;
    }
    
    isFastForwarding = false;
    updateScores(); updateCardDisplay(); updateHistoryDisplay(); updateRpsUI(); updateTimerUI();
    ui.turnStatus.textContent = state.phase === 'END' ? ui.turnStatus.textContent : "Timeline altered! Waiting for input.";
}

// Boot
init();

function tickTimers() {
    if (state.phase === 'END' || state.gameEnded || isFastForwarding) return;

    let myNeedsToAct = false;
    let enemyNeedsToAct = false;

    if (state.phase === 'INITIAL_DRAFT' || state.phase === 'BONUS_DRAFT') {
        myNeedsToAct = !state.myDraftDone;
        enemyNeedsToAct = !state.enemyDraftDone;
    } else if (state.phase === 'RPS') {
        myNeedsToAct = state.myRpsChoices.length < getMyMaxMoves();
        enemyNeedsToAct = state.enemyRpsChoices.length < getEnemyMaxMoves();
    }

    let updated = false;
    if (state.myTimerValue !== null && myNeedsToAct) {
        state.myTimerValue--;
        updated = true;
        if (state.myTimerValue <= 0) {
            state.myTimerValue = 0;
            sendNetworkMessage('TIME_OUT');
            endGame("You ran out of time! (Gastroenteresis)");
        } else if (state.myTimerValue % 10 === 0) {
            // Sync every 10 seconds
            sendNetworkMessage('TIMER_SYNC', { value: state.myTimerValue });
        }
    }
    if (state.enemyTimerValue !== null && enemyNeedsToAct) {
        state.enemyTimerValue--;
        updated = true;
        if (state.enemyTimerValue <= 0) {
            state.enemyTimerValue = 0;
        }
    }
    if (updated) updateTimerUI();
}