// sounds.js

class SoundManager {
  static audioCtx;
  static backgroundMusic;
  static gainNode;
  static sfxGainNode;
  static isPlaying = false;
  static musicSource = null;

  // Configuraciones para cada sonido
  static soundConfigs = {
    click: { type: 'sine', frequency: 1000, duration: 50, volume: 0.1 },
    money: { type: 'triangle', frequency: 500, frequencyEnd: 1000, duration: 100, volume: 0.2 },
    upgrade: { type: 'sine', frequency: 800, frequencyEnd: 1200, duration: 200, volume: 0.15 },
    error: { type: 'sawtooth', frequency: 400, frequencyEnd: 200, duration: 300, volume: 0.1 },
    popup: { type: 'sine', frequency: 1500, duration: 50, volume: 0.1 },
    gameover: { type: 'sawtooth', frequency: 300, frequencyEnd: 100, duration: 1000, volume: 0.25 },
    notification: { type: 'sine', frequency: 900, duration: 100, volume: 0.1 },
  };

  static init() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioCtx.createGain();
      this.sfxGainNode = this.audioCtx.createGain();
      this.gainNode.connect(this.audioCtx.destination);
      this.sfxGainNode.connect(this.audioCtx.destination);
      
      // Establecer volúmenes iniciales
      this.gainNode.gain.value = 0.5;
      this.sfxGainNode.gain.value = 0.5;
      
      this.loadBackgroundMusic();
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }

  static async loadBackgroundMusic() {
    try {
      const response = await fetch('assets/sounds/music.mp3');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      this.backgroundMusic = await this.audioCtx.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error loading background music:', error);
    }
  }

  static startBackgroundMusic() {
    if (this.isPlaying || !this.backgroundMusic) return;
    
    try {
      if (this.musicSource) {
        this.musicSource.disconnect();
      }
      
      this.musicSource = this.audioCtx.createBufferSource();
      this.musicSource.buffer = this.backgroundMusic;
      this.musicSource.connect(this.gainNode);
      this.musicSource.loop = true;
      this.musicSource.start();
      this.isPlaying = true;
    } catch (error) {
      console.error('Error starting background music:', error);
    }
  }

  static stopBackgroundMusic() {
    if (!this.isPlaying) return;
    try {
      if (this.musicSource) {
        this.musicSource.stop();
        this.musicSource.disconnect();
      }
      this.isPlaying = false;
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  }

  static setBackgroundMusicVolume(volume) {
    if (this.gainNode) {
      try {
        this.gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      } catch (error) {
        console.error('Error setting background music volume:', error);
      }
    }
  }

  static setSFXVolume(volume) {
    if (this.sfxGainNode) {
      try {
        this.sfxGainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      } catch (error) {
        console.error('Error setting SFX volume:', error);
      }
    }
  }

  // Función general para reproducir sonidos basados en configuraciones
  static async playSound(soundName) {
    const config = this.soundConfigs[soundName];
    if (!config) {
      console.error(`Configuración no encontrada para el sonido: ${soundName}`);
      return;
    }

    try {
      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      oscillator.type = config.type || 'sine';
      oscillator.frequency.setValueAtTime(config.frequency, this.audioCtx.currentTime);

      if (config.frequencyEnd) {
        oscillator.frequency.linearRampToValueAtTime(
          config.frequencyEnd,
          this.audioCtx.currentTime + config.duration / 1000
        );
      }

      gainNode.gain.setValueAtTime(config.volume || 0.1, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + config.duration / 1000
      );

      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
      }, config.duration);
    } catch (error) {
      console.error(`Error al reproducir el sonido ${soundName}:`, error);
    }
  }

  // Función específica para el sonido de policía (sirena)
  static playPoliceSound() {
    const frequencies = [800, 1000];
    const duration = 100;
    const repeats = 4;
    let time = this.audioCtx.currentTime;

    for (let i = 0; i < repeats; i++) {
      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(frequencies[i % 2], time);
      gainNode.gain.setValueAtTime(0.2, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration / 1000);
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      oscillator.start(time);
      oscillator.stop(time + duration / 1000);
      time += duration / 1000;
    }
  }

  // Función específica para el sonido de expansión (acorde)
  static playExpansionSound() {
    const frequencies = [400, 500, 600];
    const duration = 500;
    frequencies.forEach(freq => {
      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + duration / 1000
      );
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      oscillator.start();
      oscillator.stop(this.audioCtx.currentTime + duration / 1000);
    });
  }

  // Métodos específicos para reproducir cada tipo de sonido
  static playButtonClick() {
    this.playSound('click');
  }

  static playMoneyEarned() {
    this.playSound('money');
  }

  static playUpgradePurchase() {
    this.playSound('upgrade');
  }

  static playInsufficientFunds() {
    this.playSound('error');
  }

  static playExpansion() {
    this.playExpansionSound();
  }

  static playPolice() {
    this.playPoliceSound();
  }

  static playPopup() {
    this.playSound('popup');
  }

  static playGameOver() {
    this.playSound('gameover');
  }

  static playNotification() {
    this.playSound('notification');
  }
}

export default SoundManager;