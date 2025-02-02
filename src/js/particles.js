// particles.js
export function generateMoneyParticles(clickSpeed, buttonElement) {
    // Calcula la cantidad de partículas según la velocidad de clics
    const particleCount = Math.min(30, 5 + clickSpeed * 3);
    const rect = buttonElement.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
  
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('money-particle');
  
      const img = document.createElement('img');
      img.src = 'assets/images/dinero.png'; // Ajusta la ruta si es necesario
      img.alt = 'Dinero';
      particle.appendChild(img);
  
      // Ángulo aleatorio centrado en -90° (hacia arriba) con ±30° de variación
      const angle = -90 + (Math.random() - 0.5) * 60;
      // Distancia aleatoria entre 50 y 150 píxeles
      const distance = Math.random() * 100 + 50;
      const rad = angle * Math.PI / 180;
      const translateX = distance * Math.cos(rad);
      const translateY = distance * Math.sin(rad);
  
      // Duración aleatoria de la animación entre 0.5s y 0.8s
      const duration = Math.random() * 0.3 + 0.5;
  
      // Rotación aleatoria para dar un extra de dinamismo
      const rotation = Math.floor(Math.random() * 360);
  
      // Posición inicial (centrada en el botón)
      particle.style.left = `${originX}px`;
      particle.style.top = `${originY}px`;
      // Variables CSS para la animación
      particle.style.setProperty('--tx', `${translateX}px`);
      particle.style.setProperty('--ty', `${translateY}px`);
      particle.style.setProperty('--rotate', `${rotation}deg`);
  
      // Aplica la animación
      particle.style.animation = `money-particle-animation ${duration}s ease-out forwards`;
  
      document.body.appendChild(particle);
  
      // Elimina la partícula al terminar la animación
      particle.addEventListener('animationend', () => {
        particle.remove();
      });
    }
  }
  