const net = new NetworkModule();
net.init();

// --- DOM Elements ---
const statusEl = document.getElementById('status');
const roomUrlEl = document.getElementById('roomUrl');
const btnCreate = document.getElementById('btnCreate');
const btnTransfer = document.getElementById('btnTransfer');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const paintCanvas = document.createElement('canvas');
paintCanvas.width = canvas.width;
paintCanvas.height = canvas.height;
const paintCtx = paintCanvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const imageContainer = document.getElementById('imageContainer');
const loadingOverlay = document.getElementById('loadingOverlay');

// --- Game State ---
const players = {};
let myPos = { x: 200, y: 200 };
const keys = {};

// --- Network Initialization ---
net.on('ready', (id) => {
    // Check URL parameters to auto-join
    const urlParams = new URLSearchParams(window.location.search);
    const roomToJoin = urlParams.get('room');

    if (roomToJoin) {
        net.joinRoom(roomToJoin);
    } else {
        btnCreate.style.display = 'inline-block';
    }
});

net.on('status', (msg) => {
    statusEl.innerText = 'Status: ' + msg;
    if (net.isHost) {
        const url = `${window.location.origin}${window.location.pathname}?room=${net.myId}`;
        roomUrlEl.innerHTML = `Share URL: <a href="${url}" target="_blank">${url}</a>`;
        btnCreate.style.display = 'none';
        btnTransfer.style.display = 'inline-block';
    }
});

net.on('playerLeft', (id) => {
    delete players[id];
    console.log("Cleaned up player:", id);
});

btnCreate.onclick = () => net.hostRoom();

// --- Input & Fast-Paced Syncing (Position) ---
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function gameLoop() {
    let moved = false;
    const speed = 5;
    if (keys['w']) { myPos.y -= speed; moved = true; }
    if (keys['s']) { myPos.y += speed; moved = true; }
    if (keys['a']) { myPos.x -= speed; moved = true; }
    if (keys['d']) { myPos.x += speed; moved = true; }

    if (moved) {
        // Send fast position update. 
        net.send('POS_UPDATE', { id: net.myId, pos: myPos }, false); 
    }

    draw();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

net.on('POS_UPDATE', (data) => {
    players[data.id] = data.pos;
});

function draw() {
    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the persistent paint layer FIRST
    ctx.drawImage(paintCanvas, 0, 0);
    
    // Draw remote players
    ctx.fillStyle = '#ff0000';
    for (let id in players) {
        if (id !== net.myId) {
            ctx.fillRect(players[id].x, players[id].y, 20, 20);
        }
    }
    
    // Draw self
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(myPos.x, myPos.y, 20, 20);
}

// --- Canvas Painting Sync ---
let isDrawing = false;
let lastDrawPos = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastDrawPos = { x: e.offsetX, y: e.offsetY };
});
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const currentPos = { x: e.offsetX, y: e.offsetY };
    
    // Draw locally immediately
    drawLine(lastDrawPos, currentPos);

    // Send draw command
    net.send('DRAW_CMD', { start: lastDrawPos, end: currentPos });
    
    lastDrawPos = currentPos;
});

function drawLine(start, end) {
    paintCtx.beginPath();
    paintCtx.moveTo(start.x, start.y);
    paintCtx.lineTo(end.x, end.y);
    paintCtx.strokeStyle = '#000';
    paintCtx.lineWidth = 2;
    paintCtx.stroke();
}

net.on('DRAW_CMD', (data) => {
    drawLine(data.start, data.end);
});

// --- Image Sync & Loading State ---
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local loading state and broadcast to others
    loadingOverlay.style.display = 'block';
    net.send('IMG_LOADING', { id: net.myId, state: true });

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64Str = event.target.result;
        displayImage(base64Str);
        
        // Send the payload (PeerJS handles splitting large blobs/ArrayBuffers internally)
        net.send('IMG_DATA', base64Str);
        
        loadingOverlay.style.display = 'none';
        net.send('IMG_LOADING', { id: net.myId, state: false });
    };
    reader.readAsDataURL(file);
});

net.on('IMG_LOADING', (data) => {
    if (data.state) {
        loadingOverlay.innerText = `Peer is transmitting image...`;
        loadingOverlay.style.display = 'block';
    } else {
        loadingOverlay.style.display = 'none';
    }
});

net.on('IMG_DATA', (base64Str) => {
    displayImage(base64Str);
});

function displayImage(src) {
    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.marginTop = '10px';
    img.style.border = '1px solid #777';
    imageContainer.innerHTML = ''; // Replace old image
    imageContainer.appendChild(img);
}

btnTransfer.onclick = () => {
    // For the demo, we'll just prompt for the ID. 
    const newHostId = net.peerList.find(newHostId => newHostId !== net.myId);
	if (newHostId){
        net.transferHost(newHostId);
    }
};

net.on('migrated', (msg) => {
    console.log(msg);
    // If you were just made the new host, update your UI
    if (net.isHost) {
        btnCreate.style.display = 'none';
        btnTransfer.style.display = 'inline-block';
    } else {
        btnTransfer.style.display = 'none';
    }
});