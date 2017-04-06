const HappyLazyImages = {
  lazyCache: {},
  updateImages: function () {
    const imgElements = HappyNellyUtils.querySelectorAllCached(
      `.${HappyNellyUtils.rootClassName} img[data-src]`);
    for (let i = 0; i < imgElements.length; i++) {
      if (HappyLazyImages.lazyCache[i]) {
        continue;
      }
      const el = imgElements[i];
      if (!HappyNellyUtils.elementInView(el)) {
        continue;
      }
      HappyLazyImages.lazyCache[i] = true;
      el.addEventListener("load", (e) => {
        el.classList.add("loaded");
      });
      el.src = el.dataset.src;
    }
  },
};
