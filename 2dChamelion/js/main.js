import ScreenManager from './ScreenManager.js';
import NetworkModule from './network.js';
import StartScreen from './screens/StartScreen.js';

const net = new NetworkModule();
const screenManager = new ScreenManager('app-root');

net.init();
net.on('ready', (id) => {
    // Check for auto-join URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomToJoin = urlParams.get('room');

    screenManager.load(StartScreen, net, { autoJoinRoom: roomToJoin });
});