const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

window.AudioEngine = {
    ctx: audioCtx, // <-- THIS IS THE MISSING LINE!
    masterVolume: 0.5,
    
    createNoiseBuffer: function(durationSec) {
        const bufferSize = audioCtx.sampleRate * durationSec;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        return buffer;
    },

    playClickSound: function(isDown) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const startFreq = isDown ? 4000 : 3000;
        const endFreq = isDown ? 2000 : 1500;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.015);
        const effVol = Math.max(this.masterVolume, 0.001) * 0.05; 
        gain.gain.setValueAtTime(effVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.02);
    },

    playSlapSound: function() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.1);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass'; 
        filter.frequency.value = 800 + (Math.random() * 200 - 100); 
        filter.Q.value = 1.5 + (Math.random() * 0.6 - 0.3);
        const gain = this.ctx.createGain();
        const effVol = Math.max(this.masterVolume, 0.001);
        gain.gain.setValueAtTime(0.8 * this.masterVolume, this.ctx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.01 * effVol, this.ctx.currentTime + 0.1);
        noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        noise.start();
    },

    playHighFiveSound: function(grade, combo) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const effVol = Math.max(this.masterVolume, 0.001);
        
        // Impact
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.3);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass'; 
        filter.frequency.value = grade === 'perfect' ? 2000 : 1200;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(effVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        noise.start();

        // Arpeggios
        const notes = grade === 'perfect' ? [1, 1.25, 1.5, 2] : grade === 'solid' ? [1, 1.25, 1.5] : [];
        const baseFreq = 440 * Math.pow(1.059, Math.min(combo, 24));
        notes.forEach((ratio, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = baseFreq * ratio;
            const noteGain = this.ctx.createGain();
            const startTime = this.ctx.currentTime + i * 0.06;
            noteGain.gain.setValueAtTime(0, startTime);
            noteGain.gain.linearRampToValueAtTime(0.2 * effVol, startTime + 0.01);
            noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
            osc.connect(noteGain); noteGain.connect(this.ctx.destination);
            osc.start(startTime); osc.stop(startTime + 0.15);
        });
    }
};