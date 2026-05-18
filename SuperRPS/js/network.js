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
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        const link = `${baseUrl}?join=${peer.id}`;
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
                const halted = executeDraftSelection(data.card, 'enemy', data.stolen);
                if (halted) return;
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
        case 'TIMER_SYNC':
            state.enemyTimerValue = data.value;
            updateTimerUI();
            break;
        case 'TIME_OUT':
            endGame("Opponent ran out of time! (Gastroenteresis)");
            break;
    }
}