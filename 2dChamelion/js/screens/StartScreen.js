import SettingsScreen from './SettingsScreen.js';

export default class StartScreen {
    constructor(manager, net, context) {
        this.manager = manager;
        this.net = net;
        this.context = context;
    }

    template() {
        return `
            <div class="screen">
                <h2>Mecha Chameleon: Web</h2>
                <div class="panel" style="max-width: 400px;">
                    <label>Your Name:</label>
                    <input type="text" id="playerName" placeholder="Enter your name" value="Player_${Math.floor(Math.random()*1000)}">
                    
                    <hr style="margin: 20px 0; border-color: #444;">
                    <button id="btnCreate">Create Room (Host)</button>
                    
                    <hr style="margin: 20px 0; border-color: #444;">
                    <input type="text" id="roomCode" placeholder="Enter Room Code">
                    <button id="btnJoin">Join Room</button>
                </div>
            </div>
        `;
    }

    mount() {
        const btnCreate = document.getElementById('btnCreate');
        const btnJoin = document.getElementById('btnJoin');
        const roomCodeInput = document.getElementById('roomCode');
        const playerNameInput = document.getElementById('playerName');

        // Auto-join from URL parameter logic
        if (this.context.autoJoinRoom) {
            roomCodeInput.value = this.context.autoJoinRoom;
            this.executeJoin(this.context.autoJoinRoom, playerNameInput.value);
        }

        btnCreate.onclick = () => {
            this.net.hostRoom();
            this.manager.load(SettingsScreen, this.net, { playerName: playerNameInput.value });
        };

        btnJoin.onclick = () => {
            const code = roomCodeInput.value.trim();
            if (code) {
                this.executeJoin(code, playerNameInput.value);
            }
        };
    }

    executeJoin(roomCode, playerName) {
        this.net.joinRoom(roomCode);
        this.manager.load(SettingsScreen, this.net, { playerName: playerName, joiningRoom: roomCode });
    }

    destroy() {
        // Clean up listeners if necessary
    }
}