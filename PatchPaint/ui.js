const net = new NetworkModule();
net.init();

// --- DOM Elements ---
const screens = {
    start: document.getElementById('startScreen'),
    settings: document.getElementById('settingsScreen')
};

// Inputs & Buttons
const btnCreate = document.getElementById('btnCreate');
const btnJoin = document.getElementById('btnJoin');
const btnCopyUrl = document.getElementById('btnCopyUrl');
const roomCodeInput = document.getElementById('roomCode');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const playerNameInput = document.getElementById('playerName');

// Settings Elements
const syncInputs = document.querySelectorAll('.sync-input');
const inpPaintTime = document.getElementById('inpPaintTime');
const inpHuntTime = document.getElementById('inpHuntTime');
const inpLevelUrl = document.getElementById('inpLevelUrl');
const inpScale = document.getElementById('inpScale');

// Image Previews
const levelPreviewFull = document.getElementById('levelPreviewFull');
const dragContainer = document.getElementById('dragContainer');
const levelPreviewDrag = document.getElementById('levelPreviewDrag');

// --- Game State Object ---
let gameState = {
    paintTime: 240,
    huntTime: 300,
    levelUrl: '',
    scale: 100
};

// --- Screen Management ---
function showScreen(screenName) {
    screens.start.style.display = 'none';
    screens.settings.style.display = 'none';
    screens[screenName].style.display = 'block';
}

function applyPermissions() {
    // Lock all input fields if the player is not the host
    syncInputs.forEach(input => {
        input.disabled = !net.isHost;
    });
}

// --- Network Triggers ---
net.on('ready', (id) => {
    console.log("Ready. My ID:", id);

    // Check URL parameters to auto-join
    const urlParams = new URLSearchParams(window.location.search);
    const roomToJoin = urlParams.get('room');

    if (roomToJoin) {
        // Automatically execute the join logic
        roomCodeInput.value = roomToJoin; // Populate for visual feedback
        net.joinRoom(roomToJoin);
        
        roomCodeDisplay.innerText = `Connected to: ${roomToJoin}`;
        showScreen('settings');
        applyPermissions();
        
        // Ask the host for the current settings immediately
        setTimeout(() => net.send('REQ_SETTINGS', {}, true), 500); 
    }
});

btnCreate.onclick = () => {
    net.hostRoom();
    roomCodeDisplay.innerText = `Room Code: ${net.myId}`;
    showScreen('settings');
    applyPermissions();
};

btnJoin.onclick = () => {
    const code = roomCodeInput.value.trim();
    if (code) {
        net.joinRoom(code);
        roomCodeDisplay.innerText = `Connected to: ${code}`;
        showScreen('settings');
        applyPermissions();
        // Ask the host for the current settings immediately
        setTimeout(() => net.send('REQ_SETTINGS', {}, true), 500); 
    }
};

btnCopyUrl.onclick = () => {
    // Construct the join URL using the current origin and path
    const url = `${window.location.origin}${window.location.pathname}?room=${net.myId}`;
    
    navigator.clipboard.writeText(url).then(() => {
        const originalText = btnCopyUrl.innerText;
        btnCopyUrl.innerText = "Copied!";
        btnCopyUrl.style.backgroundColor = "#28a745"; // Success green
        
        setTimeout(() => {
            btnCopyUrl.innerText = originalText;
            btnCopyUrl.style.backgroundColor = ""; // Revert
        }, 2000);
    });
};
// --- Settings Synchronization ---

// 1. Host detects local changes and broadcasts them
syncInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (!net.isHost) return;
        
        gameState.paintTime = inpPaintTime.value;
        gameState.huntTime = inpHuntTime.value;
        gameState.levelUrl = inpLevelUrl.value;
        gameState.scale = inpScale.value;

        updateVisualsLocal();
        net.send('SETTINGS_UPDATE', gameState, true);
    });
});

// 2. Client receives settings from host
net.on('SETTINGS_UPDATE', (newState) => {
    gameState = newState;
    
    // Update local DOM inputs to match host
    inpPaintTime.value = gameState.paintTime;
    inpHuntTime.value = gameState.huntTime;
    inpLevelUrl.value = gameState.levelUrl;
    inpScale.value = gameState.scale;

    updateVisualsLocal();
});

// 3. Host receives request from new client and sends state
net.on('REQ_SETTINGS', () => {
    if (net.isHost) {
        net.send('SETTINGS_UPDATE', gameState, true);
    }
});

// --- Image Preview, Draggable Logic & Boundary Math ---

let dragOffset = { x: 0, y: 0 };
let isDragging = false;
let startPos = { x: 0, y: 0 };

// Ensure image loads trigger a re-clamp (important when changing URLs)
levelPreviewDrag.onload = updateVisualsLocal;

function clampDragOffset() {
    // Don't calculate if there is no valid image loaded
    if (!levelPreviewDrag.naturalWidth) return;

    const containerW = dragContainer.clientWidth;
    const containerH = dragContainer.clientHeight;
    
    // The center point of the container
    const centerX = containerW / 2;
    const centerY = containerH / 2;

    // Actual pixel size of the image right now
    const scaleMult = gameState.scale / 100;
    const imgW = levelPreviewDrag.naturalWidth * scaleMult;
    const imgH = levelPreviewDrag.naturalHeight * scaleMult;

    // Math: The image's X offset must be <= CenterX, 
    // AND the image's right edge (X + imgW) must be >= CenterX.
    const minX = centerX - imgW;
    const maxX = centerX;
    const minY = centerY - imgH;
    const maxY = centerY;

    // Force the offset to stay within these bounds
    dragOffset.x = Math.max(minX, Math.min(maxX, dragOffset.x));
    dragOffset.y = Math.max(minY, Math.min(maxY, dragOffset.y));
}

function updateVisualsLocal() {
    if (levelPreviewFull.src !== gameState.levelUrl) {
        levelPreviewFull.src = gameState.levelUrl;
        levelPreviewDrag.src = gameState.levelUrl;
        dragOffset = { x: 0, y: 0 }; 
    }
    
    // Always clamp before applying the transform to prevent zooming out of bounds
    clampDragOffset();
    
    const scaleMult = gameState.scale / 100;
    levelPreviewDrag.style.transform = `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${scaleMult})`;
}

// -- Dragging Events --
dragContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragContainer.style.cursor = 'grabbing';
    startPos = { 
        x: e.clientX - dragOffset.x, 
        y: e.clientY - dragOffset.y 
    };
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    dragContainer.style.cursor = 'grab';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    dragOffset.x = e.clientX - startPos.x;
    dragOffset.y = e.clientY - startPos.y;
    
    updateVisualsLocal(); // This will now clamp and apply transform
});

// -- Scroll to Zoom Event --
dragContainer.addEventListener('wheel', (e) => {
    // Prevent the whole page from scrolling while zooming
    e.preventDefault(); 
    
    // Only the host can adjust settings
    if (!net.isHost) return; 

    let currentScale = parseInt(inpScale.value) || 100;
    const zoomSpeed = 5; 

    if (e.deltaY < 0) {
        currentScale += zoomSpeed; // Scrolling up = Zoom In
    } else {
        currentScale -= zoomSpeed; // Scrolling down = Zoom Out
    }
    
    // Don't let scale drop to 0 or negative
    currentScale = Math.max(5, currentScale); 
    
    inpScale.value = currentScale;
    
    // Programmatically fire the input event so the host broadcasts the new scale
    inpScale.dispatchEvent(new Event('input'));
    
}, { passive: false }); // Passive false allows e.preventDefault()