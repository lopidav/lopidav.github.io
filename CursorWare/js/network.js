window.Network = {
    peer: null,
    hostConnection: null,
    clientConnections: {},

    broadcastData: function(payload) {
        if (GameState.isHost) { 
            for(let id in this.clientConnections) {
                if(this.clientConnections[id].open) this.clientConnections[id].send(payload); 
            }
        }
        else if (this.hostConnection && this.hostConnection.open) {
            this.hostConnection.send(payload);
        }
    },

    updateRemoteCursor: function(id, x, y) {
        if (!GameState.peers[id]) {
            GameState.peers[id] = { targetX: x*GameState.gameWidth, targetY: y*GameState.gameHeight, renderX: x*GameState.gameWidth, renderY: y*GameState.gameHeight, element: Visuals.createCursorElement(id), currentShape: Assets.PATH_POINTER };
            if (!GameState.baseZ[id]) GameState.baseZ[id] = 100;
            document.getElementById('player-count').innerText = Object.keys(GameState.peers).length + 1;
        } else {
            GameState.peers[id].targetX = x*GameState.gameWidth; 
            GameState.peers[id].targetY = y*GameState.gameHeight;
        }
    },

    handleClientDisconnect: function(peerId) {
        if(GameState.peers[peerId]) {
            GameState.peers[peerId].element.remove();
            delete GameState.peers[peerId];
            document.getElementById('player-count').innerText = Object.keys(GameState.peers).length + 1;
            
            for (let otherId in this.clientConnections) {
                if (otherId !== peerId && this.clientConnections[otherId].open) {
                    this.clientConnections[otherId].send({ t: 'event', type: 'peer_disconnect', id: peerId });
                }
            }
        }
        
        if (GameState.activeDrags[peerId]) {
            let draggedId = GameState.activeDrags[peerId].target;
            CursorManager.setIdle(draggedId);
            delete GameState.activeDrags[peerId];
        }
        for (let draggerId in GameState.activeDrags) {
            if (GameState.activeDrags[draggerId].target === peerId) {
                CursorManager.setIdle(draggerId);
                delete GameState.activeDrags[draggerId];
                if (draggerId === GameState.myId) {
                    GameState.isDragging = false;
                    GameState.interactingPeer = null;
                }
            }
        }
    },

    handlePeerData: function(data, conn) {
        if (data.t === 'c') this.updateRemoteCursor(data.id, data.x, data.y);
        
        // BUG FIX: Elegant handshaking sync protocol to guarantee old players load instantly for new players.
        else if (data.t === 'sync_req') {
            if (GameState.isHost) {
                let syncData = { t: 'sync_res', peers: {} };
                syncData.peers[GameState.myId] = { 
                    x: GameState.localPos.x / GameState.gameWidth, 
                    y: GameState.localPos.y / GameState.gameHeight 
                };
                for (let otherId in GameState.peers) {
                    syncData.peers[otherId] = { 
                        x: GameState.peers[otherId].targetX / GameState.gameWidth, 
                        y: GameState.peers[otherId].targetY / GameState.gameHeight 
                    };
                }
                conn.send(syncData);
            }
        }
        else if (data.t === 'sync_res') {
            for (let pid in data.peers) {
                if (pid !== GameState.myId) {
                    this.updateRemoteCursor(pid, data.peers[pid].x, data.peers[pid].y);
                }
            }
        }
        
        else if (data.t === 'event') {
            if (data.type === 'hit') { 
                if (data.to === GameState.myId) GameState.recentHits[data.from] = Date.now(); 
            }
            else if (data.type === 'highfive_confirm' && data.to === GameState.myId) { 
                clearTimeout(GameState.pendingHitTimeout); 
                Visuals.executeHighFiveVisuals(data.from, GameState.myId, data.diff); 
            }
            else if (data.type === 'aspect_ratio') {
                if (window.setAspectRatio) window.setAspectRatio(data.ratio);
            }
            else if (data.type === 'slap_execute' && data.to === GameState.myId) {
                if (GameState.isDragging && GameState.interactingPeer) {
                    this.broadcastData({ t: 'event', type: 'drop', dragger: GameState.myId, dragged: GameState.interactingPeer });
                    GameState.isDragging = false; GameState.interactingPeer = null;
                }
                Visuals.executeSlapVisuals(data.from, GameState.myId);
            }
            else if (data.type === 'drag') {
                GameState.activeDrags[data.dragger] = { target: data.dragged, time: Date.now() };
                CursorManager.setState(data.dragger, 'DRAGGING');
                Visuals.setHandShape(data.dragger, Assets.PATH_GRAB); 
                CursorManager.setState(data.dragged, 'DRAGGED');
                Visuals.setHandShape(data.dragged, Assets.PATH_SQUEEZED);
                if (data.dragged === GameState.myId) { 
                    if (GameState.isDragging && GameState.interactingPeer) {
                        this.broadcastData({ t: 'event', type: 'drop', dragger: GameState.myId, dragged: GameState.interactingPeer });
                        GameState.isDragging = false; GameState.interactingPeer = null;
                    }
                    GameState.localPos.x = data.x * GameState.gameWidth; 
                    GameState.localPos.y = data.y * GameState.gameHeight; 
                } else if (GameState.peers[data.dragged]) {
                    GameState.peers[data.dragged].targetX = data.x * GameState.gameWidth;
                    GameState.peers[data.dragged].targetY = data.y * GameState.gameHeight;
                }
            }
            else if (data.type === 'drop') { 
                CursorManager.setIdle(data.dragger);
                CursorManager.setIdle(data.dragged);
                delete GameState.activeDrags[data.dragger];
                if (data.x !== undefined && data.y !== undefined) {
                    if (data.dragged === GameState.myId) {
                        GameState.localPos.x = data.x * GameState.gameWidth;
                        GameState.localPos.y = data.y * GameState.gameHeight;
                    } else if (GameState.peers[data.dragged]) {
                        GameState.peers[data.dragged].targetX = data.x * GameState.gameWidth;
                        GameState.peers[data.dragged].targetY = data.y * GameState.gameHeight;
                    }
                }
            }
            else if (data.type === 'break_free') {
                Visuals.executeSlapVisuals(data.from, data.to);
                delete GameState.activeDrags[data.to];
                if (data.to === GameState.myId) { GameState.isDragging = false; GameState.interactingPeer = null; }
            }
            else if (data.type === 'empty_click_down') Visuals.executeEmptyClickDown(data.id);
            else if (data.type === 'empty_click_up') Visuals.executeEmptyClickUp(data.id);
            else if (data.type === 'peer_disconnect') this.handleClientDisconnect(data.id);
        }
        
        if (GameState.isHost) { 
            for(let id in this.clientConnections) {
                if(id !== conn.peer && this.clientConnections[id].open) {
                    // Do not broadcast internal handshakes to the whole lobby
                    if (data.t !== 'sync_req' && data.t !== 'sync_res') {
                        this.clientConnections[id].send(data); 
                    }
                }
            }
        }
    }
};