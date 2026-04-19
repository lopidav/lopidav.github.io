// --- 1. Game Data Setup ---
const WIN_SCORE = 10;
const DRAFT_OPTIONS_COUNT = 3;

// Asset Storage
const sounds = {
    win: new Audio('audio/win.mp3'),
    lose: new Audio('audio/lose.mp3'),
    draft: new Audio('audio/draft.mp3')
};
const icons = {
    rock: `<svg viewBox="0 0 24 24"><path d="M19.5 9.5c0-.83-.67-1.5-1.5-1.5h-1.5V6.5c0-.83-.67-1.5-1.5-1.5h-1.5V3.5c0-.83-.67-1.5-1.5-1.5S10.5 2.67 10.5 3.5v5H9V7.5C9 6.67 8.33 6 7.5 6S6 6.67 6 7.5v3.68c-.96.2-1.93.59-2.73 1.15-.65.45-.88 1.35-.45 2.02l2.67 4.14c1.1 1.7 2.97 2.72 5 2.76h4.5c2.76 0 5-2.24 5-5v-6.75z"/></svg>`,
    paper: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
    scissors: `<svg viewBox="0 0 24 24"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1l-9.64-9.64zM6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-3z"/></svg>`,
    card: `<svg viewBox="0 0 24 24"><rect x="2" y="6" width="5" height="12" rx="1"/><rect x="17" y="6" width="5" height="12" rx="1"/><rect x="8" y="3" width="8" height="18" rx="1"/></svg>`
};
const BROKEN_ICON = `<svg viewBox="0 0 24 24"><path d="M3 3L21 21M21 3L3 21" stroke="#e74c3c" stroke-width="4" stroke-linecap="round"/></svg>`;

// Define Superpower Cards
const SUPERPOWER_CARDS = [
    {
        id: 1,
        name: "Intelegenesis",
        art: "https://picsum.photos/seed/brain/150/150",
        effect: "If you win with paper - you win two times the points."
    },
    {
        id: 2,
        name: "Lesbianesis",
        art: "https://picsum.photos/seed/scissors/150/150",
        effect: "If you and your opponent both scissor - you win the round."
    },
    ...Array.from({ length: 19 }, (_, i) => ({
        id: i + 3,
        name: `Power ${i + 3}`,
        art: `https://picsum.photos/seed/${i + 3}/150/150`,
        effect: `This is a powerful placeholder effect for Power ${i + 3}. When you read this, imagine immense cosmic power.`
    }))
];

// --- 2. State Variables ---
let peer = null;
let conn = null;

let state = {
    isHost: false,
    myScore: 0,
    enemyScore: 0,
    myCards: [],
    enemyCards: [],
    history: [],
    myRpsChoice: null,
    enemyRpsChoice: null,
    myDraftDone: false,
    enemyDraftDone: false,
    myBonusDrafts: 0,
    enemyBonusDrafts: 0,
    phase: 'LOBBY' // LOBBY, INITIAL_DRAFT, RPS, BONUS_DRAFT, WAITING, END
};

// --- 3. DOM Elements ---
const screens = {
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};
const ui = {
    lobbyNameInput: document.getElementById('lobby-name-input'),
    myNameDisplay: document.getElementById('my-name-display'),
    enemyNameDisplay: document.getElementById('enemy-name-display'),
    myId: document.getElementById('my-id'),
    copyIdBtn: document.getElementById('copy-id-btn'),
    copyLinkBtn: document.getElementById('copy-link-btn'),
    joinInput: document.getElementById('join-id'),
    joinBtn: document.getElementById('join-btn'),
    myScoreDots: document.getElementById('my-score-dots'),
    enemyScoreDots: document.getElementById('enemy-score-dots'),
    myCardsList: document.getElementById('my-cards-list'),
    enemyCardsList: document.getElementById('enemy-cards-list'),
    turnStatus: document.getElementById('turn-status'),
    draftArea: document.getElementById('draft-area'),
    draftOptions: document.getElementById('draft-options'),
    hideDraftBtn: document.getElementById('hide-draft-btn'),
    skipDraftBtn: document.getElementById('skip-draft-btn'),
    returnDraftBtn: document.getElementById('return-draft-btn'),
    rpsArea: document.getElementById('rps-area'),
    myClashIcon: document.getElementById('my-clash-icon'),
    enemyClashIcon: document.getElementById('enemy-clash-icon'),
    historyContainer: document.getElementById('history-container'),
    endModal: document.getElementById('end-modal'),
    endMessage: document.getElementById('end-message'),
    restartBtn: document.getElementById('restart-btn')
};

// --- 4. Initialization & Networking ---
function init() {
    // Load names
    const savedName = localStorage.getItem('superRpsPlayerName') || '';
    ui.lobbyNameInput.value = savedName;
    ui.myNameDisplay.value = savedName || 'You';

    const updateName = (newName, sourceElement) => {
        localStorage.setItem('superRpsPlayerName', newName);
        if (sourceElement !== ui.lobbyNameInput) ui.lobbyNameInput.value = newName;
        if (sourceElement !== ui.myNameDisplay) ui.myNameDisplay.value = newName || 'You';
        if (conn && conn.open) sendNetworkMessage('SET_NAME', { name: newName });
    };

    ui.lobbyNameInput.addEventListener('input', (e) => updateName(e.target.value, ui.lobbyNameInput));
    ui.myNameDisplay.addEventListener('input', (e) => updateName(e.target.value, ui.myNameDisplay));
    ui.myNameDisplay.addEventListener('blur', (e) => {
        if (!e.target.value.trim()) ui.myNameDisplay.value = 'You';
    });


    peer = new Peer(); // Connects to default PeerJS cloud server

    peer.on('open', (id) => {
        ui.myId.textContent = id;
        
        // Auto-join via URL
        const urlParams = new URLSearchParams(window.location.search);
        const joinId = urlParams.get('join');
        if (joinId) {
            ui.joinInput.value = joinId;
            const connection = peer.connect(joinId);
            setupConnection(connection);
            
            // Clean URL bar to avoid loop on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });
    
    setupClipboard();

    // Handle incoming connection (Host side)
    peer.on('connection', (connection) => {
        if (conn) {
            connection.close(); // Only allow 1v1
            return;
        }
        setupConnection(connection);
    });

    // Handle outgoing connection (Client side)
    ui.joinBtn.addEventListener('click', () => {
        const targetId = ui.joinInput.value.trim();
        if (!targetId) return;
        const connection = peer.connect(targetId);
        setupConnection(connection);
    });

    // Bind RPS buttons
    document.querySelectorAll('.rps-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const choice = e.currentTarget.dataset.choice;
            makeRpsChoice(choice);
        });
    });

    // Bind Restart button
    ui.restartBtn.addEventListener('click', () => {
        sendNetworkMessage('RESTART_GAME');
        restartGame();
    });

    // Bind Draft Overlay Buttons
    ui.hideDraftBtn.addEventListener('click', () => {
        ui.draftArea.classList.add('hidden');
        ui.returnDraftBtn.classList.remove('hidden');
    });
    
    ui.returnDraftBtn.addEventListener('click', () => {
        ui.draftArea.classList.remove('hidden');
        ui.returnDraftBtn.classList.add('hidden');
    });
    
    ui.skipDraftBtn.addEventListener('click', () => {
        selectCard(null); // Skip selection
    });

    // Horizontal scroll for history using mouse wheel
    ui.historyContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        ui.historyContainer.scrollLeft += e.deltaY;
    });

    // F2 to show all cards in draft
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F2' && !ui.draftArea.classList.contains('hidden')) {
            e.preventDefault();
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
}

function setupConnection(connection) {
    conn = connection;
    state.isHost = peer.id > conn.peer; // Deterministic host resolution for sync authority
    
    conn.on('open', () => {
        showScreen('game');
        console.log("Connected to opponent.");
        sendNetworkMessage('SET_NAME', { name: localStorage.getItem('superRpsPlayerName') || '' });
        
        // Host triggers the game start to synchronize
        if (peer.id > conn.peer) {
            setTimeout(startInitialDraft, 500);
        }
    });

    conn.on('data', (data) => {
        handleNetworkMessage(data);
    });

    conn.on('close', () => {
        console.log("Opponent disconnected.");
        ui.turnStatus.textContent = "Opponent disconnected!";
    });
}

function setupClipboard() {
    const copy = (text, btn) => {
        navigator.clipboard.writeText(text).then(() => {
            const original = btn.textContent;
            btn.textContent = "Copied!";
            setTimeout(() => btn.textContent = original, 2000);
        }).catch(() => console.error("Clipboard failed"));
    };

    ui.copyIdBtn.addEventListener('click', () => copy(peer.id, ui.copyIdBtn));
    
    ui.copyLinkBtn.addEventListener('click', () => {
        const link = `${window.location.origin}${window.location.pathname}?join=${peer.id}`;
        copy(link, ui.copyLinkBtn);
    });
}

function sendNetworkMessage(type, payload = {}) {
    if (conn && conn.open) {
        conn.send({ type, ...payload });
    }
}

function handleNetworkMessage(data) {
    switch(data.type) {
        case 'START_INITIAL_DRAFT':
            startInitialDraft();
            break;
        case 'CARD_SELECTED':
            state.enemyDraftDone = true;
            if (data.card) {
                state.enemyCards.push(data.card);
                state.history.push({ type: 'draft', picker: 'enemy' });
                updateHistoryDisplay();
                updateCardDisplay();
            }
            checkPhaseTransition();
            break;
        case 'RPS_CHOICE':
            state.enemyRpsChoice = data.choice;
            updateRpsUI();
            resolveRpsRound();
            break;
        case 'RESTART_GAME':
            restartGame();
            break;
        case 'SYNC_STATE':
            if (!state.isHost) { // Only clients accept forcibly synchronized state
                state.myScore = data.clientScore;
                state.enemyScore = data.hostScore;
                updateScores();
            }
            break;
        case 'SET_NAME':
            ui.enemyNameDisplay.textContent = data.name || 'Opponent';
            break;
    }
}

// --- 5. Game Logic & Flow ---

function startInitialDraft() {
    if (peer.id > conn.peer) sendNetworkMessage('START_INITIAL_DRAFT');
    
    state.phase = 'INITIAL_DRAFT';
    state.myCards = [];
    state.enemyCards = [];
    state.history = [];
    state.myDraftDone = false;
    state.enemyDraftDone = false;
    state.myRpsChoice = null;
    state.enemyRpsChoice = null;
    state.myScore = 0;
    state.enemyScore = 0;
    state.myBonusDrafts = 0;
    state.enemyBonusDrafts = 0;
    updateScores();
    updateCardDisplay();
    updateHistoryDisplay();
    
    triggerDraft("Choose your starting superpower!");
}

function triggerDraft(message) {
    ui.turnStatus.textContent = message;
    ui.rpsArea.classList.add('hidden');
    ui.draftArea.classList.remove('hidden');
    ui.draftOptions.innerHTML = '';

    // Pick random cards from the pool
    const shuffled = [...SUPERPOWER_CARDS].sort(() => 0.5 - Math.random());
    const options = shuffled.slice(0, DRAFT_OPTIONS_COUNT);

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
    if (document.hidden) return;
    if (sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].play().catch(e => console.warn("Audio play blocked", e));
    }
}

function selectCard(card) {
    if (card) {
        playSound('draft');
        state.myCards.push(card);
        state.history.push({ type: 'draft', picker: 'me' });
        updateHistoryDisplay();
        updateCardDisplay();
    }
    state.myDraftDone = true;
    
    ui.draftArea.classList.add('hidden');
    ui.returnDraftBtn.classList.add('hidden'); // Ensure return is hidden
    ui.turnStatus.textContent = "Waiting for opponent...";
    
    sendNetworkMessage('CARD_SELECTED', { card });
    checkPhaseTransition();
}

function checkPhaseTransition() {
    if (state.phase === 'INITIAL_DRAFT' && state.myDraftDone && state.enemyDraftDone) {
        startRpsPhase();
    }
    else if (state.phase === 'WAITING' && state.enemyDraftDone) {
         processNextDraft();
    }
    else if (state.phase === 'BONUS_DRAFT' && state.myDraftDone && state.enemyDraftDone) {
         processNextDraft();
    }
}

function startRpsPhase() {
    state.phase = 'RPS';
    
    ui.turnStatus.textContent = "Choose Rock, Paper, or Scissors!";
    ui.rpsArea.classList.remove('hidden');
    ui.myClashIcon.classList.add('hidden');
    ui.enemyClashIcon.classList.add('hidden');
    ui.draftArea.classList.add('hidden');

    updateRpsUI();
    resolveRpsRound(); // Try instantly resolving if opponent already sent choice
}

function updateRpsUI() {
    if (state.phase !== 'RPS') return;

    // Highlight the selected button
    document.querySelectorAll('.rps-btn').forEach(btn => {
        if (btn.dataset.choice === state.myRpsChoice) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });

    // Show the opponent's "Ready" indicator if they picked
    if (state.enemyRpsChoice) {
        ui.enemyClashIcon.classList.remove('hidden');
        ui.enemyClashIcon.innerHTML = `<span style="font-size:2em; color:#ccc; font-weight:bold;">?</span>`;
    } else {
        ui.enemyClashIcon.classList.add('hidden');
    }

    // Update Context Text
    if (state.myRpsChoice && !state.enemyRpsChoice) {
        ui.turnStatus.textContent = "Choice selected. Waiting for opponent...";
    } else if (!state.myRpsChoice && state.enemyRpsChoice) {
        ui.turnStatus.textContent = "Opponent is ready! Make your choice!";
    } else {
        ui.turnStatus.textContent = "Choose Rock, Paper, or Scissors!";
    }
}

function makeRpsChoice(choice) {
    if (state.phase !== 'RPS') return;
    
    // Toggle selection if clicking the same button
    if (state.myRpsChoice === choice) state.myRpsChoice = null;
    else state.myRpsChoice = choice;
    
    updateRpsUI();
    
    sendNetworkMessage('RPS_CHOICE', { choice: state.myRpsChoice });
    resolveRpsRound();
}

function resolveRpsRound() {
    if (state.phase !== 'RPS' || !state.myRpsChoice || !state.enemyRpsChoice) return;

    const me = state.myRpsChoice;
    const enemy = state.enemyRpsChoice;
    
    // Clear state immediately to prevent next-round race conditions
    state.myRpsChoice = null;
    state.enemyRpsChoice = null;
    state.myDraftDone = false;
    state.enemyDraftDone = false;
    state.phase = 'RESOLVING'; // Lock phase during animations
    
    ui.rpsArea.classList.add('hidden');
    document.querySelectorAll('.rps-btn').forEach(btn => btn.classList.remove('selected'));

    ui.myClashIcon.classList.remove('hidden');
    ui.enemyClashIcon.classList.remove('hidden');
    ui.myClashIcon.innerHTML = icons[me];
    ui.enemyClashIcon.innerHTML = icons[enemy];
    ui.turnStatus.textContent = "Clash!";
    
    ui.myClashIcon.classList.add('clash-anim-up');
    ui.enemyClashIcon.classList.add('clash-anim-down');

    let wins = { me: false, enemy: false };
    let myWinTriggers = 0; // Tracks multi-triggers for future cards
    let enemyWinTriggers = 0;

    if (me === enemy) {
        if (me === 'scissors') {
            const myLesb = state.myCards.filter(c => c.id === 2).length;
            const enemyLesb = state.enemyCards.filter(c => c.id === 2).length;
            if (myLesb > 0) {
                wins.me = true;
                myWinTriggers = myLesb;
                triggerCardAnimation('me', 2);
            }
            if (enemyLesb > 0) {
                wins.enemy = true;
                enemyWinTriggers = enemyLesb;
                triggerCardAnimation('enemy', 2);
            }
        }
    } else if (
        (me === 'rock' && enemy === 'scissors') ||
        (me === 'paper' && enemy === 'rock') ||
        (me === 'scissors' && enemy === 'paper')
    ) {
        wins.me = true;
        myWinTriggers = 1;
    } else {
        wins.enemy = true;
        enemyWinTriggers = 1;
    }

    runDelayed(() => {
        if (!wins.me && wins.enemy) { ui.myClashIcon.classList.add('clash-loser-anim'); ui.myClashIcon.innerHTML = BROKEN_ICON; }
        else if (wins.me && !wins.enemy) { ui.enemyClashIcon.classList.add('clash-loser-anim'); ui.enemyClashIcon.innerHTML = BROKEN_ICON; }
        else if (!wins.me && !wins.enemy) { 
            ui.enemyClashIcon.classList.add('clash-loser-anim'); ui.myClashIcon.classList.add('clash-loser-anim');
            ui.enemyClashIcon.innerHTML = BROKEN_ICON; ui.myClashIcon.innerHTML = BROKEN_ICON;
        } // If both win, neither breaks!

        runDelayed(() => {
            ui.myClashIcon.classList.remove('clash-anim-up', 'clash-loser-anim');
            ui.enemyClashIcon.classList.remove('clash-anim-down', 'clash-loser-anim');
            ui.myClashIcon.classList.add('hidden');
            ui.enemyClashIcon.classList.add('hidden');

        if (wins.me && wins.enemy) ui.turnStatus.textContent = "Both Players Win!";
        else if (wins.me) ui.turnStatus.textContent = "You Win the Round!";
        else if (wins.enemy) ui.turnStatus.textContent = "Opponent Wins the Round!";
        else ui.turnStatus.textContent = "It's a Tie!";
        
        state.history.push({ me, enemy, wins });
        updateHistoryDisplay();

        let myPoints = 0;
        let enemyPoints = 0;

        if (wins.me) {
            myPoints = 1;
            let intelCount = state.myCards.filter(c => c.id === 1).length;
            if (me === 'paper' && intelCount > 0) {
                myPoints *= Math.pow(2, intelCount);
                triggerCardAnimation('me', 1);
            }
        }
        if (wins.enemy) {
            enemyPoints = 1;
            let intelCount = state.enemyCards.filter(c => c.id === 1).length;
            if (enemy === 'paper' && intelCount > 0) {
                enemyPoints *= Math.pow(2, intelCount);
                triggerCardAnimation('enemy', 1);
            }
        }

        let oldMyScore = state.myScore;
        state.myScore += myPoints;
        let evensCrossedMe = Math.floor(state.myScore / 2) - Math.floor(oldMyScore / 2);
        if (evensCrossedMe > 0) state.enemyBonusDrafts += evensCrossedMe;

        let oldEnemyScore = state.enemyScore;
        state.enemyScore += enemyPoints;
        let evensCrossedEnemy = Math.floor(state.enemyScore / 2) - Math.floor(oldEnemyScore / 2);
        if (evensCrossedEnemy > 0) state.myBonusDrafts += evensCrossedEnemy;

        if (wins.me || wins.enemy) {
            if (wins.me) playSound('win');
            if (wins.enemy && !wins.me) playSound('lose');

            let totalAnims = myPoints + enemyPoints;
            let animsDone = 0;
            const onAnimDone = () => {
                animsDone++;
                if (animsDone === totalAnims) {
                    updateScores();
                    handlePostRound();
                }
            };

            if (myPoints > 0) animatePoint('me', myPoints, onAnimDone);
            if (enemyPoints > 0) animatePoint('enemy', enemyPoints, onAnimDone);
        } else {
            updateScores();
            handlePostRound();
        }
        }, 600); // Wait for broken shake animation
    }, 200); // Wait for halfway down vertical translation to trigger shatter
}

function triggerCardAnimation(owner, cardId) {
    const container = owner === 'me' ? ui.myCardsList : ui.enemyCardsList;
    const cardEls = container.querySelectorAll(`.card[data-id="${cardId}"]`);
    cardEls.forEach(el => {
        el.classList.remove('card-trigger-anim');
        void el.offsetWidth; // Force CSS reflow to restart animation safely
        el.classList.add('card-trigger-anim');
    });
}

function animatePoint(player, points, onComplete) {
    if (document.hidden) {
        for(let i = 0; i < points; i++) onComplete();
        return;
    }

    for (let i = 0; i < points; i++) {
        setTimeout(() => {
            const point = document.createElement('div');
            point.className = 'animated-point';
            document.body.appendChild(point);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const currentScore = player === 'me' ? state.myScore : state.enemyScore;
                    const targetScore = currentScore - points + 1 + i;
                    const prefix = player === 'me' ? 'my' : 'enemy';
                    const targetDot = document.querySelector(`#${prefix}-score-dots .dot:nth-child(${targetScore})`);
                    
                    if (targetDot) {
                        const rect = targetDot.getBoundingClientRect();
                        const centerX = window.innerWidth / 2;
                        const centerY = window.innerHeight / 2;
                        const targetX = rect.left + rect.width / 2;
                        const targetY = rect.top + rect.height / 2;
                        
                        point.style.transform = `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0.5)`;
                    }

                    setTimeout(() => {
                        point.remove();
                        onComplete();
                    }, 600); // sync with css animation timing
                });
            });
        }, i * 200); // Stagger the animations
    }
}

function handlePostRound() {
    // Check for match win
    if (state.myScore >= WIN_SCORE && state.enemyScore >= WIN_SCORE) {
        if (state.myScore > state.enemyScore) endGame("You Win!");
        else if (state.enemyScore > state.myScore) endGame("Opponent Wins!");
        else endGame("It's a Tie Game!");
        return;
    } else if (state.myScore >= WIN_SCORE) {
        endGame("You Win!");
        return;
    } else if (state.enemyScore >= WIN_SCORE) {
        endGame("Opponent Wins!");
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
    if (state.myBonusDrafts > 0 && state.enemyBonusDrafts > 0) {
        state.myBonusDrafts--;
        state.enemyBonusDrafts--;
        state.phase = 'BONUS_DRAFT';
        state.myDraftDone = false;
        state.enemyDraftDone = false;
        triggerDraft("Choose a bonus card!");
    } else if (state.myBonusDrafts > 0) {
        state.myBonusDrafts--;
        state.phase = 'BONUS_DRAFT';
        state.myDraftDone = false;
        state.enemyDraftDone = true;
        triggerDraft("Opponent hit an even score! Choose a bonus card:");
    } else if (state.enemyBonusDrafts > 0) {
        state.enemyBonusDrafts--;
        state.phase = 'WAITING';
        state.myDraftDone = true;
        state.enemyDraftDone = false;
        ui.turnStatus.textContent = "Opponent is drafting a bonus card...";
    } else {
        startRpsPhase();
        return;
    }
    checkPhaseTransition();
}

function endGame(msg) {
    state.phase = 'END';
    ui.turnStatus.textContent = `Game Over - ${msg}`;
    ui.rpsArea.classList.add('hidden');
    ui.draftArea.classList.add('hidden');
    
    ui.endMessage.textContent = msg;
    ui.endModal.classList.remove('hidden');
}

function restartGame() {
    ui.endModal.classList.add('hidden');
    startInitialDraft();
}

// --- 6. Utilities ---
function runDelayed(callback, delay) {
    if (document.hidden) {
        callback();
    } else {
        setTimeout(callback, delay);
    }
}

function showScreen(screenName) {
    screens.lobby.classList.remove('active');
    screens.game.classList.remove('active');
    screens[screenName].classList.add('active');
}

function renderDots(score, maxScore) {
    let html = '';
    for (let i = 0; i < maxScore; i++) {
        html += `<div class="dot ${i < score ? 'filled' : ''}"></div>`;
    }
    return html;
}

function updateScores() {
    ui.myScoreDots.innerHTML = renderDots(state.myScore, WIN_SCORE);
    ui.enemyScoreDots.innerHTML = renderDots(state.enemyScore, WIN_SCORE);
}

function updateCardDisplay() {
    const renderCard = (c, owner) => `
        <div class="card pop-in" data-id="${c.id}" onclick="showCardModal(${c.id}, '${owner}')">
            <div class="card-title">${c.name}</div>
            <img class="card-art" src="${c.art}" alt="Art">
            <div class="card-tooltip">${c.effect}</div>
        </div>`;
    ui.myCardsList.innerHTML = state.myCards.map(c => renderCard(c, 'me')).join('');
    ui.enemyCardsList.innerHTML = state.enemyCards.map(c => renderCard(c, 'enemy')).join('');
}

function updateHistoryDisplay() {
    if (!ui.historyContainer) return;

    const prevScrollLeft = ui.historyContainer.scrollLeft;
    const prevScrollWidth = ui.historyContainer.scrollWidth;

    ui.historyContainer.innerHTML = state.history.map(turn => {
        if (turn.type === 'draft') {
            return `
                <div class="history-turn pop-in">
                    <div class="history-icon ${turn.picker === 'enemy' ? 'draft-icon' : 'empty'}">${turn.picker === 'enemy' ? icons.card : ''}</div>
                    <div class="history-icon ${turn.picker === 'me' ? 'draft-icon' : 'empty'}">${turn.picker === 'me' ? icons.card : ''}</div>
                </div>
            `;
        } else {
            return `
                <div class="history-turn pop-in">
                    <div class="history-icon ${turn.wins.enemy ? 'winner' : (turn.wins.me ? 'loser' : 'tie')}">${icons[turn.enemy]}</div>
                    <div class="history-icon ${turn.wins.me ? 'winner' : (turn.wins.enemy ? 'loser' : 'tie')}">${icons[turn.me]}</div>
                </div>
            `;
        }
    }).join('');
    
    // Restore exact scroll position instantly so the view doesn't jump
    ui.historyContainer.scrollLeft = prevScrollLeft;

    // Smoothly shift to the left by the width of the newly added items
    const newScrollWidth = ui.historyContainer.scrollWidth;
    if (newScrollWidth > prevScrollWidth) {
        setTimeout(() => {
            ui.historyContainer.scrollTo({
                left: prevScrollLeft + (newScrollWidth - prevScrollWidth),
                behavior: 'smooth'
            });
        }, 10); // Let the DOM layout update first
    }
}

function showCardModal(id, owner = 'pool') {
    let card;
    if (owner === 'me') card = state.myCards.find(c => c.id === id);
    else if (owner === 'enemy') card = state.enemyCards.find(c => c.id === id);
    
    if (!card) card = SUPERPOWER_CARDS.find(c => c.id === id);
    
    if(!card) return;
    document.getElementById('modal-title').textContent = card.name;
    document.getElementById('modal-art').src = card.art;
    document.getElementById('modal-effect').textContent = card.effect;
    document.getElementById('card-modal').classList.remove('hidden');
}

function closeCardModal() {
    document.getElementById('card-modal').classList.add('hidden');
}

// Boot
init();