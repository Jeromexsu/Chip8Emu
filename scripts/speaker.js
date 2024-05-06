class Speaker {
    DEFAULT_FREQUENCY = 440;
    ctx;
    gain; // volumn control
    destination;
    oscillator;
    enabled = false;

    init() {
        this.ctx = new window.AudioContext();
        this.gain = this.ctx.createGain();
        this.destination = this.ctx.destination;
        this.gain.connect(this.destination);
        this.play(440);
        this.enabled = true;

    }

    play(frequency) {
        if(this.enabled && !this.oscillator) {
            this.oscillator = this.ctx.createOscillator();
            this.oscillator.frequency.setValueAtTime(frequency || this.DEFAULT_FREQUENCY, this.ctx.currentTime);
            this.oscillator.type = 'square';
            this.oscillator.connect(this.gain);
            this.oscillator.start();
        }
    }

    stop() {
        if(this.ctx && this.oscillator && this.ctx.state === 'running') {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }

}

export default Speaker;