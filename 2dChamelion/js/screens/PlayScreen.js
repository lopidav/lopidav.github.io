import SettingsScreen from './SettingsScreen.js';

export default class PlayScreen {
    constructor(manager, net, context) {
        this.manager = manager;
        this.net = net;
        this.context = context;

        // Player's persistent chosen name
        this.myPlayerName = this.context.myPlayerName || this.context.playerName || (this.context.players && this.context.players[this.net.myId]) || (this.net.isHost ? 'Host' : 'Player');

        // Game state
        this.currentPhase = null;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.rematchCountdownInterval = null;

        // Hunt Phase State
        this.allSquares = {};
        this.foundSquareIds = new Set();
        this.squaresFound = 0;
        this.winnerName = null;
        this.isTransitioningToHunt = false;

        // --- Viewport state ---
        this.maxScale = (parseInt(this.context.scale, 10) || 100) / 100;
        this.currentScale = this.maxScale; // Start at settings scale
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.hasDragged = false;

        // WASD
        this.keysDown = {};
        this.wasdInterval = null;
        this.WASD_SPEED = 8;

        // Square — 50px at maxScale, scales with zoom
        this.SQUARE_SIZE = 50;
        this.isLocked = false;
        this.squareImageX = 0; // Square center in image-space coords
        this.squareImageY = 0;

        // --- Paint Mode State ---
        this.isPaintMode = false;
        this.isPainting = false;
        this.isEyedropperActive = false;
        this.lastPaintX = 0;
        this.lastPaintY = 0;
        this.paintCtx = null;
        this.colorPicker = null;

        // Floating Paint Panel Drag State
        this.isPanelDragging = false;
        this.panelMouseStartX = 0;
        this.panelMouseStartY = 0;
        this.panelInitialLeft = 0;
        this.panelInitialTop = 0;

        // Stroke composite layers for smooth opacity painting
        this.strokeCanvas = document.createElement('canvas');
        this.strokeCanvas.width = this.SQUARE_SIZE;
        this.strokeCanvas.height = this.SQUARE_SIZE;
        this.strokeCtx = this.strokeCanvas.getContext('2d');

        this.snapshotCanvas = document.createElement('canvas');
        this.snapshotCanvas.width = this.SQUARE_SIZE;
        this.snapshotCanvas.height = this.SQUARE_SIZE;
        this.snapshotCtx = this.snapshotCanvas.getContext('2d');

        // Offscreen sampling canvas for instant eyedropper
        this.offscreenCanvas = null;
        this.offscreenCtx = null;

        // Image
        this.levelImage = null;
        this.imageLoaded = false;

        // Bound handlers for cleanup
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onWheel = this._onWheel.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onSquareMouseDown = this._onSquareMouseDown.bind(this);
        this._onPaintMouseMove = this._onPaintMouseMove.bind(this);
        this._onPaintMouseUp = this._onPaintMouseUp.bind(this);
        this._onPanelMouseDown = this._onPanelMouseDown.bind(this);
        this._onPanelMouseMove = this._onPanelMouseMove.bind(this);
        this._onPanelMouseUp = this._onPanelMouseUp.bind(this);
        this._onWindowMouseMove = this._onWindowMouseMove.bind(this);
        // PlayScreen.js - inside constructor(manager, net, context)

// --- Player Progress Tracking ---
this.playerProgress = {}; // { [peerId]: Set(foundSquareIds) }

// --- Player List Drag & Minimize State ---
this.isPlPanelDragging = false;
this.isPlPanelMinimized = false;
this.plMouseStartX = 0;
this.plMouseStartY = 0;
this.plInitialLeft = 0;
this.plInitialTop = 0;

// Bound handlers for Player List drag & window events
this._onPlPanelMouseDown = this._onPlPanelMouseDown.bind(this);
this._onPlPanelMouseMove = this._onPlPanelMouseMove.bind(this);
this._onPlPanelMouseUp = this._onPlPanelMouseUp.bind(this);
    }

    template() {
        return `
            <style>
                @keyframes blink-blue {
                    0% { outline: 3px solid #00aaff; box-shadow: 0 0 15px #00aaff; }
                    50% { outline: 3px solid transparent; box-shadow: none; }
                    100% { outline: 3px solid #00aaff; box-shadow: 0 0 15px #00aaff; }
                }
                @keyframes blink-red {
                    0% { outline: 3px solid #ff2222; box-shadow: 0 0 15px #ff2222; }
                    50% { outline: 3px solid transparent; box-shadow: none; }
                    100% { outline: 3px solid #ff2222; box-shadow: 0 0 15px #ff2222; }
                }
                .square-found {
                    animation: blink-blue 0.6s infinite !important;
                    user-select: none;
                    -webkit-user-drag: none;
                }
                .square-not-found {
                    animation: blink-red 0.6s infinite !important;
                    user-select: none;
                    -webkit-user-drag: none;
                }
                .is-dragging, .is-dragging * {
                    cursor: grabbing !important;
                }
            </style>
            <div id="playRoot" style="width: 100%; height: 100%; position: relative; overflow: hidden; user-select: none;">
                <!-- HUD Top Center -->
                <div id="gameHud" style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 20; text-align: center; padding: 10px 20px; background: rgba(17, 17, 17, 0.9); border-radius: 8px; backdrop-filter: blur(6px); pointer-events: auto; min-width: 240px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                    <h2 id="phaseDisplay" style="margin: 0 0 5px 0;">Starting...</h2>
                    <div id="gameTimer" style="font-size: 2.5em; font-weight: bold; color: #fff;">00:00</div>
                    
                    <h1 id="winnerText" style="display: none; font-size: 2.2em; color: var(--accent); margin: 10px 0; text-shadow: 2px 2px 4px #000;"></h1>
                    
                    <div id="hideModeControls" style="display: flex; gap: 8px; justify-content: center; align-items: center; margin-top: 8px;">
                        <button id="btnLockPos" style="padding: 6px 12px; font-size: 13px; background: #555; border: 1px solid #888; border-radius: 4px; color: #fff; cursor: pointer;">🔓 Unlocked [E]</button>
                        <button id="btnPaintMode" style="padding: 6px 12px; font-size: 13px; background: #555; border: 1px solid #888; border-radius: 4px; color: #fff; cursor: pointer;">🖌️ Paint Mode [F]</button>
                    </div>

                    <div id="postGameControls" style="display: none; margin-top: 15px; gap: 15px; justify-content: center;"></div>
                </div>

                <!-- Floating Draggable Color & Paint Panel (Default Left) -->
                <div id="paintPanel" style="display: none; position: absolute; top: 80px; left: 20px; z-index: 25; background: rgba(24, 24, 30, 0.95); border-radius: 8px; border: 1px solid #555; flex-direction: column; align-items: stretch; font-size: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.6); pointer-events: auto; min-width: 180px;">
                    <!-- Draggable Header Bar -->
                    <div id="paintPanelHeader" style="padding: 8px 12px; background: #222; border-bottom: 1px solid #444; border-top-left-radius: 8px; border-top-right-radius: 8px; cursor: grab; user-select: none; display: flex; align-items: center; justify-content: space-between; font-weight: bold; color: #eee;">
                        <span>🎨 Color & Tools</span>
                        <span style="font-size: 11px; opacity: 0.6; cursor: grab;">⠿ drag</span>
                    </div>

                    <div style="padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        <!-- iro.js picker mount point -->
                        <div id="iroPickerContainer" style="display: flex; justify-content: center;"></div>

                        <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <button id="btnEyedropper" style="flex: 1; padding: 6px 10px; font-size: 12px; background: #444; border: 1px solid #666; border-radius: 4px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                                <span>💧</span> <span id="eyedropperLabel">Eyedropper</span>
                            </button>
                            <div id="colorPreviewBox" style="width: 28px; height: 28px; border-radius: 4px; border: 1px solid #777; background: #ff0000; box-shadow: inset 0 0 4px rgba(0,0,0,0.5);"></div>
                        </div>

                        <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                            <span style="color: #ccc; min-width: 45px;">Brush:</span>
                            <input type="range" id="brushSize" min="1" max="25" value="2" style="flex: 1; cursor: pointer;">
                            <span id="brushVal" style="min-width: 30px; text-align: right; color: #fff;">2px</span>
                        </div>
                    </div>
                </div>

                <!-- Looking Glass Eyedropper Loupe -->
                <div id="eyedropperLoupe" style="
                    display: none;
                    position: absolute;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 3px solid #ffffff;
                    box-shadow: 0 6px 25px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(0,0,0,0.6);
                    overflow: hidden;
                    pointer-events: none;
                    z-index: 100;
                    transform: translate(-50%, -50%);
                    background: #1a1a1a;
                ">
                    <canvas id="loupeCanvas" width="120" height="120" style="display: block; width: 100%; height: 100%; image-rendering: pixelated;"></canvas>
                    <!-- Center pixel reticle square -->
                    <div style="
                        position: absolute;
                        top: 50%; left: 50%;
                        transform: translate(-50%, -50%);
                        width: 12px;
                        height: 12px;
                        border: 1.5px solid #ffffff;
                        box-shadow: 0 0 2px #000, inset 0 0 2px #000;
                        box-sizing: border-box;
                        pointer-events: none;
                    "></div>
                    <!-- Color Hex Badge at bottom of loupe -->
                    <div id="loupeColorBadge" style="
                        position: absolute;
                        bottom: 8px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0,0,0,0.85);
                        color: #ffffff;
                        font-family: monospace;
                        font-size: 10px;
                        font-weight: bold;
                        padding: 2px 6px;
                        border-radius: 8px;
                        border: 1px solid #777;
                        white-space: nowrap;
                        pointer-events: none;
                    ">#FFFFFF</div>
                </div>

                <!-- Fade Overlay -->
                <div id="fadeOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; opacity: 0; pointer-events: none; transition: opacity 0.6s ease-in-out; z-index: 9999;"></div>

                <!-- Squares Container for Hunt Phase & Post-Game (Hidden during hide phase) -->
                <div id="squaresContainer" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 5;"></div>

                <!-- Level viewport -->
                <div id="levelViewport" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; overflow: hidden; cursor: grab;">
                    <img id="levelImage" src="" style="position: absolute; transform-origin: 0 0; pointer-events: none;" draggable="false">
                </div>

                <!-- Single editable Square overlay for Hide Phase (Canvas) -->
                <canvas id="centerSquare" width="${this.SQUARE_SIZE}" height="${this.SQUARE_SIZE}" style="
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${this.SQUARE_SIZE}px;
                    height: ${this.SQUARE_SIZE}px;
                    background: transparent;
                    box-sizing: border-box;
                    pointer-events: none;
                    image-rendering: pixelated;
                    z-index: 10;
                "></canvas>

                <!-- Floating Draggable Player Progress Panel -->
                <div id="playerListPanel" style="
                    display: none;
                    position: absolute;
                    top: 80px;
                    right: 20px;
                    z-index: 25;
                    background: rgba(24, 24, 30, 0.95);
                    border-radius: 8px;
                    border: 1px solid #555;
                    flex-direction: column;
                    align-items: stretch;
                    font-size: 13px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.6);
                    pointer-events: auto;
                    min-width: 220px;
                ">
                    <!-- Draggable Header -->
                    <div id="playerListHeader" style="
                        padding: 8px 12px;
                        background: #222;
                        border-bottom: 1px solid #444;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                        cursor: grab;
                        user-select: none;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-weight: bold;
                        color: #eee;
                    ">
                        <span>👥 Players Progress</span>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <button id="btnMinimizePlayerList" style="
                                background: #333;
                                border: 1px solid #555;
                                color: #fff;
                                border-radius: 3px;
                                cursor: pointer;
                                font-weight: bold;
                                padding: 0 6px;
                                font-size: 12px;
                                line-height: 16px;
                            ">_</button>
                            <span style="font-size: 11px; opacity: 0.6;">⠿</span>
                        </div>
                    </div>

                    <div id="playerListContent" style="padding: 10px; display: flex; flex-direction: column; gap: 6px;">
                        <ul id="hudPlayerList" style="list-style: none; padding: 0; margin: 0; max-height: 200px; overflow-y: auto;"></ul>
                        </div>
                    </div>

                    <!-- Hover Tooltip for Player Progress Inspection -->
                    <div id="playerListTooltip" style="
                        display: none;
                        position: absolute;
                        z-index: 100;
                        background: rgba(15, 15, 25, 0.96);
                        border: 1px solid #777;
                        border-radius: 6px;
                        padding: 8px 12px;
                        font-size: 12px;
                        color: #fff;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.8);
                        pointer-events: none;
                        white-space: nowrap;
                    "></div>
            </div>
        `;
    }

    mount() {
        this.playRoot = document.getElementById('playRoot');
        this.phaseDisplay = document.getElementById('phaseDisplay');
        this.gameTimer = document.getElementById('gameTimer');
        this.winnerText = document.getElementById('winnerText');
        this.hideModeControls = document.getElementById('hideModeControls');
        this.postGameControls = document.getElementById('postGameControls');
        this.squaresContainer = document.getElementById('squaresContainer');
        this.levelViewport = document.getElementById('levelViewport');
        this.levelImage = document.getElementById('levelImage');
        this.centerSquare = document.getElementById('centerSquare');
        this.btnLockPos = document.getElementById('btnLockPos');
        this.btnPaintMode = document.getElementById('btnPaintMode');
        this.paintPanel = document.getElementById('paintPanel');
        this.paintPanelHeader = document.getElementById('paintPanelHeader');
        this.btnEyedropper = document.getElementById('btnEyedropper');
        this.eyedropperLabel = document.getElementById('eyedropperLabel');
        this.colorPreviewBox = document.getElementById('colorPreviewBox');
        this.brushSizeInput = document.getElementById('brushSize');
        this.brushVal = document.getElementById('brushVal');
        this.fadeOverlay = document.getElementById('fadeOverlay');

        // Loupe DOM elements
        this.eyedropperLoupe = document.getElementById('eyedropperLoupe');
        this.loupeCanvas = document.getElementById('loupeCanvas');
        this.loupeCtx = this.loupeCanvas ? this.loupeCanvas.getContext('2d') : null;
        this.loupeColorBadge = document.getElementById('loupeColorBadge');

        // Setup paint canvas context & fill with solid white
        this.paintCtx = this.centerSquare.getContext('2d');
        this.paintCtx.fillStyle = '#ffffff';
        this.paintCtx.fillRect(0, 0, this.SQUARE_SIZE, this.SQUARE_SIZE);

        // Initialize iro.js Color Picker with Box + Hue slider + Alpha slider
        if (window.iro) {
            this.colorPicker = new iro.ColorPicker('#iroPickerContainer', {
                width: 160,
                color: '#ff0000',
                borderWidth: 1,
                borderColor: '#555',
                layout: [
                    {
                        component: iro.ui.Box,
                        options: {}
                    },
                    {
                        component: iro.ui.Slider,
                        options: {
                            sliderType: 'hue'
                        }
                    },
                    {
                        component: iro.ui.Slider,
                        options: {
                            sliderType: 'alpha'
                        }
                    }
                ]
            });

            this.colorPicker.on('color:change', (color) => {
                if (this.colorPreviewBox) {
                    this.colorPreviewBox.style.background = color.rgbaString;
                }
            });

            if (this.colorPreviewBox) {
                this.colorPreviewBox.style.background = this.colorPicker.color.rgbaString;
            }
        }

        // Load image
        if (this.context.levelUrl) {
            this.levelImage.crossOrigin = 'anonymous';
            this.levelImage.onload = () => {
                this.imageLoaded = true;
                this._initOffscreenLevelCanvas();
                this._centerImageOnSquare();
                this._updateSquareImagePos();
                this._clampPan();
                this._applyTransform();
            };
            this.levelImage.src = this.context.levelUrl;
        }

        // HUD buttons
        this.btnLockPos.onclick = () => this._toggleLock();
        this.btnPaintMode.onclick = () => this._togglePaintMode();

        // Paint panel controls
        this.brushSizeInput.oninput = () => {
            this.brushVal.innerText = `${this.brushSizeInput.value}px`;
        };

        // Eyedropper button
        this.btnEyedropper.onclick = () => {
            this._toggleEyedropper();
        };

        // Floating Paint Panel dragging events
        this.paintPanelHeader.addEventListener('mousedown', this._onPanelMouseDown);
        window.addEventListener('mousemove', this._onPanelMouseMove);
        window.addEventListener('mouseup', this._onPanelMouseUp);

        // Global mouse movement for looking glass eyedropper
        window.addEventListener('mousemove', this._onWindowMouseMove);

        // Square painting events
        this.centerSquare.addEventListener('mousedown', this._onSquareMouseDown);
        window.addEventListener('mousemove', this._onPaintMouseMove);
        window.addEventListener('mouseup', this._onPaintMouseUp);

        // Viewport drag and zoom input listeners
        this.levelViewport.addEventListener('mousedown', this._onMouseDown);
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
        this.levelViewport.addEventListener('wheel', this._onWheel, { passive: false });
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);

        // WASD loop
        this.wasdInterval = setInterval(() => this._processWASD(), 16);

        // --- Game phase logic ---
        if (this.net.isHost) {
            this.startPhase('hide');

            this.net.on('playerConnected', (newPlayerId) => {
                this.net.sendTo(newPlayerId, 'FORCE_JOIN_GAME', {
                    ...this.context,
                    players: this.context.players
                }, true);
                setTimeout(() => {
                    this.net.sendTo(newPlayerId, 'GAME_STATE_UPDATE', {
                        phase: this.currentPhase,
                        timeLeft: this.timeLeft,
                        winnerName: this.winnerName
                    }, true);
                    if (Object.keys(this.allSquares).length > 0) {
                        this.net.sendTo(newPlayerId, 'ALL_SQUARES_SYNC', this.allSquares, true);
                    }
                }, 500);
            });
        }

        // --- Network Listeners ---
        this.net.on('SUBMIT_SQUARE', (data) => {
            this.allSquares[data.id] = data;

            // Host authoritatively broadcasts all accumulated squares to every client
            if (this.net.isHost) {
                this.net.send('ALL_SQUARES_SYNC', this.allSquares, true);
            }

            if (!this.isTransitioningToHunt && (this.currentPhase === 'hunt' || this.currentPhase === 'postgame')) {
                this._renderAllSquares().then(() => {
                    this._applyTransform();
                    this.updatePlayerListGUI();
                });
            }
        });

        this.net.on('ALL_SQUARES_SYNC', (squares) => {
            Object.assign(this.allSquares, squares);

            if (!this.isTransitioningToHunt && (this.currentPhase === 'hunt' || this.currentPhase === 'postgame')) {
                this._renderAllSquares().then(() => {
                    this._applyTransform();
                    this.updatePlayerListGUI();
                });
            }
        });

        this.net.on('DECLARE_WINNER', (data) => {
            if (this.net.isHost && this.currentPhase === 'hunt') {
                this._handleWinnerDeclared(data.winnerId, data.winnerName);
            }
        });

        this.net.on('GAME_STATE_UPDATE', (state) => {
            const previousPhase = this.currentPhase;
            this.currentPhase = state.phase;
            this.timeLeft = state.timeLeft;
            this.winnerName = state.winnerName;

            // Trigger clean reset when moving to hide phase (e.g. On Rematch)
            if (previousPhase !== 'hide' && this.currentPhase === 'hide') {
                this._resetToHidePhase();
            }

            // Trigger transition when flipping from hide to hunt
            if (previousPhase === 'hide' && this.currentPhase === 'hunt') {
                this._triggerHuntTransition();
            }

            this.renderGameState();
        });

        this.net.on('GAME_REMATCH', () => this.startRematchCountdown());
        this.net.on('GAME_GOTO_SETTINGS', () => this.manager.load(SettingsScreen, this.net, {
            ...this.context,
            myPlayerName: this.myPlayerName,
            playerName: this.myPlayerName
        }));

        this.playerListPanel = document.getElementById('playerListPanel');
        this.playerListHeader = document.getElementById('playerListHeader');
        this.playerListContent = document.getElementById('playerListContent');
        this.btnMinimizePlayerList = document.getElementById('btnMinimizePlayerList');
        this.hudPlayerList = document.getElementById('hudPlayerList');
        this.playerListTooltip = document.getElementById('playerListTooltip');

        // Drag & Minimize event listeners
        this.playerListHeader.addEventListener('mousedown', this._onPlPanelMouseDown);
        window.addEventListener('mousemove', this._onPlPanelMouseMove);
        window.addEventListener('mouseup', this._onPlPanelMouseUp);

        this.btnMinimizePlayerList.onclick = (e) => {
            e.stopPropagation();
            this.isPlPanelMinimized = !this.isPlPanelMinimized;
            this.playerListContent.style.display = this.isPlPanelMinimized ? 'none' : 'block';
            this.btnMinimizePlayerList.innerText = this.isPlPanelMinimized ? '+' : '_';
        };

        // Network listeners for discovery progress
        this.net.on('SQUARE_FOUND_UPDATE', (data) => {
            if (!this.playerProgress[data.finderId]) {
                this.playerProgress[data.finderId] = new Set();
            }
            this.playerProgress[data.finderId].add(data.squareId);
            this.updatePlayerListGUI();
        });

        this.net.on('ALL_PLAYER_PROGRESS_SYNC', (data) => {
            Object.keys(data).forEach(pId => {
                this.playerProgress[pId] = new Set(data[pId]);
            });
            this.updatePlayerListGUI();
        });
    }

    // =====================================================
    // Reset to Hide Phase (Used on initial start & rematch)
    // =====================================================

    _resetToHidePhase() {
        this.allSquares = {};
        this.foundSquareIds = new Set();
        this.squaresFound = 0;
        this.winnerName = null;
        this.isTransitioningToHunt = false;

        // Clean up hunt squares container
        if (this.squaresContainer) {
            this.squaresContainer.style.display = 'none';
            this.squaresContainer.innerHTML = '';
        }

        // Clean up overlays
        if (this.fadeOverlay) {
            this.fadeOverlay.style.opacity = '0';
        }
        const rematchOverlay = document.getElementById('rematchOverlay');
        if (rematchOverlay && rematchOverlay.parentNode) {
            rematchOverlay.parentNode.removeChild(rematchOverlay);
        }

        // Reset center square
        if (this.centerSquare) {
            this.centerSquare.style.display = 'block';
            this.centerSquare.style.pointerEvents = 'none';
            this.centerSquare.style.cursor = 'default';
            if (this.paintCtx) {
                this.paintCtx.clearRect(0, 0, this.SQUARE_SIZE, this.SQUARE_SIZE);
                this.paintCtx.fillStyle = '#ffffff';
                this.paintCtx.fillRect(0, 0, this.SQUARE_SIZE, this.SQUARE_SIZE);
            }
        }

        // Reset paint tools & lock states
        this.isPaintMode = false;
        this.isPainting = false;
        this.isEyedropperActive = false;
        if (this.paintPanel) this.paintPanel.style.display = 'none';
        if (this.eyedropperLoupe) this.eyedropperLoupe.style.display = 'none';
        if (this.btnPaintMode) {
            this.btnPaintMode.innerText = '🖌️ Paint Mode [F]';
            this.btnPaintMode.style.background = '#555';
            this.btnPaintMode.style.display = 'inline-block';
        }
        this._toggleLock(false);

        // Show hide mode HUD controls
        if (this.hideModeControls) {
            this.hideModeControls.style.display = 'flex';
        }
        if (this.btnLockPos) {
            this.btnLockPos.style.display = 'inline-block';
            this.btnLockPos.innerText = '🔓 Unlocked [E]';
            this.btnLockPos.style.background = '#555';
        }

        // Reset camera to settings scale & center
        this.currentScale = this.maxScale;
        if (this.imageLoaded) {
            this._centerImageOnSquare();
            this._updateSquareImagePos();
            this._clampPan();
            this._applyTransform();
        }
        this.playerProgress = {};
        if (this.playerListPanel) this.playerListPanel.style.display = 'none';
        if (this.playerListTooltip) this.playerListTooltip.style.display = 'none';
    }

    // =====================================================
    // Hunt Transition & Synchronization
    // =====================================================

    _triggerHuntTransition() {
        this.isTransitioningToHunt = true;

        // 1. Keep squaresContainer hidden while fade to black begins
        if (this.squaresContainer) {
            this.squaresContainer.style.display = 'none';
        }

        // 2. Save and broadcast the player's painted square
        const squareData = this.centerSquare.toDataURL('image/png');
        const squarePayload = {
            id: this.net.myId,
            name: this.myPlayerName,
            image: squareData,
            x: this.squareImageX,
            y: this.squareImageY
        };
        
        this.allSquares[this.net.myId] = squarePayload;
        this.net.send('SUBMIT_SQUARE', squarePayload, true);
        
        // 3. Start the screen fade to black
        if (this.fadeOverlay) {
            this.fadeOverlay.style.opacity = '1';
        }
    
        // 4. Once screen is fully black: hide paint tools, reset camera, render squares, then fade out
        setTimeout(async () => {
            // Disable painting and hide edit controls
            if (this.isPaintMode) this._togglePaintMode(false);
            if (this.hideModeControls) this.hideModeControls.style.display = 'none';
            if (this.centerSquare) this.centerSquare.style.display = 'none';
    
            // Reset the camera to center and max scale
            this.currentScale = this.maxScale;
            this._centerImageOnSquare();
            this._clampPan();
            
            // Show squaresContainer and render all squares onto the level
            if (this.squaresContainer) {
                this.squaresContainer.style.display = 'block';
            }
            await this._renderAllSquares();
            this._applyTransform();
    
            this.isTransitioningToHunt = false;

            // Fade back in to reveal the level with all squares on the board
            if (this.fadeOverlay) {
                this.fadeOverlay.style.opacity = '0';
            }
        }, 600);
    }
    
    _renderAllSquares() {
        return new Promise((resolve) => {
            const container = document.getElementById('squaresContainer');
            if (!container) return resolve();
            
            const squareIds = Object.keys(this.allSquares);
            let squaresToLoad = 0;
            let loadedCount = 0;
            
            const checkDone = () => {
                if (loadedCount >= squaresToLoad) resolve();
            };

            squareIds.forEach(id => {
                let img = document.getElementById(`square-${id}`);
                if (!img) {
                    squaresToLoad++;
                    const data = this.allSquares[id];
                    img = document.createElement('img');
                    img.id = `square-${id}`;
                    
                    img.style.position = 'absolute';
                    img.style.pointerEvents = 'auto'; 
                    img.style.transform = 'translate(-50%, -50%)';
                    img.style.cursor = 'grab';
                    img.style.userSelect = 'none';
                    img.style.webkitUserDrag = 'none';
                    img.setAttribute('draggable', 'false');

                    // Prevent native image dragging and forward mousedown to viewport camera panning
                    img.ondragstart = (e) => { e.preventDefault(); return false; };
                    img.onmousedown = (e) => {
                        this._onMouseDown(e);
                    };

                    // Track loading states
                    img.onload = () => {
                        loadedCount++;
                        checkDone();
                    };
                    img.onerror = () => {
                        loadedCount++;
                        checkDone();
                    };

                    img.onclick = (e) => {
                        e.stopPropagation();
                        if (this.currentPhase !== 'hunt') return;
                        if (this.hasDragged) return; // Player was panning the map, not guessing
                        this._onSquareFound(id, img);
                    };
        
                    img.src = data.image; 
                    container.appendChild(img);
                } else {
                    // Update state if already existing (e.g. In post-game)
                    if (this.currentPhase === 'postgame') {
                        img.style.display = 'block';
                        img.style.pointerEvents = 'none';
                        if (this.foundSquareIds.has(id)) {
                            img.className = 'square-found';
                        } else {
                            img.className = 'square-not-found';
                        }
                    }
                }
            });

            if (squaresToLoad === 0) {
                resolve();
            }
        });
    }

    _onSquareFound(id, img) {
        if (this.currentPhase !== 'hunt') return;
        if (this.foundSquareIds.has(id)) return;

        this.foundSquareIds.add(id);
        this.squaresFound++;

        // Track local progress
        if (!this.playerProgress[this.net.myId]) {
            this.playerProgress[this.net.myId] = new Set();
        }
        this.playerProgress[this.net.myId].add(id);

        // Broadcast discovery to all players
        this.net.send('SQUARE_FOUND_UPDATE', {
            finderId: this.net.myId,
            squareId: id
        }, true);

        this.updatePlayerListGUI();
        img.className = 'square-found';

        // Check Win Condition:
        const totalSquares = Math.max(
            Object.keys(this.allSquares).length,
            this.context && this.context.players ? Object.keys(this.context.players).length : 0
        );
        const requiredToWin = totalSquares;

        if (this.squaresFound >= requiredToWin && requiredToWin > 0) {
            if (this.net.isHost) {
                this._handleWinnerDeclared(this.net.myId, this.myPlayerName);
            } else {
                this.net.send('DECLARE_WINNER', { 
                    winnerId: this.net.myId,
                    winnerName: this.myPlayerName
                }, true);
            }
        }
    }

    _handleWinnerDeclared(winnerId, winnerNameFromPacket = null) {
        let name = winnerNameFromPacket;
        if (!name && this.allSquares[winnerId] && this.allSquares[winnerId].name) {
            name = this.allSquares[winnerId].name;
        }
        if (!name && this.context && this.context.players) {
            name = this.context.players[winnerId];
        }
        if (!name && winnerId === this.net.myId) {
            name = this.myPlayerName;
        }
        this.winnerName = name || "Player";
        this.startPhase('postgame');
    }

    // =====================================================
    // Draggable Paint Panel
    // =====================================================

    _onPanelMouseDown(e) {
        if (e.button !== 0) return;
        this.isPanelDragging = true;
        this.panelMouseStartX = e.clientX;
        this.panelMouseStartY = e.clientY;
        this.panelInitialLeft = this.paintPanel.offsetLeft;
        this.panelInitialTop = this.paintPanel.offsetTop;
        this.paintPanelHeader.style.cursor = 'grabbing';
        e.preventDefault();
        e.stopPropagation();
    }

    _onPanelMouseMove(e) {
        if (!this.isPanelDragging) return;
        const deltaX = e.clientX - this.panelMouseStartX;
        const deltaY = e.clientY - this.panelMouseStartY;
        let newX = this.panelInitialLeft + deltaX;
        let newY = this.panelInitialTop + deltaY;

        const maxLeft = this.playRoot.clientWidth - this.paintPanel.offsetWidth - 10;
        const maxTop = this.playRoot.clientHeight - this.paintPanel.offsetHeight - 10;
        newX = Math.max(10, Math.min(maxLeft, newX));
        newY = Math.max(10, Math.min(maxTop, newY));

        this.paintPanel.style.left = newX + 'px';
        this.paintPanel.style.top = newY + 'px';
    }

    _onPanelMouseUp() {
        if (this.isPanelDragging) {
            this.isPanelDragging = false;
            if (this.paintPanelHeader) {
                this.paintPanelHeader.style.cursor = 'grab';
            }
        }
    }

    // =====================================================
    // Lock & Paint Mode Toggles
    // =====================================================

    _toggleLock(forceOn = null) {
        if (forceOn !== null) {
            this.isLocked = forceOn;
        } else {
            this.isLocked = !this.isLocked;
        }

        if (this.isLocked) {
            this.btnLockPos.innerText = '🔒 Locked [E]';
            this.btnLockPos.style.background = 'var(--accent)';
        } else {
            this.btnLockPos.innerText = '🔓 Unlocked [E]';
            this.btnLockPos.style.background = '#555';
            const vw = this.levelViewport.clientWidth;
            const vh = this.levelViewport.clientHeight;
            this.panX = vw / 2 - this.squareImageX * this.currentScale;
            this.panY = vh / 2 - this.squareImageY * this.currentScale;
            this._clampPan();
        }
        this._applyTransform();
    }

    _togglePaintMode(force = null) {
        if (force !== null) {
            this.isPaintMode = force;
        } else {
            this.isPaintMode = !this.isPaintMode;
        }

        if (this.isPaintMode) {
            if (!this.isLocked) {
                this._toggleLock(true);
            }
            this.btnPaintMode.innerText = '🎨 Paint Mode ON [F]';
            this.btnPaintMode.style.background = 'var(--accent)';
            this.paintPanel.style.display = 'flex';
            this.centerSquare.style.pointerEvents = 'auto';
            this.centerSquare.style.cursor = 'crosshair';
        } else {
            if (this.isEyedropperActive) {
                this._toggleEyedropper(false);
            }
            this.btnPaintMode.innerText = '🖌️ Paint Mode [F]';
            this.btnPaintMode.style.background = '#555';
            this.paintPanel.style.display = 'none';
            this.centerSquare.style.pointerEvents = 'none';
            this.centerSquare.style.cursor = 'default';

            if (this.currentScale > this.maxScale) {
                const ratio = this.maxScale / this.currentScale;
                const vw = this.levelViewport.clientWidth;
                const vh = this.levelViewport.clientHeight;
                const cx = vw / 2;
                const cy = vh / 2;
                this.panX = cx - ratio * (cx - this.panX);
                this.panY = cy - ratio * (cy - this.panY);
                this.currentScale = this.maxScale;
                this._clampPan();
                if (!this.isLocked) this._updateSquareImagePos();
                this._applyTransform();
            }
        }
    }

    // =====================================================
    // Instant Eyedropper & Looking Glass Loupe
    // =====================================================

    _initOffscreenLevelCanvas() {
        try {
            this.offscreenCanvas = document.createElement('canvas');
            this.offscreenCanvas.width = this.levelImage.naturalWidth;
            this.offscreenCanvas.height = this.levelImage.naturalHeight;
            this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
            this.offscreenCtx.drawImage(this.levelImage, 0, 0);
        } catch (err) {
            console.warn("Could not cache level image for color sampling:", err);
        }
    }

    _toggleEyedropper(force = null) {
        if (force !== null) {
            this.isEyedropperActive = force;
        } else {
            this.isEyedropperActive = !this.isEyedropperActive;
        }

        if (this.isEyedropperActive) {
            this.btnEyedropper.style.background = 'var(--accent)';
            this.eyedropperLabel.innerText = 'Click to Pick';
            this.eyedropperLoupe.style.display = 'block';
            this.levelViewport.style.cursor = 'none';
            this.centerSquare.style.cursor = 'none';
        } else {
            this.btnEyedropper.style.background = '#444';
            this.eyedropperLabel.innerText = 'Eyedropper';
            this.eyedropperLoupe.style.display = 'none';
            this.levelViewport.style.cursor = this.isDragging ? 'grabbing' : 'grab';
            this.centerSquare.style.cursor = this.isPaintMode ? 'crosshair' : 'default';
        }
    }

    _onWindowMouseMove(e) {
        if (!this.isEyedropperActive || !this.eyedropperLoupe || !this.loupeCtx) return;

        // Position loupe centered at cursor relative to playRoot
        const rootRect = this.playRoot.getBoundingClientRect();
        const lx = e.clientX - rootRect.left;
        const ly = e.clientY - rootRect.top;
        this.eyedropperLoupe.style.left = lx + 'px';
        this.eyedropperLoupe.style.top = ly + 'px';

        // Sample an 11x11 grid centered on the cursor
        const GRID_SIZE = 11;
        const HALF_GRID = Math.floor(GRID_SIZE / 2);
        const CELL_SIZE = 120 / GRID_SIZE;

        let centerColor = { r: 255, g: 255, b: 255, a: 1 };

        this.loupeCtx.clearRect(0, 0, 120, 120);

        for (let gy = 0; gy < GRID_SIZE; gy++) {
            for (let gx = 0; gx < GRID_SIZE; gx++) {
                const sx = e.clientX + (gx - HALF_GRID);
                const sy = e.clientY + (gy - HALF_GRID);

                const color = this._sampleColorAt(sx, sy) || { r: 30, g: 30, b: 34, a: 1 };

                if (gx === HALF_GRID && gy === HALF_GRID) {
                    centerColor = color;
                }

                this.loupeCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a !== undefined ? color.a : 1})`;
                this.loupeCtx.fillRect(gx * CELL_SIZE, gy * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                // Subtle grid borders
                this.loupeCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                this.loupeCtx.strokeRect(gx * CELL_SIZE, gy * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }

        const hex = this._rgbToHex(centerColor.r, centerColor.g, centerColor.b);
        this.loupeColorBadge.innerText = hex;
        this.loupeColorBadge.style.borderColor = hex;
    }

    _rgbToHex(r, g, b) {
        const toHex = (n) => n.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    _sampleColorAt(clientX, clientY) {
        if (!this.imageLoaded || !this.levelViewport) return null;

        // 1. Check if clicking on the square canvas
        const sqRect = this.centerSquare.getBoundingClientRect();
        if (
            clientX >= sqRect.left && clientX <= sqRect.right &&
            clientY >= sqRect.top && clientY <= sqRect.bottom
        ) {
            const sqX = Math.max(0, Math.min(this.centerSquare.width - 1, Math.floor(((clientX - sqRect.left) / sqRect.width) * this.centerSquare.width)));
            const sqY = Math.max(0, Math.min(this.centerSquare.height - 1, Math.floor(((clientY - sqRect.top) / sqRect.height) * this.centerSquare.height)));
            try {
                const pixel = this.paintCtx.getImageData(sqX, sqY, 1, 1).data;
                return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] / 255 };
            } catch (e) {
                console.warn("Error sampling square canvas:", e);
            }
        }

        // 2. Check level image (account for viewport's screen position)
        if (this.offscreenCtx) {
            const vpRect = this.levelViewport.getBoundingClientRect();
            const localX = clientX - vpRect.left;
            const localY = clientY - vpRect.top;

            const imgX = Math.floor((localX - this.panX) / this.currentScale);
            const imgY = Math.floor((localY - this.panY) / this.currentScale);

            if (imgX >= 0 && imgX < this.levelImage.naturalWidth && imgY >= 0 && imgY < this.levelImage.naturalHeight) {
                try {
                    const pixel = this.offscreenCtx.getImageData(imgX, imgY, 1, 1).data;
                    return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] / 255 };
                } catch (e) {
                    console.warn("Error sampling level image:", e);
                }
            }
        }

        return null;
    }

    // =====================================================
    // Painting on Square with Smooth Opacity Layering
    // =====================================================

    _getCanvasCoords(e) {
        const rect = this.centerSquare.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.centerSquare.width;
        const y = ((e.clientY - rect.top) / rect.height) * this.centerSquare.height;
        return { x, y };
    }

    _drawStroke(x, y, isStart = false) {
        if (!this.paintCtx || !this.colorPicker) return;

        const color = this.colorPicker.color;
        const rgb = color.rgb;
        const alpha = color.alpha;
        const brushSize = parseInt(this.brushSizeInput.value, 10);

        // Draw solid opaque stroke onto the scratch canvas
        this.strokeCtx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        this.strokeCtx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        this.strokeCtx.lineWidth = brushSize;
        this.strokeCtx.lineCap = 'round';
        this.strokeCtx.lineJoin = 'round';

        if (isStart) {
            this.strokeCtx.beginPath();
            this.strokeCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
            this.strokeCtx.fill();
        } else {
            this.strokeCtx.beginPath();
            this.strokeCtx.moveTo(this.lastPaintX, this.lastPaintY);
            this.strokeCtx.lineTo(x, y);
            this.strokeCtx.stroke();
        }

        // Composite snapshot + scratch stroke with current opacity
        this.paintCtx.clearRect(0, 0, this.SQUARE_SIZE, this.SQUARE_SIZE);
        this.paintCtx.drawImage(this.snapshotCanvas, 0, 0);
        this.paintCtx.globalAlpha = alpha;
        this.paintCtx.drawImage(this.strokeCanvas, 0, 0);
        this.paintCtx.globalAlpha = 1.0;
    }

    _onSquareMouseDown(e) {
        if (e.button !== 0) return;

        if (this.isEyedropperActive) {
            const color = this._sampleColorAt(e.clientX, e.clientY);
            if (color && this.colorPicker) {
                this.colorPicker.color.set(color);
                if (this.colorPreviewBox) {
                    this.colorPreviewBox.style.background = this.colorPicker.color.rgbaString;
                }
            }
            this._toggleEyedropper(false);
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (!this.isPaintMode) return;
        this.isPainting = true;

        // Snapshot current canvas state before starting this stroke
        this.snapshotCtx.clearRect(0, 0, this.SQUARE_SIZE, this.SQUARE_SIZE);
        this.snapshotCtx.drawImage(this.centerSquare, 0, 0);

        // Clear temporary stroke layer
        this.strokeCtx.clearRect(0, 0, this.SQUARE_SIZE, this.SQUARE_SIZE);

        const pos = this._getCanvasCoords(e);
        this.lastPaintX = pos.x;
        this.lastPaintY = pos.y;
        this._drawStroke(pos.x, pos.y, true);
        e.preventDefault();
        e.stopPropagation();
    }

    _onPaintMouseMove(e) {
        if (!this.isPainting) return;
        const pos = this._getCanvasCoords(e);
        this._drawStroke(pos.x, pos.y, false);
        this.lastPaintX = pos.x;
        this.lastPaintY = pos.y;
    }

    _onPaintMouseUp() {
        if (this.isPainting) {
            this.isPainting = false;
        }
    }

    // =====================================================
    // Viewport: pan, zoom, clamp, square
    // =====================================================

    _centerImageOnSquare() {
        const vw = this.levelViewport.clientWidth;
        const vh = this.levelViewport.clientHeight;
        const imgW = this.levelImage.naturalWidth * this.currentScale;
        const imgH = this.levelImage.naturalHeight * this.currentScale;
        this.panX = (vw - imgW) / 2;
        this.panY = (vh - imgH) / 2;
    }

    /** Update the square's image-space coords from the viewport center (only when unlocked in hide phase). */
    _updateSquareImagePos() {
        if (this.isLocked || !this.imageLoaded || this.currentPhase !== 'hide') return;
        const vw = this.levelViewport.clientWidth;
        const vh = this.levelViewport.clientHeight;
        this.squareImageX = (vw / 2 - this.panX) / this.currentScale;
        this.squareImageY = (vh / 2 - this.panY) / this.currentScale;
    }

    _clampPan() {
        if (!this.imageLoaded) return;

        const vw = this.levelViewport.clientWidth;
        const vh = this.levelViewport.clientHeight;
        const imgW = this.levelImage.naturalWidth * this.currentScale;
        const imgH = this.levelImage.naturalHeight * this.currentScale;

        if (this.currentPhase === 'hunt' || this.currentPhase === 'postgame' || this.isLocked) {
            const margin = 50;
            this.panX = Math.max(-imgW + margin, Math.min(vw - margin, this.panX));
            this.panY = Math.max(-imgH + margin, Math.min(vh - margin, this.panY));
        } else {
            const halfSq = (this.SQUARE_SIZE * (this.currentScale / this.maxScale)) / 2;
            const sqLeft   = vw / 2 - halfSq;
            const sqRight  = vw / 2 + halfSq;
            const sqTop    = vh / 2 - halfSq;
            const sqBottom = vh / 2 + halfSq;

            if (imgW <= halfSq * 2) {
                this.panX = vw / 2 - imgW / 2;
            } else {
                this.panX = Math.min(sqLeft, Math.max(sqRight - imgW, this.panX));
            }

            if (imgH <= halfSq * 2) {
                this.panY = vh / 2 - imgH / 2;
            } else {
                this.panY = Math.min(sqTop, Math.max(sqBottom - imgH, this.panY));
            }
        }
    }

    _applyTransform() {
        this.levelImage.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.currentScale})`;

        const size = this.SQUARE_SIZE * (this.currentScale / this.maxScale);
        this.centerSquare.style.width = size + 'px';
        this.centerSquare.style.height = size + 'px';

        if (this.isLocked) {
            const screenX = this.squareImageX * this.currentScale + this.panX;
            const screenY = this.squareImageY * this.currentScale + this.panY;
            this.centerSquare.style.left = screenX + 'px';
            this.centerSquare.style.top = screenY + 'px';
        } else {
            this.centerSquare.style.left = '50%';
            this.centerSquare.style.top = '50%';
        }
        this.centerSquare.style.transform = 'translate(-50%, -50%)';

        // Apply transforms to all submitted player squares
        Object.keys(this.allSquares).forEach(id => {
            const sqData = this.allSquares[id];
            const el = document.getElementById(`square-${id}`);
            if (el) {
                el.style.width = size + 'px';
                el.style.height = size + 'px';
                const screenX = sqData.x * this.currentScale + this.panX;
                const screenY = sqData.y * this.currentScale + this.panY;
                el.style.left = screenX + 'px';
                el.style.top = screenY + 'px';
            }
        });
    }

    // --- Mouse drag ---
    _onMouseDown(e) {
        if (e.button !== 0) return;

        if (this.isEyedropperActive) {
            const color = this._sampleColorAt(e.clientX, e.clientY);
            if (color && this.colorPicker) {
                this.colorPicker.color.set(color);
                if (this.colorPreviewBox) {
                    this.colorPreviewBox.style.background = this.colorPicker.color.rgbaString;
                }
            }
            this._toggleEyedropper(false);
            e.preventDefault();
            return;
        }

        this.isDragging = true;
        this.hasDragged = false;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.mouseDownX = e.clientX;
        this.mouseDownY = e.clientY;
        if (this.playRoot) this.playRoot.classList.add('is-dragging');
        e.preventDefault();
    }

    _onMouseMove(e) {
        if (!this.isDragging) return;
        if (Math.abs(e.clientX - this.mouseDownX) > 4 || Math.abs(e.clientY - this.mouseDownY) > 4) {
            this.hasDragged = true;
        }

        const speed = e.shiftKey ? 0.2 : 1.0;
        const dx = (e.clientX - this.lastMouseX) * speed;
        const dy = (e.clientY - this.lastMouseY) * speed;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        this.panX += dx;
        this.panY += dy;
        this._clampPan();
        if (!this.isLocked && this.currentPhase === 'hide') this._updateSquareImagePos();
        this._applyTransform();
    }

    _onMouseUp() {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (this.playRoot) this.playRoot.classList.remove('is-dragging');
        this.levelViewport.style.cursor = this.isEyedropperActive ? 'none' : 'grab';
    }

    // --- Scroll zoom ---
    _onWheel(e) {
        e.preventDefault();
        if (!this.imageLoaded) return;

        const vw = this.levelViewport.clientWidth;
        const vh = this.levelViewport.clientHeight;

        const zoomFactor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
        let newScale = this.currentScale * zoomFactor;

        const maxAllowedZoom = this.isPaintMode ? (this.maxScale * 10) : this.maxScale;
        newScale = Math.min(maxAllowedZoom, Math.max(0.01, newScale));
        if (newScale === this.currentScale) return;

        const ratio = newScale / this.currentScale;

        const cx = vw / 2;
        const cy = vh / 2;
        this.panX = cx - ratio * (cx - this.panX);
        this.panY = cy - ratio * (cy - this.panY);

        this.currentScale = newScale;
        this._clampPan();
        if (!this.isLocked && this.currentPhase === 'hide') this._updateSquareImagePos();
        this._applyTransform();
    }

    // --- WASD / arrow keys ---
    _onKeyDown(e) {
        if (e.target && e.target.tagName === 'INPUT') return;

        const key = e.key.toLowerCase();
        this.keysDown[key] = true;

        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
            e.preventDefault();
        }

        if (key === 'escape' && this.isEyedropperActive) {
            this._toggleEyedropper(false);
        } else if (key === 'e' && this.currentPhase === 'hide') {
            this._toggleLock();
        } else if (key === 'f' && this.currentPhase === 'hide') {
            this._togglePaintMode();
        }
    }

    _onKeyUp(e) {
        if (e.target && e.target.tagName === 'INPUT') return;
        this.keysDown[e.key.toLowerCase()] = false;
    }

    _processWASD() {
        if (!this.imageLoaded) return;
        const speed = this.keysDown['shift'] ? (this.WASD_SPEED / 10) : this.WASD_SPEED;

        let dx = 0, dy = 0;
        if (this.keysDown['w'] || this.keysDown['arrowup'])    dy += speed;
        if (this.keysDown['s'] || this.keysDown['arrowdown'])  dy -= speed;
        if (this.keysDown['a'] || this.keysDown['arrowleft'])  dx += speed;
        if (this.keysDown['d'] || this.keysDown['arrowright']) dx -= speed;
        if (dx === 0 && dy === 0) return;

        this.panX += dx;
        this.panY += dy;
        this._clampPan();
        if (!this.isLocked && this.currentPhase === 'hide') this._updateSquareImagePos();
        this._applyTransform();
    }

    // =====================================================
    // Game phases
    // =====================================================

    startPhase(phaseName) {
        if (!this.net.isHost) return;

        const previousPhase = this.currentPhase;
        this.currentPhase = phaseName;
        if (this.timerInterval) clearInterval(this.timerInterval);

        // Reset game state cleanly on start of hide phase
        if (phaseName === 'hide') {
            this._resetToHidePhase();
        }

        if (previousPhase === 'hide' && phaseName === 'hunt') {
            this._triggerHuntTransition();
        }

        switch (phaseName) {
            case 'hide':
                this.timeLeft = parseInt(this.context.paintTime, 10);
                this.startTimer(() => this.startPhase('hunt'));
                break;
            case 'hunt':
                this.timeLeft = parseInt(this.context.huntTime, 10);
                this.net.send('ALL_SQUARES_SYNC', this.allSquares, true);
                this.startTimer(() => this.startPhase('postgame'));
                break;
            case 'postgame':
                this.timeLeft = 0;
                break;
        }
        this.broadcastGameState();
        this.renderGameState();
    }

    renderGameState() {
        this.postGameControls.style.display = 'none';
        this.gameTimer.style.display = 'block';

        if (this.winnerText) this.winnerText.style.display = 'none';
        switch (this.currentPhase) {
            case 'hide':
                if (this.playerListPanel) this.playerListPanel.style.display = 'none';
                break;
            case 'hunt':
            case 'postgame':
                if (this.playerListPanel) this.playerListPanel.style.display = 'flex';
                this.updatePlayerListGUI();
                break;
        }
        switch (this.currentPhase) {
            case 'hide':
                this.phaseDisplay.innerText = 'Hide Phase';
                if (this.hideModeControls) this.hideModeControls.style.display = 'flex';
                break;
            case 'hunt':
                this.phaseDisplay.innerText = 'Hunt Phase';
                if (this.hideModeControls) this.hideModeControls.style.display = 'none';
                break;
            case 'postgame':
                this.phaseDisplay.innerText = 'Game Over';
                this.gameTimer.style.display = 'none';
                if (this.hideModeControls) this.hideModeControls.style.display = 'none';
                
                if (this.winnerName && this.winnerText) {
                    this.winnerText.innerText = `${this.winnerName} Wins!`;
                    this.winnerText.style.display = 'block';
                }

                // Make all squares visible with blinking outlines in postgame
                if (this.squaresContainer) {
                    this.squaresContainer.style.display = 'block';
                }
                this._renderAllSquares().then(() => this._applyTransform());

                if (this.net.isHost) {
                    this.postGameControls.style.display = 'flex';
                    this.postGameControls.innerHTML = `
                        <button id="btnRematch">Rematch</button>
                        <button id="btnGoToSettings" style="background: #555;">Back to Settings</button>
                    `;
                    this.bindPostGameButtons();
                }
                break;
        }
        this.updateTimerDisplay();
    }

    startTimer(onComplete) {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.broadcastGameState();
            this.renderGameState();
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                onComplete();
            }
        }, 1000);
    }

    broadcastGameState() {
        if (!this.net.isHost) return;
        this.net.send('GAME_STATE_UPDATE', {
            phase: this.currentPhase,
            timeLeft: this.timeLeft,
            winnerName: this.winnerName
        }, false);
    }

    bindPostGameButtons() {
        document.getElementById('btnRematch').onclick = () => {
            this.net.send('GAME_REMATCH', {}, true);
            this.startRematchCountdown();
        };
        document.getElementById('btnGoToSettings').onclick = () => {
            this.net.send('GAME_GOTO_SETTINGS', {}, true);
            this.manager.load(SettingsScreen, this.net, {
                ...this.context,
                myPlayerName: this.myPlayerName,
                playerName: this.myPlayerName
            });
        };
    }

    startRematchCountdown() {
        if (this.rematchCountdownInterval) clearInterval(this.rematchCountdownInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);

        let count = 5;
        let overlay = document.getElementById('rematchOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'rematchOverlay';
            overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:50;flex-direction:column;text-align:center;';
            this.playRoot.appendChild(overlay);
        }

        const update = () => {
            overlay.innerHTML = `<div>
                <h2 style="margin:0;color:#ccc;">Rematch starting in...</h2>
                <h1 style="font-size:8em;margin:10px 0 0 0;color:var(--accent);">${count}</h1>
            </div>`;
        };

        update();
        this.rematchCountdownInterval = setInterval(() => {
            count--;
            update();
            if (count <= 0) {
                clearInterval(this.rematchCountdownInterval);
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (this.net.isHost) {
                    this.startPhase('hide');
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        if (this.timeLeft < 0) return;
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.gameTimer.innerText =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        this.gameTimer.style.color = this.timeLeft <= 10 ? 'var(--accent)' : '#fff';
    }

    destroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.rematchCountdownInterval) clearInterval(this.rematchCountdownInterval);
        if (this.wasdInterval) clearInterval(this.wasdInterval);

        if (this.paintPanelHeader) {
            this.paintPanelHeader.removeEventListener('mousedown', this._onPanelMouseDown);
        }
        window.removeEventListener('mousemove', this._onPanelMouseMove);
        window.removeEventListener('mouseup', this._onPanelMouseUp);
        window.removeEventListener('mousemove', this._onWindowMouseMove);

        if (this.levelViewport) {
            this.levelViewport.removeEventListener('mousedown', this._onMouseDown);
            this.levelViewport.removeEventListener('wheel', this._onWheel);
        }
        if (this.centerSquare) {
            this.centerSquare.removeEventListener('mousedown', this._onSquareMouseDown);
        }
        window.removeEventListener('mousemove', this._onPaintMouseMove);
        window.removeEventListener('mouseup', this._onPaintMouseUp);
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);

        if (this.net.isHost) this.net.events['playerConnected'] = [];
        this.net.events['GAME_STATE_UPDATE'] = [];
        this.net.events['GAME_REMATCH'] = [];
        this.net.events['GAME_GOTO_SETTINGS'] = [];
        this.net.events['SUBMIT_SQUARE'] = [];
        this.net.events['ALL_SQUARES_SYNC'] = [];
        this.net.events['DECLARE_WINNER'] = [];
        if (this.playerListHeader) {
            this.playerListHeader.removeEventListener('mousedown', this._onPlPanelMouseDown);
        }
        window.removeEventListener('mousemove', this._onPlPanelMouseMove);
        window.removeEventListener('mouseup', this._onPlPanelMouseUp);
        this.net.events['SQUARE_FOUND_UPDATE'] = [];
        this.net.events['ALL_PLAYER_PROGRESS_SYNC'] = [];
    }
    // =====================================================
    // Player List Panel Drag, Minimize & GUI
    // =====================================================

    _onPlPanelMouseDown(e) {
        if (e.button !== 0 || e.target === this.btnMinimizePlayerList) return;
        this.isPlPanelDragging = true;
        this.plMouseStartX = e.clientX;
        this.plMouseStartY = e.clientY;
        this.plInitialLeft = this.playerListPanel.offsetLeft;
        this.plInitialTop = this.playerListPanel.offsetTop;
        this.playerListHeader.style.cursor = 'grabbing';
        e.preventDefault();
        e.stopPropagation();
    }

    _onPlPanelMouseMove(e) {
        if (!this.isPlPanelDragging) return;
        const deltaX = e.clientX - this.plMouseStartX;
        const deltaY = e.clientY - this.plMouseStartY;
        let newX = this.plInitialLeft + deltaX;
        let newY = this.plInitialTop + deltaY;

        const maxLeft = this.playRoot.clientWidth - this.playerListPanel.offsetWidth - 10;
        const maxTop = this.playRoot.clientHeight - this.playerListPanel.offsetHeight - 10;
        newX = Math.max(10, Math.min(maxLeft, newX));
        newY = Math.max(10, Math.min(maxTop, newY));

        this.playerListPanel.style.left = newX + 'px';
        this.playerListPanel.style.top = newY + 'px';
        this.playerListPanel.style.right = 'auto'; // Allow left positioning
    }

    _onPlPanelMouseUp() {
        if (this.isPlPanelDragging) {
            this.isPlPanelDragging = false;
            if (this.playerListHeader) {
                this.playerListHeader.style.cursor = 'grab';
            }
        }
    }

    updatePlayerListGUI() {
        if (!this.hudPlayerList) return;
        this.hudPlayerList.innerHTML = '';

        const allSquareIds = Object.keys(this.allSquares);
        const totalSquares = allSquareIds.length;

        // Get all active players from context or squares
        const playersObj = (this.context && this.context.players) ? this.context.players : {};
        const playerIds = Array.from(new Set([...Object.keys(playersObj), ...Object.keys(this.allSquares)]));

        playerIds.forEach(pId => {
            const pName = playersObj[pId] || (this.allSquares[pId] ? this.allSquares[pId].name : 'Player');
            const foundSet = this.playerProgress[pId] || new Set();
            const foundCount = foundSet.size;

            const li = document.createElement('li');
            li.style.cssText = 'padding: 6px 8px; background: #222; margin-bottom: 4px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: 1px solid #333;';
            li.innerHTML = `
                <span style="font-weight: bold; color: ${pId === this.net.myId ? '#00aaff' : '#eee'};">${pName}</span>
                <span style="font-family: monospace; background: #111; padding: 2px 6px; border-radius: 3px; color: ${foundCount === totalSquares && totalSquares > 0 ? '#00ff00' : '#ffeb3b'};">
                    ${foundCount}/${totalSquares}
                </span>
            `;

            // Tooltip hover handlers
            li.onmouseenter = (e) => {
                if (!this.playerListTooltip) return;
                let content = `<div style="font-weight: bold; border-bottom: 1px solid #444; padding-bottom: 4px; margin-bottom: 4px;">${pName}'s Progress</div>`;

                if (totalSquares === 0) {
                    content += `<div style="color: #aaa;">No squares available</div>`;
                } else {
                    allSquareIds.forEach(sqId => {
                        const sqOwner = this.allSquares[sqId].name || 'Player';
                        const hasFound = foundSet.has(sqId);
                        const icon = hasFound ? '✅' : '❌';
                        const color = hasFound ? '#4caf50' : '#ff5252';
                        content += `<div style="color: ${color}; margin-top: 2px;">${icon} ${sqOwner}'s Square</div>`;
                    });
                }

                this.playerListTooltip.innerHTML = content;
                this.playerListTooltip.style.display = 'block';

                const rect = li.getBoundingClientRect();
                this.playerListTooltip.style.left = Math.max(10, rect.left - 210) + 'px';
                this.playerListTooltip.style.top = rect.top + 'px';
            };

            li.onmouseleave = () => {
                if (this.playerListTooltip) this.playerListTooltip.style.display = 'none';
            };

            this.hudPlayerList.appendChild(li);
        });
    }
    
}