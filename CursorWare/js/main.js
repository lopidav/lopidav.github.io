const SEND_RATE = 1000 / 60; 
const LERP_SPEED = 0.8; 
const HIT_RADIUS = 35;

function enterGame() {
    GameState.isInGame = true;
    document.getElementById('lobby').classList.add('hidden-fade');
    setTimeout(() => document.getElementById('lobby').style.display = 'none', 200);
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('display-room-id').innerText = GameState.roomId;
    document.getElementById('display-invite-link').value = window.location.origin + window.location.pathname + '?room=' + GameState.roomId;
    document.getElementById('click-prompt').style.display = 'flex';
    GameState.baseZ[GameState.myId] = 100;
    
    requestAnimationFrame(renderLoop);
    setInterval(networkTick, SEND_RATE);
}

function renderLoop() {
    const now = Date.now();
    
    for (let dId in GameState.activeDrags) {
        if (now - GameState.activeDrags[dId].time > 150) {
            Visuals.setHandShape(dId, Assets.PATH_POINTER);
            Visuals.setHandShape(GameState.activeDrags[dId].target, Assets.PATH_POINTER);
            delete GameState.activeDrags[dId];
        }
    }

    let speeds = {};
    speeds[GameState.myId] = Math.hypot(GameState.localPos.x - (GameState.lastLocalPosX || GameState.localPos.x), GameState.localPos.y - (GameState.lastLocalPosY || GameState.localPos.y));
    GameState.lastLocalPosX = GameState.localPos.x;
    GameState.lastLocalPosY = GameState.localPos.y;
    
    for (let id in GameState.peers) {
        const p = GameState.peers[id];
        speeds[id] = Math.hypot(p.targetX - (p.lastTargetX || p.targetX), p.targetY - (p.lastTargetY || p.targetY));
        p.lastTargetX = p.targetX;
        p.lastTargetY = p.targetY;
    }

    const allIds = [GameState.myId, ...Object.keys(GameState.peers)];
    for (let i = 0; i < allIds.length; i++) {
        for (let j = i + 1; j < allIds.length; j++) {
            const idA = allIds[i];
            const idB = allIds[j];
            const posA = idA === GameState.myId ? GameState.localPos : {x: GameState.peers[idA].renderX, y: GameState.peers[idA].renderY};
            const posB = idB === GameState.myId ? GameState.localPos : {x: GameState.peers[idB].renderX, y: GameState.peers[idB].renderY};
            
            const dist = Math.hypot(posA.x - posB.x, posA.y - posB.y);
            const pairKey = idA < idB ? idA + '|' + idB : idB + '|' + idA;
            
            if (dist < 40) {
                if (!GameState.overlaps[pairKey]) {
                    GameState.overlaps[pairKey] = true;
                    if (speeds[idA] > speeds[idB] + 0.5) Visuals.promoteZ(idA, idB);
                    else if (speeds[idB] > speeds[idA] + 0.5) Visuals.promoteZ(idB, idA);
                }
            } else {
                delete GameState.overlaps[pairKey];
            }
        }
    }

    let zMap = {};
    for (let id in GameState.peers) zMap[id] = (GameState.baseZ[id] || 100) * 10;
    zMap[GameState.myId] = (GameState.baseZ[GameState.myId] || 100) * 10;

    for (let draggerId in GameState.activeDrags) {
        let draggedId = GameState.activeDrags[draggerId].target;
        let dragLayer = 10000 + (GameState.baseZ[draggedId] || 100) * 10;
        zMap[draggedId] = dragLayer;
        zMap[draggerId] = dragLayer + 5; 
    }
    
    GameState.currentZMap = zMap; 

    if (GameState.localCursorEl) {
        GameState.localCursorEl.style.zIndex = zMap[GameState.myId];
        GameState.localCursorEl.style.transform = `translate3d(${GameState.localPos.x}px, ${GameState.localPos.y}px, 0)`;
    }

    for (let id in GameState.peers) {
        const p = GameState.peers[id];
        p.element.style.zIndex = zMap[id];
        p.renderX += (p.targetX - p.renderX) * LERP_SPEED;
        p.renderY += (p.targetY - p.renderY) * LERP_SPEED;
        p.element.style.transform = `translate3d(${p.renderX}px, ${p.renderY}px, 0)`;
    }
    
    requestAnimationFrame(renderLoop);
}

function networkTick() {
    if (!GameState.isClickedIn || !GameState.isInGame) return;

    const xNorm = GameState.localPos.x / window.innerWidth;
    const yNorm = GameState.localPos.y / window.innerHeight;

    if (GameState.isDragging && GameState.interactingPeer) {
        Visuals.promoteZ(GameState.myId, GameState.interactingPeer);
        GameState.activeDrags[GameState.myId] = { target: GameState.interactingPeer, time: Date.now() };

        if (GameState.peers[GameState.interactingPeer]) {
            GameState.peers[GameState.interactingPeer].targetX = GameState.localPos.x;
            GameState.peers[GameState.interactingPeer].targetY = GameState.localPos.y;
        }

        Network.broadcastData({
            t: 'event', type: 'drag', dragger: GameState.myId, dragged: GameState.interactingPeer,
            x: parseFloat(xNorm.toFixed(5)), y: parseFloat(yNorm.toFixed(5))
        });
    }

    if (xNorm === GameState.lastSentMouse.x && yNorm === GameState.lastSentMouse.y) return;

    Network.broadcastData({
        t: 'c', id: GameState.myId,
        x: parseFloat(xNorm.toFixed(5)), y: parseFloat(yNorm.toFixed(5))
    });

    GameState.lastSentMouse = { x: xNorm, y: yNorm };
}

// Input Logic
window.addEventListener('contextmenu', (e) => {
    if (GameState.isClickedIn) e.preventDefault();
});

window.addEventListener('mousedown', (e) => {
    if (!GameState.isClickedIn) return;

    if (GameState.testingMode && e.button === 2) {
        let nearestId = null;
        let minDist = Infinity;
        for (let id in GameState.peers) {
            let p = GameState.peers[id];
            let dist = Math.hypot(p.renderX - GameState.localPos.x, p.renderY - GameState.localPos.y);
            if (dist < minDist) { minDist = dist; nearestId = id; }
        }

        if (nearestId) {
            GameState.localPos.x = GameState.peers[nearestId].renderX;
            GameState.localPos.y = GameState.peers[nearestId].renderY;
            Visuals.executeHighFiveVisuals(GameState.myId, nearestId, 0); 
            Network.broadcastData({ t: 'event', type: 'highfive_confirm', from: GameState.myId, to: nearestId, diff: 0 });
        }
        return;
    }

    if (e.button !== 0) return;

    const now = Date.now();
    let brokeFree = false;

    for (let draggerId in GameState.activeDrags) {
        if (GameState.activeDrags[draggerId].target === GameState.myId && (now - GameState.activeDrags[draggerId].time <= 150)) {
            Visuals.executeSlapVisuals(GameState.myId, draggerId);
            Network.broadcastData({ t: 'event', type: 'break_free', from: GameState.myId, to: draggerId });
            delete GameState.activeDrags[draggerId];
            brokeFree = true;
        }
    }

    if (brokeFree) return;

    let hitId = null; let minDist = HIT_RADIUS;
    for (let id in GameState.peers) {
        let p = GameState.peers[id];
        let dist = Math.hypot(p.renderX - GameState.localPos.x, p.renderY - GameState.localPos.y);
        if (dist < minDist) { minDist = dist; hitId = id; }
    }

    if (hitId) {
        GameState.interactingPeer = hitId; 
        GameState.isDragging = false; 
        GameState.mouseDownTime = now; 
        GameState.dragStartPos = { ...GameState.localPos };
    } else {
        GameState.isEmptyClick = true;
        Visuals.executeEmptyClickDown(GameState.myId);
        Network.broadcastData({ t: 'event', type: 'empty_click_down', id: GameState.myId });
    }
});

window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
        let amIBeingDragged = false;
        for (let dId in GameState.activeDrags) {
            if (GameState.activeDrags[dId].target === GameState.myId) {
                amIBeingDragged = true; break;
            }
        }
        if (amIBeingDragged) {
            if (Math.abs(e.movementX) > 0 || Math.abs(e.movementY) > 0) {
                const el = GameState.localCursorEl.querySelector('.cursor-icon');
                if (el) {
                    el.style.marginLeft = `${Math.random() * 6 - 3}px`;
                    el.style.marginTop = `${Math.random() * 6 - 3}px`;
                    clearTimeout(GameState.twitchTimeout);
                    GameState.twitchTimeout = setTimeout(() => {
                        if (el) { el.style.marginLeft = '0px'; el.style.marginTop = '0px'; }
                    }, 50);
                }
            }
            return; // Block movement updates
        }

        let newX = Math.max(0, Math.min(window.innerWidth - 32, GameState.localPos.x + e.movementX));
        let newY = Math.max(0, Math.min(window.innerHeight - 32, GameState.localPos.y + e.movementY));
        
        const obs = document.getElementById('obstacle');
        if (obs) {
            const rect = obs.getBoundingClientRect();
            const cSize = 32;
            const isColliding = (x, y) => x < rect.right && x + cSize > rect.left && y < rect.bottom && y + cSize > rect.top;
            
            if (isColliding(newX, newY)) {
                let slideX = newX;
                let slideY = newY;
                
                if (isColliding(newX, GameState.localPos.y)) {
                    slideX = e.movementX > 0 ? rect.left - cSize : (e.movementX < 0 ? rect.right : GameState.localPos.x);
                }
                if (isColliding(GameState.localPos.x, newY)) {
                    slideY = e.movementY > 0 ? rect.top - cSize : (e.movementY < 0 ? rect.bottom : GameState.localPos.y);
                }
                
                if (!isColliding(slideX, slideY)) {
                    newX = slideX;
                    newY = slideY;
                } else {
                    if (!isColliding(slideX, GameState.localPos.y)) {
                        newX = slideX; newY = GameState.localPos.y;
                    } else if (!isColliding(GameState.localPos.x, slideY)) {
                        newX = GameState.localPos.x; newY = slideY;
                    } else {
                        newX = GameState.localPos.x; newY = GameState.localPos.y;
                    }
                }
            }
        }

        GameState.localPos.x = newX;
        GameState.localPos.y = newY;

        if (GameState.interactingPeer && !GameState.isDragging && Math.hypot(GameState.localPos.x - GameState.dragStartPos.x, GameState.localPos.y - GameState.dragStartPos.y) > 10) {
            GameState.isDragging = true;
            Visuals.setHandShape(GameState.myId, Assets.PATH_GRAB);
            Visuals.setHandShape(GameState.interactingPeer, Assets.PATH_SQUEEZED);
        }
    }
});

window.addEventListener('mouseup', (e) => {
    if (!GameState.isClickedIn || e.button !== 0) return;
    if (GameState.isEmptyClick) {
        Visuals.executeEmptyClickUp(GameState.myId);
        Network.broadcastData({ t: 'event', type: 'empty_click_up', id: GameState.myId });
        GameState.isEmptyClick = false; return;
    }
    if (!GameState.interactingPeer) return;
    
    const now = Date.now();
    const targetId = GameState.interactingPeer;

    if (!GameState.isDragging && (now - GameState.mouseDownTime < 300)) {
        if (GameState.recentHits[targetId] && (now - GameState.recentHits[targetId] <= 400)) {
            const diff = now - GameState.recentHits[targetId];
            Visuals.executeHighFiveVisuals(GameState.myId, targetId, diff);
            Network.broadcastData({ t: 'event', type: 'highfive_confirm', from: GameState.myId, to: targetId, diff: diff });
            delete GameState.recentHits[targetId];
        } else {
            Network.broadcastData({ t: 'event', type: 'hit', from: GameState.myId, to: targetId });
            GameState.pendingHitTimeout = setTimeout(() => {
                Visuals.executeSlapVisuals(GameState.myId, targetId);
                Network.broadcastData({ t: 'event', type: 'slap_execute', from: GameState.myId, to: targetId });
            }, 200);
        }
    }
    if (GameState.isDragging) {
        Visuals.setHandShape(GameState.myId, Assets.PATH_POINTER); 
        Visuals.setHandShape(targetId, Assets.PATH_POINTER);
        
        let dropX = GameState.localPos.x + 30;
        let dropY = GameState.localPos.y - 30;
        dropX = Math.max(0, Math.min(window.innerWidth - 32, dropX));
        dropY = Math.max(0, Math.min(window.innerHeight - 32, dropY));
        
        const obs = document.getElementById('obstacle');
        if (obs) {
            const rect = obs.getBoundingClientRect();
            const cSize = 32;
            if (dropX < rect.right && dropX + cSize > rect.left && dropY < rect.bottom && dropY + cSize > rect.top) {
                dropX = GameState.localPos.x;
                dropY = GameState.localPos.y;
            }
        }
        
        if (GameState.peers[targetId]) {
            GameState.peers[targetId].targetX = dropX;
            GameState.peers[targetId].targetY = dropY;
        }
        
        Network.broadcastData({ 
            t: 'event', type: 'drop', dragger: GameState.myId, dragged: targetId,
            x: parseFloat((dropX / window.innerWidth).toFixed(5)), 
            y: parseFloat((dropY / window.innerHeight).toFixed(5)) 
        });
        delete GameState.activeDrags[GameState.myId];
    }
    GameState.interactingPeer = null; 
    GameState.isDragging = false;
});

// UI Listeners
window.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
        e.preventDefault();
        GameState.testingMode = !GameState.testingMode;
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-slate-800 text-white px-4 py-2 rounded shadow-lg z-[9999] font-bold border border-indigo-500 transition-opacity';
        toast.innerText = 'Testing Mode: ' + (GameState.testingMode ? 'ON' : 'OFF');
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 1500);
    }
    if (e.key === 'Tab' && GameState.isClickedIn) {
        e.preventDefault();
        if (!e.repeat) document.body.classList.add('labels-visible');
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'Tab' && GameState.isClickedIn) {
        e.preventDefault();
        document.body.classList.remove('labels-visible');
    }
});

const clickPrompt = document.getElementById('click-prompt');
clickPrompt.addEventListener('click', () => { 
    if(AudioEngine.ctx.state === 'suspended') AudioEngine.ctx.resume(); 
    document.body.requestPointerLock(); 
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement) { 
        GameState.isClickedIn = true; 
        clickPrompt.style.display = 'none'; 
        document.getElementById('game-ui').classList.add('hidden');
        if(!GameState.localCursorEl) GameState.localCursorEl = Visuals.createCursorElement(GameState.myId, true); 
    } else { 
        GameState.isClickedIn = false; 
        if(GameState.isInGame) {
            clickPrompt.style.display = 'flex'; 
            document.getElementById('game-ui').classList.remove('hidden');
        }
        if (GameState.isDragging && GameState.interactingPeer) {
            Visuals.setHandShape(GameState.myId, Assets.PATH_POINTER); 
            Visuals.setHandShape(GameState.interactingPeer, Assets.PATH_POINTER);
            
            let dropX = GameState.localPos.x + 30;
            let dropY = GameState.localPos.y - 30;
            dropX = Math.max(0, Math.min(window.innerWidth - 32, dropX));
            dropY = Math.max(0, Math.min(window.innerHeight - 32, dropY));
            
            const obs = document.getElementById('obstacle');
            if (obs) {
                const rect = obs.getBoundingClientRect();
                const cSize = 32;
                if (dropX < rect.right && dropX + cSize > rect.left && dropY < rect.bottom && dropY + cSize > rect.top) {
                    dropX = GameState.localPos.x;
                    dropY = GameState.localPos.y;
                }
            }
            
            if (GameState.peers[GameState.interactingPeer]) {
                GameState.peers[GameState.interactingPeer].targetX = dropX;
                GameState.peers[GameState.interactingPeer].targetY = dropY;
            }
            
            Network.broadcastData({ 
                t: 'event', type: 'drop', dragger: GameState.myId, dragged: GameState.interactingPeer,
                x: parseFloat((dropX / window.innerWidth).toFixed(5)),
                y: parseFloat((dropY / window.innerHeight).toFixed(5))
            });
            delete GameState.activeDrags[GameState.myId];
            GameState.isDragging = false;
            GameState.interactingPeer = null;
        }
    }
});

window.addEventListener('resize', () => {
    for (let id in GameState.peers) {
        const p = GameState.peers[id];
        const xNorm = p.targetX / (window.innerWidth || 1);
        const yNorm = p.targetY / (window.innerHeight || 1);
        p.targetX = xNorm * window.innerWidth;
        p.targetY = yNorm * window.innerHeight;
    }
});

function initPeer(onReady) {
    document.getElementById('action-state').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');
    Network.peer = new Peer(null, { debug: 1 });
    Network.peer.on('open', (id) => { GameState.myId = id; onReady(id); });
}

document.getElementById('btn-host').addEventListener('click', () => {
    initPeer((id) => {
        GameState.isHost = true; GameState.roomId = id;
        Network.peer.on('connection', (conn) => {
            Network.clientConnections[conn.peer] = conn;
            // The bug fix: We no longer lazily send state blindly here. 
            // We await a "sync_req" from the client through the Network module.
            conn.on('data', (data) => Network.handlePeerData(data, conn));
            conn.on('close', () => Network.handleClientDisconnect(conn.peer));
            conn.on('error', () => Network.handleClientDisconnect(conn.peer));
        });
        enterGame();
    });
});

document.getElementById('btn-join').addEventListener('click', () => {
    const rid = document.getElementById('input-room-id').value.trim();
    if (!rid) return;
    initPeer((id) => {
        GameState.roomId = rid;
        Network.hostConnection = Network.peer.connect(rid);
        Network.hostConnection.on('open', () => {
            enterGame();
            // Request state of existing cursors from the Host the exact moment we load in
            Network.hostConnection.send({ t: 'sync_req', id: GameState.myId });
            // Broadcast own existence instantly
            Network.hostConnection.send({ 
                t: 'c', 
                id: GameState.myId, 
                x: GameState.localPos.x / window.innerWidth, 
                y: GameState.localPos.y / window.innerHeight 
            });
        });
        Network.hostConnection.on('data', (data) => Network.handlePeerData(data, Network.hostConnection));
        Network.hostConnection.on('close', () => { alert("Host disconnected!"); location.reload(); });
        Network.hostConnection.on('error', () => { alert("Connection error!"); location.reload(); });
    });
});

document.getElementById('volume-slider').addEventListener('input', (e) => {
    AudioEngine.masterVolume = parseFloat(e.target.value);
    document.getElementById('volume-display').innerText = Math.round(AudioEngine.masterVolume * 100) + '%';
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('room')) { 
    document.getElementById('input-room-id').value = urlParams.get('room'); 
    document.getElementById('btn-join').click(); 
}

document.getElementById('btn-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(GameState.roomId).then(() => {
        document.getElementById('icon-copy').classList.add('hidden'); document.getElementById('icon-check').classList.remove('hidden');
        setTimeout(() => { document.getElementById('icon-copy').classList.remove('hidden'); document.getElementById('icon-check').classList.add('hidden'); }, 2000);
    });
});

document.getElementById('btn-copy-link').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('display-invite-link').value).then(() => {
        document.getElementById('icon-copy-link').classList.add('hidden'); document.getElementById('icon-check-link').classList.remove('hidden');
        setTimeout(() => { document.getElementById('icon-copy-link').classList.remove('hidden'); document.getElementById('icon-check-link').classList.add('hidden'); }, 2000);
    });
});