class Speaker {
    DEFAULT_FREQUENCY = 440;

    ctx = new window.AudioContext();
    gain = this.ctx.createGain(); // volumn control
    destination = this.ctx.destination;
    oscillator;

    constructor() {
        this.gain.connect(this.destination);
    }

    play(frequency) {
        if(this.oscillator === undefined || this.oscillator === null) {
            this.oscillator = this.ctx.createOscillator();
            this.oscillator.frequency.setValueAtTime(frequency || this.DEFAULT_FREQUENCY, this.ctx.currentTime);
            this.oscillator.type = 'square';
            this.oscillator.connect(this.gain);
            this.oscillator.start();
        }
    }

    stop() {
        // this.oscillator.stop();
        // this.oscillator.disconnect();
        // this.oscillator = null;
    }

}

export default Speaker;