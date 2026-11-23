(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // WebKit accepts the backdrop syntax but does not render SVG displacement there.
  const useBackdrop = !!window.chrome && CSS.supports('backdrop-filter', 'url("#water-refraction")');
  const root = document.documentElement;
  let layer, filter, image, displacement;
  const duration = 1340;
  const riseTime = 170;
  const startRadius = 42;
  const maxRadius = 247;
  // Leave room for asynchronous scrolling around WebKit's root filter region.
  const scrollStep = 128;
  const filterPadding = 32;
  const smoothstep = t => t * t * (3 - 2 * t);
  let originX, originY, start, frame;
  let width, height, offsetX, offsetY, layerX = 0, layerY = 0, touchActive = false;

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
        const wave = radius ? Math.sin(radius * 3 * Math.PI) * envelope / radius : 0;
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
      layer.className = 'water-refraction';
      layer.setAttribute('aria-hidden', 'true');
    }
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    layer?.remove();
    root.classList.remove('water-refraction-active');
  }

  function setFilterRegion(left, top, regionWidth, regionHeight) {
    if (width === regionWidth && height === regionHeight && offsetX === left && offsetY === top) return;
    width = regionWidth;
    height = regionHeight;
    offsetX = left;
    offsetY = top;
    filter.setAttribute('x', left);
    filter.setAttribute('y', top);
    filter.setAttribute('width', width);
    filter.setAttribute('height', height);
  }

  function placeLayer() {
    // A document-positioned backdrop scrolls with the page on the compositor,
    // including in between animation callbacks during touch and momentum scroll.
    const extent = maxRadius + filterPadding;
    layerX = Math.max(0, Math.floor(originX - extent));
    layerY = Math.max(0, Math.floor(originY - extent));
    const right = Math.min(root.scrollWidth, Math.ceil(originX + extent));
    const bottom = Math.min(root.scrollHeight, Math.ceil(originY + extent));
    const layerWidth = right - layerX;
    const layerHeight = bottom - layerY;
    layer.style.left = layerX + 'px';
    layer.style.top = layerY + 'px';
    layer.style.width = layerWidth + 'px';
    layer.style.height = layerHeight + 'px';
    setFilterRegion(0, 0, layerWidth, layerHeight);
    if (!layer.isConnected) document.body.append(layer);
  }

  function draw(now) {
    const elapsed = Math.max(0, now - start);
    if (elapsed >= duration || reducedMotion.matches) {
      stop();
      return;
    }

    if (!useBackdrop) {
      // WebKit's SVG filter is applied to the document itself. Reposition
      // its padded clip region while keeping the wave in document coordinates.
      const top = Math.floor(scrollY / scrollStep) * scrollStep - filterPadding;
      setFilterRegion(scrollX - filterPadding, top,
        root.clientWidth + 2 * filterPadding,
        root.clientHeight + scrollStep + 2 * filterPadding);
    }

    const progress = elapsed / duration;
    const radius = startRadius + (maxRadius - startRadius) * progress * (1.25 - .25 * progress);
    image.setAttribute('x', originX - layerX - radius);
    image.setAttribute('y', originY - layerY - radius);
    image.setAttribute('width', 2 * radius);
    image.setAttribute('height', 2 * radius);
    const rise = smoothstep(Math.min(1, elapsed / riseTime));
    const fade = 1 - smoothstep(Math.max(0, (elapsed - riseTime) / (duration - riseTime)));
    const strength = 12 * rise * fade;
    displacement.setAttribute('scale', strength);

    frame = requestAnimationFrame(draw);
  }

  function ripple(touch) {
    if (reducedMotion.matches || document.body.classList.contains('loading')) return;
    if (!filter) initialize();

    originX = touch.clientX + scrollX;
    originY = touch.clientY + scrollY;
    start = performance.now();

    cancelAnimationFrame(frame);
    if (useBackdrop) placeLayer();
    else root.classList.add('water-refraction-active');
    draw(start);
  }

  // One wave starts at contact, then continues through the natural scroll.
  // Subsequent move/cancel events leave the animation to fade on its own.
  const options = { passive: true, capture: true };
  window.addEventListener('touchstart', event => {
    if (event.touches.length > 1) stop();
    if (touchActive || event.touches.length !== 1) return;
    touchActive = true;
    ripple(event.touches[0]);
  }, options);

  function release(event) {
    if (event.touches.length === 0) touchActive = false;
  }
  window.addEventListener('touchend', release, options);
  window.addEventListener('touchcancel', release, options);
})();
