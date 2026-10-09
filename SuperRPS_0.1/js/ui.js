// --- 3. DOM Elements ---
const screens = {
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};
const ui = {
    app: document.getElementById('app'),
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
    myTimerDisplay: document.getElementById('my-timer'),
    enemyTimerDisplay: document.getElementById('enemy-timer'),
    myCardsList: document.getElementById('my-cards-list'),
    enemyCardsList: document.getElementById('enemy-cards-list'),
    turnStatus: document.getElementById('turn-status'),
    draftArea: document.getElementById('draft-area'),
    draftOptions: document.getElementById('draft-options'),
    hideDraftBtn: document.getElementById('hide-draft-btn'),
    skipDraftBtn: document.getElementById('skip-draft-btn'),
    returnDraftBtn: document.getElementById('return-draft-btn'),
    returnEndBtn: document.getElementById('return-end-btn'),
    futureDraftsBtn: document.getElementById('future-drafts-btn'),
    futureModal: document.getElementById('future-modal'),
    futureMyOptions: document.getElementById('future-my-options'),
    futureEnemyOptions: document.getElementById('future-enemy-options'),
    futurePrevBtn: document.getElementById('future-prev-btn'),
    futureNextBtn: document.getElementById('future-next-btn'),
    futureCloseBtn: document.getElementById('future-close-btn'),
    futureModalTitle: document.getElementById('future-modal-title'),
    rpsArea: document.getElementById('rps-area'),
    rpsQueueArea: document.getElementById('rps-queue-area'),
    myClashIcon: document.getElementById('my-clash-icon'),
    enemyClashIcon: document.getElementById('enemy-clash-icon'),
    historyContainer: document.getElementById('history-container'),
    endModal: document.getElementById('end-modal'),
    endMessage: document.getElementById('end-message'),
    viewBoardBtn: document.getElementById('view-board-btn'),
    restartBtn: document.getElementById('restart-btn'),
    globalTooltip: document.getElementById('global-tooltip'),
    timesisModal: document.getElementById('timesis-modal'),
    timesisHistoryContainer: document.getElementById('timesis-history-container'),
    timesisSkipBtn: document.getElementById('timesis-skip-btn'),
    timesisRedraftModal: document.getElementById('timesis-redraft-modal'),
    timesisDraftOptions: document.getElementById('timesis-draft-options'),
    timesisRedraftBackBtn: document.getElementById('timesis-redraft-back-btn'),
    timesisRemoveModal: document.getElementById('timesis-remove-modal'),
    timesisRemoveQueue: document.getElementById('timesis-remove-queue'),
    timesisRemoveBackBtn: document.getElementById('timesis-remove-back-btn'),
    timesisRemoveConfirmBtn: document.getElementById('timesis-remove-confirm-btn')
};

function getAppScale() {
    return Math.min(window.innerWidth / 800, window.innerHeight / 950);
}

function resizeApp() {
    if (!ui.app) return;
    const scale = getAppScale();
    ui.app.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

// --- Visual Utils ---
function triggerCardAnimation(owner, cardId) {
    if (isFastForwarding) return;
    const container = owner === 'me' ? ui.myCardsList : ui.enemyCardsList;
    const cardEls = container.querySelectorAll(`.card[data-id="${cardId}"]`);
    cardEls.forEach(el => {
        el.classList.remove('card-trigger-anim');
        void el.offsetWidth; // Force CSS reflow to restart animation safely
        el.classList.add('card-trigger-anim');
    });
}

function animatePoint(player, newFullPoints, onComplete) {
    if (document.hidden || isFastForwarding) {
        for(let i = 0; i < newFullPoints; i++) onComplete();
        return;
    }

    const enemyInvisible = state.enemyCards.some(c => c.id === 5) && !state.gameEnded;
    if (player === 'enemy' && enemyInvisible) {
        for (let i = 0; i < newFullPoints; i++) onComplete();
        return;
    }

    for (let i = 0; i < newFullPoints; i++) {
        setTimeout(() => {
            const point = document.createElement('div');
            point.className = 'animated-point';
            ui.app.appendChild(point);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const currentScore = player === 'me' ? state.myScore : state.enemyScore;
                    const targetScore = Math.floor(currentScore) - newFullPoints + 1 + i;
                    const prefix = player === 'me' ? 'my' : 'enemy';
                    const targetDot = document.querySelector(`#${prefix}-score-dots .dot:nth-child(${targetScore})`);
                    
                    if (targetDot) {
                        const appRect = ui.app.getBoundingClientRect();
                        const scale = getAppScale();
                        const rect = targetDot.getBoundingClientRect();
                        
                        const targetX = (rect.left - appRect.left) / scale + (rect.width / scale) / 2;
                        const targetY = (rect.top - appRect.top) / scale + (rect.height / scale) / 2;
                        
                        const centerX = 400; // Half of 800px width
                        const centerY = 475; // Half of 950px height
                        
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

function showScreen(screenName) {
    screens.lobby.classList.remove('active');
    screens.game.classList.remove('active');
    screens[screenName].classList.add('active');
}

function renderDots(score, maxScore) {
    let html = '';
    for (let i = 0; i < maxScore; i++) {
        if (score >= i + 0.999) {
            html += `<div class="dot filled"></div>`;
        } else if (score > i + 0.001) {
            let fraction = score - i;
            let degrees = fraction * 360;
            html += `<div class="dot fraction-filled" style="background: conic-gradient(#f1c40f ${degrees}deg, #e0e0e0 0);"></div>`;
        } else {
            html += `<div class="dot"></div>`;
        }
    }
    return html;
}

function updateScores() {
    if (isFastForwarding) return;
    const enemyInvisible = state.enemyCards.some(c => c.id === 5) && !state.gameEnded;
    ui.myScoreDots.innerHTML = renderDots(state.myScore, WIN_SCORE);
    ui.enemyScoreDots.innerHTML = renderDots(enemyInvisible ? 0 : state.enemyScore, WIN_SCORE);
}

function updateTimerUI() {
    if (state.myTimerValue !== null) {
        ui.myTimerDisplay.classList.remove('hidden');
        ui.myTimerDisplay.textContent = `⏱️ ${state.myTimerValue}s`;
    } else {
        ui.myTimerDisplay.classList.add('hidden');
    }

    const enemyInvisible = state.enemyCards.some(c => c.id === 5) && !state.gameEnded;
    if (state.enemyTimerValue !== null && !enemyInvisible) {
        ui.enemyTimerDisplay.classList.remove('hidden');
        ui.enemyTimerDisplay.textContent = `⏱️ ${state.enemyTimerValue}s`;
    } else {
        ui.enemyTimerDisplay.classList.add('hidden');
    }
}

function highlightCard(cardId, owner) {
    const container = owner === 'me' ? ui.myCardsList : ui.enemyCardsList;
    container.querySelectorAll(`.card[data-id="${cardId}"]`).forEach(el => {
        el.classList.add('card-highlight');
    });
}

function unhighlightCard(cardId, owner) {
    const container = owner === 'me' ? ui.myCardsList : ui.enemyCardsList;
    container.querySelectorAll(`.card[data-id="${cardId}"]`).forEach(el => {
        el.classList.remove('card-highlight');
    });
}

function closeCardModal() {
    document.getElementById('card-modal').classList.add('hidden');
}

function updateCardDisplay() {
    if (isFastForwarding) return;
    const enemyInvisible = state.enemyCards.some(c => c.id === 5) && !state.gameEnded;
    const renderCard = (c, owner) => {
        return `
            <div class="card pop-in" data-id="${c.id}" data-effect="${c.effect.replace(/"/g, '&quot;')}" onclick="showCardModal(${c.id}, '${owner}')">
                <div class="card-title">${c.name}</div>
                <img class="card-art" src="${c.art}" alt="Art">
            </div>`;
    };
    ui.myCardsList.innerHTML = state.myCards.map(c => renderCard(c, 'me')).join('');
    ui.enemyCardsList.innerHTML = enemyInvisible ? '' : state.enemyCards.map(c => renderCard(c, 'enemy')).join('');
    
    if (state.myCards.some(c => c.id === 12)) {
        ui.futureDraftsBtn.classList.remove('hidden');
    } else {
        ui.futureDraftsBtn.classList.add('hidden');
    }
}

function updateHistoryDisplay() {
    if (isFastForwarding || !ui.historyContainer) return;

    const enemyInvisible = state.enemyCards.some(c => c.id === 5) && !state.gameEnded;
    const prevScrollLeft = ui.historyContainer.scrollLeft;
    const prevScrollWidth = ui.historyContainer.scrollWidth;

    ui.historyContainer.innerHTML = state.history.map(turn => {
        if (turn.type === 'draft') {
            if (turn.picker === 'enemy' && enemyInvisible) return ''; // Completely hide enemy drafts

            const enemyAttrs = turn.picker === 'enemy' && turn.card ? `onclick="showCardModal(${turn.card.id}, 'enemy')" onmouseenter="highlightCard(${turn.card.id}, 'enemy')" onmouseleave="unhighlightCard(${turn.card.id}, 'enemy')"` : '';
            const myAttrs = turn.picker === 'me' && turn.card ? `onclick="showCardModal(${turn.card.id}, 'me')" onmouseenter="highlightCard(${turn.card.id}, 'me')" onmouseleave="unhighlightCard(${turn.card.id}, 'me')"` : '';

            return `
                <div class="history-turn pop-in">
                    <div class="history-icon ${turn.picker === 'enemy' ? 'draft-icon interactive' : 'empty'}" ${enemyAttrs}>${turn.picker === 'enemy' ? icons.card : ''}</div>
                    <div class="history-icon ${turn.picker === 'me' ? 'draft-icon interactive' : 'empty'}" ${myAttrs}>${turn.picker === 'me' ? icons.card : ''}</div>
                </div>
            `;
        } else {
            let enemyPoints = turn.enemyPoints ?? (turn.wins.enemy ? 1 : 0);
            let myPoints = turn.myPoints ?? (turn.wins.me ? 1 : 0);
            
            let enemyIconClass = enemyInvisible ? 'empty' : (turn.wins.enemy ? (enemyPoints >= 0.999 ? 'winner' : 'fraction-winner') : (turn.wins.me ? 'loser' : 'tie'));
            let myIconClass = turn.wins.me ? (myPoints >= 0.999 ? 'winner' : 'fraction-winner') : (turn.wins.enemy ? 'loser' : 'tie');
            
            let enemyStyle = '';
            if (turn.wins.enemy && enemyPoints > 0.001 && enemyPoints < 0.999 && !enemyInvisible) {
                let degrees = enemyPoints * 360;
                enemyStyle = `style="background: conic-gradient(#f1c40f ${degrees}deg, #fff 0);"`;
            }
            
            let myStyle = '';
            if (turn.wins.me && myPoints > 0.001 && myPoints < 0.999) {
                let degrees = myPoints * 360;
                myStyle = `style="background: conic-gradient(#f1c40f ${degrees}deg, #fff 0);"`;
            }

            const enemyIconHTML = enemyInvisible ? '' : icons[turn.enemy];
            return `
                <div class="history-turn pop-in">
                    <div class="history-icon ${enemyIconClass}" ${enemyStyle}>${enemyIconHTML}</div>
                    <div class="history-icon ${myIconClass}" ${myStyle}>${icons[turn.me]}</div>
                </div>
            `;
        }
    }).join('');
    
    ui.historyContainer.scrollLeft = prevScrollLeft;

    const newScrollWidth = ui.historyContainer.scrollWidth;
    if (newScrollWidth > prevScrollWidth) {
        setTimeout(() => {
            ui.historyContainer.scrollTo({
                left: prevScrollLeft + (newScrollWidth - prevScrollWidth),
                behavior: 'smooth'
            });
        }, 10);
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