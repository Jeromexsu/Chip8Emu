class Keyboard {
    KEY_MAP = {
        49: 0x1, // 1
        50: 0x2, // 2
        51: 0x3, // 3
        52: 0xc, // 4
        81: 0x4, // Q
        87: 0x5, // W
        69: 0x6, // E
        82: 0xD, // R
        65: 0x7, // A
        83: 0x8, // S
        68: 0x9, // D
        70: 0xE, // F
        90: 0xA, // Z
        88: 0x0, // X
        67: 0xB, // C
        86: 0xF  // V
    };
    keyPressed = [];
    waitForKey;
    constructor() {
        window.addEventListener('keydown',this.onKeyDown.bind(this),false);
        window.addEventListener('keyup',this.onKeyUp.bind(this),false);
    }

    onKeyDown(e) {
        let key = this.KEY_MAP[e.keyCode];
        if(key === undefined || key === null) return;
        // console.log(key);
        this.keyPressed[key] = true;
        if(this.waitForKey) {
            this.waitForKey(key);
            this.waitForKey = null;
        }
    }

    onKeyUp(e) {
        let key = this.KEY_MAP[e.keyCode];
        // console.log(key);
        this.keyPressed[key] = false;
    }

    isKeyPressed(key) {
        return this.keyPressed[key];
    }
}

export default Keyboard