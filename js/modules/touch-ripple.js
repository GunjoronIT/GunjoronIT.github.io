(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // WebKit accepts the backdrop syntax but does not render SVG displacement there.
  const useBackdrop = !!window.chrome && CSS.supports('backdrop-filter', 'url("#water-refraction")');
  const root = document.documentElement;
  let layer, filter, image, displacement;
  let originX, originY, start, moving, frame;

  // Red and green store the horizontal and vertical offsets. Mid-gray
  // leaves pixels in place, including between the crests of the wave.
  function makeMap() {
    const canvas = document.createElement('canvas');
    const size = canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    const pixels = context.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (2 * x + 1) / size - 1;
        const dy = (2 * y + 1) / size - 1;
        const radius = Math.hypot(dx, dy);
        const envelope = Math.sin(Math.PI * Math.min(1, radius)) ** 2;
        const wave = radius ? Math.sin(radius * 7 * Math.PI) * envelope / radius : 0;
        const index = (y * size + x) * 4;
        pixels.data[index] = 128 + 120 * wave * dx;
        pixels.data[index + 1] = 128 + 120 * wave * dy;
        pixels.data[index + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL();
  }

  function initialize() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.innerHTML = `<filter id="water-refraction" filterUnits="userSpaceOnUse"
      color-interpolation-filters="sRGB">
      <feFlood flood-color="#808000" result="neutral"/>
      <feImage result="wave"/>
      <feComposite in="wave" in2="neutral" operator="over" result="offsets"/>
      <feDisplacementMap in="SourceGraphic" in2="offsets" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
    filter = svg.querySelector('filter');
    image = svg.querySelector('feImage');
    displacement = svg.querySelector('feDisplacementMap');
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', makeMap());
    document.body.append(svg);

    if (useBackdrop) {
      layer = document.createElement('div');
      layer.setAttribute('aria-hidden', 'true');
    }
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    layer?.remove();
    root.classList.remove('water-refraction-active');
  }

  function draw(now) {
    const progress = Math.min(1, (now - start) / (moving ? 450 : 740));
    if (progress === 1 || reducedMotion.matches) {
      stop();
      return;
    }

    const radius = 20 + progress * (moving ? 125 : 235);
    const left = useBackdrop ? 0 : scrollX;
    const top = useBackdrop ? 0 : scrollY;
    filter.setAttribute('x', left);
    filter.setAttribute('y', top);
    filter.setAttribute('width', root.clientWidth);
    filter.setAttribute('height', root.clientHeight);
    image.setAttribute('x', originX + left - radius);
    image.setAttribute('y', originY + top - radius);
    image.setAttribute('width', 2 * radius);
    image.setAttribute('height', 2 * radius);
    const strength = (moving ? 13 : 24) * Math.min(1, progress * 16) * (1 - progress) ** 1.4;
    displacement.setAttribute('scale', strength);

    frame = requestAnimationFrame(draw);
  }

  function ripple(touch, swipe) {
    if (reducedMotion.matches || document.body.classList.contains('loading')) return;
    const now = performance.now();
    if (swipe && (now - start < (moving ? 220 : 260) ||
        Math.hypot(touch.clientX - originX, touch.clientY - originY) < 30)) return;

    if (!filter) initialize();
    originX = touch.clientX;
    originY = touch.clientY;
    start = now;
    moving = swipe;

    cancelAnimationFrame(frame);
    draw(now);
    if (useBackdrop) {
      layer.className = 'water-refraction';
      if (!layer.isConnected) document.body.append(layer);
    } else {
      root.classList.add('water-refraction-active');
    }
  }

  // Passive touch events keep delivering positions during native scrolling.
  const options = { passive: true, capture: true };
  window.addEventListener('touchstart', event => {
    if (event.touches.length === 1) ripple(event.touches[0], false);
    else stop();
  }, options);
  window.addEventListener('touchmove', event => {
    if (event.touches.length === 1) ripple(event.touches[0], true);
  }, options);
  window.addEventListener('touchcancel', stop, options);
})();
