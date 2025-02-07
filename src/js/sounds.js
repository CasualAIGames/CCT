// sounds.js

const SoundManager = (() => {
    // Se utiliza AudioContext para generar sonidos con la API Web Audio.
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
  
    // Se crea un masterGain para controlar el volumen global.
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5; // Ajusta el volumen general aquí.
    masterGain.connect(audioCtx.destination);
  
    let bgMusic = null;
  
    // Inicializa la música de fondo.
    function initBackgroundMusic() {
      bgMusic = new Audio('assets/sounds/music.mp3');
      bgMusic.loop = true;
      // Conecta la música de fondo al AudioContext.
      const bgSource = audioCtx.createMediaElementSource(bgMusic);
      bgSource.connect(masterGain);
    }
  
    /**
     * Reproduce un tono con los parámetros especificados.
     * @param {number} frequency Frecuencia en Hz.
     * @param {string} type Tipo de onda ('sine', 'square', 'triangle', 'sawtooth').
     * @param {number} duration Duración en segundos.
     * @param {number} volume Volumen (0 a 1).
     * @param {number} delay Retraso en segundos antes de iniciar.
     */
    function playTone(frequency, type = 'sine', duration = 0.2, volume = 0.5, delay = 0) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
  
      oscillator.type = type;
      oscillator.frequency.value = frequency;
  
      const now = audioCtx.currentTime + delay;
      gainNode.gain.setValueAtTime(volume, now);
      // Se utiliza una rampa exponencial para una salida suave.
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
  
      oscillator.start(now);
      oscillator.stop(now + duration);
    }
  
    /**
     * Reproduce una secuencia de tonos para lograr efectos sonoros más complejos.
     * Cada objeto en el array debe tener: frequency, type, duration, volume y delay.
     * @param {Array} sequence Array de objetos con las propiedades de cada tono.
     */
    function playSequence(sequence) {
      sequence.forEach(tone => {
        playTone(tone.frequency, tone.type, tone.duration, tone.volume, tone.delay);
      });
    }
  
    // ---------------- Funciones originales con mejoras y nuevas funciones ---------------- //
  
    function playButtonClick() {
      // Sonido rápido y satisfactorio al pulsar un botón.
      playTone(400, 'triangle', 0.1, 0.3);
    }
  
    function playNotification() {
      // Sonido de notificación con dos tonos en secuencia.
      playSequence([
        { frequency: 800, type: 'sine', duration: 0.1, volume: 0.3, delay: 0 },
        { frequency: 1000, type: 'sine', duration: 0.1, volume: 0.3, delay: 0.1 }
      ]);
    }
  
    function playExpansion() {
      // Sonido en cascada para indicar expansión (por ejemplo, al conquistar un país).
      playSequence([
        { frequency: 500, type: 'sine', duration: 0.1, volume: 0.4, delay: 0 },
        { frequency: 600, type: 'sine', duration: 0.1, volume: 0.4, delay: 0.1 },
        { frequency: 700, type: 'sine', duration: 0.1, volume: 0.4, delay: 0.2 }
      ]);
    }
  
    function playPolice() {
      // Sonido agresivo usando ondas sawtooth para acciones policiales.
      playSequence([
        { frequency: 1000, type: 'sawtooth', duration: 0.2, volume: 0.4, delay: 0 },
        { frequency: 800, type: 'sawtooth', duration: 0.2, volume: 0.4, delay: 0.2 }
      ]);
    }
  
    function playPopup() {
      // Sonido suave e invitante para ventanas emergentes.
      playTone(1200, 'triangle', 0.2, 0.3);
    }
  
    function playRescueSuccess() {
      // Sonido corto y festivo para indicar éxito en una acción de rescate.
      playSequence([
        { frequency: 1000, type: 'sine', duration: 0.15, volume: 0.5, delay: 0 },
        { frequency: 1200, type: 'sine', duration: 0.15, volume: 0.5, delay: 0.15 }
      ]);
    }
  
    function playRescueFail() {
      // Sonido con tono bajo para indicar fallo en una acción.
      playTone(500, 'sine', 0.15, 0.5);
    }
  
    // ---------------- Nuevas funciones de sonido para más variedad ---------------- //
  
    function playMoneyEarned() {
      // Sonido en forma de cascada (chime) para cuando se recolecta dinero.
      playSequence([
        { frequency: 600, type: 'sine', duration: 0.1, volume: 0.4, delay: 0 },
        { frequency: 800, type: 'sine', duration: 0.1, volume: 0.4, delay: 0.15 },
        { frequency: 1000, type: 'sine', duration: 0.1, volume: 0.4, delay: 0.3 }
      ]);
    }
  
    function playUpgradePurchase() {
      // Sonido que indica la compra exitosa de una mejora.
      playSequence([
        { frequency: 700, type: 'triangle', duration: 0.1, volume: 0.3, delay: 0 },
        { frequency: 900, type: 'triangle', duration: 0.1, volume: 0.3, delay: 0.1 }
      ]);
    }
  
    function playInsufficientFunds() {
      // Sonido descendente para indicar que no hay suficiente dinero.
      playSequence([
        { frequency: 800, type: 'sine', duration: 0.1, volume: 0.3, delay: 0 },
        { frequency: 600, type: 'sine', duration: 0.1, volume: 0.3, delay: 0.1 }
      ]);
    }
  
    function playGameOver() {
      // Sonido melancólico para el fin del juego.
      playSequence([
        { frequency: 300, type: 'sawtooth', duration: 0.2, volume: 0.5, delay: 0 },
        { frequency: 200, type: 'sawtooth', duration: 0.3, volume: 0.5, delay: 0.2 }
      ]);
    }
  
    // Funciones para controlar la música de fondo.
    function startBackgroundMusic() {
      if (bgMusic) {
        bgMusic.play();
      }
    }
  
    function stopBackgroundMusic() {
      if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
      }
    }
  
    return {
      init() {
        initBackgroundMusic();
      },
      playButtonClick,
      playNotification,
      playExpansion,
      playPolice,
      playPopup,
      playRescueSuccess,
      playRescueFail,
      playMoneyEarned,
      playUpgradePurchase,
      playInsufficientFunds,
      playGameOver,
      startBackgroundMusic,
      stopBackgroundMusic,
      audioCtx,
      playTone,     // Se expone en caso de que necesites reproducir tonos personalizados.
      playSequence  // Se expone para generar nuevas secuencias de sonido.
    };
  })();
  
  export default SoundManager;
  