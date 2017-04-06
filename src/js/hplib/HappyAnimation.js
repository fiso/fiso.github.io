const HappyAnimation = {
  parallaxCache: {},
  updateParallax: function () {
    const parallaxElements = HappyNellyUtils.querySelectorAllCached(
      `.${HappyNellyUtils.rootClassName} .parallax`);
    for (let i = 0; i < parallaxElements.length; i++) {
      const el = parallaxElements[i];
      if (!HappyNellyUtils.elementInView(el, 100 * window.devicePixelRatio)) {
        if (el.style.willChange) {
          el.style.willChange = "";
        }
        continue;
      }
      el.style.willChange = "transform";
      if (!HappyAnimation.parallaxCache[i]) {
        HappyAnimation.parallaxCache[i] = el.dataset.parallaxStrength;
      }
      const strength = (HappyAnimation.parallaxCache[i] || 200) /
        window.devicePixelRatio;
      const elementBounds = el.getBoundingClientRect();
      const elementCenter = elementBounds.top + elementBounds.height / 2;
      const position = (window.innerHeight - elementBounds.top) /
        (window.innerHeight + elementBounds.height);
      HappyNellyUtils.setVendorStyle(el, "Transform",
        `translateY(${-(strength * 0.5) + position * strength}px)`);
    }
  },

  appearCache: {},
  updateAppear: function () {
    const appearElements = HappyNellyUtils.querySelectorAllCached(
      `.${HappyNellyUtils.rootClassName} .appear`);
    for (let i = 0; i < appearElements.length; i++) {
      if (HappyAnimation.appearCache[i]) {
        continue;
      }
      const el = appearElements[i];
      if (!HappyNellyUtils.elementInView(el)) {
        continue;
      }
      HappyAnimation.appearCache[i] = true;
      el.classList.add("appeared");
    }
  },
};
