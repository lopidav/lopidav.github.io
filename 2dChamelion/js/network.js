export default class NetworkModule {
    constructor() {
        this.peer = null;
        this.connections = new Map(); // id -> connection
        this.isHost = false;
        this.hostId = null;
        this.myId = null;
        this.peerList = []; // Kept updated by host for migration
        this.events = {};
        
        // Disconnect heartbeat tracking
        this.pingInterval = null;
        this.pendingQueue = [];
    }

    // --- Simple Event Emitter ---
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    emit(event, data, extra) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data, extra));
        }
    }

    // --- Initialization ---
    init() {
        this.peer = new Peer({ debug: 2 });

        this.peer.on('open', (id) => {
            this.myId = id;
            this.emit('ready', id);
        });

        this.peer.on('connection', (conn) => this._handleIncomingConnection(conn));
        this.peer.on('error', (err) => this.emit('error', err));
        
        // Catch sudden disconnects from signaling server
        this.peer.on('disconnected', () => {
            console.warn("Disconnected from signaling server. Attempting reconnect...");
            this.peer.reconnect();
        });
    }

    hostRoom() {
        this.isHost = true;
        this.hostId = this.myId;
        this.peerList = [this.myId];
        this.emit('status', 'Hosting Room: ' + this.myId);
        this._startHeartbeat();
    }

    joinRoom(hostId) {
        this.isHost = false;
        this.hostId = hostId;
        this.emit('status', 'Connecting to: ' + hostId);
        const conn = this.peer.connect(hostId, { reliable: true });
        this._setupConnection(conn);
    }

    // --- Core Routing ---
    _handleIncomingConnection(conn) {
        this._setupConnection(conn);
        
        conn.on('open', () => {
            if (this.isHost) {
                // Inform new client of all current peers (for migration fallback)
                if (!this.peerList.includes(conn.peer)) this.peerList.push(conn.peer);
                this._broadcastTopology();

                // Let the network module's owner (the screen) know a new player has connected.
                // This allows the screen to decide what to do (e.g., send game state).
                this.emit('playerConnected', conn.peer);
            }
        });
    }

    _setupConnection(conn) {
        this.connections.set(conn.peer, conn);

        conn.on('open', () => {
            if (!this.isHost && conn.peer === this.hostId) {
                this._flushPendingQueue();
                this.emit('connectedToHost', conn.peer);
            }
        });

        conn.on('data', (packet) => {
            this._handlePacket(packet, conn.peer);
        });

        conn.on('close', () => this._handleDisconnect(conn.peer));
        conn.on('error', (err) => {
            console.warn(`Connection error with ${conn.peer}:`, err);
            this._handleDisconnect(conn.peer);
        });
    }

    _flushPendingQueue() {
        const hostConn = this.connections.get(this.hostId);
        if (hostConn && hostConn.open && this.pendingQueue.length > 0) {
            while (this.pendingQueue.length > 0) {
                const packet = this.pendingQueue.shift();
                hostConn.send(packet);
            }
        }
    }

    // --- Packet Handling ---
    send(type, payload, reliable = true) {
        const packet = { type, payload, sender: this.myId };
        
        if (this.isHost) {
            this.broadcastRaw(packet);
        } else {
            // Clients send everything to host. Host handles authoritative sync.
            const hostConn = this.connections.get(this.hostId);
            if (hostConn && hostConn.open) {
                hostConn.send(packet);
            } else {
                this.pendingQueue.push(packet);
            }
        }
    }

    sendTo(peerId, type, payload, reliable = true) {
        const packet = { type, payload, sender: this.myId };
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
            conn.send(packet);
        } else {
            console.warn(`Could not send message to ${peerId}: connection not found or not open.`);
        }
    }

    broadcastRaw(packet) {
        this.connections.forEach(conn => {
            if (conn.open) conn.send(packet);
        });
    }

    _handlePacket(packet, senderId) {
        // Determine the true origin client ID
        const actualSender = packet.sender || senderId;

        // Internal network packets
        if (packet.type === 'SYS_TOPOLOGY') {
            this.peerList = packet.payload;
            return;
        }
        if (packet.type === 'SYS_PING') {
            const conn = this.connections.get(actualSender);
            if (conn) conn.send({ type: 'SYS_PONG' });
            return;
        }
        if (packet.type === 'SYS_HOST_MIGRATE') {
            this._executeHostMigration(packet.payload);
            return;
        }

        // Do NOT relay direct client-to-host requests to all clients
        const clientDirectRequests = ['REQ_SETTINGS', 'SET_NAME', 'SUBMIT_SQUARE', 'DECLARE_WINNER'];
        if (this.isHost && packet.type !== 'STATE_SYNC' && !clientDirectRequests.includes(packet.type)) {
            this.broadcastRaw(packet); 
        }

        // Pass to game logic with the true sender ID
        this.emit(packet.type, packet.payload, actualSender);
    }

    // --- Host Migration & Disconnects ---
    _handleDisconnect(peerId) {
        this.connections.delete(peerId);
        
        if (this.isHost) {
            this.peerList = this.peerList.filter(id => id !== peerId);
            this._broadcastTopology();
            this.emit('playerLeft', peerId);
        } else if (peerId === this.hostId) {
            console.warn("Host disconnected! Initiating migration...");
            this._determineNewHost();
        }
    }

    _startHeartbeat() {
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
            if (!this.isHost) return;
            // Only clean up connections that explicitly disconnected or failed
            this.connections.forEach((conn, id) => {
                if (conn.peerConnection) {
                    const state = conn.peerConnection.iceConnectionState;
                    if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                        this._handleDisconnect(id);
                    }
                }
            });
        }, 3000);
    }

    _broadcastTopology() {
        this.broadcastRaw({ type: 'SYS_TOPOLOGY', payload: this.peerList });
    }

    transferHost(newHostId) {
        if (!this.isHost) return;
        this.broadcastRaw({ type: 'SYS_HOST_MIGRATE', payload: newHostId });
        this._executeHostMigration(newHostId);
    }

    _determineNewHost() {
        // Remove old host from list
        this.peerList = this.peerList.filter(id => id !== this.hostId);
        // Deterministic migration: lowest alphanumeric ID becomes new host
        this.peerList.sort();
        const nextHost = this.peerList[0];
        this._executeHostMigration(nextHost);
    }

    _executeHostMigration(newHostId) {
        this.hostId = newHostId;
        
        // Actually close old WebRTC connections to prevent ghost data
        this.connections.forEach(conn => conn.close());
        this.connections.clear(); 

        if (this.myId === newHostId) {
            this.hostRoom(); // I am the new host
            this.emit('migrated', 'You are the new host');
        } else {
            this.isHost = false;
            // Delay slightly to let the new host establish their room
            setTimeout(() => this.joinRoom(newHostId), 1000);
            this.emit('migrated', 'Host migrated to: ' + newHostId);
        }
    }
}