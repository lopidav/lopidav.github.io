window.GameState = {
    isHost: false, 
    myId: null, 
    roomId: null, 
    isInGame: false, 
    isClickedIn: false, 
    testingMode: false,
    peers: {}, 
    localPos: { x: 0, y: 0 },
    gameWidth: 0,
    gameHeight: 0,
    aspectRatio: 2,
    lastSentMouse: { x: 0, y: 0 }, 
    localCursorEl: null, 
    localShape: window.Assets.PATH_POINTER,
    baseZ: {}, 
    currentZMap: {}, 
    overlaps: {}, 
    activeDrags: {}, 
    slapCombos: {}, 
    hfCombos: {},
    interactingPeer: null, 
    isDragging: false, 
    isEmptyClick: false,
    dragStartPos: { x: 0, y: 0 }, 
    mouseDownTime: 0, 
    recentHits: {}, 
    pendingHitTimeout: null
};

window.CursorManager = {
    states: {},
    setState: function(id, state) {
        if (!this.states[id]) this.states[id] = { state: 'IDLE', timer: null, sequenceTimer: null };
        const s = this.states[id];
        s.state = state;
        if (s.timer) { clearTimeout(s.timer); s.timer = null; }
        if (s.sequenceTimer) { clearTimeout(s.sequenceTimer); s.sequenceTimer = null; }
        return s;
    },
    setIdle: function(id) {
        this.setState(id, 'IDLE');
        window.Visuals.setHandShape(id, window.Assets.PATH_POINTER);
    },
    getState: function(id) {
        return this.states[id] ? this.states[id].state : 'IDLE';
    },
    isColliding: function(x, y, rect) {
        const pts = [ { x: x, y: y }, { x: x - 4, y: y + 18 }, { x: x + 2, y: y + 14 }, { x: x + 12, y: y + 16 } ];
        for (let i = 0; i < pts.length; i++) {
            if (pts[i].x > rect.left && pts[i].x < rect.right && pts[i].y > rect.top && pts[i].y < rect.bottom) return true;
        }
        return false;
    }
};