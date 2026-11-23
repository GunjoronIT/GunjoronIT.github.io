(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let layer;
  let lastX, lastY, lastTime;

  function ripple(x, y, moving) {
    if (reducedMotion.matches || document.body.classList.contains('loading')) return;

    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'touch-ripples';
      layer.setAttribute('aria-hidden', 'true');
      document.body.append(layer);
    }

    if (layer.childElementCount >= 8) layer.firstElementChild.remove();

    const wave = document.createElement('div');
    wave.className = 'touch-ripple';
    wave.style.left = x + 'px';
    wave.style.top = y + 'px';
    if (moving) wave.style.setProperty('--ripple-scale', '.7');
    layer.append(wave);
    // Also clean up when reduced motion changes during an animation.
    setTimeout(() => wave.remove(), 760);

    lastX = x;
    lastY = y;
    lastTime = performance.now();
  }

  // Passive touch events keep delivering positions during native scrolling.
  const options = { passive: true, capture: true };
  window.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    const { clientX, clientY } = event.touches[0];
    ripple(clientX, clientY, false);
  }, options);

  window.addEventListener('touchmove', event => {
    if (event.touches.length !== 1 || performance.now() - lastTime < 100) return;
    const { clientX, clientY } = event.touches[0];
    if (Math.hypot(clientX - lastX, clientY - lastY) < 24) return;
    ripple(clientX, clientY, true);
  }, options);
})();
