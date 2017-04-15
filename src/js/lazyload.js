const lazyImages = {
  _lazyCache: {},
  _lazyCacheList: [],
  _imgElements: null,
  _allLoaded: false,

  _removeEventListeners: function (el) {
    el.removeEventListener("load", lazyImages._onLoad);
    el.removeEventListener("error", lazyImages._onError);
  },

  _onLoad: function (e) {
    this.classList.remove("loading");
    this.classList.add("loaded");
    lazyImages._removeEventListeners(this);
  },

  _onError: function (e) {
    this.classList.remove("loading");
    this.classList.add("error");
    lazyImages._removeEventListeners(this);
  },

  updateImages: function () {
    if (lazyImages._allLoaded) {
      return;
    }

    if (!lazyImages._imgElements) {
      lazyImages._imgElements = fiso.querySelectorAllCached("img[data-src]");
    } else {
      if (lazyImages._lazyCacheList.length === lazyImages._imgElements.length) {
        lazyImages._allLoaded = true;
        return;
      }
    }

    const _imgElements = lazyImages._imgElements;

    for (let i = 0; i < _imgElements.length; i++) {
      if (lazyImages._lazyCache[i]) {
        continue;
      }
      const el = _imgElements[i];
      if (!fiso.elementInView(el)) {
        continue;
      }
      lazyImages._lazyCache[i] = true;
      lazyImages._lazyCacheList = Object.keys(lazyImages._lazyCache);

      el.addEventListener("load", lazyImages._onLoad);
      el.addEventListener("error", lazyImages._onError);
      el.classList.add("loading");
      el.src = el.dataset.src;
      delete el.dataset.src;
    }
  },
};
