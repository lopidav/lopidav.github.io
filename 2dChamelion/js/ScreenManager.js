export default class ScreenManager {
    constructor(rootElementId) {
        this.root = document.getElementById(rootElementId);
        this.activeScreen = null;
    }

    // Loads a new screen, passing the network module and any extra context
    load(ScreenClass, networkModule, context = {}) {
        if (this.activeScreen && this.activeScreen.destroy) {
            this.activeScreen.destroy();
        }

        this.activeScreen = new ScreenClass(this, networkModule, context);
        this.root.innerHTML = this.activeScreen.template();
        this.activeScreen.mount();
    }
}