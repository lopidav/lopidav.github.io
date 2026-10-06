import PlayScreen from './PlayScreen.js';

export default class SettingsScreen {
    constructor(manager, net, context) {
        this.manager = manager;
        this.net = net;
        this.context = context;

        // Player's persistent local chosen name (never overwritten by remote state broadcasts)
        this.myPlayerName = this.context.myPlayerName || this.context.playerName || (this.context.players && this.context.players[this.net.myId]) || (this.net.isHost ? 'Host' : 'Player');

        const defaultState = {
            paintTime: 240,
            huntTime: 300,
            levelUrl: '',
            scale: 100,
            dragX: 0, 
            dragY: 0,
            mapName: 'None',
            players: {}
        };

        // If we are returning from a game, context will be the full previous gameState.
        this.gameState = { ...defaultState, ...context };
        if (!this.gameState.players) {
            this.gameState.players = {};
        }
        
        if (this.net.isHost) {
            this.gameState.players[this.net.myId] = this.myPlayerName;
        }

        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.startPos = { x: 0, y: 0 };
        
        this.countdownInterval = null;
        this.isCountingDown = false;
        this.countdownEndTime = 0;

        this.bindEvents = this.bindEvents.bind(this);
    }

    template() {
        const roomCode = this.net.isHost ? this.net.myId : (this.net.hostId || this.context.joiningRoom || 'Unknown');
        return `
        <div class="screen">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Game Settings</h2>
                <div>
                    <span id="roomCodeDisplay" style="margin-right: 15px; font-weight: bold; color: #00ff00;">
                        ${this.net.isHost ? `Room Code: ${roomCode}` : `Connected to: ${roomCode}`}
                    </span>
                    <button id="btnCopyUrl" style="margin: 0;">Copy Room URL</button>
                </div>
            </div>
            
            <div class="flex">
                <div class="panel" style="flex: 1; min-width: 300px;">
                    <h3>Players (<span id="playerCount">0</span>)</h3>
                    <ul id="playerList" class="player-list"></ul>
                    
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <input type="text" id="inpMyName" value="${this.myPlayerName}" style="margin:0;">
                        <button id="btnUpdateName" style="margin:0;">Change Name</button>
                    </div>
                    <hr style="border-color:#444;">

                    <label>Paint Time (s):</label>
                    <input type="number" id="inpPaintTime" class="sync-input" value="240">
                    
                    <label>Hunt Time (s):</label>
                    <input type="number" id="inpHuntTime" class="sync-input" value="300">
                </div>

                <div class="panel" style="flex: 1.5;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <h3>Level Inspector</h3>
                        <span style="font-size: 12px; color: ${this.net.isHost ? '#00ff00' : '#ffeb3b'};">
                            ${this.net.isHost ? 'You are controlling the view' : 'Viewing Host screen...'}
                        </span>
                    </div>

                    <div style="margin: 15px 0; padding: 10px; background: #111; border-radius: 5px; border: 1px solid #333;">
                        <h4 style="margin: 0; color: #aaa;">Current Map: <span id="currentMapDisplay" style="color: #00ff00; font-weight: bold;">None</span></h4>
                    </div>

                    <div id="hostMapControls" style="display: none; background: #222; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: 1px solid #444;">
                        <div style="display: flex; gap: 15px;">
                            <div style="flex: 1;">
                                <label style="margin-top:0;">Save Current Map:</label>
                                <div style="display: flex; gap: 5px; margin-top: 5px;">
                                    <input type="text" id="inpMapName" placeholder="Map Name..." style="margin: 0; flex: 1;">
                                    <button id="btnSaveMap" style="margin: 0;">Save</button>
                                </div>
                            </div>
                            <div style="flex: 1;">
                                <label style="margin-top:0;">Load Saved Map:</label>
                                <select id="selSavedMaps" style="width: 100%; padding: 8px; background: #111; color: white; border: 1px solid #555; border-radius: 4px; margin-top: 5px;">
                                    <option value="">-- Select a saved map --</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                        <div style="flex: 2;">
                            <label style="margin-top:0;">Level Image URL:</label>
                            <input type="text" id="inpLevelUrl" class="sync-input" placeholder="https://...">
                        </div>
                        <div style="flex: 1;">
                            <label style="margin-top:0;">Scale / Size (%):</label>
                            <input type="number" id="inpScale" class="sync-input" value="100">
                        </div>
                    </div>

                    <div style="display: flex; gap: 15px; margin-top: 10px;">
                        <div style="flex: 1;">
                            <p style="font-size: 12px; color: #aaa; margin-top:0;">1:1 Scale Preview</p>
                            <div id="dragContainer" style="width: 100%; aspect-ratio: 1; overflow: hidden; border: 2px solid #555; position: relative; background: #222; cursor: default;">
                                <img id="levelPreviewDrag" src="" style="position: absolute; left: 0; top: 0; transform-origin: top left; pointer-events: none;">
                                <div style="position: absolute; width: 50px; height: 50px; border: 2px solid red; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 10; box-sizing: border-box;"></div>
                            </div>
                        </div>

                        <div style="width: 150px; flex-shrink: 0;">
                             <p style="font-size: 12px; color: #aaa; margin-top:0;">Full Map Thumbnail</p>
                             <div style="width: 100%; aspect-ratio: 1; border: 1px dashed #777; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                 <img id="levelPreviewFull" src="" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="startGameContainer" style="text-align: center; margin-top: 20px; display: none;">
                 <button id="btnStartGame" style="padding: 15px 40px; font-size: 20px;">Start Game</button>
            </div>

            <div id="countdownContainer" class="countdown-overlay" style="display: none;">
                <div class="countdown-content">
                    <h2>Game starting in...</h2>
                    <h1 id="countdownDisplay">5</h1>
                </div>
            </div>
        </div>
        `;
    }

    mount() {
        this.cacheDOM();
        this.applyPermissions();
        this.updateInputsFromState();
        this.bindEvents();

        if (this.net.isHost) {
            this.renderPlayerList();
            this.loadSavedMaps();
            this.updateVisualsLocal();

            // HOST-ONLY: Handle players joining during settings or countdown
            this.net.on('playerConnected', (newPlayerId) => {
                this.net.sendTo(newPlayerId, 'SETTINGS_UPDATE', this.gameState, true);

                if (this.isCountingDown) {
                    const remainingTime = Math.max(0, this.countdownEndTime - Date.now());
                    this.net.sendTo(newPlayerId, 'START_COUNTDOWN_SYNC', { remaining: remainingTime }, true);
                }
            });
        } else {
            this.net.send('REQ_SETTINGS', { name: this.myPlayerName }, true);
            this.net.on('connectedToHost', () => {
                this.net.send('REQ_SETTINGS', { name: this.myPlayerName }, true);
            });
        }
    }

    updateInputsFromState() {
        this.inpPaintTime.value = this.gameState.paintTime;
        this.inpHuntTime.value = this.gameState.huntTime;
        this.inpLevelUrl.value = this.gameState.levelUrl;
        this.inpScale.value = this.gameState.scale;
        
        this.dragOffset.x = this.gameState.dragX;
        this.dragOffset.y = this.gameState.dragY;
    }

    cacheDOM() {
        this.syncInputs = document.querySelectorAll('.sync-input');
        this.inpPaintTime = document.getElementById('inpPaintTime');
        this.inpHuntTime = document.getElementById('inpHuntTime');
        this.inpLevelUrl = document.getElementById('inpLevelUrl');
        this.inpScale = document.getElementById('inpScale');
        
        this.playerListEl = document.getElementById('playerList');
        this.playerCountEl = document.getElementById('playerCount');
        this.inpMyName = document.getElementById('inpMyName');
        this.btnUpdateName = document.getElementById('btnUpdateName');

        this.currentMapDisplay = document.getElementById('currentMapDisplay');
        this.dragContainer = document.getElementById('dragContainer');
        this.levelPreviewDrag = document.getElementById('levelPreviewDrag');
        this.levelPreviewFull = document.getElementById('levelPreviewFull');
        
        this.hostMapControls = document.getElementById('hostMapControls');
        this.inpMapName = document.getElementById('inpMapName');
        this.btnSaveMap = document.getElementById('btnSaveMap');
        this.selSavedMaps = document.getElementById('selSavedMaps');

        this.startGameContainer = document.getElementById('startGameContainer');
        this.btnStartGame = document.getElementById('btnStartGame');
        this.countdownContainer = document.getElementById('countdownContainer');
        this.countdownDisplay = document.getElementById('countdownDisplay');

        this.levelPreviewDrag.onload = () => {
            this.clampDragOffset();
            this.updateVisualsLocal();
        };
    }

    applyPermissions() {
        this.syncInputs.forEach(input => input.disabled = !this.net.isHost);
        
        if (this.net.isHost) {
            this.hostMapControls.style.display = 'block';
            this.dragContainer.style.cursor = 'grab';
            this.startGameContainer.style.display = 'block';
        }
    }

    loadSavedMaps() {
        const saved = JSON.parse(localStorage.getItem('mecha_maps') || '{}');
        this.selSavedMaps.innerHTML = '<option value="">-- Select a saved map --</option>';
        for (let name in saved) {
            const opt = document.createElement('option');
            opt.value = name; 
            opt.innerText = name;
            this.selSavedMaps.appendChild(opt);
        }
    }

    bindEvents() {
        document.getElementById('btnCopyUrl').onclick = (e) => {
            const roomCode = this.net.isHost ? this.net.myId : (this.net.hostId || this.context.joiningRoom);
            const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
            navigator.clipboard.writeText(url);
            e.target.innerText = "Copied!";
            setTimeout(() => e.target.innerText = "Copy Room URL", 2000);
        };

        this.btnUpdateName.onclick = () => {
            const newName = this.inpMyName.value.trim();
            if (!newName) return;
            this.myPlayerName = newName;
            if (this.net.isHost) {
                this.gameState.players[this.net.myId] = newName;
                this.broadcastState();
                this.renderPlayerList();
            } else {
                this.net.send('SET_NAME', newName, true);
            }
        };

        this.btnStartGame.onclick = () => {
            if (!this.net.isHost) return;
            this.net.send('START_COUNTDOWN', {}, true);
            this.handleStartCountdown();
        };

        // Host Map Roster Bindings
        if (this.net.isHost) {
            this.btnSaveMap.onclick = () => {
                const name = this.inpMapName.value.trim();
                const url = this.inpLevelUrl.value.trim();
                const currentScale = parseInt(this.inpScale.value) || 100;

                if (name && url) {
                    const saved = JSON.parse(localStorage.getItem('mecha_maps') || '{}');
                    saved[name] = { url: url, scale: currentScale }; 
                    localStorage.setItem('mecha_maps', JSON.stringify(saved));
                    
                    this.loadSavedMaps();
                    this.selSavedMaps.value = name; 
                    
                    this.gameState.mapName = name;
                    this.updateVisualsLocal();
                    this.broadcastState();
                }
            };

            this.selSavedMaps.onchange = () => {
                const mapName = this.selSavedMaps.value;
                if (mapName) {
                    this.inpMapName.value = mapName;

                    const saved = JSON.parse(localStorage.getItem('mecha_maps') || '{}');
                    const mapData = saved[mapName];

                    if (mapData) {
                        const url = typeof mapData === 'string' ? mapData : mapData.url;
                        const scale = typeof mapData === 'object' && mapData.scale ? mapData.scale : 100;

                        this.inpLevelUrl.value = url;
                        this.inpScale.value = scale;
                        
                        this.gameState.mapName = mapName;

                        this.inpLevelUrl.dispatchEvent(new Event('input'));
                        this.inpScale.dispatchEvent(new Event('input'));
                    }
                }
            };
        }

        // Detect input changes (host only)
        this.syncInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                if (!this.net.isHost) return;
                
                if (e.target === this.inpLevelUrl && e.isTrusted) {
                    this.gameState.mapName = "Custom / Unsaved";
                    this.inpMapName.value = "";
                    this.selSavedMaps.value = "";
                }

                if (this.gameState.levelUrl !== this.inpLevelUrl.value) {
                    this.dragOffset = { x: 0, y: 0 };
                    this.gameState.dragX = 0;
                    this.gameState.dragY = 0;
                }

                this.gameState.paintTime = this.inpPaintTime.value;
                this.gameState.huntTime = this.inpHuntTime.value;
                this.gameState.levelUrl = this.inpLevelUrl.value;
                this.gameState.scale = this.inpScale.value;
                
                this.updateVisualsLocal();
                this.broadcastState();
            });
        });

        // --- Network Listeners ---
        this.net.on('SETTINGS_UPDATE', (newState) => {
            this.gameState = newState;
            
            this.inpPaintTime.value = this.gameState.paintTime;
            this.inpHuntTime.value = this.gameState.huntTime;
            this.inpLevelUrl.value = this.gameState.levelUrl;
            this.inpScale.value = this.gameState.scale;
            
            this.dragOffset.x = this.gameState.dragX;
            this.dragOffset.y = this.gameState.dragY;

            this.inpMyName.value = this.myPlayerName; // Preserve local name
            this.updateVisualsLocal();
            this.renderPlayerList();
        });

        this.net.on('VIEW_SYNC', (data) => {
            this.dragOffset.x = data.x;
            this.dragOffset.y = data.y;
            this.updateVisualsLocal();
        });
// Register player as soon as WebRTC connection opens
        this.net.on('playerConnected', (newPlayerId) => {
            if (this.net.isHost) {
                if (!this.gameState.players[newPlayerId]) {
                    this.gameState.players[newPlayerId] = `Player_${newPlayerId.substring(0, 4)}`;
                }
                this.renderPlayerList();
                this.broadcastState();

                if (this.isCountingDown) {
                    const remainingTime = Math.max(0, this.countdownEndTime - Date.now());
                    this.net.sendTo(newPlayerId, 'START_COUNTDOWN_SYNC', { remaining: remainingTime }, true);
                }
            }
        });

        this.net.on('REQ_SETTINGS', (data, senderId) => {
            if (this.net.isHost) {
                const clientName = (data && data.name) ? data.name : `Player_${senderId.substring(0, 4)}`;
                this.gameState.players[senderId] = clientName;
                this.renderPlayerList();
                this.broadcastState();
            }
        });

        this.net.on('SET_NAME', (newName, senderId) => {
            if (this.net.isHost) {
                this.gameState.players[senderId] = newName;
                this.renderPlayerList();
                this.broadcastState();
            }
        });

        this.net.on('playerLeft', (id) => {
            if (this.net.isHost) {
                delete this.gameState.players[id];
                this.renderPlayerList();
                this.broadcastState();
            }
        });

        this.net.on('START_COUNTDOWN', () => {
            this.handleStartCountdown();
        });

        this.net.on('START_COUNTDOWN_SYNC', (data) => {
            this.startCountdown(data.remaining / 1000);
        });

        this.net.on('FORCE_JOIN_GAME', (gameContext) => {
            this.manager.load(PlayScreen, this.net, {
                ...gameContext,
                myPlayerName: this.myPlayerName,
                playerName: this.myPlayerName
            });
        });

        // --- Drag & Zoom Listeners (Host ONLY) ---
        if (this.net.isHost) {
            this.dragContainer.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.dragContainer.style.cursor = 'grabbing';
                this.startPos = { x: e.clientX - this.dragOffset.x, y: e.clientY - this.dragOffset.y };
            });

            window.addEventListener('mouseup', () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    this.dragContainer.style.cursor = 'grab';
                    this.gameState.dragX = this.dragOffset.x;
                    this.gameState.dragY = this.dragOffset.y;
                    this.broadcastState();
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                
                this.dragOffset.x = e.clientX - this.startPos.x;
                this.dragOffset.y = e.clientY - this.startPos.y;
                this.clampDragOffset();
                this.updateVisualsLocal();

                this.net.send('VIEW_SYNC', { x: this.dragOffset.x, y: this.dragOffset.y }, false);
            });

            this.dragContainer.addEventListener('wheel', (e) => {
                e.preventDefault(); 
                let currentScale = parseInt(this.inpScale.value) || 100;
                currentScale += e.deltaY < 0 ? 5 : -5;
                currentScale = Math.max(5, currentScale); 
                this.inpScale.value = currentScale;
                this.inpScale.dispatchEvent(new Event('input'));
            }, { passive: false });
        }
    }

    broadcastState() {
        this.net.send('SETTINGS_UPDATE', this.gameState, true);
    }

    handleStartCountdown() {
        this.isCountingDown = true;
        this.countdownEndTime = Date.now() + 5000;
        this.startGameContainer.style.display = 'none';
        this.startCountdown();
    }

    startCountdown(startTime = 5) {
        this.countdownContainer.style.display = 'flex';
        let count = Math.ceil(startTime);

        this.countdownDisplay.innerText = count;

        if (this.countdownInterval) clearInterval(this.countdownInterval);

        this.countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownDisplay.innerText = count;
            } else {
                clearInterval(this.countdownInterval);
                this.isCountingDown = false;
                this.manager.load(PlayScreen, this.net, {
                    ...this.gameState,
                    myPlayerName: this.myPlayerName,
                    playerName: this.myPlayerName
                });
            }
        }, 1000);
    }

    renderPlayerList() {
        this.playerListEl.innerHTML = '';
        const playerIds = Object.keys(this.gameState.players);
        this.playerCountEl.innerText = playerIds.length;

        playerIds.forEach(id => {
            const isHostStr = (id === this.net.hostId || (this.net.isHost && id === this.net.myId)) 
                ? '<span class="host-badge">(Host)</span>' 
                : '';
            
            const li = document.createElement('li');
            li.innerHTML = `<span>${this.gameState.players[id]} ${isHostStr}</span>`;
            this.playerListEl.appendChild(li);
        });
    }

    clampDragOffset() {
        if (!this.net.isHost || !this.levelPreviewDrag.naturalWidth) return;
        
        const containerW = this.dragContainer.clientWidth;
        const containerH = this.dragContainer.clientHeight;
        const centerX = containerW / 2;
        const centerY = containerH / 2;
        const scaleMult = this.gameState.scale / 100;
        const imgW = this.levelPreviewDrag.naturalWidth * scaleMult;
        const imgH = this.levelPreviewDrag.naturalHeight * scaleMult;

        const minX = centerX - imgW;
        const maxX = centerX;
        const minY = centerY - imgH;
        const maxY = centerY;

        this.dragOffset.x = Math.max(minX, Math.min(maxX, this.dragOffset.x));
        this.dragOffset.y = Math.max(minY, Math.min(maxY, this.dragOffset.y));
    }

    updateVisualsLocal() {
        this.currentMapDisplay.innerText = this.gameState.mapName || 'None';

        if (this.levelPreviewDrag.src !== this.gameState.levelUrl && this.gameState.levelUrl !== "") {
            this.levelPreviewDrag.src = this.gameState.levelUrl;
            this.levelPreviewFull.src = this.gameState.levelUrl;
        }
        
        const scaleMult = this.gameState.scale / 100;
        this.levelPreviewDrag.style.transform = `translate(${this.dragOffset.x}px, ${this.dragOffset.y}px) scale(${scaleMult})`;
    }

    destroy() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.net.events['SETTINGS_UPDATE'] = [];
        this.net.events['VIEW_SYNC'] = [];
        this.net.events['REQ_SETTINGS'] = [];
        this.net.events['SET_NAME'] = [];
        this.net.events['playerLeft'] = [];
        this.net.events['START_COUNTDOWN'] = [];
        this.net.events['START_COUNTDOWN_SYNC'] = [];
        this.net.events['FORCE_JOIN_GAME'] = [];
        this.net.events['connectedToHost'] = [];
        if (this.net.isHost) this.net.events['playerConnected'] = [];
    }
}