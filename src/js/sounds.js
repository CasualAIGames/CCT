// sounds.js

class SoundManager {
  static audioCtx;
  static backgroundMusic;
  static gainNode;
  static sfxGainNode;
  static isPlaying = false;
  static musicSource = null;

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

  static async playSound(soundName) {
    try {
      // Simular efectos de sonido básicos con osciladores si no hay archivos
      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      switch(soundName) {
        case 'click':
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.1;
          break;
        case 'money':
          oscillator.frequency.value = 600;
          oscillator.type = 'triangle';
          gainNode.gain.value = 0.2;
          break;
        case 'upgrade':
          oscillator.frequency.value = 1000;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.15;
          break;
        case 'error':
          oscillator.frequency.value = 200;
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.1;
          break;
        case 'expansion':
          oscillator.frequency.value = 400;
          oscillator.type = 'square';
          gainNode.gain.value = 0.15;
          break;
        case 'police':
          oscillator.frequency.value = 300;
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.2;
          break;
        case 'popup':
          oscillator.frequency.value = 700;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.1;
          break;
        case 'gameover':
          oscillator.frequency.value = 150;
          oscillator.type = 'sawtooth';
          gainNode.gain.value = 0.25;
          break;
        case 'notification':
          oscillator.frequency.value = 900;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.1;
          break;
        default:
          oscillator.frequency.value = 440;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.1;
      }

      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
      }, 100);
      
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  }

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
    this.playSound('expansion');
  }

  static playPolice() {
    this.playSound('police');
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
