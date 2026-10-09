let peer = null;
let conn = null;

function setupConnection(connection) {
    conn = connection;
    state.isHost = peer.id > conn.peer; // Deterministic host resolution for sync authority
    state.originalIsHost = state.isHost;
    
    conn.on('open', () => {
        showScreen('game');
        console.log("Connected to opponent.");
        sendNetworkMessage('SET_NAME', { name: state.trueMyName });
        
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
    if (conn && conn.open && !isFastForwarding) {
        conn.send({ type, ...payload });
    }
}

function handleNetworkMessage(data) {
    switch(data.type) {
        case 'START_INITIAL_DRAFT':
            startInitialDraft(data);
            break;
        case 'CARD_SELECTED':
            state.enemyDraftDone = true;
            state.enemyDraftsTaken++;
            if (state.enemyBonusDrafts > 0) state.enemyBonusDrafts--;
            if (data.card) {
                if (data.stolen) {
                    const myThiefIdx = state.myCards.findIndex(c => c.id === 8);
                    if (myThiefIdx !== -1) state.myCards.splice(myThiefIdx, 1);
                    state.myCards.push(data.card);
                    state.history.push({ type: 'draft', picker: 'me', card: data.card, masterIndex: state.masterEnemyDrafts.length });
                    state.masterEnemyDrafts.push(data.card.id); // Enemy still theoretically chose it!
                    
                    if (data.card.id === 17 && !isFastForwarding) {
                        openTimesisUI();
                        return;
                    }
                    if (data.card.id === 19) { state.enemyTimerValue = 90; updateTimerUI(); }
                } else {
                    state.enemyCards.push(data.card);
                    state.history.push({ type: 'draft', picker: 'enemy', card: data.card, masterIndex: state.masterEnemyDrafts.length });
                    state.masterEnemyDrafts.push(data.card.id);
                    if (data.card.id === 17 && !isFastForwarding) { ui.turnStatus.textContent = "Opponent is altering the past..."; return; }
                    if (data.card.id === 19) { state.myTimerValue = 90; updateTimerUI(); }
                }

                if (data.card.id === 9) {
                    state.myScore = 0;
                    state.enemyScore = 0;
                    updateScores();
                }

                if (data.card.id === 16) {
                    applySoulesis();
                }

                updateHistoryDisplay();
                updateCardDisplay();
            }
            updateRpsUI();
            checkPhaseTransition();
            break;
        case 'RPS_CHOICE':
            state.enemyRpsChoices = data.choices || [];
            updateRpsUI();
            resolveRoundSequence();
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
            if (state.soulesisSwaps % 2 === 1) {
                state.trueMyName = data.name;
                localStorage.setItem('superRpsPlayerName', state.trueMyName);
                ui.lobbyNameInput.value = state.trueMyName;
            } else {
                state.trueEnemyName = data.name;
            }
            ui.enemyNameDisplay.textContent = data.name || 'Opponent';
            break;
        case 'TIMESIS_CHANGE':
            applyTimesisChangeLocally(data.type, data.index, data.newValue, 'enemy');
            break;
    }
}